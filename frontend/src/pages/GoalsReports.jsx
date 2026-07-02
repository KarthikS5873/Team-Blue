import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Target, Plus, CheckCircle, Flame, Calendar, Sparkles, DollarSign, Award, Download, Printer, Percent, Users, Clock, Trash2, ArrowRight } from 'lucide-react';

export const GoalsReports = () => {
  const {
    currentRoute,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    activities,
    user,
    clients
  } = useApp();

  if (!user) return null;

  // ------------------------------------------------------------------
  // GOALS ENGINE STATE & ACTIONS (Route: "/goals")
  // ------------------------------------------------------------------
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);
  const [goalCurrent, setGoalCurrent] = useState(0);
  const [goalUnit, setGoalUnit] = useState('USD');
  const [goalDeadline, setGoalDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [goalCategory, setGoalCategory] = useState('Revenue');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalTitle) return;

    addGoal({
      title: goalTitle,
      targetValue: goalTarget,
      currentValue: goalCurrent,
      unit: goalUnit,
      deadline: goalDeadline,
      category: goalCategory
    });

    setGoalTitle('');
    setGoalTarget(10);
    setGoalCurrent(0);
    setShowAddGoalForm(false);
  };

  const handleIncrementGoal = (id, currentValue, targetValue) => {
    if (currentValue < targetValue) {
      updateGoal(id, { currentValue: currentValue + 1 });
    }
  };

  // ------------------------------------------------------------------
  // FINANCIAL STATEMENT EXPORTER STATES (Route: "/reports")
  // ------------------------------------------------------------------
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Computations for report
  const totalHours = activities.reduce((sum, act) => sum + act.duration, 0);
  const billableActivities = activities.filter(act => act.billable);
  const totalBillableHours = billableActivities.reduce((sum, act) => sum + act.duration, 0);
  const totalUnbillableHours = totalHours - totalBillableHours;
  const totalRevenue = activities.reduce((sum, act) => sum + (act.revenueGenerated || 0), 0);
  
  // Categorized unbillable leakage hours
  const adminHours = activities.filter(act => act.category === 'Admin & Ops').reduce((sum, act) => sum + act.duration, 0);
  const marketingHours = activities.filter(act => act.category === 'Marketing & Sales').reduce((sum, act) => sum + act.duration, 0);
  const productHours = activities.filter(act => act.category === 'Product Dev').reduce((sum, act) => sum + act.duration, 0);
  const learningHours = activities.filter(act => act.category === 'Learning & Growth').reduce((sum, act) => sum + act.duration, 0);

  const adminLeakage = adminHours * user.targetHourlyRate;
  const marketingLeakage = marketingHours * user.targetHourlyRate;
  const productLeakage = productHours * user.targetHourlyRate;
  const learningLeakage = learningHours * user.targetHourlyRate;
  const totalLeakage = adminLeakage + marketingLeakage + productLeakage + learningLeakage;

  // Efficiency index (Revenue / (Revenue + Leakage))
  const efficiencyIndex = totalRevenue > 0 ? Math.round((totalRevenue / (totalRevenue + totalLeakage)) * 100) : 0;

  const triggerMockExport = (type) => {
    setIsExporting(true);
    setExportComplete(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
      if (type === 'pdf') {
        window.print();
      }
    }, 1500);
  };

  // ------------------------------------------------------------------
  // RENDERING SCENE: GOALS
  // ------------------------------------------------------------------
  if (currentRoute === '/goals') {
    return (
      <div id="goals-page" className="space-y-6 animate-in fade-in duration-200">
        
        {/* Header Toolbar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Strategic Objectives</h3>
            <p className="text-xs text-neutral-505">Track targets for revenue growth, overhead boundaries, and client retention.</p>
          </div>
          <button
            id="add-goal-toggle-btn"
            onClick={() => setShowAddGoalForm(!showAddGoalForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Define Objective</span>
          </button>
        </div>

        {/* Goal Form Card */}
        {showAddGoalForm && (
          <div id="add-goal-form-container" className="bg-white rounded-lg border border-neutral-200 p-6 shadow-md max-w-xl animate-in slide-in-from-top-4 duration-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-505 mb-4 font-mono">Define Metric Parameter</h4>
            <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-505 font-semibold mb-1">Objective Title</label>
                  <input
                    id="new-goal-title"
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Maximize billing, Minimize admin"
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-505 font-semibold mb-1">Objective Classification</label>
                  <select
                    id="new-goal-category"
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Revenue">Revenue Earnings</option>
                    <option value="Productivity">Productivity Hours</option>
                    <option value="Acquisition">Client Acquisition</option>
                    <option value="Learning">Learning & Competency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-505 font-semibold mb-1">Metric Unit</label>
                  <select
                    id="new-goal-unit"
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="USD">Earnings (USD $)</option>
                    <option value="Hours">Hours (h)</option>
                    <option value="Clients">Portfolio Clients</option>
                    <option value="Percentage">Ratio Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-505 font-semibold mb-1">Target Value</label>
                  <input
                    id="new-goal-target"
                    type="number"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-505 font-semibold mb-1">Target Deadline</label>
                  <input
                    id="new-goal-date"
                    type="date"
                    required
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalForm(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="goal-submit-btn"
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-505 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Onboard Objective
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals Listing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isCompleted = goal.currentValue >= goal.targetValue;

            return (
              <div
                key={goal.id}
                className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Goal Card Header */}
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider bg-neutral-100 text-neutral-600">
                      {goal.category}
                    </span>
                    <button
                      id={`delete-goal-btn-${goal.id}`}
                      onClick={() => deleteGoal(goal.id)}
                      className="text-neutral-300 hover:text-red-500 transition-colors p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Goal Info */}
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm leading-tight">{goal.title}</h4>
                    <p className="text-[10px] text-neutral-400 font-mono flex items-center mt-1.5">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Deadline: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Progress visuals */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className="text-neutral-505">Current Progress:</span>
                      <span className="text-neutral-900">
                        {goal.unit === 'USD' ? '$' : ''}
                        {goal.currentValue} / {goal.unit === 'USD' ? '$' : ''}
                        {goal.targetValue} {goal.unit !== 'USD' ? goal.unit : ''} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden border border-neutral-200/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-505' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Incrementor and Success indicator */}
                <div className="mt-6 pt-4 border-t border-neutral-50 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex items-center space-x-1.5 text-emerald-600 font-bold text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Goal Completed!</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-blue-600 font-bold text-xs animate-pulse">
                      <Flame className="w-4 h-4" />
                      <span>Active Drive</span>
                    </div>
                  )}

                  {!isCompleted && (
                    <button
                      id={`inc-goal-${goal.id}`}
                      onClick={() => handleIncrementGoal(goal.id, goal.currentValue, goal.targetValue)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center cursor-pointer"
                    >
                      <span>Update</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDERING SCENE: EXPORTS & REPORTS
  // ------------------------------------------------------------------
  return (
    <div id="reports-exporting-page" className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      
      {/* Exporter Toolbar */}
      <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-955">Financial Statements Engine</h3>
          <p className="text-[10px] text-neutral-550">Generate and print audit-grade Executive Valuation & Opportunity Cost declarations.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            id="print-statement-btn"
            onClick={() => triggerMockExport('pdf')}
            disabled={isExporting}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Print / Export PDF'}</span>
          </button>
          <button
            id="csv-download-btn"
            onClick={() => triggerMockExport('csv')}
            disabled={isExporting}
            className="px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-semibold text-xs rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Spreadsheet</span>
          </button>
        </div>
      </div>

      {exportComplete && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold text-center animate-bounce">
          ✓ Document Compiled & Transmitted Successfully!
        </div>
      )}

      {/* Main printable ledger overlay */}
      <div id="printable-statement" className="bg-white rounded-lg border border-neutral-200 p-8 shadow-md space-y-8 font-sans">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-neutral-900 flex items-center">
              <span className="bg-slate-900 text-white p-1 rounded-lg text-sm mr-2 font-mono">CH</span>
              CHRONOSAI VALUATION STATEMENT
            </h1>
            <p className="text-xs text-neutral-400 font-mono">DOC ID: CHR-STMT-2026-0702</p>
            <p className="text-xs text-neutral-500">Executive: <span className="font-bold text-neutral-800">{user.name}</span> • Company: <span className="font-bold text-neutral-800">{user.company}</span></p>
          </div>
          <div className="text-right text-xs">
            <h4 className="font-bold text-neutral-900">CHRONOS DIGITAL LTD</h4>
            <p className="text-neutral-400">Statement compiled on:</p>
            <p className="font-mono font-semibold text-neutral-700">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* 1. Earnings summary section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono border-b border-neutral-100 pb-1 flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-emerald-500" />
            Section I: Gross Consulting Earnings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-neutral-100">
              <thead>
                <tr className="text-neutral-400 font-semibold">
                  <th className="py-2">Client Portfolio Name</th>
                  <th className="py-2 text-right">Hours Tracked</th>
                  <th className="py-2 text-right">Contracted Rate</th>
                  <th className="py-2 text-right">Gross Earnings Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-705">
                {clients.map(c => {
                  const logs = activities.filter(act => act.clientId === c.id);
                  const hrs = logs.reduce((sum, act) => sum + act.duration, 0);
                  const rev = logs.reduce((sum, act) => sum + (act.revenueGenerated || 0), 0);
                  if (hrs === 0) return null;

                  return (
                    <tr key={c.id}>
                      <td className="py-2.5 font-semibold text-neutral-900">{c.name}</td>
                      <td className="py-2.5 text-right font-mono">{hrs.toFixed(1)}h</td>
                      <td className="py-2.5 text-right font-mono">${c.hourlyRate}/hr</td>
                      <td className="py-2.5 text-right font-mono font-bold text-neutral-900">${rev.toLocaleString()}</td>
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr className="font-bold text-neutral-900 bg-neutral-50">
                  <td className="py-2.5 px-2">Total Yield Portfolio</td>
                  <td className="py-2.5 text-right font-mono pr-2">{totalBillableHours.toFixed(1)}h</td>
                  <td className="py-2.5 text-right font-mono">-</td>
                  <td className="py-2.5 text-right font-mono text-emerald-600 px-2">${totalRevenue.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Opportunity Cost leakage analysis */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono border-b border-neutral-100 pb-1 flex items-center">
            <Clock className="w-4 h-4 mr-1 text-amber-500" />
            Section II: Opportunity Time Leakage
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-neutral-100">
              <thead>
                <tr className="text-neutral-400 font-semibold">
                  <th className="py-2">Unbillable Taxonomy Category</th>
                  <th className="py-2 text-right">Overhead Hours</th>
                  <th className="py-2 text-right">Calibration Rate</th>
                  <th className="py-2 text-right">Opportunity Cost Leak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-705">
                <tr>
                  <td className="py-2.5 font-semibold text-neutral-900">Administrative & Operations</td>
                  <td className="py-2.5 text-right font-mono">{adminHours.toFixed(1)}h</td>
                  <td className="py-2.5 text-right font-mono">${user.targetHourlyRate}/hr</td>
                  <td className="py-2.5 text-right font-mono text-amber-600 font-semibold">${adminLeakage.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-neutral-900">Marketing & Sales Pipeline</td>
                  <td className="py-2.5 text-right font-mono">{marketingHours.toFixed(1)}h</td>
                  <td className="py-2.5 text-right font-mono">${user.targetHourlyRate}/hr</td>
                  <td className="py-2.5 text-right font-mono text-amber-600 font-semibold">${marketingLeakage.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-neutral-900">Product Development (R&D)</td>
                  <td className="py-2.5 text-right font-mono">{productHours.toFixed(1)}h</td>
                  <td className="py-2.5 text-right font-mono">${user.targetHourlyRate}/hr</td>
                  <td className="py-2.5 text-right font-mono text-amber-600 font-semibold">${productLeakage.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-neutral-900">Learning & Competency Growth</td>
                  <td className="py-2.5 text-right font-mono">{learningHours.toFixed(1)}h</td>
                  <td className="py-2.5 text-right font-mono">${user.targetHourlyRate}/hr</td>
                  <td className="py-2.5 text-right font-mono text-amber-600 font-semibold">${learningLeakage.toLocaleString()}</td>
                </tr>
                {/* Total leak row */}
                <tr className="font-bold text-neutral-900 bg-neutral-50">
                  <td className="py-2.5 px-2">Total Unbillable Leakage</td>
                  <td className="py-2.5 text-right font-mono pr-2">{totalUnbillableHours.toFixed(1)}h</td>
                  <td className="py-2.5 text-right font-mono">-</td>
                  <td className="py-2.5 text-right font-mono text-amber-600 px-2">${totalLeakage.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Valuation metrics balance summary */}
        <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">Net Earning Effectiveness Score</span>
            <div className="text-2xl font-black mt-1 text-blue-400">{efficiencyIndex}% EFFICIENCY</div>
          </div>
          <div className="sm:text-right text-xs space-y-1">
            <p className="text-slate-400">Monthly Revenue Goal: <span className="text-white font-bold">${user.monthlyRevenueGoal.toLocaleString()}</span></p>
            <p className="text-slate-400">Total Net Value Potential: <span className="text-white font-bold">${(totalRevenue + totalLeakage).toLocaleString()}</span></p>
          </div>
        </div>

        {/* Auditor endorsement stamp */}
        <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-neutral-400 gap-4">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-505 animate-pulse" />
            <span>Certified & Audited automatically by ChronosAI Time Intelligence Engine</span>
          </div>
          <p className="font-mono uppercase tracking-widest">SOC-2 VERIFIED SECURE</p>
        </div>

      </div>

    </div>
  );
};
