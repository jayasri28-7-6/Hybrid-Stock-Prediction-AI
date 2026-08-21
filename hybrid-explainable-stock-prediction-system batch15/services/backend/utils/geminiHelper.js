const { GoogleGenerativeAI } = require('@google/genai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiHelper {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generatePrediction(symbol, historicalData) {
    try {
      const prompt = `
        As a stock market expert, analyze the following historical data for ${symbol} and provide a prediction.
        Historical Data: ${JSON.stringify(historicalData)}
        
        Provide a response in JSON format with:
        1. predictedPrice (number)
        2. confidence (number between 0 and 1)
        3. trend (UP/DOWN/STABLE)
        4. reasoning (string explaining the prediction)
        5. keyFactors (array of important factors)
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        return JSON.parse(text);
      } catch {
        // If response is not JSON, return formatted object
        return {
          predictedPrice: 0,
          confidence: 0.7,
          trend: 'STABLE',
          reasoning: text,
          keyFactors: ['Market trends', 'Historical performance']
        };
      }
    } catch (error) {
      console.error('Gemini prediction error:', error);
      throw error;
    }
  }

  async generateForecast(symbol, historicalData, days) {
    try {
      const prompt = `
        Generate a ${days}-day price forecast for ${symbol} based on:
        ${JSON.stringify(historicalData)}
        
        Provide response as JSON array with objects containing:
        - date (YYYY-MM-DD)
        - predictedPrice (number)
        - trend (UP/DOWN/STABLE)
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        // Generate mock forecast
        const forecast = [];
        const lastPrice = historicalData[historicalData.length - 1]?.price || 100;
        
        for (let i = 1; i <= days; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const change = (Math.random() - 0.5) * 5;
          forecast.push({
            date: date.toISOString().split('T')[0],
            predictedPrice: lastPrice + change,
            trend: change > 0 ? 'UP' : change < 0 ? 'DOWN' : 'STABLE'
          });
        }
        return forecast;
      }
    } catch (error) {
      console.error('Forecast generation error:', error);
      throw error;
    }
  }

  async analyzeSentiment(text) {
    try {
      const prompt = `
        Analyze the sentiment of this financial news:
        "${text}"
        
        Respond with JSON:
        {
          "sentiment": "Positive/Neutral/Negative",
          "confidence": number between 0 and 1,
          "score": number between -1 and 1
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());
      
      return {
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        score: analysis.score
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        sentiment: 'Neutral',
        confidence: 0.5,
        score: 0
      };
    }
  }

  async generateExplanation(symbol, features) {
    try {
      const prompt = `
        Explain why the stock ${symbol} might have these feature importances:
        ${JSON.stringify(features)}
        
        Provide SHAP-like explanation with:
        1. Top positive factors
        2. Top negative factors
        3. Overall impact on prediction
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        explanation: response.text(),
        features: features || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Explanation generation error:', error);
      throw error;
    }
  }

  async translateText(text, targetLanguage) {
    try {
      const prompt = `Translate this financial text to ${targetLanguage}:\n${text}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original if translation fails
    }
  }
}

module.exports = new GeminiHelper();