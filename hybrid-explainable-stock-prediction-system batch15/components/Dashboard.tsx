
import React, { useState, useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { NAV_ITEMS, LANGUAGES } from '../constants';
import StockPrediction from './modules/StockPrediction';
import NewsSentiment from './modules/NewsSentiment';
import ExplainableAI from './modules/ExplainableAI';
import HistoricalComparison from './modules/HistoricalComparison';
import SmartAlerts from './modules/SmartAlerts';
import UserDashboard from './modules/UserDashboard';
import AboutSystem from './modules/AboutSystem';
import MarketExpertChat from './modules/MarketExpertChat';
import { User } from '../types';
import { getSystemStatus, subscribeToStatus } from '../services/geminiService';

interface DashboardProps {
    onLogout: () => void;
    currentUser: User;
}

const ICONS: { [key: string]: React.ReactElement } = {
  stockPrediction: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  newsSentiment: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-1 8h.01" /></svg>,
  explainableAI: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  historicalComparison: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  smartAlerts: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  userDashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  aboutSystem: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

const getISTTime = () => new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});

const MOCK_TICKER = [
    { label: 'NIFTY 50', value: '24,323', change: '+0.45%', up: true },
    { label: 'SENSEX', value: '79,486', change: '+0.38%', up: true },
    { label: 'NASDAQ', value: '18,675', change: '-1.12%', up: false },
    { label: 'BTC', value: '$96,432', change: '+2.41%', up: true },
];

const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentUser }) => {
  const [activeModule, setActiveModule] = useState('stockPrediction');
  const [stockSymbol, setStockSymbol] = useState('');
  const [lastPrediction, setLastPrediction] = useState<any>(null);
  const { t, language, setLanguage } = usePreferences();
  const [time, setTime] = useState(getISTTime());
  const [systemStatus, setSystemStatus] = useState(getSystemStatus());

  useEffect(() => {
    const timer = setInterval(() => setTime(getISTTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToStatus((status) => setSystemStatus(status));
    return unsubscribe;
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'stockPrediction': return <StockPrediction stockSymbol={stockSymbol} setStockSymbol={setStockSymbol} onPredictionFetched={setLastPrediction} />;
      case 'newsSentiment': return <NewsSentiment stockSymbol={stockSymbol} />;
      case 'explainableAI': return <ExplainableAI stockSymbol={stockSymbol} />;
      case 'historicalComparison': return <HistoricalComparison stockSymbol={stockSymbol} />;
      case 'smartAlerts': return <SmartAlerts stockSymbol={stockSymbol} userEmail={currentUser.email} />;
      case 'userDashboard': return <UserDashboard />;
      case 'aboutSystem': return <AboutSystem />;
      default: return <div className="p-6"><h1 className="text-3xl font-bold">{t(activeModule)}</h1></div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-300">
      <aside className="w-64 bg-gray-800/80 backdrop-blur-md border-r border-gray-700/50 flex flex-col justify-between p-5">
        <div>
            <div className="text-left mb-8 flex items-center gap-3">
                 <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
                <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">H.S.P.S</h2>
            </div>
            <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
                <button key={item} onClick={() => setActiveModule(item)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeModule === item ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-700/50'}`}>
                    {ICONS[item]} <span>{t(item)}</span>
                </button>
            ))}
            </nav>
        </div>
        <div className="space-y-4">
            <div className="px-4 py-2 bg-gray-900/40 rounded-xl border border-gray-700/50">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">User Profile</p>
                <p className="text-xs font-bold text-white truncate">{currentUser.username}</p>
            </div>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-500/10 text-red-400 transition-colors">
                {ICONS['logout']} <span>{t('logout')}</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="bg-gray-950 border-b border-gray-800 py-1.5 overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-marquee flex gap-10">
                {MOCK_TICKER.concat(MOCK_TICKER).map((t, i) => (
                    <div key={i} className="flex gap-2 items-center text-xs">
                        <span className="font-bold text-gray-500">{t.label}</span>
                        <span className="text-white font-mono">{t.value}</span>
                        <span className={t.up ? 'text-green-500' : 'text-red-500'}>{t.change}</span>
                    </div>
                ))}
            </div>
        </div>

        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-white tracking-tight">{t(activeModule)}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] font-mono bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                {t('istTime', { time })}
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer font-bold">
              {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gray-900/20">
          {renderModule()}
        </div>

        <MarketExpertChat stockSymbol={stockSymbol} lastPrediction={lastPrediction} />
      </main>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; animation: marquee 40s linear infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;
