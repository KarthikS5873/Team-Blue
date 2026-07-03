import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, onAuthStateChange, getSession } from '../lib/supabase';
import { api } from '../lib/api';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentRoute, setCurrentRoute] = useState(() => {
    return localStorage.getItem('advisor_route') || '/';
  });

  useEffect(() => {
    localStorage.setItem('advisor_route', currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchProfiles(session.access_token);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfiles(session.access_token);
      } else {
        setUserProfile(null);
        setBusinessProfile(null);
        setAiRecommendations(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchProfiles = async (token) => {
    try {
      const data = await api.auth.me();
      setUserProfile(data.user);
      setBusinessProfile(data.businessProfile);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!session;
  const isOnboarded = userProfile?.onboarding_completed;

  const navigateTo = (route) => {
    setCurrentRoute(route);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const profileData = await api.auth.me().catch(() => ({ user: null, businessProfile: null }));
    setUserProfile(profileData.user);
    setBusinessProfile(profileData.businessProfile);
    setLoading(false);
    if (profileData.user?.onboarding_completed) {
      navigateTo('/dashboard');
    } else {
      navigateTo('/onboarding');
    }
  };

  const signup = async (email, password, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone } }
    });
    if (error) throw new Error(error.message);
    navigateTo('/onboarding');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setBusinessProfile(null);
    setAiRecommendations(null);
    setCurrentRoute('/');
  };

  const completeOnboarding = async (onboardingData) => {
    const data = await api.auth.onboarding(onboardingData);
    setUserProfile(data.user);
    setBusinessProfile(data.businessProfile);
    navigateTo('/dashboard');
  };

  const updateProfile = async (profileData) => {
    try {
      const { user } = await api.auth.me();
      const updatedUser = { ...user, ...profileData };

      if (updatedUser.name || updatedUser.location) {
        await supabase.from('users').update({
          name: updatedUser.name,
          location: updatedUser.location
        }).eq('id', user.id);
      }

      const { data: business } = await supabase
        .from('business_profiles')
        .update({
          business_name: updatedUser.business_name,
          business_type: updatedUser.business_type,
          role: updatedUser.role,
          description: updatedUser.description,
          goal: updatedUser.goal,
          monthly_revenue: updatedUser.monthly_revenue,
          weekly_revenue: updatedUser.weekly_revenue,
          daily_revenue: updatedUser.daily_revenue
        })
        .eq('user_id', user.id)
        .select()
        .single();

      setUserProfile(updatedUser);
      if (business) setBusinessProfile(business);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const refreshRecommendations = async () => {
    setIsGeneratingAI(true);
    try {
      const data = await api.ai.recommendations();
      setAiRecommendations(data);
    } catch (error) {
      console.error('AI recommendations error:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <AppContext.Provider value={{
      currentRoute,
      navigateTo,
      session,
      userProfile,
      businessProfile,
      isAuthenticated,
      isOnboarded,
      loading,
      login,
      signup,
      logout,
      completeOnboarding,
      updateProfile,
      refreshRecommendations,
      aiRecommendations,
      isGeneratingAI
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
