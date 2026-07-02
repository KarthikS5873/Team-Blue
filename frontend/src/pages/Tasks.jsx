import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { STATUS_COLORS, PRIORITY_COLORS } from '../lib/constants';
import { CheckSquare, Plus, Loader2, AlertCircle, Trash2, Sparkles, RefreshCw } from 'lucide-react';

export const Tasks = () => {
  const { refreshRecommendations } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prioritizing, setPrioritizing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.tasks.list();
      setTasks(data.tasks || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      await api.tasks.create({
        title,
        priority: 'medium',
        duration_minutes: null,
        status: 'pending'
      });
      setTitle('');
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' :
      task.status === 'in-progress' ? 'completed' : 'in-progress';
    try {
      await api.tasks.update(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.tasks.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrioritize = async () => {
    setPrioritizing(true);
    try {
      await api.ai.prioritize();
      await fetchTasks();
      await refreshRecommendations();
    } catch (err) {
      setError(err.message);
    } finally {
      setPrioritizing(false);
    }
  };

  const sorted = [...tasks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] || 1) - (order[b.priority] || 1);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Task Manager</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrioritize} disabled={prioritizing || tasks.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
            {prioritizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{prioritizing ? 'Prioritizing...' : 'AI Prioritize'}</span>
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex flex-col space-y-2">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Task title" required />
          </div>
          <div className="flex space-x-2">
            <button type="submit" disabled={saving}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer">
              {saving ? 'Saving...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-500 mx-auto" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-lg">
          <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No tasks yet. Click "Add Task" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(task => (
            <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between group">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button onClick={() => handleStatusChange(task)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : 'border-slate-600 hover:border-blue-500'
                  }`}>
                  {task.status === 'completed' && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="min-w-0">
                  <p className={`text-sm ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-[10px] font-semibold uppercase ${PRIORITY_COLORS[task.priority] || 'text-slate-400'}`}>{task.priority}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_COLORS[task.status] || 'text-slate-400'}`}>{task.status}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
