import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, DollarSign, Award, Target, TrendingUp, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const Analysis = () => {
  const { currentRoute, activities, clients, user } = useApp();

  if (!user) return null;

  // 1. DATA PREPARATION & CALCULATIONS
  const totalHours = activities.reduce((sum, act) => sum + act.duration, 0);
  const billableActivities = activities.filter(act => act.billable);
  const totalBillableHours = billableActivities.reduce((sum, act) => sum + act.duration, 0);
  const totalUnbillableHours = totalHours - totalBillableHours;
  const billableRatio = totalHours > 0 ? Math.round((totalBillableHours / totalHours) * 100) : 0;
  const totalRevenue = activities.reduce((sum, act) => sum + (act.revenueGenerated || 0), 0);

  // Category breakdown for Pie Chart
  const categories = ['Client Work', 'Admin & Ops', 'Marketing & Sales', 'Product Dev', 'Learning & Growth'];
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
  
  const categoryChartData = categories.map((cat, idx) => {
    const hours = activities
      .filter(act => act.category === cat)
      .reduce((sum, act) => sum + act.duration, 0);
    return {
      name: cat,
      value: Number(hours.toFixed(1)),
      color: COLORS[idx]
    };
  }).filter(item => item.value > 0);

  // Day of week productivity breakdown (Mon-Sun)
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekData = DAYS.map((dayName, dayIdx) => {
    const dailyLogs = activities.filter(act => {
      // get day index
      const d = new Date(act.date + 'T00:00:00');
      return d.getDay() === dayIdx;
    });

    const billableHours = dailyLogs
      .filter(act => act.billable)
      .reduce((sum, act) => sum + act.duration, 0);
      
    const unbillableHours = dailyLogs
      .filter(act => !act.billable)
      .reduce((sum, act) => sum + act.duration, 0);

    return {
      day: dayName.substring(0, 3),
      'Billable Hours': Number(billableHours.toFixed(1)),
      'Unbillable Hours': Number(unbillableHours.toFixed(1))
    };
  });

  // Client ROI Calculations
  const clientData = clients.map(client => {
    const clientLogs = activities.filter(act => act.clientId === client.id);
    const clientHours = clientLogs.reduce((sum, act) => sum + act.duration, 0);
    const clientRevenue = clientLogs.reduce((sum, act) => sum + (act.revenueGenerated || 0), 0);
    const hourlyYield = clientHours > 0 ? Math.round(clientRevenue / clientHours) : 0;
    
    return {
      name: client.name,
      company: client.company,
      hourlyRate: client.hourlyRate,
      hours: clientHours,
      revenue: clientRevenue,
      hourlyYield: hourlyYield,
    };
  });

  // Filter out clients with no hours tracked for visual charts
  const activeClientChartData = clientData.filter(c => c.hours > 0);

  // ------------------------------------------------------------------
  // VIEW A: TIME ANALYSIS (Route: "/time-analysis")
  // ------------------------------------------------------------------
  if (currentRoute === '/time-analysis') {
    return (
      <div id="time-analysis-page" className="space-y-8 animate-in fade-in duration-200">
        
        {/* Core Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider block">Total Tracked Hours</span>
            <div className="text-3xl font-black text-slate-950 font-mono mt-1">{totalHours.toFixed(1)}h</div>
            <p className="text-[10px] text-slate-500 mt-2">Active logging volume over database ledger</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider block">Billable Time Ratio</span>
            <div className="text-3xl font-black text-blue-600 font-mono mt-1">{billableRatio}%</div>
            <div className="w-2/3 bg-slate-100 h-1.5 rounded-full mx-auto mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${billableRatio}%` }} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider block">Unbillable Admin Overhead</span>
            <div className="text-3xl font-black text-amber-500 font-mono mt-1">{totalUnbillableHours.toFixed(1)}h</div>
            <p className="text-[10px] text-slate-500 mt-2">Equivalent to {(100 - billableRatio)}% of tracked time</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Pie Category density */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Category Duration Mix</h3>
              <p className="text-[10px] text-slate-500">Breakdown of hours across functional categories</p>
            </div>
            {categoryChartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
                Log activities to generate category allocations.
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center mt-4">
                <div className="w-full h-44 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Hours`, 'Time']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-[10px]">
                  {categoryChartData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 truncate">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-neutral-500 truncate">{item.name}</span>
                      <span className="font-mono font-bold text-neutral-700">({item.value}h)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2 & 3: Day of Week Density */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Weekly Execution Heat Map</h3>
              <p className="text-[10px] text-slate-500">Comparison of billable focus hours vs administrative overheads by day of week</p>
            </div>
            <div className="flex-1 w-full mt-4 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="Billable Hours" fill="#3b82f6" stackId="a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Unbillable Hours" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------
  // VIEW B: REVENUE MAPPING (Route: "/revenue")
  // ------------------------------------------------------------------
  return (
    <div id="revenue-mapping-page" className="space-y-8 animate-in fade-in duration-200">
      
      {/* Portfolio Financial Benchmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider block">Logged Billings</span>
          <div className="text-3xl font-black text-emerald-600 font-mono mt-1">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <p className="text-[10px] text-slate-500 mt-2">Active billable consulting hours logged</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider block">Average Hourly Yield</span>
          <div className="text-3xl font-black text-slate-950 font-mono mt-1">
            ${totalBillableHours > 0 ? Math.round(totalRevenue / totalBillableHours) : 0}/hr
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Relative to target rate: ${user.targetHourlyRate}/hr</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider block">Goal Gap Analysis</span>
          <div className="text-3xl font-black text-indigo-600 font-mono mt-1">
            ${Math.max(0, user.monthlyRevenueGoal - totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Remaining to hit monthly goal of ${user.monthlyRevenueGoal.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Revenue per Client */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Client Portfolio Gross Billings</h3>
            <p className="text-[10px] text-slate-500">Gross total revenue generated by each active consulting account</p>
          </div>
          {activeClientChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Log client-associated activities to populate portfolio revenues.
            </div>
          ) : (
            <div className="flex-1 w-full mt-4 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeClientChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Gross Billings']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Card 2: Client Hourly Yield Comparison */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Client Return-on-Hour (Yield)</h3>
            <p className="text-[10px] text-slate-500">Comparison of contracted hourly billing rates vs actual realized hourly yield</p>
          </div>
          {activeClientChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Log client-associated hours to compute return parameters.
            </div>
          ) : (
            <div className="flex-1 w-full mt-4 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeClientChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`$${value}/hr`, 'Yield']} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="hourlyRate" name="Contracted Rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hourlyYield" name="Realized Yield" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Realized Client yield list table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Realized Consulting Return Ledger</h3>
          <p className="text-[10px] text-slate-500">Review detailed audit parameters, total hours, and realized ROI across accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-mono border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Client Identity</th>
                <th className="py-3.5 px-4 font-semibold">Hours Tracked</th>
                <th className="py-3.5 px-4 font-semibold">Total Gross Billings</th>
                <th className="py-3.5 px-4 font-semibold">Contracted Rate</th>
                <th className="py-3.5 px-4 font-semibold">Realized Yield</th>
                <th className="py-3.5 px-6 font-semibold text-right">Status Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientData.map(c => {
                const isOptimal = c.hourlyYield >= user.targetHourlyRate;
                return (
                  <tr key={c.name} className="hover:bg-slate-50/40">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.company}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-700 font-bold">{c.hours.toFixed(1)}h</td>
                    <td className="py-4 px-4 font-mono text-slate-900 font-bold">${c.revenue.toLocaleString()}</td>
                    <td className="py-4 px-4 font-mono text-slate-505">${c.hourlyRate}/hr</td>
                    <td className={`py-4 px-4 font-mono font-bold ${isOptimal ? 'text-emerald-600' : 'text-amber-600'}`}>
                      ${c.hourlyYield}/hr
                    </td>
                    <td className="py-4 px-6 text-right">
                      {c.hours === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase">
                          No Time Logged
                        </span>
                      ) : isOptimal ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                          Optimal Yield
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                          Leak Warning
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
