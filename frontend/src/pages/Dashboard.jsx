import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { formatINR } from '../lib/format';
import { Sparkles, Target, DollarSign, Clock, TrendingUp, AlertCircle, ChevronRight, ListTodo, RefreshCw, Loader2, CheckSquare } from 'lucide-react';

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
            <div className="space-y-3">
              {aiRecommendations.recommendations.slice(0, 4).map((rec, i) => (
                <div key={i} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-200 leading-relaxed">{rec}</p>
                </div>
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
        </div>

        {/* Priority Tasks */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
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
            <button onClick={() => navigateTo('/activity/new')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer">
              + Log Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


