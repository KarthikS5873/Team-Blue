import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../lib/constants';
import { Settings, User, Save, Loader2, AlertCircle, MapPin, Building2, Briefcase, FileText, Target, DollarSign } from 'lucide-react';

export const SettingsProfile = () => {
  const { currentRoute, userProfile, businessProfile, updateProfile } = useApp();
  const isSettings = currentRoute === '/settings';

  const [name, setName] = useState(userProfile?.name || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [businessName, setBusinessName] = useState(businessProfile?.business_name || '');
  const businessType = 'Freelancer';
  const [role, setRole] = useState(businessProfile?.role || '');
  const [description, setDescription] = useState(businessProfile?.description || '');
  const [goal, setGoal] = useState(businessProfile?.goal || '');
  const [monthlyRevenue, setMonthlyRevenue] = useState(businessProfile?.monthly_revenue || '');
  const [weeklyRevenue, setWeeklyRevenue] = useState(businessProfile?.weekly_revenue || '');
  const [dailyRevenue, setDailyRevenue] = useState(businessProfile?.daily_revenue || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await updateProfile({
        name,
        location,
        business_name: businessName,
        business_type: businessType,
        role,
        description,
        goal,
        monthly_revenue: Number(monthlyRevenue) || 0,
        weekly_revenue: Number(weeklyRevenue) || 0,
        daily_revenue: Number(dailyRevenue) || 0
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center space-x-3 mb-2">
        {isSettings ? <Settings className="w-5 h-5 text-blue-400" /> : <User className="w-5 h-5 text-blue-400" />}
        <h3 className="text-lg font-bold text-white">{isSettings ? 'Settings' : 'Profile'}</h3>
      </div>

      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
          Profile updated successfully
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center mb-4">
            <User className="w-4 h-4 text-blue-400 mr-2" /> Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <MapPin className="w-3 h-3 inline mr-1" /> Location
              </label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h4 className="text-sm font-bold text-white flex items-center mb-4">
            <Building2 className="w-4 h-4 text-blue-400 mr-2" /> Business Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Name</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Type</label>
              <div className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm flex items-center">
                <span className="text-blue-400 font-semibold">Freelancer</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Target className="w-3 h-3 inline mr-1" /> Goal
              </label>
              <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none h-20" />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h4 className="text-sm font-bold text-white flex items-center mb-4">
            <DollarSign className="w-4 h-4 text-blue-400 mr-2" /> Revenue
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monthly (₹)</label>
              <input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Weekly (₹)</label>
              <input type="number" value={weeklyRevenue} onChange={(e) => setWeeklyRevenue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily (₹)</label>
              <input type="number" value={dailyRevenue} onChange={(e) => setDailyRevenue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-lg flex items-center justify-center space-x-2 cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </form>
    </div>
  );
};
