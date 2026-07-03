import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { STATUS_COLORS } from '../lib/constants';
import { CheckSquare, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react';

function computePriority(title, deadline) {
  const lower = (title || '').toLowerCase();

  const highKeywords = [
    'client', 'deliverable', 'invoice', 'payment', 'proposal', 'contract', 'agreement',
    'revision', 'urgent', 'meeting', 'call', 'revenue', 'sale', 'deal',
    'pitch', 'presentation', 'launch', 'release', 'deploy', 'review', 'approval',
    'follow up', 'follow-up', 'submit', 'quote', 'estimate',
    'close', 'win', 'sign', 'onboard', 'kickoff', 'milestone',
    'pay', 'bill', 'money', 'receipt',
    'bug', 'fix', 'error', 'issue', 'critical', 'emergency',
    'complaint', 'escalation', 'overdue',
    'prospect', 'lead', 'opportunity', 'statement', 'hire', 'freelance',
    'gig', 'assignment', 'brief', 'action', 'response', 'reply',
    'confirm', 'schedule', 'write', 'draft', 'prepare', 'create',
    'develop', 'build', 'complete', 'finish', 'finalize', 'deliver'
  ];
  const lowKeywords = [
    'clean', 'organize', 'admin', 'archive', 'sort', 'tidy', 'label',
    'cleanup', 'clean up', 'trash', 'spam', 'junk',
    'read', 'reading', 'blog', 'article', 'watch', 'video', 'tutorial',
    'browse', 'surf', 'scroll', 'notification'
  ];

  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'High';
    if (diffDays <= 3) return 'High';
  }

  for (const kw of highKeywords) {
    if (lower.includes(kw)) return 'High';
  }

  for (const kw of lowKeywords) {
    if (lower.includes(kw)) return 'Low';
  }

  return 'Medium';
}

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
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
      const priority = computePriority(title, deadline);
      await api.tasks.create({
        title,
        deadline: deadline || null,
        priority
      });
      setTitle('');
      setDeadline('');
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

  const highTasks = tasks.filter(t => t.priority === 'high');
  const mediumTasks = tasks.filter(t => t.priority === 'medium' || !t.priority);
  const lowTasks = tasks.filter(t => t.priority === 'low');

  const renderPriorityColumn = (titleLabel, priorityKey, tasksList, borderBgClass, dotClass) => {
    return (
      <div className={`border rounded-xl p-4 flex flex-col space-y-3 min-h-[250px] ${borderBgClass}`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
            <h4 className="text-sm font-semibold text-white">{titleLabel}</h4>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full font-medium">
            {tasksList.length}
          </span>
        </div>

        {tasksList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-600">
            <p className="text-xs italic">No {priorityKey} priority tasks</p>
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
            {tasksList.map(task => (
              <div key={task.id} className="bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 rounded-lg p-3 flex items-start justify-between group transition-all">
                <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                  <button onClick={() => handleStatusChange(task)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 hover:border-blue-500'
                    }`}>
                    {task.status === 'completed' && (
                      <svg className="w-2.5 h-2.5 stroke-[3] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium leading-relaxed break-words ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_COLORS[task.status] || 'bg-slate-800 text-slate-400'}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0 ml-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Task Manager</h3>
        </div>
        <div className="flex items-center space-x-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-400 font-medium">Task Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Send invoice to Client X" required />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-400 font-medium">Deadline (optional)</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          {title && (() => {
            const p = computePriority(title, deadline);
            const colors = { High: 'text-red-400', Medium: 'text-yellow-400', Low: 'text-slate-400' };
            return <p className="text-[10px]">Priority: <span className={`font-bold ${colors[p] || 'text-slate-400'}`}>{p}</span></p>;
          })()}
          <p className="text-[10px] text-slate-500 italic">Auto-assigned based on task content and deadline</p>
          <div className="flex space-x-2 pt-1">
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
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-lg">
          <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No tasks yet. Click "Add Task" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderPriorityColumn('High Priority', 'high', highTasks, 'border-red-500/10 bg-red-500/5', 'bg-red-500')}
          {renderPriorityColumn('Medium Priority', 'medium', mediumTasks, 'border-yellow-500/10 bg-yellow-500/5', 'bg-yellow-500')}
          {renderPriorityColumn('Low Priority', 'low', lowTasks, 'border-slate-500/10 bg-slate-500/5', 'bg-slate-400')}
        </div>
      )}
    </div>
  );
};
