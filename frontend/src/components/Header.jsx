import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Sun, Moon } from 'lucide-react';

export const Header = () => {
  const { currentRoute, isAuthenticated, isOnboarded } = useApp();
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('advisor_theme') || 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('advisor_theme', theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8 transition-colors">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {titles[currentRoute] || 'ValueTrack AI'}
        </h2>
      </div>
      <div className="flex items-center space-x-4 text-xs text-slate-500">
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Advisor Active</span>
        </div>
      </div>
    </header>
  );
};
