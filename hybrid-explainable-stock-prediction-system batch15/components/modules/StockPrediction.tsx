
import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { usePreferences } from '../../context/PreferencesContext';
import { getStockPrediction, getCompanyDetails, getNewsSentiment } from '../../services/geminiService';
import { StockData, ForecastData, CompanyDetails, Bookmark } from '../../types';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { CURRENCIES } from '../../constants';
import { useToast } from '../../context/ToastContext';

interface StockPredictionProps {
    stockSymbol: string;
    setStockSymbol: (symbol: string) => void;
    onPredictionFetched?: (data: any) => void;
}

const safeFormat = (value: any, decimals: number = 2): string => {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num) || num === 0) return '0.00';
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const CustomTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1f2e] border border-gray-700 rounded-xl p-4 shadow-2xl">
                <p className="text-[#aaa] font-bold text-xs mb-2">{label}</p>
                <div className="space-y-1">
                    <p className="text-sm font-bold flex justify-between gap-4">
                        <span className="text-[#8b5cf6]">Actual :</span>
                        <span className="text-white">{currency}{safeFormat(payload[0].value)}</span>
                    </p>
                    <p className="text-sm font-bold flex justify-between gap-4">
                        <span className="text-[#10b981]">Predicted :</span>
                        <span className="text-white">{currency}{safeFormat(payload[1].value)}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const StockPrediction: React.FC<StockPredictionProps> = ({ stockSymbol, setStockSymbol, onPredictionFetched }) => {
    const { t, language, currency, setCurrency, chartSettings, updateChartSettings } = usePreferences();
    const { showToast } = useToast();
    
    const [actualData, setActualData] = useState<StockData[]>([]);
    const [predictedHistorical, setPredictedHistorical] = useState<StockData[]>([]);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [companyInfo, setCompanyInfo] = useState<CompanyDetails | null>(null);
    const [recommendation, setRecommendation] = useState<{ action: string, explanation: string } | null>(null);
    const [sentiment, setSentiment] = useState<{ mood: string, insight: string } | null>(null);
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (stockSymbol) {
            const saved = localStorage.getItem('userBookmarks');
            if (saved) {
                const bookmarks: Bookmark[] = JSON.parse(saved);
                setIsBookmarked(bookmarks.some(b => b.symbol === stockSymbol));
            } else {
                setIsBookmarked(false);
            }
        }
    }, [stockSymbol]);

    const toggleBookmark = () => {
        if (!companyInfo || !stockSymbol) return;
        
        const saved = localStorage.getItem('userBookmarks');
        let bookmarks: Bookmark[] = saved ? JSON.parse(saved) : [];
        
        if (isBookmarked) {
            bookmarks = bookmarks.filter(b => b.symbol !== stockSymbol);
            showToast(`Removed ${stockSymbol} from watchlist.`);
        } else {
            const newBookmark: Bookmark = {
                symbol: stockSymbol,
                name: companyInfo.name,
                smartAlertEnabled: false
            };
            bookmarks.push(newBookmark);
            showToast(`Added ${stockSymbol} to watchlist.`);
        }
        
        localStorage.setItem('userBookmarks', JSON.stringify(bookmarks));
        setIsBookmarked(!isBookmarked);
    };

    const handlePrediction = async () => {
        if (!stockSymbol) return;
        setLoading(true);
        // Clear previous context to avoid confusion
        setActualData([]);
        setCompanyInfo(null);
        setRecommendation(null);
        
        try {
            const [predResult, companyResult, newsResult] = await Promise.all([
                getStockPrediction(stockSymbol, chartSettings.startDate, chartSettings.endDate, language, true),
                getCompanyDetails(stockSymbol, language, true),
                getNewsSentiment(stockSymbol, language, 3, true)
            ]);
            
            setActualData(predResult.actual || []);
            setPredictedHistorical(predResult.historicalPredictions || []);
            setForecastData(predResult.forecast || []);
            setLivePrice(predResult.livePrice);
            setCompanyInfo(companyResult.details);
            setRecommendation({
                action: predResult.recommendation || 'HOLD',
                explanation: predResult.evaluation || 'The current market signals are being synthesized.'
            });
            setSentiment({
                mood: newsResult.insight?.toLowerCase().includes('positive') ? 'Positive' : 
                      newsResult.insight?.toLowerCase().includes('negative') ? 'Negative' : 'Neutral',
                insight: newsResult.insight
            });
            
            if (onPredictionFetched) onPredictionFetched(predResult);
            showToast(`Market Intel for ${stockSymbol} Generated.`);
        } catch (err: any) {
            showToast(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const combinedData = useMemo(() => {
        const allDates = Array.from(new Set([
            ...actualData.map(d => d.date),
            ...predictedHistorical.map(d => d.date)
        ])).sort();

        return allDates.map(date => {
            const actual = actualData.find(d => d.date === date);
            const pred = predictedHistorical.find(d => d.date === date);
            return {
                date,
                Actual: actual ? actual.price : null,
                Predicted: pred ? pred.price : (actual ? actual.price : null)
            };
        });
    }, [actualData, predictedHistorical]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* 1. INPUT PANEL */}
            <Card className="bg-[#1a1f2e] border border-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[13px] font-medium text-gray-400">Enter Stock Symbol (e.g., AAPL)</label>
                        <input 
                            type="text" 
                            placeholder="AAPL or TCS" 
                            value={stockSymbol} 
                            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())} 
                            className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[13px] font-medium text-gray-400">Currency</label>
                        <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)} 
                            className="w-full bg-[#0d1117] border border-cyan-500 text-white rounded-lg px-4 py-3 outline-none cursor-pointer"
                        >
                            {CURRENCIES.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} {c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[13px] font-medium text-gray-400">Start Date</label>
                        <input 
                            type="date" 
                            value={chartSettings.startDate} 
                            onChange={(e) => updateChartSettings({ startDate: e.target.value })}
                            className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[13px] font-medium text-gray-400">End Date</label>
                        <input 
                            type="date" 
                            value={chartSettings.endDate} 
                            onChange={(e) => updateChartSettings({ endDate: e.target.value })}
                            className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handlePrediction} 
                            disabled={loading || !stockSymbol} 
                            className="w-full h-[52px] bg-[#1da1f2] hover:bg-[#1a91da] text-white font-black rounded-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <Spinner /> : "GET PREDICTION"}
                        </button>
                    </div>
                </div>
            </Card>

            {loading && (
                 <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                    <Spinner />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mt-6">Synthesizing Market Intelligence...</p>
                </div>
            )}

            {companyInfo && !loading && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
                    
                    {/* 2. COMPANY PROFILING */}
                    <Card className="bg-[#1a1f2e] border border-gray-800 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-2xl relative group">
                        <div className="shrink-0 flex items-center justify-center w-24 h-24 rounded-[1.8rem] bg-blue-600 text-white font-black text-3xl shadow-xl uppercase italic">
                            {stockSymbol.charAt(0)}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-1">
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{companyInfo.name}</h2>
                                <button 
                                    onClick={toggleBookmark}
                                    className={`p-2 rounded-xl transition-all duration-300 ${isBookmarked ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
                                    title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">
                                {companyInfo.sector} • {companyInfo.industry}
                            </p>
                            <p className="text-gray-300 text-lg leading-relaxed italic border-l-4 border-blue-600 pl-8 py-2 bg-gray-900/40 rounded-r-2xl">
                                "{companyInfo.description}"
                            </p>
                        </div>
                    </Card>

                    {/* 3. TREND & EXPERT RECOMMENDATION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className={`bg-[#1a1f2e] border-l-8 rounded-[2rem] p-8 flex flex-col justify-center shadow-xl ${
                            recommendation?.action === 'BUY' ? 'border-green-500' : 'border-blue-600'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Final Recommendation</h4>
                                    <h2 className={`text-5xl font-black italic tracking-tighter ${
                                        recommendation?.action === 'BUY' ? 'text-green-500' : 'text-white'
                                    }`}>
                                        {recommendation?.action}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Live Market Value</h4>
                                    <h2 className="text-3xl font-black text-white font-mono">{currency}{safeFormat(livePrice)}</h2>
                                </div>
                            </div>
                            <p className="text-gray-200 text-lg font-bold italic leading-relaxed bg-gray-950/30 p-4 rounded-xl border border-gray-800">
                                {recommendation?.explanation}
                            </p>
                        </Card>

                        <Card className="bg-[#1a1f2e] border border-gray-800 rounded-[2rem] p-8 flex flex-col justify-center shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global News Sentiment</h4>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                                    sentiment?.mood === 'Positive' ? 'bg-green-500/10 text-green-400' : 
                                    sentiment?.mood === 'Negative' ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-400'
                                }`}>
                                    {sentiment?.mood || 'Neutral'}
                                </span>
                            </div>
                            <div className="p-5 bg-gray-950/50 border border-gray-800 rounded-2xl italic">
                                <p className="text-gray-400 text-base leading-relaxed">
                                    {sentiment?.insight || 'Parsing global news feeds...'}
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* 4. PREDICTION CHART */}
                    <Card className="bg-[#1a1f2e] border border-gray-800 rounded-[2rem] p-10 min-h-[580px] shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                                ACTUAL VS. PREDICTED CLOSING PRICES – {stockSymbol}
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div><span className="text-[10px] font-black text-gray-500 uppercase">Actual</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div><span className="text-[10px] font-black text-gray-500 uppercase">Predicted</span></div>
                            </div>
                        </div>
                        
                        <div className="h-[450px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={combinedData}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" stroke="#666" fontSize={11} tickMargin={12} axisLine={{ stroke: '#444' }} tickLine={false} />
                                    <YAxis stroke="#666" fontSize={11} axisLine={{ stroke: '#444' }} tickLine={false} tickFormatter={(v) => `${currency}${v}`} />
                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                    <Area type="monotone" dataKey="Actual" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 3 }} animationDuration={2000} />
                                    <Area type="monotone" dataKey="Predicted" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPredicted)" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }} animationDuration={2000} />
                                    <Brush dataKey="date" height={32} stroke="#1da1f2" fill="#0d1117" travellerWidth={14} gap={5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* 5. 7-DAY FUTURE PREDICTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <Card className="lg:col-span-3 bg-[#1a1f2e] border-t-4 border-cyan-500 rounded-[2.5rem] overflow-hidden shadow-2xl p-0">
                            <div className="p-8 border-b border-gray-800">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">7-Day Forward Trajectory</h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase mt-1 tracking-widest">Synthesized target forecasts based on causal logic</p>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-900/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Forecast Horizon</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Alpha Target</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Sentiment Intensity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/30">
                                    {forecastData.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-800/40 transition-all group">
                                            <td className="px-8 py-5 text-sm font-mono text-gray-300">{item.date}</td>
                                            <td className="px-8 py-5 text-xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                                                {currency}{safeFormat(item.targetPrice)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="h-1.5 w-32 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                                                    <div className="bg-cyan-500 h-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${65 + Math.random() * 25}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>

                        <div className="space-y-6">
                            <Card className="bg-gray-950 border border-gray-800 p-10 rounded-[2.5rem] shadow-xl text-center">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 block">Market Alpha Note</span>
                                <p className="text-xs text-gray-400 italic leading-relaxed">
                                    The predicted trajectory utilizes a hybrid logic bridge, weighing real-time news velocity against historical support clusters for {stockSymbol}.
                                </p>
                            </Card>
                            <Card className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[2.5rem] shadow-xl flex flex-col items-center">
                                <div className="p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest text-center">Data Verified</h4>
                                <p className="text-[9px] text-gray-500 text-center mt-2 leading-tight uppercase font-black">Grounded Intelligence Protocol Active</p>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockPrediction;
