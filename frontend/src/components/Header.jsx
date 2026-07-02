import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles } from 'lucide-react';

export const Header = () => {
  const { currentRoute, isAuthenticated, isOnboarded } = useApp();
  if (!isAuthenticated || !isOnboarded) return null;

  const titles = {
    '/dashboard': 'Executive Dashboard',
    '/activity/new': 'Log Activity',
    '/activity/history': 'Activity History',
    '/tasks': 'Task Manager',
    '/reports': 'Business Reports',
    '/settings': 'Settings',
    '/profile': 'Profile',
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {titles[currentRoute] || 'BusinessAI'}
        </h2>
      </div>
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>AI Advisor Active</span>
      </div>
    </header>
  );
};
