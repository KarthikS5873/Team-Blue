import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Clock,
  ShieldAlert,
  Users,
  Sparkles,
  ArrowUpRight,
  Plus,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

export const Dashboard = () => {
  const {
    user,
    activities,
    clients,
    navigateTo,
    aiInsights,
    isGeneratingInsights,
    generateAIAnalysis
  } = useApp();

  if (!user) return null;

  // 1. DYNAMIC CALCULATIONS
  const totalHours = activities.reduce((sum, act) => sum + act.duration, 0);
  const billableActivities = activities.filter(act => act.billable);
  const totalBillableHours = billableActivities.reduce((sum, act) => sum + act.duration, 0);
  
  // Billable Ratio
  const billableRatio = totalHours > 0 ? Math.round((totalBillableHours / totalHours) * 100) : 0;
  
  // Total Revenue Generated
  const totalRevenue = activities.reduce((sum, act) => sum + (act.revenueGenerated || 0), 0);
  
  // Opportunity Cost Leakage (duration * targetHourlyRate for all unbillable hours)
  const totalLeakage = activities
    .filter(act => !act.billable)
    .reduce((sum, act) => sum + (act.duration * (user.targetHourlyRate || 150)), 0);

  // Average Hourly Billing Rate (Revenue / Billable Hours)
  const averageBillableRate = totalBillableHours > 0 
    ? Math.round(totalRevenue / totalBillableHours) 
    : 0;

  // 2. RECHARTS CHART DATA PREPARATION
  // Category Allocation Bar Chart
  const categories = ['Client Work', 'Admin & Ops', 'Marketing & Sales', 'Product Dev', 'Learning & Growth'];
  const categoryData = categories.map(cat => {
    const hours = activities
      .filter(act => act.category === cat)
      .reduce((sum, act) => sum + act.duration, 0);
    return {
      name: cat.split(' ')[0], // short name
      fullName: cat,
      Hours: Number(hours.toFixed(1))
    };
  });

  // Daily Trend Area Chart (Grouping last 7 dates)
  const uniqueDates = Array.from(new Set(activities.map(act => act.date))).sort().slice(-7);
  const trendData = uniqueDates.map(date => {
    const dailyRevenue = activities
      .filter(act => act.date === date)
      .reduce((sum, act) => sum + (act.revenueGenerated || 0), 0);
    
    const dailyHours = activities
      .filter(act => act.date === date)
      .reduce((sum, act) => sum + act.duration, 0);

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return {
      date: formattedDate,
      Revenue: dailyRevenue,
      Hours: Number(dailyHours.toFixed(1))
    };
  });

  // Ensure charts have default dummy dates if trend is empty
  const finalTrendData = trendData.length > 0 ? trendData : [
    { date: 'Jun 28', Revenue: 400, Hours: 6 },
    { date: 'Jun 29', Revenue: 787, Hours: 7 },
    { date: 'Jun 30', Revenue: 0, Hours: 5 },
    { date: 'Jul 01', Revenue: 625, Hours: 7.5 },
    { date: 'Jul 02', Revenue: 600, Hours: 4.5 }
  ];

  return (
    <div id="dashboard-page-container" className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl shadow-slate-950/20 text-white relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-500/10 to-transparent blur-2xl" />
        
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-bold tracking-tight">System Calibrated, Welcome back, {user.name}</h2>
          <p className="text-xs text-slate-400">
            ChronosAI is actively scanning <span className="text-blue-400 font-mono font-bold">{activities.length} activity logs</span> across <span className="text-blue-400 font-mono font-bold">{clients.length} active clients</span>.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0 z-10">
          <button
            id="dash-quick-log-btn"
            onClick={() => navigateTo('/activity/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Time Activity</span>
          </button>
          <button
            id="dash-ai-btn"
            onClick={() => navigateTo('/ai-insights')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Deep Audit Insights</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Revenue */}
        <div id="metric-card-revenue" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-505 font-sans">
              Gross Monthly Billings
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1.5 flex items-center">
              Target goal: <span className="font-mono font-bold text-slate-705 ml-1">${user.monthlyRevenueGoal.toLocaleString()}/mo</span>
              <span className="ml-2 font-semibold text-emerald-600">
                ({Math.round((totalRevenue / user.monthlyRevenueGoal) * 100)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Opportunity Leakage */}
        <div id="metric-card-leakage" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-505">
              Opportunity Time Leak
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-600 font-mono">
              ${totalLeakage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-505 mt-1.5">
              Lost billable potential on <span className="font-mono font-bold text-slate-705">{(totalHours - totalBillableHours).toFixed(1)}h</span> of unbillable work.
            </p>
          </div>
        </div>

        {/* Card 3: Hour breakdown */}
        <div id="metric-card-billable-ratio" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-550">
              Billable Allocation
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              {billableRatio}% <span className="text-xs text-slate-400 font-sans font-normal">({totalBillableHours.toFixed(1)}h)</span>
            </h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${billableRatio}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Average Client rate */}
        <div id="metric-card-avg-rate" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-550">
              Average Billable Rate
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              ${averageBillableRate}/hr
            </h3>
            <p className="text-[10px] text-slate-505 mt-1.5">
              Relative to your target: <span className="font-mono font-bold text-slate-705">${user.targetHourlyRate}/hr</span>
              <span className={`ml-1 font-bold ${averageBillableRate >= user.targetHourlyRate ? 'text-emerald-600' : 'text-amber-600'}`}>
                ({averageBillableRate >= user.targetHourlyRate ? '+' : ''}{Math.round(((averageBillableRate - user.targetHourlyRate) / user.targetHourlyRate) * 100)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Revenue Generated trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-955 font-sans tracking-tight">Billings Generation Trend</h3>
              <p className="text-[10px] text-slate-500">Gross revenue generated across historical timeline dates</p>
            </div>
            <button onClick={() => navigateTo('/revenue')} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider font-sans flex items-center space-x-0.5 cursor-pointer">
              <span>Revenue Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Hour Allocations by Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-955 font-sans tracking-tight">Time Category Allocations</h3>
              <p className="text-[10px] text-slate-500">Hours distributed across task taxonomy categories</p>
            </div>
            <button onClick={() => navigateTo('/time-analysis')} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider font-sans flex items-center space-x-0.5 cursor-pointer">
              <span>Time analysis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${value} Hours`, 'Time Spent']} />
                <Bar dataKey="Hours" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Two Columns: Recent logs and AI suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Recent Activity list */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-955 font-sans tracking-tight">Recent Work Log Entries</h3>
              <button onClick={() => navigateTo('/activity/history')} className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 cursor-pointer">
                <span>View all ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activities.slice(0, 4).map((act, index) => {
                const clientObj = clients.find(c => c.id === act.clientId);
                return (
                  <div key={act.id} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                    <div className="truncate pr-4 flex-1">
                      <h4 className="font-semibold text-slate-800 truncate">{act.title}</h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans font-medium">{act.category}</span>
                        <span>•</span>
                        <span>{new Date(act.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        {clientObj && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 font-sans font-semibold">{clientObj.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-bold text-slate-800">{act.duration}h</div>
                      {act.billable ? (
                        <div className="text-[10px] text-emerald-600 font-mono font-bold">+${act.revenueGenerated}</div>
                      ) : (
                        <div className="text-[10px] text-amber-600 font-mono">-${act.duration * (user.targetHourlyRate || 150)} leak</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 3: AI Quick Insight Snippet */}
        <div className="bg-slate-900 p-6 rounded-xl text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest">ChronosAI Audit</span>
            </div>

            {aiInsights.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono bg-slate-850 border border-slate-800 px-2 py-1 rounded inline-block">
                  {aiInsights[0].title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                  {aiInsights[0].description}
                </p>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-300">
                  <span className="font-bold text-blue-400">Next Step:</span> {aiInsights[0].actionableStep}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No audits run yet. Connect your API key to activate server-side analytics.</p>
            )}
          </div>

          <button
            onClick={() => navigateTo('/ai-insights')}
            className="w-full mt-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Open AI Audit Playground</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
