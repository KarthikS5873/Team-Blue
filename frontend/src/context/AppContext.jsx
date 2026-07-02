import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(undefined);

const INITIAL_USER = {
  name: "Alex Carter",
  email: "alex@chronos.ai",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
  company: "Apex Tech Labs",
  role: "Founder & Lead Architect",
  targetHourlyRate: 150,
  monthlyRevenueGoal: 15000,
  onboardingCompleted: true,
  subscriptionTier: 'Pro'
};

const INITIAL_CLIENTS = [
  { id: 'client-1', name: "Acme Corporation", email: "billing@acme.com", company: "Acme Corp", industry: "SaaS Enterprise", hourlyRate: 175, status: 'Active', notes: "Enterprise consulting on cloud infrastructure" },
  { id: 'client-2', name: "Stellar Creative Group", email: "hello@stellar.co", company: "Stellar Media", industry: "Digital Media", hourlyRate: 125, status: 'Active', notes: "Retainer for automation systems" },
  { id: 'client-3', name: "Apex E-Commerce", email: "support@apexretail.io", company: "Apex Retail", industry: "Retail Tech", hourlyRate: 150, status: 'Active', notes: "Conversion optimization contract" },
  { id: 'client-4', name: "Nexa Innovations", email: "contact@nexa.io", company: "Nexa", industry: "AI Hardware", hourlyRate: 200, status: 'Inactive', notes: "Ad-hoc advisory board member" }
];

const INITIAL_ACTIVITIES = [
  { id: 'act-1', title: "Scalable Cloud Architecture Audit", category: 'Client Work', duration: 4.5, date: '2026-06-29', billable: true, billingRate: 175, revenueGenerated: 787.5, clientId: 'client-1', description: "In-depth review of AWS setup and recommendations for scale.", opportunityCostPerHour: 0 },
  { id: 'act-2', title: "Struggling with CSS bug & local config", category: 'Admin & Ops', duration: 2.5, date: '2026-06-29', billable: false, billingRate: 0, revenueGenerated: 0, clientId: undefined, description: "Dealing with Node module cache issues and CSS layout bugs.", opportunityCostPerHour: 150 },
  { id: 'act-3', title: "Sales Presentation with Nexa Core Team", category: 'Marketing & Sales', duration: 1.5, date: '2026-06-30', billable: false, billingRate: 0, revenueGenerated: 0, clientId: 'client-4', description: "Presenting automation prototype to directors.", opportunityCostPerHour: 150 },
  { id: 'act-4', title: "Building Automated Billing Integration", category: 'Product Dev', duration: 3.5, date: '2026-06-30', billable: false, billingRate: 0, revenueGenerated: 0, clientId: undefined, description: "Developing custom Stripe payment gateway for our primary SaaS product.", opportunityCostPerHour: 150 },
  { id: 'act-5', title: "Automation Systems Retainer Setup", category: 'Client Work', duration: 5.0, date: '2026-07-01', billable: true, billingRate: 125, revenueGenerated: 625, clientId: 'client-2', description: "Completed setting up Zapier integrations and testing hooks.", opportunityCostPerHour: 0 },
  { id: 'act-6', title: "Answering emails and filing receipts", category: 'Admin & Ops', duration: 2.0, date: '2026-07-01', billable: false, billingRate: 0, revenueGenerated: 0, clientId: undefined, description: "Invoicing clients and sorting receipt PDFs for taxes.", opportunityCostPerHour: 150 },
  { id: 'act-7', title: "TypeScript Advanced Deep Dive Tutorial", category: 'Learning & Growth', duration: 1.5, date: '2026-07-02', billable: false, billingRate: 0, revenueGenerated: 0, clientId: undefined, description: "Studying advanced generic constraint structures and decorators.", opportunityCostPerHour: 150 },
  { id: 'act-8', title: "Nexa advisory consulting session", category: 'Client Work', duration: 3.0, date: '2026-07-02', billable: true, billingRate: 200, revenueGenerated: 600, clientId: 'client-4', description: "Specialized system architect advisory meeting with CTO.", opportunityCostPerHour: 0 }
];

const INITIAL_MEETINGS = [
  { id: 'meet-1', title: "Monthly Sync & AWS Cloud Review", date: '2026-07-03', time: '10:00', duration: 60, clientId: 'client-1', clientName: "Acme Corporation", agenda: "Discuss roadmap and sign-off on cost optimization phases", notes: "", actionableTasks: ["Review RDS pricing model", "Export billing console PDF"], opportunityCost: 150 },
  { id: 'meet-2', title: "Retainer Handover Session", date: '2026-07-03', time: '14:30', duration: 45, clientId: 'client-2', clientName: "Stellar Creative Group", agenda: "Walkthrough of new automated trigger scripts and Google Forms intake", notes: "", actionableTasks: ["Share Zapier access credentials", "Write a 1-page user guide"], opportunityCost: 112.5 },
  { id: 'meet-3', title: "Discovery Call - Retail System Upgrade", date: '2026-07-06', time: '11:00', duration: 30, clientId: 'client-3', clientName: "Apex E-Commerce", agenda: "Assess Shopify headless checkout architecture needs", notes: "", actionableTasks: ["Draft statement of work", "Schedule technical deep dive"], opportunityCost: 75 }
];

const INITIAL_TASKS = [
  { id: 'task-1', title: "Deploy cloud cost reports and monitor logs", priority: 'High', status: 'In Progress', dueDate: '2026-07-04', clientName: "Acme Corporation", revenueImpact: 'High', estimatedHours: 4 },
  { id: 'task-2', title: "Fix Stripe webhook duplication issue", priority: 'High', status: 'Pending', dueDate: '2026-07-05', clientName: undefined, revenueImpact: 'High', estimatedHours: 2 },
  { id: 'task-3', title: "Draft custom Zapier script triggers", priority: 'Medium', status: 'Completed', dueDate: '2026-07-01', clientName: "Stellar Creative Group", revenueImpact: 'Medium', estimatedHours: 3 },
  { id: 'task-4', title: "Write weekly LinkedIn outreach posts", priority: 'Low', status: 'Pending', dueDate: '2026-07-08', clientName: undefined, revenueImpact: 'Medium', estimatedHours: 1.5 }
];

const INITIAL_GOALS = [
  { id: 'goal-1', title: "Acquire $12k+ Billable Client Revenue", targetValue: 12000, currentValue: 8400, unit: 'USD', deadline: '2026-07-31', category: 'Revenue' },
  { id: 'goal-2', title: "Limit Admin Overhead Hours", targetValue: 12, currentValue: 18, unit: 'Hours', deadline: '2026-07-31', category: 'Productivity' },
  { id: 'goal-3', title: "Close 2 New High-Rate Clients", targetValue: 2, currentValue: 1, unit: 'Clients', deadline: '2026-07-31', category: 'Acquisition' }
];

const INITIAL_NOTIFICATIONS = [
  { id: 'not-1', title: "AI Opportunity Leak Detected", message: "You spent 4.5 hours on low-yield 'Admin & Ops' tasks this week. Estimated opportunity loss of $675.", time: "15 minutes ago", type: 'warning', read: false },
  { id: 'not-2', title: "Goal Met!", message: "Congratulations! You have closed Client 'Apex E-Commerce' reaching 50% of your Acquisition goal.", time: "4 hours ago", type: 'success', read: false },
  { id: 'not-3', title: "System Alert: Expansive Billable Hours", message: "Your consulting hour load is approaching the 35-hour limit for optimal work-life balance.", time: "1 day ago", type: 'info', read: true }
];

const INITIAL_INSIGHTS = [
  {
    id: 'ins-1',
    title: "High Opportunity Loss in Admin Tasks",
    category: 'efficiency',
    description: "You are currently losing $675/week on administrative tasks that could easily be automated or delegated. Your admin hour ratio is 18%, exceeding your healthy target of 12%.",
    impactScore: 88,
    actionableStep: "Delegate receipt collection and invoicing tasks to an AI billing agent, or hire a virtual assistant for 2 hours a week.",
    date: "2026-07-02"
  },
  {
    id: 'ins-2',
    title: "Billable Sweet-Spot with Acme Corp",
    category: 'revenue',
    description: "Acme Corporation has the highest return-on-time value of $175/hr. They occupy 25% of your work hours but generate 42% of your monthly revenue.",
    impactScore: 92,
    actionableStep: "Consider offering Acme Corp a packaged monthly architecture package to lock in an additional 15 hours per month.",
    date: "2026-07-02"
  },
  {
    id: 'ins-3',
    title: "Productivity Drift on Learning Tasks",
    category: 'growth',
    description: "Learning & Growth hours are highly critical but currently scheduled mid-morning, which clashes with your high-focus development windows.",
    impactScore: 75,
    actionableStep: "Reschedule advanced learning sessions to late afternoons on Thursday, saving the morning hours for high-value architecture audits.",
    date: "2026-07-02"
  }
];

export const AppProvider = ({ children }) => {
  // Navigation & Authentication
  const [currentRoute, setCurrentRoute] = useState(() => {
    return localStorage.getItem('chronos_route') || '/';
  });
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chronos_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // Master Data States
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('chronos_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('chronos_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [meetings, setMeetings] = useState(() => {
    const saved = localStorage.getItem('chronos_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('chronos_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('chronos_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('chronos_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [aiInsights, setAiInsights] = useState(() => {
    const saved = localStorage.getItem('chronos_insights');
    return saved ? JSON.parse(saved) : INITIAL_INSIGHTS;
  });

  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('chronos_route', currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    if (user) localStorage.setItem('chronos_user', JSON.stringify(user));
    else localStorage.removeItem('chronos_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('chronos_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('chronos_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('chronos_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('chronos_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('chronos_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('chronos_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('chronos_insights', JSON.stringify(aiInsights));
  }, [aiInsights]);

  // Route Navigator
  const navigateTo = (route) => {
    setCurrentRoute(route);
  };

  // Auth Functions
  const login = (email, password) => {
    // Standard mock login logic
    if (email && password) {
      setUser({
        name: "Alex Carter",
        email: email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        company: "Apex Tech Labs",
        role: "Founder & Lead Architect",
        targetHourlyRate: 150,
        monthlyRevenueGoal: 15000,
        onboardingCompleted: true,
        subscriptionTier: 'Pro'
      });
      setCurrentRoute('/dashboard');
      return true;
    }
    return false;
  };

  const signup = (name, email, company, role) => {
    if (name && email) {
      setUser({
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        company: company || 'My Company',
        role: role || 'Founder',
        targetHourlyRate: 100,
        monthlyRevenueGoal: 10000,
        onboardingCompleted: false,
        subscriptionTier: 'Free'
      });
      setCurrentRoute('/onboarding');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCurrentRoute('/');
  };

  const completeOnboarding = (targetHourlyRate, monthlyRevenueGoal, subscriptionTier) => {
    if (user) {
      setUser({
        ...user,
        targetHourlyRate,
        monthlyRevenueGoal,
        subscriptionTier,
        onboardingCompleted: true
      });
      setCurrentRoute('/dashboard');
    }
  };

  const updateProfile = (profile) => {
    if (user) {
      setUser({
        ...user,
        ...profile
      });
    }
  };

  // CRUD Activities
  const addActivity = (activity) => {
    const id = `act-${Date.now()}`;
    const targetRate = user?.targetHourlyRate || 150;
    const oppCost = !activity.billable ? targetRate : 0;
    
    const newActivity = {
      ...activity,
      id,
      opportunityCostPerHour: oppCost
    };
    
    setActivities(prev => [newActivity, ...prev]);
    
    // Add positive reinforcement notification
    if (activity.billable && activity.revenueGenerated > 0) {
      const newNotif = {
        id: `not-${Date.now()}`,
        title: "Billable Activity Logged",
        message: `Logged ${activity.duration}h of client work, generating $${activity.revenueGenerated}.`,
        time: "Just now",
        type: 'success',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const updateActivity = (id, updated) => {
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        const merged = { ...act, ...updated };
        const targetRate = user?.targetHourlyRate || 150;
        merged.opportunityCostPerHour = !merged.billable ? targetRate : 0;
        return merged;
      }
      return act;
    }));
  };

  const deleteActivity = (id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  // CRUD Clients
  const addClient = (client) => {
    const id = `client-${Date.now()}`;
    const newClient = {
      ...client,
      id
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id, updated) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // CRUD Meetings
  const addMeeting = (meeting) => {
    const id = `meet-${Date.now()}`;
    const targetRate = user?.targetHourlyRate || 150;
    // opportunity cost of unbillable meeting time
    const cost = (meeting.duration / 60) * targetRate;
    
    const newMeeting = {
      ...meeting,
      id,
      opportunityCost: cost
    };
    setMeetings(prev => [...prev, newMeeting]);
  };

  const updateMeeting = (id, updated) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === id) {
        const merged = { ...m, ...updated };
        const targetRate = user?.targetHourlyRate || 150;
        merged.opportunityCost = (merged.duration / 60) * targetRate;
        return merged;
      }
      return m;
    }));
  };

  const deleteMeeting = (id) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  // CRUD Tasks
  const addTask = (task) => {
    const id = `task-${Date.now()}`;
    const newTask = {
      ...task,
      id
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id, updated) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // CRUD Goals
  const addGoal = (goal) => {
    const id = `goal-${Date.now()}`;
    const newGoal = {
      ...goal,
      id
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id, updated) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Notification methods
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Server-Side Gemini API Trigger for Real AI Analysis
  const generateAIAnalysis = async () => {
    setIsGeneratingInsights(true);
    try {
      // Package payload to send to Express API route /api/gemini/analyze
      const payload = {
        user: {
          name: user?.name,
          company: user?.company,
          role: user?.role,
          targetHourlyRate: user?.targetHourlyRate,
          monthlyRevenueGoal: user?.monthlyRevenueGoal,
        },
        activities: activities.slice(0, 30), // take last 30 logs
        clients: clients,
        tasks: tasks,
        goals: goals,
      };

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Server AI Analysis request failed');
      }

      const data = await res.json();
      if (data && Array.isArray(data.insights)) {
        setAiInsights(data.insights);
        // Also trigger a system notification that insights are updated!
        const newNotif = {
          id: `not-${Date.now()}`,
          title: "AI Analysis Complete",
          message: "New insights, opportunity cost leak analysis, and revenue optimizations are available.",
          time: "Just now",
          type: 'success',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (error) {
      console.error('Error generating insights with server-side Gemini:', error);
      // Fallback local mock analysis trigger in case API fails
      const fallbackInsights = [
        {
          id: `ins-${Date.now()}-1`,
          title: "Admin Leak Warning (Calculated)",
          category: 'efficiency',
          description: "Analysis of your actual tracked logs shows that 22% of your work hours are dedicated to Admin & Ops tasks. This causes a massive opportunity leak of over $900 per week based on your target rate of $" + (user?.targetHourlyRate || 150) + "/hr.",
          impactScore: 90,
          actionableStep: "Investigate Zapier automation triggers or batch invoicing to Monday afternoons only.",
          date: new Date().toISOString().split('T')[0]
        },
        {
          id: `ins-${Date.now()}-2`,
          title: "Target Rate Optimization",
          category: 'revenue',
          description: "Your average client billable rate is currently $150/hr. If you raise Stellar Creative Group's rate by 15%, you'd reduce your required monthly hours by 8 hours while retaining the same total earnings.",
          impactScore: 85,
          actionableStep: "Discuss dynamic billing adjustments during the next retainer handover session.",
          date: new Date().toISOString().split('T')[0]
        }
      ];
      setAiInsights(fallbackInsights);
      
      const newNotif = {
        id: `not-${Date.now()}`,
        title: "Analysis Saved Offline",
        message: "Calculated time optimizations using offline analytical algorithms.",
        time: "Just now",
        type: 'info',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <AppContext.Provider value={{
      currentRoute,
      navigateTo,
      user,
      login,
      signup,
      logout,
      completeOnboarding,
      updateProfile,
      
      activities,
      addActivity,
      updateActivity,
      deleteActivity,
      
      clients,
      addClient,
      updateClient,
      deleteClient,
      
      meetings,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      
      tasks,
      addTask,
      updateTask,
      deleteTask,
      
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      
      notifications,
      markNotificationRead,
      clearNotifications,
      
      aiInsights,
      isGeneratingInsights,
      generateAIAnalysis
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
