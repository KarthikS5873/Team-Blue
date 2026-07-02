import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, User, HelpCircle, Shield, Bell, HelpCircle as HelpIcon, Check, Award, RefreshCw, Key, ArrowRight, BookOpen, ChevronDown } from 'lucide-react';

export const SettingsProfile = () => {
  const {
    currentRoute,
    user,
    updateProfile,
    clients,
    activities
  } = useApp();

  if (!user) return null;

  // ------------------------------------------------------------------
  // PROFILE SUB-PAGE STATES & CRUD (Route: "/profile")
  // ------------------------------------------------------------------
  const [profileName, setProfileName] = useState(user.name);
  const [profileCompany, setProfileCompany] = useState(user.company);
  const [profileRole, setProfileRole] = useState(user.role);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const handleUpdateProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      company: profileCompany,
      role: profileRole
    });
    setProfileSuccessMsg("Profile successfully updated in active system cache!");
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // ------------------------------------------------------------------
  // SETTINGS SUB-PAGE STATES (Route: "/settings")
  // ------------------------------------------------------------------
  const [rateInput, setRateInput] = useState(user.targetHourlyRate);
  const [goalInput, setGoalInput] = useState(user.monthlyRevenueGoal);
  const [tierInput, setTierInput] = useState(user.subscriptionTier);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  const handleUpdateSettingsSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      targetHourlyRate: rateInput,
      monthlyRevenueGoal: goalInput,
      subscriptionTier: tierInput
    });
    setSettingsSuccessMsg("Configuration benchmarks saved successfully!");
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  // ------------------------------------------------------------------
  // HELP CENTER FAQ ACCORDIONS (Route: "/help")
  // ------------------------------------------------------------------
  const [activeFAQ, setActiveFAQ] = useState(null);

  const faqs = [
    {
      q: "What is 'Opportunity Time Leakage'?",
      a: "Opportunity Time Leakage measures the financial yield you lost by performing unbillable tasks (Admin, Internal Ops, or unbilled product development) instead of direct billable consulting. It is calculated by multiplying the unbillable duration by your configured target hourly rate."
    },
    {
      q: "How does ChronosAI calculate 'Realized Client Yield'?",
      a: "Realized Yield is the total revenue generated from client-associated billable activities divided by the total logged hours for that client. It helps identify low-yield accounts (high unbillable meeting/overhead times relative to small billed logs) vs high-yield accounts."
    },
    {
      q: "How does server-side Gemini AI audit work?",
      a: "When you launch a ChronosAI Time Audit, your logged activity blocks, current monthly objectives, and client profiles are compiled and sent to our secure Express backend proxy. Gemini 3.5-flash analyzes your specific time taxonomy, opportunity costs, and client returns, returning three customized optimization blueprints."
    },
    {
      q: "Is my corporate data secure?",
      a: "Yes. ChronosAI employs advanced server-side API proxy routing, ensuring that all API connections and secrets are entirely invisible to the client. Your tracked time ledger and accounts are encrypted locally on your host environment."
    }
  ];

  // ------------------------------------------------------------------
  // SCENE RENDERER: PROFESSIONAL USER PROFILE
  // ------------------------------------------------------------------
  if (currentRoute === '/profile') {
    return (
      <div id="profile-page-container" className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
        
        {/* Profile Card Summary */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full border border-neutral-200 object-cover mx-auto md:mx-0 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="text-center md:text-left space-y-1.5 flex-1">
            <h3 className="text-lg font-bold text-neutral-900">{user.name}</h3>
            <p className="text-xs text-neutral-500 font-sans font-medium">{user.role} at <span className="text-neutral-900 font-semibold">{user.company}</span></p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-705 font-mono font-bold">Target: ${user.targetHourlyRate}/hr</span>
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold">Goal: ${user.monthlyRevenueGoal.toLocaleString()}/mo</span>
              <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold">Plan: {user.subscriptionTier}</span>
            </div>
          </div>
        </div>

        {/* Profile Editing Form Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm">
          <div className="flex items-center space-x-2 text-neutral-900 mb-6">
            <User className="w-5 h-5 text-neutral-400" />
            <h4 className="text-sm font-bold tracking-tight">Modify Executive Profile</h4>
          </div>

          {profileSuccessMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold mb-6">
              ✓ {profileSuccessMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-505 font-semibold mb-1">Corporate Name</label>
                <input
                  id="profile-name-input"
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-neutral-505 font-semibold mb-1">Email Coordinates</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-100 rounded-lg text-neutral-400 cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-505 font-semibold mb-1">Corporate Entity</label>
                <input
                  id="profile-company-input"
                  type="text"
                  required
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-neutral-505 font-semibold mb-1">Executive Title Role</label>
                <input
                  id="profile-role-input"
                  type="text"
                  required
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                id="profile-submit-btn"
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-md cursor-pointer"
              >
                Sync Profile Coordinates
              </button>
            </div>
          </form>
        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------
  // SCENE RENDERER: ACCOUNT SETTINGS
  // ------------------------------------------------------------------
  if (currentRoute === '/settings') {
    return (
      <div id="settings-page-container" className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
        
        {/* Core Settings Config */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm">
          <div className="flex items-center space-x-2 text-neutral-900 mb-6">
            <Settings className="w-5 h-5 text-neutral-400" />
            <h4 className="text-sm font-bold tracking-tight">Configure Valuation Benchmarks</h4>
          </div>

          {settingsSuccessMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold mb-6">
              ✓ {settingsSuccessMsg}
            </div>
          )}

          <form onSubmit={handleUpdateSettingsSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Target Hourly Rate Slider */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-neutral-505 font-semibold uppercase tracking-wider font-mono">Target Rate Calibration</span>
                  <span className="text-sm font-mono font-bold text-blue-600">${rateInput}/hr</span>
                </div>
                <input
                  id="settings-rate-slider"
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={rateInput}
                  onChange={(e) => setRateInput(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Monthly revenue goal input */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-neutral-505 font-semibold uppercase tracking-wider font-mono">Monthly Earnings Goal</span>
                  <span className="text-sm font-mono font-bold text-blue-600">${goalInput.toLocaleString()}</span>
                </div>
                <input
                  id="settings-goal-slider"
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={goalInput}
                  onChange={(e) => setGoalInput(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Subscription Tier select */}
              <div>
                <label className="block text-neutral-505 font-semibold mb-1.5">Active Subscription Plan</label>
                <select
                  id="settings-plan-select"
                  value={tierInput}
                  onChange={(e) => setTierInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  <option value="Free">Starter ($0/mo)</option>
                  <option value="Pro">Executive ($29/mo)</option>
                  <option value="Enterprise">Enterprise ($149/mo)</option>
                </select>
              </div>

              {/* Alerts Toggles */}
              <div className="space-y-3">
                <label className="block text-neutral-505 font-semibold">System Alert Channels</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-neutral-600 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Transmit Weekly Email Leak Audits</span>
                  </label>
                  <label className="flex items-center space-x-2 text-neutral-600 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Instant Opportunity Leak Alerts (SMS)</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                id="settings-submit-btn"
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-md cursor-pointer"
              >
                Sync Benchmarks
              </button>
            </div>
          </form>
        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------
  // SCENE RENDERER: HELP CENTER / DOCS FAQs
  // ------------------------------------------------------------------
  return (
    <div id="help-page-container" className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      
      {/* Search Documentation banner */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 shadow-xl text-white">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest font-mono">ChronosAI Knowledge Base</h3>
        </div>
        <p className="text-xs text-slate-400">Search guides, methodologies, and calculations governing your executive time analyzer console.</p>
      </div>

      {/* Accordion list */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm divide-y divide-neutral-100">
        {faqs.map((faq, idx) => {
          const isOpen = activeFAQ === idx;
          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <button
                id={`faq-toggle-${idx}`}
                onClick={() => setActiveFAQ(isOpen ? null : idx)}
                className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs text-left focus:outline-none font-sans cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
              </button>
              
              {isOpen && (
                <p id={`faq-answer-${idx}`} className="text-xs text-neutral-505 leading-relaxed font-sans bg-neutral-50 p-3 rounded-lg border border-neutral-100/50 animate-in slide-in-from-top-1">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
