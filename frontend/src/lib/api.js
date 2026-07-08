import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

async function request(endpoint, options = {}) {
  const token = await getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }

  return res.json();
}

export const api = {
  auth: {
    signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    onboarding: (data) => request('/auth/onboarding', { method: 'PUT', body: JSON.stringify(data) })
  },

  activities: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/activities${qs ? `?${qs}` : ''}`);
    },
    create: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/activities/${id}`, { method: 'DELETE' })
  },

  tasks: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/tasks${qs ? `?${qs}` : ''}`);
    },
    create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
  },

  ai: {
    recommendations: () => request('/ai/recommendations', { method: 'POST' }),
    prioritize: () => request('/ai/prioritize', { method: 'POST' }),
  },

  reports: {
    list: (type) => request(`/reports/${type}`),
    get: (type, id) => request(`/reports/${type}/${id}`),
    generate: (type) => request('/reports/generate', { method: 'POST', body: JSON.stringify({ type }) })
  }
};
