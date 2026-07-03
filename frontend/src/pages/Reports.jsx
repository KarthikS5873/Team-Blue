import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { BarChart3, Loader2, AlertCircle, FileText, Calendar, Clock, ChevronRight, Sparkles, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const TABS = ['daily', 'weekly', 'monthly'];

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setSelectedReport(null);
    try {
      const data = await api.reports.list(activeTab);
      setReports(data.reports || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await api.reports.generate(activeTab);
      setReports(prev => [data.report, ...prev]);
      setSelectedReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = async (id) => {
    try {
      const data = await api.reports.get(activeTab, id);
      setSelectedReport(data.report);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderAnalysis = (data) => {
    if (!data) return null;

    const timeWasted = data.timeWastedTasks || [];
    const areas = data.areasToFocus || [];
    const projections = data.incomeGrowthProjections || [];
    const statement = data.incomeGrowthStatement || '';

    return (
      <div className="space-y-6 mt-6 pt-6 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-950/10 border border-red-500/10 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Time Wasted Tasks
            </h4>
            {timeWasted.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No significant time waste identified.</p>
            ) : (
              <div className="space-y-2.5">
                {timeWasted.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900/60 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-300">{item.task}</span>
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-semibold">
                        -{item.minutesWasted} mins
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Areas to Focus
            </h4>
            {areas.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No specific focus areas recommended.</p>
            ) : (
              <div className="space-y-2.5">
                {areas.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900/60 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-300">{item.area}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">
                        +{item.hoursRecommended} hrs/wk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {projections.length > 0 && (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Income Growth Projection
            </h4>
            {statement && (
              <p className="text-xs text-slate-300 leading-relaxed bg-indigo-950/10 border border-indigo-500/10 p-3.5 rounded-lg">
                {statement}
              </p>
            )}

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projections} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `\u20B9${val.toLocaleString('en-IN')}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8', fontSize: '11px' }}
                    formatter={(value) => [`\u20B9${value.toLocaleString('en-IN')}`, 'Projected Revenue']}
                  />
                  <Area type="monotone" dataKey="revenueProjected" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };
  const renderRecommendationCard = (rec, index) => {
    if (!rec || typeof rec !== 'object') return null;

    const isWaste = rec.priority === 'Critical' || rec.priority === 'Important';
    
    return (
      <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md mb-4 text-left">
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-blue-400 tracking-wider uppercase flex items-center">
            🤖 INSIGHT #{index + 1}
          </span>
          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
            rec.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
            rec.priority === 'Important' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {rec.priority}
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-850">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">{rec.category}</span>
              <span className="text-sm font-bold text-white">{rec.title}</span>
            </div>
            <div className="shrink-0 flex items-center space-x-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                rec.timeLossPercentage && rec.timeLossPercentage !== '0% focus loss' && rec.timeLossPercentage !== '0% business loss'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
              }`}>
                {rec.timeLossPercentage && rec.timeLossPercentage !== '0% focus loss' && rec.timeLossPercentage !== '0% business loss'
                  ? `⏳ Wasted: ${rec.timeSpent} (${rec.timeLossPercentage})`
                  : `🚀 Gained: ${rec.timeReduction || rec.timeSpent} (${rec.growthGainPercentage})`
              }
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reason (Why AI Flagged This)</h5>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/10 p-2.5 rounded border border-slate-850/60">{rec.whyFlagged}</p>
          </div>

          <div className="pt-2 border-t border-slate-850/60">
            <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center">
              💡 Solution (Action Plan)
            </h5>
            <div className="space-y-1.5">
              <div className="text-xs text-slate-300 font-medium">
                {isWaste ? 'Recommended Steps to Avoid / Optimize:' : 'Recommended Steps to Double-down:'}
              </div>
              <ul className="space-y-1 text-xs text-slate-400">
                {rec.alternatives?.map((alt, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-500 text-[10px] mt-0.5">✔</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
              {rec.timeReduction && rec.timeReduction !== '0 hrs' && (
                <div className="text-[11px] text-slate-400 mt-2 italic">
                  Expected Outcome: Save {rec.timeSaved} (Reduction target: {rec.timeReduction})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Business Reports</h3>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer">
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{generating ? 'Generating...' : `Generate ${activeTab} Report`}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports ({reports.length})
          </h4>

          {loading ? (
            <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-500 mx-auto" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No reports yet. Click generate to create one.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {reports.map(report => (
                <button key={report.id} onClick={() => handleSelect(report.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedReport?.id === report.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-300">{report.period_start?.slice(0, 10)}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6">
          {selectedReport ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</h4>
                <span className="text-[10px] text-slate-500">{selectedReport.period_start?.slice(0, 10)} - {selectedReport.period_end?.slice(0, 10)}</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {selectedReport.total_activities !== undefined && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{selectedReport.total_activities}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Activities</p>
                    </div>
                  )}
                  {selectedReport.total_minutes !== undefined && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{Math.round(selectedReport.total_minutes / 60)}h</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Time</p>
                    </div>
                  )}
                  {selectedReport.categories_covered !== undefined && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{selectedReport.categories_covered}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Categories</p>
                    </div>
                  )}
                </div>

                {selectedReport.recommendations?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 mr-1.5" /> AI Business Insights
                    </h5>
                    <div className="space-y-4">
                      {selectedReport.recommendations.map((rec, i) => renderRecommendationCard(rec, i))}
                    </div>
                  </div>
                )}

                {renderAnalysis(selectedReport)}

                {selectedReport.content && !selectedReport.recommendations && (
                  <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedReport.content}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Select a report to view its details</p>
              {reports.length === 0 && !loading && (
                <button onClick={handleGenerate} disabled={generating}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg inline-flex items-center space-x-1.5 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate First Report</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
