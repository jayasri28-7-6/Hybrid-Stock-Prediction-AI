
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { getNewsSentiment, generateMarketMoodVisual, generateNewsSpeech, getCompanyDetails, decodeBase64, decodeAudioDataRaw } from '../../services/geminiService';
import { NewsArticle, CompanyDetails } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface NewsSentimentProps {
  stockSymbol: string;
}

const NewsSentiment: React.FC<NewsSentimentProps> = ({ stockSymbol }) => {
  const { t, language } = usePreferences();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [moodVisual, setMoodVisual] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [companyLive, setCompanyLive] = useState<CompanyDetails | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(3);

  const fetchNews = useCallback(async (limit = 3, isInitial = true) => {
    if (!stockSymbol) return;
    isInitial ? setLoading(true) : setLoadingMore(true);
    try {
      const [newsResult, companyResult] = await Promise.all([
        getNewsSentiment(stockSymbol, language, limit, !isInitial),
        isInitial ? getCompanyDetails(stockSymbol, language) : Promise.resolve({details: companyLive})
      ]);
      setNews(newsResult.articles || []);
      setInsight(newsResult.insight || "");
      setSources(newsResult.sources || []);
      if (isInitial) setCompanyLive(companyResult.details);
      
      if (isInitial && newsResult.insight) {
        generateMarketMoodVisual(newsResult.insight).then(setMoodVisual);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); setLoadingMore(false); }
  }, [stockSymbol, language, companyLive]);

  useEffect(() => { 
    setNews([]);
    setDisplayLimit(3);
    fetchNews(3, true); 
  }, [stockSymbol, language]);

  const handleLoadMore = () => {
    const nextLimit = displayLimit + 5;
    setDisplayLimit(nextLimit);
    fetchNews(nextLimit, false);
  };

  const handlePlaySpeech = async () => {
    if (!insight || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const base64Audio = await generateNewsSpeech(insight);
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decoded = decodeBase64(base64Audio);
        const buffer = await decodeAudioDataRaw(decoded, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else { setIsSpeaking(false); }
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {stockSymbol && companyLive && (
        <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 text-white font-black text-2xl shadow-xl uppercase italic">{stockSymbol.charAt(0)}</div>
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t('livePulse')}</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded-full animate-pulse border border-green-500/20">SENTIMENT ACTIVE</span>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-4">{companyLive.name}</h3>
                <p className="text-gray-300 text-lg leading-relaxed font-medium italic border-l-2 border-blue-600 pl-6 py-1">"{companyLive.description}"</p>
             </div>
             <button onClick={() => fetchNews(displayLimit, true)} disabled={loading || loadingMore} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center gap-2">
                {loading ? <Spinner /> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                {t('refreshNews')}
             </button>
          </div>
        </Card>
      )}

      {stockSymbol && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <Card className="relative overflow-hidden group min-h-[350px] border-none bg-gray-900 flex items-center justify-center rounded-[3rem] shadow-2xl">
            {loading ? <Spinner /> : moodVisual ? <img src={moodVisual} alt="Mood" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-all duration-1000 scale-105" /> : <div className="text-gray-700 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">{t('analyzingVisualMood')}</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/10 to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10 z-10"><h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{stockSymbol} {t('sentiment').toUpperCase()}</h2><p className="text-gray-500 text-[10px] font-black uppercase mt-2">{t('dynamicSentimentImagery')}</p></div>
          </Card>
          <Card className="bg-gray-800/40 backdrop-blur-3xl p-10 flex flex-col justify-center rounded-[3rem] border border-gray-700/50 relative">
            {loading ? <div className="space-y-6"><div className="h-4 w-full bg-gray-700 rounded-full animate-pulse"></div><div className="h-4 w-4/5 bg-gray-700 rounded-full animate-pulse"></div></div> : (
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6"><div><h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">{t('marketPulse')}</h3><div className="h-1 w-12 bg-blue-600 rounded-full"></div></div><button onClick={handlePlaySpeech} disabled={isSpeaking} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSpeaking ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-900 border border-gray-700 text-gray-500 hover:text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></button></div>
                <p className="text-xl text-gray-100 font-bold leading-relaxed italic border-l-4 border-blue-600 pl-8 py-2">"{insight || t('processing')}"</p>
              </div>
            )}
          </Card>
        </div>
      )}

      <Card title={`${t('newsHeadlines')} - ${stockSymbol}`} className="border-t-2 border-blue-600 bg-gray-800/40 rounded-[3rem] overflow-hidden">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6"><Spinner /><p className="text-[10px] font-black uppercase tracking-widest text-blue-500 animate-pulse">{t('syncingHeadlines')}</p></div>
        ) : news.length > 0 ? (
          <div className="divide-y divide-gray-800/50">
            {news.map((a, i) => (
              <div key={a.id} className="p-10 hover:bg-gray-900/60 transition-all duration-500 group animate-in slide-in-from-right-10 fade-in duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-start gap-8">
                   <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3 text-[10px] text-gray-600 font-black uppercase">
                         <span className="text-blue-500">{a.source}</span><span className="w-1 h-1 rounded-full bg-gray-800"></span><span>{a.date}</span>
                      </div>
                      <h4 className="font-black text-2xl text-gray-100 leading-tight mb-3 group-hover:text-blue-400 transition-colors">{t(a.headlineKey, a.headlineReplacements)}</h4>
                      <p className="text-gray-400 text-lg leading-relaxed">{t(a.summaryKey, a.summaryReplacements)}</p>
                   </div>
                   <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase border ${a.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' : a.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{t(a.sentiment.toLowerCase())}</div>
                      <div className="text-right w-full"><div className="text-[8px] text-gray-600 font-black uppercase mb-1">{t('confidence')} {Math.round(a.confidence * 100)}%</div><div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800"><div className="h-full bg-blue-600" style={{ width: `${a.confidence * 100}%` }}></div></div></div>
                   </div>
                </div>
              </div>
            ))}
            <div className="p-8 text-center bg-gray-950/20">
                <Button variant="ghost" onClick={handleLoadMore} disabled={loadingMore} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-white">
                    {loadingMore ? <Spinner /> : 'Load More Market Intelligence'}
                </Button>
            </div>
          </div>
        ) : <div className="py-20 text-center text-gray-600 font-black uppercase tracking-widest opacity-40 italic">{t('enterCompanyHint')}</div>}
      </Card>

      {sources.length > 0 && !loading && (
        <Card title={t('marketIntelligenceCitations')} className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-10">
           <div className="flex flex-wrap gap-4">
             {sources.map((c, i) => c.web && (<a key={i} href={c.web.uri} target="_blank" rel="noopener noreferrer" className="px-6 py-4 bg-gray-950 hover:bg-gray-800 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-gray-800 transition-all flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>{c.web.title || t('marketLogicSource')}</a>))}
           </div>
        </Card>
      )}
    </div>
  );
};

export default NewsSentiment;
