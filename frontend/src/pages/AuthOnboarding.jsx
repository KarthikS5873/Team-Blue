import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Phone, User, MapPin, Building2, Briefcase, FileText, Target, DollarSign, ArrowRight, ArrowLeft, CheckCircle, Clock, Sparkles } from 'lucide-react';

const BUSINESS_TYPES = [
  'Freelancer', 'Agency', 'Restaurant', 'Retail Shop',
  'SaaS Founder', 'Consultant', 'Coach', 'Other'
];

const ROLES = [
  'Founder', 'Solopreneur', 'Sales Manager', 'Marketing Manager',
  'Store Owner', 'CEO', 'Director', 'Other'
];

export const AuthOnboarding = () => {
  const { currentRoute, navigateTo, login, signup, completeOnboarding } = useApp();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [weeklyRevenue, setWeeklyRevenue] = useState('');
  const [dailyRevenue, setDailyRevenue] = useState('');
  const [goal, setGoal] = useState('');
  const [onboardingError, setOnboardingError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    if (!signupEmail || !signupPassword) {
      setSignupError('Email and password are required');
      return;
    }
    try {
      await signup(signupEmail, signupPassword, signupPhone);
    } catch (err) {
      setSignupError(err.message || 'Unable to create account');
    }
  };

  const handleCompleteOnboarding = async () => {
    setOnboardingError('');
    if (!name || !businessName || !businessType || !role || !goal) {
      setOnboardingError('Please fill in all required fields');
      return;
    }

    try {
      await completeOnboarding({
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
    } catch (err) {
      setOnboardingError(err.message || 'Failed to complete setup');
    }
  };

  if (currentRoute === '/') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl" />

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-950/50 mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Business<span className="text-blue-400">AI</span></h1>
            <p className="text-sm text-slate-400 mt-2">AI-powered productivity advisor for your business</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-lg border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Sign in to your workspace</h2>

            {loginError && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 text-xs">{loginError}</div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer">
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
              <p className="text-xs text-slate-500">
                New to BusinessAI?{' '}
                <button onClick={() => navigateTo('/signup')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Create workspace
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoute === '/signup') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl" />

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-950/50 mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Create Your Workspace</h1>
            <p className="text-sm text-slate-400 mt-2">Start your 14-day free trial</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-lg border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Create Account</h2>

            {signupError && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 text-xs">{signupError}</div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="name@company.com" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="+91 98765 43210" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Min 6 characters" required minLength={6} />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer">
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button onClick={() => navigateTo('/')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoute === '/onboarding') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">BusinessAI Setup</p>
            <h1 className="text-2xl font-bold text-white mt-2">Configure Your Business Profile</h1>
            <p className="text-sm text-slate-400 mt-1">Help us understand your business for personalized recommendations</p>

            <div className="flex items-center justify-center space-x-2 mt-6">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-10 bg-blue-500' : step > s ? 'w-4 bg-blue-600' : 'w-2 bg-slate-700'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Step {step} of 5</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl">
            {onboardingError && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 text-xs">{onboardingError}</div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <User className="w-5 h-5 text-blue-400 mr-2" /> Personal Information
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Alex Carter" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <MapPin className="w-3 h-3 inline mr-1" /> Location
                  </label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Coimbatore, Tamil Nadu" />
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
                    <span>Next - Business Details</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Building2 className="w-5 h-5 text-blue-400 mr-2" /> Business Details
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Name *</label>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Growth Digital Agency" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Type *</label>
                    <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Role *</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
                      <option value="">Select role</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <FileText className="w-3 h-3 inline mr-1" /> Business Description
                  </label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none h-20"
                    placeholder="I run a digital marketing agency serving local businesses in Coimbatore..." />
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
                    <span>Next - Revenue</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-400 mr-2" /> Current Revenue Metrics
                </h3>
                <p className="text-xs text-slate-400">Tell us your approximate revenue to get better recommendations</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monthly Revenue</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                      <input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="50000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Weekly Revenue</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                      <input type="number" value={weeklyRevenue} onChange={(e) => setWeeklyRevenue(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="12000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily Revenue</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                      <input type="number" value={dailyRevenue} onChange={(e) => setDailyRevenue(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="1500" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(2)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <button onClick={() => setStep(4)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
                    <span>Next - Goal</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Target className="w-5 h-5 text-blue-400 mr-2" /> Your Business Goal
                </h3>
                <p className="text-xs text-slate-400">What's the primary goal you want to achieve?</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Goal *</label>
                  <textarea value={goal} onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none h-24"
                    placeholder="Reach ₹2,00,000 monthly revenue in 6 months" required />
                </div>
                <div className="p-4 bg-blue-950/20 border border-blue-800/20 rounded-lg text-xs text-blue-300 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-blue-400 inline mr-1" />
                  Your goal helps the AI recommend actions aligned to your vision. Be specific.
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <button onClick={handleCompleteOnboarding} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm rounded-lg flex items-center space-x-2 cursor-pointer">
                    <CheckCircle className="w-4 h-4" /><span>Complete Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
