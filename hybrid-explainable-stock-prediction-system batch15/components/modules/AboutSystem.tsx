
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { usePreferences } from '../../context/PreferencesContext';
import { getSystemStatus, subscribeToStatus } from '../../services/geminiService';

const AboutSystem: React.FC = () => {
    const { t } = usePreferences();
    const [status, setStatus] = useState(getSystemStatus());

    useEffect(() => {
        const unsubscribe = subscribeToStatus((newStatus) => {
            setStatus(newStatus);
        });
        return unsubscribe;
    }, []);
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto py-6 pb-20">
            <Card title={t('aboutTitle')} className="bg-gray-800/80 border border-gray-700">
                <div className="space-y-6 text-gray-300 leading-relaxed py-6">
                    <p className="text-lg font-medium">{t('aboutDesc1')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: '🚀', text: t('aboutDesc2') },
                            { icon: '🔍', text: t('aboutDesc3') },
                            { icon: '📊', text: t('aboutDesc4') },
                            { icon: '🌍', text: t('aboutDesc5') }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-5 bg-gray-900/50 rounded-3xl border border-gray-700/50">
                                <span className="text-2xl">{item.icon}</span>
                                <p className="text-sm font-semibold">{item.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t border-gray-700">
                        <p className="font-black text-xs uppercase tracking-widest text-blue-500 italic">{t('aboutConclusion')}</p>
                    </div>
                </div>
            </Card>

            <Card title={t('systemStatus')} className="border-t-2 border-green-500 bg-gray-900/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t('apiStatus')}</span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${status.isHealthy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {status.isHealthy ? t('connected') : 'Degraded'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{t('quotaStatus')}</span>
                            <span className="text-xs font-mono text-white">Standard Core Access</span>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-3xl flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Secure Market Channel</h4>
                        <p className="text-[10px] text-gray-500">Encrypted grounded market intelligence protocol active.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AboutSystem;
