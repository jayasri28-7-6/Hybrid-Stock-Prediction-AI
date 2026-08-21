
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePreferences } from '../../context/PreferencesContext';
import { getHistoricalData } from '../../services/geminiService';
import { StockData } from '../../types';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

interface HistoricalComparisonProps {
    stockSymbol: string;
}

const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({ stockSymbol }) => {
    const { t, language, currency } = usePreferences();
    
    // Default ranges
    const [currentRange, setCurrentRange] = useState({ 
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0] 
    });
    const [historicalRange, setHistoricalRange] = useState({ 
        start: new Date(Date.now() - 395 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        end: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    });

    const [currentData, setCurrentData] = useState<StockData[]>([]);
    const [historicalData, setHistoricalData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchData = async () => {
        if (!stockSymbol) return;
        setLoading(true);
        try {
            const [current, historical] = await Promise.all([
                getHistoricalData(stockSymbol, currentRange, language),
                getHistoricalData(stockSymbol, historicalRange, language)
            ]);
            setCurrentData(current);
            setHistoricalData(historical);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [stockSymbol, currentRange, historicalRange, language]);
    
    const stats = useMemo(() => {
        if (currentData.length < 2 || historicalData.length < 2) return null;
        
        const curStart = Number(currentData[0].price);
        const curEnd = Number(currentData[currentData.length - 1].price);
        const histStart = Number(historicalData[0].price);
        const histEnd = Number(historicalData[historicalData.length - 1].price);

        if (isNaN(curStart) || isNaN(curEnd) || isNaN(histStart) || isNaN(histEnd) || curStart === 0 || histStart === 0) return null;

        const curChange = ((curEnd - curStart) / curStart) * 100;
        const histChange = ((histEnd - histStart) / histStart) * 100;

        return { curChange, histChange, curEnd, histEnd };
    }, [currentData, historicalData]);

    const combinedData = useMemo(() => {
        const maxLength = Math.max(currentData.length, historicalData.length);
        const data = [];
        for (let i = 0; i < maxLength; i++) {
            data.push({
                index: i,
                [t('current')]: currentData[i] ? Number(currentData[i].price) : null,
                [t('historical')]: historicalData[i] ? Number(historicalData[i].price) : null,
            });
        }
        return data;
    }, [currentData, historicalData, t]);
    
    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={t('startDate')} className="bg-gray-800/40">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t('current')} Range</label>
                            <div className="flex gap-2 mt-2">
                                <input type="date" value={currentRange.start} onChange={e => setCurrentRange(prev => ({...prev, start: e.target.value}))} className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg w-full text-white"/>
                                <input type="date" value={currentRange.end} onChange={e => setCurrentRange(prev => ({...prev, end: e.target.value}))} className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg w-full text-white"/>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card title={t('endDate')} className="bg-gray-800/40">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t('historical')} Range</label>
                            <div className="flex gap-2 mt-2">
                                <input type="date" value={historicalRange.start} onChange={e => setHistoricalRange(prev => ({...prev, start: e.target.value}))} className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg w-full text-white"/>
                                <input type="date" value={historicalRange.end} onChange={e => setHistoricalRange(prev => ({...prev, end: e.target.value}))} className="bg-gray-900 border border-gray-700 text-xs p-2 rounded-lg w-full text-white"/>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Spinner />
                    <p className="text-[10px] font-black uppercase text-blue-500 animate-pulse tracking-widest">Syncing Historical Nodes...</p>
                </div>
            ) : !stockSymbol ? (
                <div className="py-20 text-center text-gray-600 font-black uppercase tracking-widest opacity-40">{t('enterCompanyHint')}</div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-t-2 border-blue-600 bg-gray-900/40">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">{t('priceTrendComparison')}</h3>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={combinedData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis dataKey="index" hide />
                                        <YAxis stroke="#404040" fontSize={10} tickFormatter={v => `${currency}${v}`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px' }} />
                                        <Legend verticalAlign="top" height={36} align="right" />
                                        <Area type="monotone" dataKey={t('current')} stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" strokeWidth={3} />
                                        <Area type="monotone" dataKey={t('historical')} stroke="#8b5cf6" fillOpacity={0.05} fill="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        
                        <div className="space-y-6">
                            <Card className="bg-gray-800/60 border-l-4 border-green-500">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('current')} Performance</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <h4 className="text-3xl font-black text-white">{stats ? `${Number(stats.curChange).toFixed(2)}%` : '--'}</h4>
                                    <span className={`text-[10px] font-bold ${stats?.curChange && stats.curChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {stats?.curChange && stats.curChange > 0 ? '▲' : '▼'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Latest: {currency}{stats ? Number(stats.curEnd).toFixed(2) : '--'}</p>
                            </Card>

                            <Card className="bg-gray-800/60 border-l-4 border-purple-500">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('historical')} Performance</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <h4 className="text-3xl font-black text-white">{stats ? `${Number(stats.histChange).toFixed(2)}%` : '--'}</h4>
                                    <span className={`text-[10px] font-bold ${stats?.histChange && stats.histChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {stats?.histChange && stats.histChange > 0 ? '▲' : '▼'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">End of Period: {currency}{stats ? Number(stats.histEnd).toFixed(2) : '--'}</p>
                            </Card>

                            <Card className="bg-gray-900/40 border border-gray-800">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Market Alpha Note</h4>
                                <p className="text-xs text-gray-300 leading-relaxed italic">
                                    Comparing the velocity of price action between these two windows highlights structural shifts in volatility and baseline support levels.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoricalComparison;
