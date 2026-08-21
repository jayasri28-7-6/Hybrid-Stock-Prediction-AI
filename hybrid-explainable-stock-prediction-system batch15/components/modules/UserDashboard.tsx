
import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { Bookmark } from '../../types';
import Card from '../common/Card';
import { useToast } from '../../context/ToastContext';

const UserDashboard: React.FC = () => {
    const { t, currency } = usePreferences();
    const { showToast } = useToast();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('userBookmarks');
        if (stored) setBookmarks(JSON.parse(stored));
    }, []);

    const toggleAlert = (symbol: string) => {
        const updated = bookmarks.map(b => 
            b.symbol === symbol ? { ...b, smartAlertEnabled: !b.smartAlertEnabled } : b
        );
        setBookmarks(updated);
        localStorage.setItem('userBookmarks', JSON.stringify(updated));
        showToast(t('notifPreferenceUpdated', { symbol }));
    };

    const removeBookmark = (symbol: string) => {
        const updated = bookmarks.filter(b => b.symbol !== symbol);
        setBookmarks(updated);
        localStorage.setItem('userBookmarks', JSON.stringify(updated));
        showToast(t('removedSymbol', { symbol }));
    };

    return (
        <div className="space-y-6">
            <Card title={t('regNotifSettings')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('notifEmail')}</label>
                        <input 
                            type="email" 
                            disabled 
                            value="user@example.com" 
                            className="w-full bg-gray-900 border border-gray-700 text-gray-400 rounded-xl px-4 py-3 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('currency')}</label>
                        <div className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 font-bold opacity-60">
                            {currency} (Managed in Analysis Panel)
                        </div>
                    </div>
                </div>
            </Card>

            <Card title={t('manageBookmarks')}>
                {bookmarks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">{t('noBookmarks')}</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookmarks.map(b => (
                            <div key={b.symbol} className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 flex items-center justify-between group hover:border-blue-500/50 transition-all">
                                <div>
                                    <h4 className="font-bold text-white">{b.name}</h4>
                                    <p className="text-xs text-gray-500">{b.symbol}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => toggleAlert(b.symbol)}
                                        className={`p-2 rounded-lg transition-colors ${b.smartAlertEnabled ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                                        title="Toggle Email Alerts"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => removeBookmark(b.symbol)}
                                        className="p-2 bg-red-900/10 text-red-500 rounded-lg hover:bg-red-900/30 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UserDashboard;
