import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { ACTIVITY_CATEGORIES } from '../lib/constants';
import { PlusCircle, History, Clock, Trash2, Loader2, AlertCircle, Filter } from 'lucide-react';

export const Activities = () => {
  const { currentRoute, businessProfile } = useApp();
  const isNew = currentRoute === '/activity/new';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = ACTIVITY_CATEGORIES['Freelancer'];

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = currentRoute === '/activity/history' ? {} : { date: dateFilter };
      const data = await api.activities.list(params);
      setActivities(data.activities || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentRoute, dateFilter]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !duration) {
      setError('Title, category, and duration are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.activities.create({
        title,
        category,
        duration_minutes: Number(duration),
        description,
        activity_date: new Date().toISOString().split('T')[0]
      });
      setTitle('');
      setCategory('');
      setDuration('');
      setDescription('');
      fetchActivities();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.activities.delete(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {isNew ? (
        <>
          <div className="flex items-center space-x-3 mb-2">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Log Activity</h3>
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="What did you work on?" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration (min) *</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="60" min="1" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none h-20"
                placeholder="Any additional details..." />
            </div>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Log Activity'}</span>
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <History className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Activity History</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-500 mx-auto" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-lg">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No activities found for this date</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map(act => (
                <div key={act.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-blue-400 uppercase">{act.category}</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-xs text-slate-500">{act.activity_date?.slice(0, 10)}</span>
                    </div>
                    <p className="text-sm text-white font-medium mt-1">{act.title}</p>
                    {act.description && <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>}
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="text-sm font-mono text-slate-300">{act.duration_minutes}m</span>
                    <button onClick={() => handleDelete(act.id)} className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
