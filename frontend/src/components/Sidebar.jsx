import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, PlusCircle, History, CheckSquare, BarChart3,
  Sparkles, Settings, LogOut, User
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRoute, navigateTo, logout, isAuthenticated, isOnboarded } = useApp();
  if (!isAuthenticated || !isOnboarded) return null;

  const navItems = [
    { section: 'Overview', items: [
      { name: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
      { name: 'Log Activity', route: '/activity/new', icon: PlusCircle },
      { name: 'Activity History', route: '/activity/history', icon: History },
    ]},
    { section: 'Management', items: [
      { name: 'Task Manager', route: '/tasks', icon: CheckSquare },
      { name: 'Reports', route: '/reports', icon: BarChart3, badge: 'AI' },
    ]},
    { section: 'System', items: [
      { name: 'Settings', route: '/settings', icon: Settings },
      { name: 'Profile', route: '/profile', icon: User },
    ]},
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 text-slate-300">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('/dashboard')}>
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">ValueTrack AI</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group, i) => (
          <div key={i} className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {group.section}
            </h3>
            {group.items.map((item, j) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button key={j} onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                  }`}>
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : ''}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase tracking-widest border border-blue-500/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors text-sm">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
