import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { getChatResponseStream, getSentimentBasedSuggestions, getSystemStatus } from '../../services/geminiService';
import { ChatMessage, Bookmark } from '../../types';

interface MarketExpertChatProps {
    stockSymbol: string;
    lastPrediction?: any;
}

const MarketExpertChat: React.FC<MarketExpertChatProps> = ({ stockSymbol, lastPrediction }) => {
    const { t, language, currency, chartSettings } = usePreferences();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [dynamicSuggestions, setDynamicSuggestions] = useState<{ label: string, prompt: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastAcknowledgedSymbol = useRef<string>(stockSymbol);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    const getBookmarks = (): string[] => {
        try {
            const saved = localStorage.getItem('userBookmarks');
            if (saved) {
                const parsed: Bookmark[] = JSON.parse(saved);
                return parsed.map(b => b.symbol);
            }
        } catch (e) {}
        return [];
    };

    useEffect(() => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (messages.length === 0) {
            setMessages([{
                role: 'model',
                text: stockSymbol ? t('chatSymbolPriming', { symbol: stockSymbol }) : t('chatInitial', { symbol: 'Market' }),
                timestamp: time
            }]);
            lastAcknowledgedSymbol.current = stockSymbol;
        } 
        else if (stockSymbol && stockSymbol !== lastAcknowledgedSymbol.current) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: t('chatSymbolPriming', { symbol: stockSymbol }),
                timestamp: time
            }]);
            lastAcknowledgedSymbol.current = stockSymbol;
        }
    }, [t, stockSymbol, messages.length]);

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchSuggestions = async () => {
            const status = getSystemStatus();
            if (status.isThrottled) return;

            try {
                const suggestions = await getSentimentBasedSuggestions(stockSymbol, language);
                if (suggestions && suggestions.length > 0) {
                    setDynamicSuggestions(suggestions);
                }
            } catch (e) {}
        };

        if (dynamicSuggestions.length === 0) {
            fetchSuggestions();
        }
    }, [isOpen, stockSymbol, language]);

    const handleSend = async (overrideInput?: string) => {
        const messageText = (overrideInput || input).trim();
        if (!messageText || isTyping) return;

        // REMOVED: Pre-emptive status.isThrottled check. 
        // We let the API try. If it hits 429, the catch block handles it.

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg: ChatMessage = { role: 'user', text: messageText, timestamp: time };

        const historyForAPI = [...messages];
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setMessages(prev => [...prev, {
            role: 'model',
            text: '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        try {
            const bookmarks = getBookmarks();
            const streamResult = await getChatResponseStream(messageText, historyForAPI, { 
                symbol: stockSymbol, 
                language,
                currency,
                bookmarks,
                lastPrediction,
                dateRange: { start: chartSettings.startDate, end: chartSettings.endDate }
            });
            
            let accumulatedText = '';
            for await (const chunk of streamResult) {
                if (chunk && chunk.text) {
                    accumulatedText += chunk.text;
                    setMessages(prev => {
                        const next = [...prev];
                        const last = next[next.length - 1];
                        if (last && last.role === 'model') {
                            last.text = accumulatedText;
                        }
                        return next;
                    });
                }
            }
        } catch (error: any) {
            const errStr = JSON.stringify(error).toLowerCase();
            const isQuotaError = errStr.includes('429') || errStr.includes('quota') || errStr.includes('limit') || errStr.includes('exhausted');
            
            setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === 'model') {
                    last.text = isQuotaError 
                        ? "⚠️ System rate limit reached. I am momentarily operating on high-level cached logic. Please refer to the grounded data on the main dashboard for current trends."
                        : "I'm experiencing a momentary connectivity shift. Please check the dashboard analysis for current signals.";
                }
                return next;
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border ${isOpen ? 'bg-gray-800 border-gray-700' : 'bg-blue-600 border-blue-500 shadow-blue-600/20'}`}
            >
                {isOpen ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                )}
            </button>

            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[420px] h-[640px] bg-gray-950 border border-gray-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('chatTitle')}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[9px] text-gray-500 uppercase font-bold">Expert Active & Context-Aware</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' : 'bg-gray-900 text-gray-300 rounded-tl-none border border-gray-800 shadow-xl'}`}>
                                    {msg.text || (isTyping && i === messages.length - 1 ? <span className="flex gap-1 items-center italic text-gray-500">Synthesizing personalized response...</span> : "Fetching market logic...")}
                                </div>
                                <span className="text-[8px] text-gray-600 mt-1.5 uppercase font-black tracking-widest">{msg.timestamp}</span>
                            </div>
                        ))}
                    </div>

                    {!isTyping && (
                        <div className="px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 border-t border-gray-900/50 bg-gray-950/50">
                            {(dynamicSuggestions.length > 0 ? dynamicSuggestions : [
                                { label: 'Analyze Headlines', prompt: `What is the current news sentiment for ${stockSymbol || 'the market'}?` },
                                { label: '7-Day Outlook', prompt: `What is the 7-day predicted price trajectory for ${stockSymbol || 'the market'}?` }
                            ]).map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(s.prompt)}
                                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-[9px] font-black text-gray-500 uppercase tracking-widest hover:border-blue-500 hover:text-blue-400 transition-all active:scale-95"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="p-6 border-t border-gray-900 bg-gray-950">
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder={t('chatPlaceholder')}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="w-full bg-gray-900 border border-gray-800 text-white rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none pr-14"
                                disabled={isTyping}
                            />
                            <button 
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isTyping ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 cursor-not-allowed'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketExpertChat;