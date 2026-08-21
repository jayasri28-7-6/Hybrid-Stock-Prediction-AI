
import React, { useState, useEffect, useRef } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { MarketAlert, Bookmark } from '../../types';
import Card from '../common/Card';
import { useToast } from '../../context/ToastContext';

interface SmartAlertsProps {
  stockSymbol: string;
  userEmail: string;
}

const SmartAlerts: React.FC<SmartAlertsProps> = ({ stockSymbol, userEmail }) => {
    const { t, currency } = usePreferences();
    const { showToast } = useToast();
    const [alertsHistory, setAlertsHistory] = useState<MarketAlert[]>([]);
    const [monitoring, setMonitoring] = useState(false);
    const lastCheckPrices = useRef<{ [symbol: string]: number }>({});
    const [activeBookmarks, setActiveBookmarks] = useState<Bookmark[]>([]);

    useEffect(() => {
        const bookmarks: Bookmark[] = JSON.parse(localStorage.getItem('userBookmarks') || '[]');
        const enabled = bookmarks.filter(b => b.smartAlertEnabled);
        setActiveBookmarks(enabled);
        setMonitoring(enabled.length > 0);
        
        enabled.forEach(b => {
            if (!lastCheckPrices.current[b.symbol]) {
                lastCheckPrices.current[b.symbol] = 200 + (Math.random() * 100);
            }
        });
    }, [stockSymbol]);

    useEffect(() => {
        if (!monitoring) return;

        const interval = setInterval(() => {
            const bookmarks: Bookmark[] = JSON.parse(localStorage.getItem('userBookmarks') || '[]');
            const enabled = bookmarks.filter(b => b.smartAlertEnabled);
            
            for (const b of enabled) {
                const prevPrice = lastCheckPrices.current[b.symbol] || 200;
                const changePercent = (Math.random() - 0.5) * 0.08; 
                const newPrice = prevPrice * (1 + changePercent);
                lastCheckPrices.current[b.symbol] = newPrice;

                if (Math.abs(changePercent) > 0.025) {
                    const direction = changePercent > 0 ? 'UP' : 'DOWN';
                    const percentageStr = `${(Math.abs(changePercent) * 100).toFixed(2)}%`;
                    
                    const alertMessage = t('raw_text', { text: "The bookmarked stock price has changed significantly." });
                    
                    const newAlert: MarketAlert = {
                        id: `alert-${Date.now()}`,
                        stock: b.symbol,
                        change: percentageStr,
                        trend: direction === 'UP' ? 'Up' : 'Down',
                        action: direction === 'UP' ? 'Sell' : 'Buy',
                        message: alertMessage,
                        timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }),
                        priceAtAlert: newPrice,
                        recipient: userEmail
                    };

                    setAlertsHistory(prev => [newAlert, ...prev].slice(0, 10));
                    showToast(t('raw_text', { text: `📧 Notification: ${b.symbol} is ${t(direction.toLowerCase())} ${percentageStr}. Dispatched to ${userEmail}` }));
                }
            }
        }, 10000); 

        return () => clearInterval(interval);
    }, [monitoring, showToast, userEmail, t]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-gray-800/60 rounded-3xl border border-gray-700/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className={`h-4 w-4 rounded-full ${monitoring ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-600'}`}></div>
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-white">
                            {monitoring ? t('realTimeAlerts') : 'Sentinel Inactive'}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">Real-time dynamic monitoring active for watchlist...</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Registered Account</p>
                    <p className="text-xs font-bold text-blue-400">{userEmail}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title={t('bookmarkedStocks')} className="lg:col-span-1 border-t-2 border-orange-500 bg-gray-800/60">
                    <div className="space-y-3 mt-4">
                        {activeBookmarks.length === 0 ? (
                            <p className="text-[9px] uppercase font-black text-gray-500 text-center py-10 tracking-widest">{t('noBookmarks')}</p>
                        ) : activeBookmarks.map(b => (
                            <div key={b.symbol} className="flex items-center justify-between p-4 bg-gray-900/60 rounded-2xl border border-gray-800">
                                <div>
                                    <span className="font-black text-white text-lg">{b.symbol}</span>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{b.name}</p>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Dispatch Log" className="lg:col-span-2 border-t-2 border-blue-600 bg-gray-800/60">
                    <div className="space-y-4 mt-4">
                        {alertsHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-600 opacity-20">
                                <p className="text-xs uppercase font-black tracking-[0.3em]">{t('noAlerts')}</p>
                            </div>
                        ) : alertsHistory.map(alert => (
                            <div key={alert.id} className="p-6 rounded-3xl flex flex-col gap-4 border border-gray-700/30 bg-gray-900/40">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-black text-2xl text-white tracking-tighter uppercase italic">{alert.stock}</h4>
                                        <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-widest">{alert.timestamp}</p>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${alert.trend === 'Up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {t(alert.trend.toLowerCase())} {alert.change}
                                    </span>
                                </div>
                                <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl text-xs font-bold text-blue-300 italic">
                                    "{alert.message}"
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span>Price: <span className="text-white">{currency}{Number(alert.priceAtAlert).toFixed(2)}</span></span>
                                    <span>{t('suggestion')}: <span className="text-white">{t(alert.action.toLowerCase())}</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SmartAlerts;
