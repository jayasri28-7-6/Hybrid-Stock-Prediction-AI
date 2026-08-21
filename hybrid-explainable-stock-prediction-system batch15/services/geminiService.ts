
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { NewsArticle, Language, MarketPerformance, StockData, ForecastData, CompanyDetails, ChatMessage, ShapFeature, DiceCounterfactual, KeyStatistics } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Global Rate Limit & Fallback State
let isThrottled = false;
let throttleTimer: any = null;
let lastErrorType: 'none' | 'rate_limit' | 'other' = 'none';
let totalRequests = 0;
let failedRequests = 0;
let errorListeners: ((status: any) => void)[] = [];

export const subscribeToStatus = (callback: (status: any) => void) => {
    errorListeners.push(callback);
    return () => {
        errorListeners = errorListeners.filter(l => l !== callback);
    };
};

const notifyListeners = () => {
    const status = getSystemStatus();
    errorListeners.forEach(l => l(status));
};

export const getSystemStatus = () => ({
    lastErrorType,
    totalRequests,
    failedRequests,
    isHealthy: lastErrorType === 'none',
    isThrottled
});

// Cache Configuration
const cache: { [key: string]: { data: any, timestamp: number } } = {};
const LONG_TTL = 15 * 60 * 1000; 
const SHORT_TTL = 30 * 1000; 

const callResilient = async <T>(
    cacheKey: string, 
    ttl: number, 
    fallback: T,
    fetcher: () => Promise<T>,
    forceRefresh = false
): Promise<{ data: T, status: 'live' | 'cached' | 'fallback' }> => {
    totalRequests++;

    if (!forceRefresh && cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < ttl) {
        return { data: cache[cacheKey].data, status: 'cached' };
    }

    if (isThrottled && !forceRefresh) {
        if (cache[cacheKey]) return { data: cache[cacheKey].data, status: 'cached' };
        return { data: fallback, status: 'fallback' };
    }

    try {
        const data = await fetcher();
        lastErrorType = 'none';
        isThrottled = false;
        if (throttleTimer) {
            clearTimeout(throttleTimer);
            throttleTimer = null;
        }
        cache[cacheKey] = { data, timestamp: Date.now() };
        notifyListeners();
        return { data, status: 'live' };
    } catch (error: any) {
        failedRequests++;
        const errStr = JSON.stringify(error).toLowerCase();
        const isQuotaError = errStr.includes('429') || errStr.includes('quota') || errStr.includes('limit') || errStr.includes('exhausted');

        if (isQuotaError) {
            lastErrorType = 'rate_limit';
            isThrottled = true;
            if (throttleTimer) clearTimeout(throttleTimer);
            throttleTimer = setTimeout(() => {
                isThrottled = false;
                lastErrorType = 'none';
                notifyListeners();
            }, 30000);
        } else {
            lastErrorType = 'other';
        }
        
        notifyListeners();
        if (cache[cacheKey]) return { data: cache[cacheKey].data, status: 'cached' };
        return { data: fallback, status: 'fallback' };
    }
};

export const getHistoricalData = async (symbol: string, range: { start: string, end: string }, lang: string): Promise<StockData[]> => {
    const fallback: StockData[] = [];
    const res = await callResilient(`hist_v3_${symbol}_${range.start}_${range.end}_${lang}`, LONG_TTL, fallback, async () => {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Fetch daily historical closing prices for ${symbol} from ${range.start} to ${range.end}. Return as JSON array of {date: string, price: number}.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const data = JSON.parse(response.text || "[]");
        return Array.isArray(data) ? data : [];
    });
    return res.data;
};

export const getStockPrediction = async (symbol: string, start: string, end: string, lang: string, forceRefresh = false) => {
    const fallback = { 
        livePrice: null, 
        actual: [], 
        historicalPredictions: [], 
        forecast: [], 
        recommendation: "HOLD", 
        evaluation: "", 
        direction: "Stable",
        lastUpdate: null,
        sources: [] 
    };

    const res = await callResilient(`pred_v9_${symbol}_${lang}`, SHORT_TTL, fallback, async () => {
        const prompt = `ACT AS EXPERT ANALYST. ANALYZE ${symbol}.
        1. Fetch REAL-TIME current price.
        2. Fetch historical daily closing prices from ${start} to ${end}.
        3. Generate "Model Predictions" for those historical dates to show Actual vs Predicted overlays.
        4. Generate a 7-day future price forecast.
        5. FINAL RECOMMENDATION: STRICTLY "BUY" OR "HOLD".
        6. PROVIDE EXPLANATION: Short, professional, simple.
        
        STRICT JSON STRUCTURE:
        {
            "livePrice": number,
            "actual": [{"date": "YYYY-MM-DD", "price": number}],
            "historicalPredictions": [{"date": "YYYY-MM-DD", "price": number}],
            "forecast": [{"date": "YYYY-MM-DD", "targetPrice": number}],
            "direction": "Bullish" | "Bearish" | "Stable",
            "recommendation": "BUY" | "HOLD",
            "evaluation": "Explanation here"
        }`;

        const genRes = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        
        const data = JSON.parse(genRes.text || JSON.stringify(fallback));
        data.lastUpdate = new Date().toISOString();
        data.sources = genRes.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return data;
    }, forceRefresh);

    return res.data;
};

export const getCompanyDetails = async (symbol: string, lang: string, forceRefresh = false) => {
    const fallback = { 
        details: { 
            name: symbol, 
            sector: 'N/A', 
            industry: 'N/A', 
            marketCategory: 'N/A', 
            description: 'N/A', 
            recentTrend: 'N/A' 
        } as CompanyDetails, 
        sources: [] 
    };
    const res = await callResilient(`comp_v5_${symbol}_${lang}`, LONG_TTL, fallback, async () => {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Fetch official profile of ${symbol}. Full company name, sector, industry, market category, recent trend and a concise 2-sentence description. Translate to ${lang}. JSON format: {name, sector, industry, marketCategory, description, recentTrend}.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const details = JSON.parse(response.text || "{}");
        return { 
            details: { ...fallback.details, ...details }, 
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
        };
    }, forceRefresh);
    return res.data;
};

export const getNewsSentiment = async (symbol: string, lang: string, limit = 3, forceRefresh = false) => {
    const fallback = { insight: "", articles: [], sources: [] };
    const res = await callResilient(`news_v5_${symbol}_${lang}`, SHORT_TTL, fallback, async () => {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Analyze current news sentiment for ${symbol}. Provide a summary mood (Positive/Neutral/Negative) and key headlines. JSON: { insight: string, articles: [{headline, summary, source, date, sentiment}] }`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        const raw = JSON.parse(response.text || JSON.stringify(fallback));
        return { 
            insight: raw.insight || "",
            articles: (raw.articles || []).map((a: any, i: number) => ({ 
                id: `n-${i}-${Date.now()}`,
                headlineKey: 'raw_text', headlineReplacements: { text: a.headline }, 
                summaryKey: 'raw_text', summaryReplacements: { text: a.summary }, 
                source: a.source, date: a.date, sentiment: a.sentiment, confidence: 0.9 
            })), 
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
        };
    }, forceRefresh);
    return res.data;
};

export const getShapExplanation = async (symbol: string, lang: string, forceRefresh = false): Promise<ShapFeature[]> => {
    const res = await callResilient(`shap_v6_${symbol}_${lang}`, LONG_TTL, [], async () => {
        const response = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: `Perform SHAP analysis on current price drivers for ${symbol}. 
            Identify at least 5 key drivers. 
            For each, provide: 
            - feature (name)
            - importance (0-1 score)
            - direction ('positive' or 'negative' impact on current price)
            - reason (concise sentence explaining why this feature is driving price).
            Return JSON: [{feature, importance, direction, reason}]`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    }, forceRefresh);
    return res.data;
};

export const getDiceCounterfactuals = async (symbol: string, lang: string, forceRefresh = false) => {
    const fallback = { data: [], sources: [] };
    const res = await callResilient(`dice_v5_${symbol}_${lang}`, LONG_TTL, fallback, async () => {
        const response = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: `Generate DICE counterfactual scenarios for ${symbol}.
            Propose 3 logical what-if scenarios that would significantly shift the price trajectory.
            For each, provide:
            - ifConditionKey (use 'raw_text')
            - ifReplacements (object with {text: "The hypothetical scenario description"})
            - thenOutcomeKey (use 'raw_text')
            - thenReplacements (object with {text: "The predicted market reaction"})
            - probability (0-1)
            - magnitude ('High', 'Medium', 'Low').
            Translate to ${lang}. Return JSON format.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        return { data: JSON.parse(response.text || "[]"), sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
    }, forceRefresh);
    return res.data;
};

export const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export async function decodeAudioDataRaw(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateMarketMoodVisual = async (insight: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: { parts: [{ text: `A futuristic stock market visual for: "${insight}".` }] },
            config: { imageConfig: { aspectRatio: "16:9" } }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (e) { return null; }
};

export const generateNewsSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (e) { return null; }
};

export const getChatResponseStream = async (message: string, history: ChatMessage[], context: any) => {
    const chat = ai.chats.create({
        model: TEXT_MODEL,
        config: {
            systemInstruction: `H.S.P.S Analyst. Language=${context.language}. Symbol=${context.symbol}. Be concise.`,
            tools: [{ googleSearch: {} }]
        }
    });
    return await chat.sendMessageStream({ message });
};

export const getSentimentBasedSuggestions = async (symbol: string, lang: string) => {
    const res = await callResilient(`suggestions_v5_${symbol}_${lang}`, LONG_TTL, [], async () => {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `3 prompts for ${symbol}. JSON: [{label, prompt}]`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
    return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
};
