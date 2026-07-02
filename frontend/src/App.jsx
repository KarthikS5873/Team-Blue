import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthOnboarding } from './pages/AuthOnboarding';
import { Dashboard } from './pages/Dashboard';
import { Activities } from './pages/Activities';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';
import { SettingsProfile } from './pages/SettingsProfile';

const AppContent = () => {
  const { isAuthenticated, isOnboarded, loading, currentRoute, navigateTo } = useApp();

  React.useEffect(() => {
    if (loading) return;
    if (isAuthenticated && !isOnboarded && currentRoute !== '/onboarding') {
      navigateTo('/onboarding');
    } else if (!isAuthenticated && currentRoute !== '/' && currentRoute !== '/signup') {
      navigateTo('/');
    }
  }, [isAuthenticated, isOnboarded, loading, currentRoute, navigateTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isOnboarded) {
    return <AuthOnboarding />;
  }

  const renderRoute = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <Dashboard />;
      case '/activity/new':
      case '/activity/history':
        return <Activities />;
      case '/tasks':
        return <Tasks />;
      case '/reports':
        return <Reports />;
      case '/settings':
      case '/profile':
        return <SettingsProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
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
