import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Sparkles, DollarSign, Check, X, ShieldAlert, Award } from 'lucide-react';

export const Header = () => {
  const { currentRoute, navigateTo, user, notifications, markNotificationRead, clearNotifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user || !user.onboardingCompleted) return null;

  const unreadNotifs = notifications.filter(n => !n.read);
  const totalUnread = unreadNotifs.length;

  // Derive human-readable page titles
  const getPageTitle = () => {
    switch (currentRoute) {
      case '/dashboard': return "Executive Dashboard";
      case '/activity/new': return "Log New Time Activity";
      case '/activity/history': return "Historical Activity Ledger";
      case '/time-analysis': return "Analytical Time Breakdown";
      case '/revenue': return "Revenue Mapping & Valuation";
      case '/calendar': return "Weekly Calendar Schedule";
      case '/tasks': return "Revenue-Impact Task Manager";
      case '/clients': return "Client Portfolio Hub";
      case '/meetings': return "High-Value Meeting Manager";
      case '/goals': return "Strategic Objectives & Goals";
      case '/ai-insights': return "ChronosAI Premium Insights";
      case '/reports': return "Financial Statements & Analytics";
      case '/settings': return "Account Configuration Settings";
      case '/profile': return "Professional User Profile";
      case '/notifications': return "System Notifications";
      case '/help': return "ChronosAI Knowledge Base";
      default: return "System Core";
    }
  };

  const handleNotificationClick = (id, message) => {
    markNotificationRead(id);
    setShowNotifications(false);
    
    // Auto-navigate to correct sections if prompt references features
    if (message.toLowerCase().includes('insight') || message.toLowerCase().includes('leak')) {
      navigateTo('/ai-insights');
    } else if (message.toLowerCase().includes('goal')) {
      navigateTo('/goals');
    } else {
      navigateTo('/notifications');
    }
  };

  return (
    <header id="header-container" className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
      {/* Dynamic Title */}
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
          {getPageTitle()}
        </h2>
        {user.subscriptionTier === 'Pro' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Award className="w-3 h-3 mr-1 text-blue-700" />
            PRO ACTIVE
          </span>
        )}
      </div>

      {/* Target Tracker & Shortcuts */}
      <div className="flex items-center space-x-6">
        {/* Metric Overview Card */}
        <div className="hidden lg:flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center text-slate-500 mr-3">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-1" />
            Target Rate:
          </div>
          <div className="font-mono font-bold text-slate-800">
            ${user.targetHourlyRate}/hr
          </div>
          <div className="h-3 w-px bg-slate-300 mx-3" />
          <div className="flex items-center text-slate-500 mr-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 mr-1" />
            AI Efficiency:
          </div>
          <div className="font-mono font-bold text-blue-600">
            High (94%)
          </div>
        </div>

        {/* Interactive Notifications Bell */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {totalUnread > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white ring-1 ring-red-400 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
                  System Alerts ({totalUnread})
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] text-slate-500 hover:text-red-500 transition-colors uppercase font-mono font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Check className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">All caught up! No notifications.</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id, notif.message)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-3 ${
                        !notif.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'warning' ? (
                          <ShieldAlert className="w-4 h-4 text-amber-500" />
                        ) : notif.type === 'success' ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs text-slate-800 truncate font-semibold ${!notif.read ? 'text-black font-bold' : ''}`}>
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigateTo('/notifications');
                  }}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider font-sans py-1 inline-block"
                >
                  View All Alerts Ledger
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mini Quick-Link User Icon */}
        <div
          onClick={() => navigateTo('/profile')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-slate-200 object-cover group-hover:border-blue-500 transition-colors"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-semibold text-slate-700 group-hover:text-black transition-colors hidden sm:inline-block">
            {user.name.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
