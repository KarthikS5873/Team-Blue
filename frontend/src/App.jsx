import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthOnboarding } from './pages/AuthOnboarding';
import { Dashboard } from './pages/Dashboard';
import { Activities } from './pages/Activities';
import { Analysis } from './pages/Analysis';
import { ClientsTasks } from './pages/ClientsTasks';
import { CalendarMeetings } from './pages/CalendarMeetings';
import { GoalsReports } from './pages/GoalsReports';
import { AIInsights } from './pages/AIInsights';
import { SettingsProfile } from './pages/SettingsProfile';

const AppContent = () => {
  const { user, currentRoute } = useApp();

  // If no user session is present or onboarding hasn't been finished, force AuthOnboarding view
  if (!user || !user.onboardingCompleted) {
    return <AuthOnboarding />;
  }

  // Master Router Switch
  const renderRoute = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <Dashboard />;
      case '/activity/new':
      case '/activity/history':
        return <Activities />;
      case '/time-analysis':
      case '/revenue':
        return <Analysis />;
      case '/tasks':
      case '/clients':
        return <ClientsTasks />;
      case '/calendar':
      case '/meetings':
        return <CalendarMeetings />;
      case '/goals':
      case '/reports':
        return <GoalsReports />;
      case '/ai-insights':
        return <AIInsights />;
      case '/settings':
      case '/profile':
      case '/help':
        return <SettingsProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div id="chronos-app-frame" className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-500/25 selection:text-blue-900">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Executive Canvas */}
      <div id="main-content-viewport" className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Controls */}
        <Header />

        {/* Dynamic Canvas Container */}
        <main className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
          <div className="max-w-6xl mx-auto">
            {renderRoute()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
