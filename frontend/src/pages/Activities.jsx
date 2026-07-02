import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, Search, ArrowUpDown, Filter, Edit2, Trash2, Calendar, Clock, DollarSign, ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';

export const Activities = () => {
  const {
    currentRoute,
    navigateTo,
    activities,
    clients,
    addActivity,
    updateActivity,
    deleteActivity,
    user
  } = useApp();

  if (!user) return null;

  // ------------------------------------------------------------------
  // STATE MANAGEMENT FOR LOG NEW ACTIVITY
  // ------------------------------------------------------------------
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Client Work');
  const [duration, setDuration] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [billable, setBillable] = useState(true);
  const [clientId, setClientId] = useState('');
  const [billingRate, setBillingRate] = useState(user.targetHourlyRate || 150);
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill client rate if client changes
  const handleClientChange = (cId) => {
    setClientId(cId);
    const client = clients.find(c => c.id === cId);
    if (client) {
      setBillingRate(client.hourlyRate);
    }
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const revenueGenerated = billable ? (duration * billingRate) : 0;

    addActivity({
      title,
      category,
      duration,
      date,
      billable,
      billingRate: billable ? billingRate : 0,
      revenueGenerated,
      clientId: clientId || undefined,
      description
    });

    setSuccessMsg("Activity successfully logged in ledger database!");
    // Reset form
    setTitle('');
    setDuration(1);
    setDescription('');
    setClientId('');
    setBillingRate(user.targetHourlyRate || 150);
    setBillable(true);

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ------------------------------------------------------------------
  // STATE FOR ACTIVITY LEDGER (SEARCH, SORT, FILTER, PAGINATION, EDIT)
  // ------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBillable, setFilterBillable] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Editing modal/state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Client Work');
  const [editDuration, setEditDuration] = useState(1);
  const [editDate, setEditDate] = useState('');
  const [editBillable, setEditBillable] = useState(true);
  const [editClientId, setEditClientId] = useState('');
  const [editBillingRate, setEditBillingRate] = useState(150);
  const [editDescription, setEditDescription] = useState('');

  const handleStartEdit = (act) => {
    setEditingId(act.id);
    setEditTitle(act.title);
    setEditCategory(act.category);
    setEditDuration(act.duration);
    setEditDate(act.date);
    setEditBillable(act.billable);
    setEditClientId(act.clientId || '');
    setEditBillingRate(act.billingRate || 150);
    setEditDescription(act.description || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingId) return;

    const revenueGenerated = editBillable ? (editDuration * editBillingRate) : 0;

    updateActivity(editingId, {
      title: editTitle,
      category: editCategory,
      duration: editDuration,
      date: editDate,
      billable: editBillable,
      billingRate: editBillable ? editBillingRate : 0,
      revenueGenerated,
      clientId: editClientId || undefined,
      description: editDescription
    });

    setEditingId(null);
  };

  // 1. FILTERING
  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || act.category === filterCategory;
    
    const matchesBillable = filterBillable === 'All' || 
                            (filterBillable === 'Billable' && act.billable) || 
                            (filterBillable === 'Non-Billable' && !act.billable);
                            
    return matchesSearch && matchesCategory && matchesBillable;
  });

  // 2. SORTING
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];

    if (sortField === 'date') {
      fieldA = new Date(a.date).getTime();
      fieldB = new Date(b.date).getTime();
    }

    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 3. PAGINATION
  const totalItems = sortedActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedActivities.slice(indexOfFirstItem, indexOfLastItem);

  // ------------------------------------------------------------------
  // SCENE RENDERER: LOG NEW ACTIVITY
  // ------------------------------------------------------------------
  if (currentRoute === '/activity/new') {
    return (
      <div id="new-activity-container" className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
        
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record a New Task or Client Hourly Block</h3>
              <p className="text-xs text-slate-500">Audit your hour yields by capturing tasks into the master financial matrix.</p>
            </div>
          </div>

          {successMsg && (
            <div id="success-alert" className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2 mb-6">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Activity Name / Short Description
                </label>
                <input
                  id="activity-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Cloud RDS Pricing Audit"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Category Classification
                </label>
                <select
                  id="activity-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white"
                >
                  <option value="Client Work">Client Work (Direct Revenue)</option>
                  <option value="Admin & Ops">Admin & Ops (Overhead)</option>
                  <option value="Marketing & Sales">Marketing & Sales (Pipeline)</option>
                  <option value="Product Dev">Product Dev (IP & R&D)</option>
                  <option value="Learning & Growth">Learning & Growth (Competency)</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Execution Date
                </label>
                <input
                  id="activity-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Duration Slider */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Hours Logged</span>
                  <span className="text-sm font-mono font-bold text-blue-600">{duration} hours</span>
                </div>
                <input
                  id="activity-duration"
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Billable Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Billing Arrangement
                </label>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    id="billable-true-btn"
                    type="button"
                    onClick={() => setBillable(true)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      billable ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Direct Billable Client Work
                  </button>
                  <button
                    id="billable-false-btn"
                    type="button"
                    onClick={() => {
                      setBillable(false);
                      setClientId('');
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      !billable ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Non-Billable (Leak Opportunity)
                  </button>
                </div>
              </div>

              {/* Associated Client (Conditional) */}
              {billable && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                    Associated Portfolio Client
                  </label>
                  <select
                    id="activity-client"
                    value={clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:bg-white"
                  >
                    <option value="">-- Private Consulting / No Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (${c.hourlyRate}/hr)</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Billing Rate (Conditional) */}
              {billable && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                    Billable Hourly Rate ($ USD)
                  </label>
                  <input
                    id="activity-billing-rate"
                    type="number"
                    value={billingRate}
                    onChange={(e) => setBillingRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Analytical Narrative Notes
                </label>
                <textarea
                  id="activity-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes explaining scope, tasks completed, and outcomes..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none h-24"
                />
              </div>

            </div>

            {/* Live Financial Valuation Card */}
            <div className="p-4 rounded-lg border bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400">Live Valuation Assessment:</span>
              </div>
              <div>
                {billable ? (
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    +${duration * billingRate} USD Billable Yield
                  </div>
                ) : (
                  <div className="text-base font-bold text-amber-400 font-mono">
                    -${duration * (user.targetHourlyRate || 150)} USD Opportunity Leak
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="activity-submit-btn"
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Log Activity Into Database Ledger
              </button>
            </div>
          </form>
        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------
  // SCENE RENDERER: HISTORICAL LEDGER
  // ------------------------------------------------------------------
  return (
    <div id="activity-ledger-container" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Search and Filters panel */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="ledger-search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by log title, keyword..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 text-xs">
          
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Category:</span>
            <select
              id="ledger-cat-filter"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Client Work">Client Work</option>
              <option value="Admin & Ops">Admin & Ops</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
              <option value="Product Dev">Product Dev</option>
              <option value="Learning & Growth">Learning & Growth</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">Billability:</span>
            <select
              id="ledger-bill-filter"
              value={filterBillable}
              onChange={(e) => {
                setFilterBillable(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Billable">Billable</option>
              <option value="Non-Billable">Non-Billable</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-mono border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Activity Info</th>
                <th className="py-3.5 px-4 font-semibold">Classification</th>
                <th className="py-3.5 px-4 font-semibold cursor-pointer select-none hover:text-black" onClick={() => toggleSort('date')}>
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold cursor-pointer select-none hover:text-black" onClick={() => toggleSort('duration')}>
                  <div className="flex items-center space-x-1">
                    <span>Duration</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold cursor-pointer select-none hover:text-black" onClick={() => toggleSort('revenueGenerated')}>
                  <div className="flex items-center space-x-1">
                    <span>Value Output</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No logs found matching search / filter criteria.
                  </td>
                </tr>
              ) : (
                currentItems.map(act => {
                  const clientObj = clients.find(c => c.id === act.clientId);
                  const isEditing = editingId === act.id;

                  if (isEditing) {
                    return (
                      <tr key={act.id} className="bg-blue-50/5">
                        <td className="py-4 px-6" colSpan={6}>
                          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input
                                type="text"
                                required
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                              >
                                <option value="Client Work">Client Work</option>
                                <option value="Admin & Ops">Admin & Ops</option>
                                <option value="Marketing & Sales">Marketing & Sales</option>
                                <option value="Product Dev">Product Dev</option>
                                <option value="Learning & Growth">Learning & Growth</option>
                              </select>
                              <input
                                type="date"
                                required
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                              />
                              <input
                                type="number"
                                step="0.5"
                                required
                                value={editDuration}
                                onChange={(e) => setEditDuration(Number(e.target.value))}
                                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                                placeholder="Hours"
                              />
                              <div className="flex items-center space-x-2">
                                <label className="text-slate-500">Billable?</label>
                                <input
                                  type="checkbox"
                                  checked={editBillable}
                                  onChange={(e) => setEditBillable(e.target.checked)}
                                  className="rounded border-slate-300"
                                />
                              </div>
                              {editBillable && (
                                <input
                                  type="number"
                                  value={editBillingRate}
                                  onChange={(e) => setEditBillingRate(Number(e.target.value))}
                                  className="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                                  placeholder="Hourly Rate"
                                />
                              )}
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{act.title}</div>
                        {act.description && (
                          <div className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">{act.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          {act.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        {new Date(act.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-800 font-bold">
                        {act.duration}h
                      </td>
                      <td className="py-4 px-4">
                        {act.billable ? (
                          <div className="font-mono text-emerald-600 font-bold flex items-center">
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            <span>{act.revenueGenerated}</span>
                            {clientObj && (
                              <span className="text-[10px] text-slate-400 font-sans ml-1.5 font-normal">({clientObj.name})</span>
                            )}
                          </div>
                        ) : (
                          <div className="font-mono text-amber-600 flex items-center">
                            <span>-${act.duration * (user.targetHourlyRate || 150)}</span>
                            <span className="text-[9px] text-slate-400 font-sans ml-1.5">Opp Leak</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          <button
                            id={`edit-act-btn-${act.id}`}
                            onClick={() => handleStartEdit(act)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-act-btn-${act.id}`}
                            onClick={() => deleteActivity(act.id)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">
              Showing items {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-500 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
