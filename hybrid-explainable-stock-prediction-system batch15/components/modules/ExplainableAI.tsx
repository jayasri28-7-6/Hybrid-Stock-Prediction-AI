
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePreferences } from '../../context/PreferencesContext';
import { getShapExplanation, getDiceCounterfactuals } from '../../services/geminiService';
import { ShapFeature, DiceCounterfactual } from '../../types';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

interface ExplainableAIProps {
  stockSymbol: string;
}

const ExplainableAI: React.FC<ExplainableAIProps> = ({ stockSymbol }) => {
  const { t, language } = usePreferences();
  const [activeTab, setActiveTab] = useState<'shap' | 'dice'>('shap');
  const [shapData, setShapData] = useState<ShapFeature[]>([]);
  const [diceData, setDiceData] = useState<DiceCounterfactual[]>([]);
  const [diceSources, setDiceSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const SHAP_POSITIVE = '#10b981';
  const SHAP_NEGATIVE = '#ef4444';

  useEffect(() => {
    const fetchData = async () => {
      if (!stockSymbol) {
        setShapData([]);
        setDiceData([]);
        setDiceSources([]);
        return;
      }
      setLoading(true);
      try {
        const [shap, diceResult] = await Promise.all([
          getShapExplanation(stockSymbol, language, true),
          getDiceCounterfactuals(stockSymbol, language, true)
        ]);
        setShapData(shap || []);
        setDiceData(diceResult?.data || []);
        setDiceSources(diceResult?.sources || []);
      } catch (e) {
        console.error("XAI Service Fault:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stockSymbol, language]);

  const renderShapAnalysis = () => (
    <Card className="animate-in fade-in zoom-in-95 duration-500 border-t-4 border-blue-600 bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-10">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">
            {t('featureImpactShap')}
          </h3>
          <p className="text-gray-500 text-[11px] font-black uppercase tracking-[0.3em]">{t('whatFactorsInfluence')}</p>
        </div>
        <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 text-green-500"><div className="w-2 h-2 rounded-full bg-green-500"></div> Bullish Impact</div>
          <div className="flex items-center gap-2 text-red-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> Bearish Impact</div>
        </div>
      </div>
      
      {shapData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 h-[450px] w-full bg-gray-950/50 rounded-3xl p-8 border border-gray-800 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 60, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" stroke="#404040" fontSize={10} hide />
                <YAxis 
                  type="category" 
                  dataKey="feature" 
                  stroke="#E5E5E5" 
                  width={140}
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  fontWeight="900"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '16px', padding: '16px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value, name, props) => {
                    const numValue = Number(value);
                    const direction = props.payload.direction;
                    return [
                      `${isNaN(numValue) ? '0.00' : numValue.toFixed(2)} (${direction.toUpperCase()})`,
                      'Global Weighted Score'
                    ];
                  }}
                />
                <Bar dataKey="importance" barSize={32} radius={[0, 10, 10, 0]}>
                  {shapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.direction === 'positive' ? SHAP_POSITIVE : SHAP_NEGATIVE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
            {shapData.map((f, i) => (
              <div key={i} className="p-6 bg-gray-950/40 border border-gray-800 rounded-3xl group hover:border-blue-500/50 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{f.feature}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${f.direction === 'positive' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {f.direction}
                  </span>
                </div>
                <p className="text-xs text-gray-500 italic leading-relaxed font-medium">
                  {f.reason}
                </p>
                <div className="mt-4 h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                  <div className={`h-full ${f.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Number(f.importance) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-24 text-center">
            <p className="text-gray-700 uppercase text-xs font-black tracking-[0.4em] animate-pulse">Drivers Logic Re-calculating...</p>
        </div>
      )}
    </Card>
  );

  const renderDiceAnalysis = () => (
    <div className="space-y-8">
     <Card className="animate-in fade-in zoom-in-95 duration-500 border-l-8 border-purple-600 bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl">
        <div className="mb-12 flex justify-between items-center">
            <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">
                  {t('whatIfAnalysisDice')}
                </h3>
                <p className="text-gray-500 text-[11px] font-black uppercase tracking-[0.3em]">{t('toSeePredictionShift')}</p>
            </div>
            <div className="px-6 py-3 bg-purple-600/10 border border-purple-500/30 rounded-2xl flex items-center gap-3">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Simulation Engine: Prime</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-10">
          {diceData.length === 0 ? (
             <div className="py-32 flex flex-col items-center justify-center space-y-6">
                <Spinner />
                <p className="text-purple-500 uppercase text-xs font-black tracking-[0.4em] animate-pulse">Simulating Causal Logic...</p>
             </div>
          ) : diceData.map((cf, index) => (
            <div key={index} className="group bg-gray-950/40 border border-gray-800 rounded-[3rem] p-10 hover:bg-gray-900/30 hover:border-purple-600/40 transition-all duration-700 relative overflow-hidden">
                <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${
                      cf.magnitude === 'High' ? 'bg-red-500/10 text-red-400' : 
                      cf.magnitude === 'Medium' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {cf.magnitude} Impact
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase">Probability</span>
                        <span className="text-xs font-mono font-black text-white">{Math.round(cf.probability * 100)}%</span>
                    </div>
                </div>
                
                <div className="flex gap-10 items-start mb-8 pr-32">
                    <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-[2rem] bg-blue-600/10 text-blue-500 font-black text-xl border border-blue-600/20 shadow-xl italic">IF</div>
                    <div className="pt-2">
                        <h4 className="text-2xl font-black text-white leading-tight tracking-tight group-hover:text-blue-400 transition-colors">
                          {t(cf.ifConditionKey, cf.ifReplacements)}
                        </h4>
                    </div>
                </div>

                <div className="ml-24 h-px w-2/3 bg-gradient-to-r from-gray-800 to-transparent my-10"></div>

                <div className="flex gap-10 items-start ml-12">
                    <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-[2rem] bg-purple-600/10 text-purple-500 font-black text-xl border border-purple-600/20 shadow-xl italic">THEN</div>
                    <div className="pt-2 flex-1">
                        <div className="p-6 bg-purple-600/[0.03] border-l-4 border-purple-600 rounded-r-3xl">
                            <p className="text-gray-300 text-lg font-bold leading-relaxed italic">
                                {t(cf.thenOutcomeKey, cf.thenReplacements)}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Visual Gauge for Probability */}
                <div className="absolute bottom-0 left-0 h-1 bg-gray-800 w-full overflow-hidden">
                    <div className="h-full bg-purple-600 group-hover:bg-purple-400 transition-all duration-1000" style={{ width: `${cf.probability * 100}%` }}></div>
                </div>
            </div>
          ))}
        </div>
    </Card>

    {diceSources.length > 0 && (
        <Card title={t('logicalVerificationSources')} className="border-t border-gray-800 bg-gray-950/40 p-10 rounded-[2.5rem] shadow-xl">
            <div className="flex flex-wrap gap-4">
                {diceSources.map((chunk, idx) => (
                    chunk.web && (
                        <a 
                            key={idx} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-gray-900/80 hover:bg-gray-800 text-blue-400 px-6 py-4 rounded-2xl border border-gray-800 transition-all font-black uppercase tracking-[0.1em] hover:border-blue-500/30 flex items-center gap-3"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            {chunk.web.title || t('marketLogicSource')}
                        </a>
                    )
                ))}
            </div>
        </Card>
    )}
    </div>
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-10 px-4">
        <div className="bg-gray-800/40 backdrop-blur-2xl rounded-[2.5rem] p-2.5 flex w-full lg:w-[600px] mx-auto shadow-2xl border border-gray-700/50">
            <button 
              onClick={() => setActiveTab('shap')}
              className={`flex-1 py-5 rounded-[1.8rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${activeTab === 'shap' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}>
              Causal Weights (SHAP)
            </button>
            <button 
              onClick={() => setActiveTab('dice')}
              className={`flex-1 py-5 rounded-[1.8rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${activeTab === 'dice' ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}>
              Re-evaluation (DICE)
            </button>
        </div>
        
        {loading ? (
            <div className="flex flex-col justify-center items-center p-60 space-y-10">
                <Spinner />
                <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-[0.6em] text-blue-500 animate-pulse">Syncing Deep Logic Layers</p>
                    <p className="text-[11px] text-gray-700 uppercase font-black mt-4 tracking-widest">Mapping causal weights for {stockSymbol}...</p>
                </div>
            </div>
        ) : !stockSymbol ? (
            <div className="flex flex-col items-center justify-center py-60 text-gray-700/40">
                <svg className="w-32 h-32 mb-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <p className="text-sm uppercase font-black tracking-[0.4em]">{t('enterCompanyHint')}</p>
            </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                {activeTab === 'shap' ? renderShapAnalysis() : renderDiceAnalysis()}
            </div>
        )}
    </div>
  );
};

export default ExplainableAI;
