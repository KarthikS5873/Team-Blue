import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Play, ShieldAlert, Award, Clock, ArrowRight, Zap, RefreshCw, EyeOff, ShieldCheck, Flame } from 'lucide-react';

export const AIInsights = () => {
  const {
    aiInsights,
    isGeneratingInsights,
    generateAIAnalysis,
    user,
    activities
  } = useApp();

  if (!user) return null;

  return (
    <div id="ai-insights-page" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Premium Hook Hero Banner */}
      <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-white rounded-lg p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-500/10 to-indigo-500/10 blur-3xl rounded-full" />
        
        <div className="space-y-4 z-10 max-w-xl">
          <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs font-extrabold tracking-widest uppercase">
            <Sparkles className="w-5 h-5 animate-pulse text-blue-400" />
            <span>ChronosAI Premium Consultant</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-tight">Identify Your Profit Leaks with Server-Side Gemini AI</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Launch an end-to-end audit scan on your logged work blocks, unbillable admin durations, meeting workloads, and client rates. ChronosAI analyzes your hourly ROI sweet-spots, tracks goal milestones, and outputs direct step-by-step optimization blueprints.
          </p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-blue-500" />
              SOC-2 Data Privacy Safe
            </span>
            <span>•</span>
            <span className="font-bold text-slate-300">
              {activities.length} logs scanned
            </span>
          </div>
        </div>

        <div className="z-10 flex-shrink-0">
          <button
            id="trigger-ai-audit-btn"
            onClick={generateAIAnalysis}
            disabled={isGeneratingInsights}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-xl shadow-slate-950/50 hover:shadow-slate-900/40 flex items-center space-x-2.5 disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingInsights ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Scanning Portfolio Matrix...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white stroke-none" />
                <span>Launch Premium AI Time Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Generating/Loading screen with reassuring messages */}
      {isGeneratingInsights && (
        <div id="ai-loading-alert" className="bg-white rounded-lg border border-neutral-200 p-10 text-center shadow-sm space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-neutral-900">Consulting Algorithm Processing...</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              ChronosAI is querying Google Gemini to evaluate opportunity cost leakages, calculate administrative hour thresholds, measure client rates, and generate actionable monetization steps. Please wait...
            </p>
          </div>
          {/* Progress sequence indicator list */}
          <div className="flex items-center justify-center space-x-6 text-[10px] font-mono text-neutral-400 pt-2">
            <span className="flex items-center text-blue-600 font-bold"><Zap className="w-3.5 h-3.5 mr-1 text-blue-500 animate-bounce" /> Compiling Logs</span>
            <span className="flex items-center text-blue-600 font-bold"><Zap className="w-3.5 h-3.5 mr-1 text-blue-500 animate-bounce delay-100" /> Calculating ROI Yields</span>
            <span className="flex items-center text-blue-600 font-bold"><Zap className="w-3.5 h-3.5 mr-1 text-blue-500 animate-bounce delay-200" /> Formatting Output</span>
          </div>
        </div>
      )}

      {/* Insights Display Grid */}
      {!isGeneratingInsights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiInsights.map((insight, index) => {
            const isEfficiency = insight.category === 'efficiency';
            const isRevenue = insight.category === 'revenue';
            const isBurnout = insight.category === 'burnout';
            
            return (
              <div
                key={insight.id || index}
                className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Glow bar */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                  isEfficiency ? 'from-amber-400 to-amber-500' :
                  isRevenue ? 'from-emerald-400 to-emerald-500' :
                  isBurnout ? 'from-red-400 to-red-500' :
                  'from-blue-400 to-blue-500'
                }`} />

                <div className="space-y-4">
                  {/* Category label & Impact Score */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      isEfficiency ? 'bg-amber-50 text-amber-700' :
                      isRevenue ? 'bg-emerald-50 text-emerald-700' :
                      isBurnout ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {insight.category}
                    </span>
                    <span className="text-neutral-400 font-bold">
                      Impact: <span className="text-neutral-950 font-black">{insight.impactScore}/100</span>
                    </span>
                  </div>

                  {/* Insight title */}
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm leading-tight">
                      {insight.title}
                    </h4>
                    <p className="text-[9px] text-neutral-400 font-mono mt-1">Audit Dated: {insight.date}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                    {insight.description}
                  </p>

                  {/* Actionable Callout Box */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200/60 rounded-lg space-y-1.5">
                    <h5 className="text-[10px] uppercase font-bold text-neutral-800 font-mono tracking-wider flex items-center">
                      <Flame className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      Action Blueprint Step
                    </h5>
                    <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                      {insight.actionableStep}
                    </p>
                  </div>

                </div>

                {/* Card Footer action indicator */}
                <div className="mt-6 pt-4 border-t border-neutral-50 flex items-center justify-between text-[10px] text-neutral-400 font-semibold font-mono">
                  <span>Audit certified secure</span>
                  <div className="flex items-center text-blue-600 font-bold">
                    <span>Target optimization Active</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
