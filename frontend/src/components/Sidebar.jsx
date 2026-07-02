import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Clock,
  DollarSign,
  Calendar,
  CheckSquare,
  Users,
  Video,
  Target,
  Sparkles,
  BarChart3,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Bell
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRoute, navigateTo, logout, user, notifications } = useApp();
  
  if (!user || !user.onboardingCompleted) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigationItems = [
    {
      section: "Overview",
      items: [
        { name: "Dashboard", route: "/dashboard", icon: LayoutDashboard },
        { name: "Log Activity", route: "/activity/new", icon: PlusCircle },
        { name: "Activity History", route: "/activity/history", icon: History },
      ]
    },
    {
      section: "Analysis & Metrics",
      items: [
        { name: "Time Analysis", route: "/time-analysis", icon: Clock },
        { name: "Revenue Mapping", route: "/revenue", icon: DollarSign },
        { name: "AI Insights", route: "/ai-insights", icon: Sparkles, badge: true },
        { name: "Financial Reports", route: "/reports", icon: BarChart3 },
      ]
    },
    {
      section: "Management",
      items: [
        { name: "Task Manager", route: "/tasks", icon: CheckSquare },
        { name: "Client Management", route: "/clients", icon: Users },
        { name: "Meeting Manager", route: "/meetings", icon: Video },
        { name: "Calendar Schedule", route: "/calendar", icon: Calendar },
        { name: "Goals & Targets", route: "/goals", icon: Target },
      ]
    },
    {
      section: "System & Help",
      items: [
        { name: "Notifications", route: "/notifications", icon: Bell, alertBadge: unreadCount },
        { name: "Settings", route: "/settings", icon: Settings },
        { name: "User Profile", route: "/profile", icon: User },
        { name: "Help Center", route: "/help", icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 text-slate-300">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('/dashboard')}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight font-sans">ChronosAI</span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navigationItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans mb-2">
              {group.section}
            </h3>
            {group.items.map((item, itemIdx) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                   id={`nav-btn-${item.route.replace('/', '')}`}
                  key={itemIdx}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase tracking-widest border border-blue-500/20 animate-pulse">
                      AI
                    </span>
                  )}
                  {item.alertBadge ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-4 text-center">
                      {item.alertBadge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigateTo('/profile')}>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover group-hover:border-blue-500 transition-colors"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] text-slate-400">Pro Plan Active</p>
            </div>
          </div>
          <button
            id="logout-button"
            onClick={logout}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
