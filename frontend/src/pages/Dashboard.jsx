import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { formatINR } from '../lib/format';
import { Sparkles, Target, DollarSign, Clock, TrendingUp, AlertCircle, ChevronRight, ListTodo, RefreshCw, Loader2, CheckSquare, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Dashboard = () => {
  const { userProfile, businessProfile, navigateTo, refreshRecommendations, aiRecommendations, isGeneratingAI } = useApp();
  const [todaysActivities, setTodaysActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [activitiesRes, tasksRes] = await Promise.all([
        api.activities.list({ date: today }),
        api.tasks.list({ status: 'pending,in-progress' })
      ]);
      setTodaysActivities(activitiesRes.activities || []);
      setTasks(tasksRes.tasks || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const priorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 5);
  const todayMinutes = todaysActivities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
  const todayHours = (todayMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {businessProfile?.business_name ? `${businessProfile.business_name} · ` : ''}
            {businessProfile?.business_type || 'Business'}
          </p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Today's Effort</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{todayHours}h</p>
          <p className="text-xs text-slate-500 mt-1">{todaysActivities.length} activities logged</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Goal</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white truncate">{businessProfile?.goal || 'No goal set'}</p>
          <p className="text-xs text-slate-500 mt-1">{businessProfile?.monthly_revenue ? `Monthly: ${formatINR(businessProfile.monthly_revenue)}` : 'Add revenue in settings'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">High Priority</span>
            <ListTodo className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{priorityTasks.length}</p>
          <p className="text-xs text-slate-500 mt-1">tasks need attention</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Recommendations */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" /> AI Recommendations
            </h3>
            <button onClick={refreshRecommendations} disabled={isGeneratingAI}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
              {isGeneratingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isGeneratingAI ? 'Generating...' : 'Refresh'}</span>
            </button>
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 mb-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {aiRecommendations?.recommendations?.length > 0 ? (
            <div className="space-y-4">
              {aiRecommendations.recommendations.slice(0, 4).map((rec, i) => (
                typeof rec === 'string' ? (
                  <div key={i} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-200 leading-relaxed">{rec}</p>
                  </div>
                ) : (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                    <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-400 tracking-wider uppercase flex items-center">
                        INSIGHT #{i + 1}
                      </span>
                      {rec.priority && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          rec.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          rec.priority === 'Important' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {rec.priority}
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3.5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-850">
                        <div>
                          {rec.category && (
                            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">{rec.category}</span>
                          )}
                          <span className="text-sm font-bold text-white">{rec.title}</span>
                        </div>
                        {rec.timeSpent && (
                          <div className="shrink-0">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                              rec.timeLossPercentage && rec.timeLossPercentage !== '0% focus loss' && rec.timeLossPercentage !== '0% business loss'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                            }`}>
                              {rec.timeLossPercentage && rec.timeLossPercentage !== '0% focus loss' && rec.timeLossPercentage !== '0% business loss'
                                ? `Wasted: ${rec.timeSpent} (${rec.timeLossPercentage})`
                                : `Gained: ${rec.timeReduction || rec.timeSpent} (${rec.growthGainPercentage})`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      {rec.whyFlagged && (
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reason (Why AI Flagged This)</h5>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/10 p-2.5 rounded border border-slate-850/60">{rec.whyFlagged}</p>
                        </div>
                      )}
                      {rec.alternatives?.length > 0 && (
                        <div className="pt-2 border-t border-slate-850/60">
                          <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center">
                            Solution (Action Plan)
                          </h5>
                          <div className="space-y-1.5">
                            <div className="text-xs text-slate-300 font-medium">
                              {rec.priority === 'Critical' || rec.priority === 'Important'
                                ? 'Recommended Steps to Avoid / Optimize:'
                                : 'Recommended Steps to Double-down:'}
                            </div>
                            <ul className="space-y-1 text-xs text-slate-400">
                              {rec.alternatives.map((alt, ai) => (
                                <li key={ai} className="flex items-start space-x-1.5">
                                  <span className="text-emerald-500 text-[10px] mt-0.5">+</span>
                                  <span>{alt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
              {aiRecommendations.recommendations.length > 4 && (
                <button onClick={() => navigateTo('/reports')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center cursor-pointer">
                  View all <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Log some activities and click Refresh to get AI-powered recommendations</p>
            </div>
          )}

          {aiRecommendations?.recommendations?.length > 0 && (() => {
            const data = aiRecommendations;
            const timeWasted = data.timeWastedTasks || [];
            const areas = data.areasToFocus || [];
            const projections = data.incomeGrowthProjections || [];
            const statement = data.incomeGrowthStatement || '';
            if (timeWasted.length === 0 && areas.length === 0 && !statement) return null;
            return (
              <div className="space-y-6 mt-6 pt-6 border-t border-slate-800/80">
                {(timeWasted.length > 0 || areas.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timeWasted.length > 0 && (
                      <div className="bg-red-950/10 border border-red-500/10 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Time Wasted Tasks
                        </h4>
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
                      </div>
                    )}
                    {areas.length > 0 && (
                      <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                          <TrendingUp className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Areas to Focus
                        </h4>
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
                      </div>
                    )}
                  </div>
                )}
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
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `\u20B9${val.toLocaleString('en-IN')}`} />
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
          })()}
        </div>

        {/* Priority Tasks */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 self-start">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center">
              <ListTodo className="w-4 h-4 text-red-400 mr-2" /> Priority Tasks
            </h3>
            <button onClick={() => navigateTo('/tasks')} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View All</button>
          </div>

          {loading ? (
            <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-500 mx-auto" /></div>
          ) : priorityTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No high priority tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {priorityTasks.map(task => (
                <div key={task.id} className="flex items-start space-x-2 p-2.5 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200 truncate">{task.title}</p>
                    {task.duration_minutes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.duration_minutes}m estimated</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button onClick={() => navigateTo('/tasks')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer">
              + Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
