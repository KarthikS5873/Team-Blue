import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, ShieldCheck, Mail, Lock, User, Building, Target, ArrowRight, DollarSign, Award, CheckCircle } from 'lucide-react';

export const AuthOnboarding = () => {
  const { currentRoute, navigateTo, login, signup, completeOnboarding } = useApp();
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('alex@chronos.ai');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');

  // Signup states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupRole, setSignupRole] = useState('');
  const [signupError, setSignupError] = useState('');

  // Onboarding states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [targetHourlyRate, setTargetHourlyRate] = useState(150);
  const [monthlyGoal, setMonthlyGoal] = useState(15000);
  const [selectedTier, setSelectedTier] = useState('Pro');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill out all fields.");
      return;
    }
    const success = login(loginEmail, loginPassword);
    if (!success) {
      setLoginError("Invalid email or password.");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail) {
      setSignupError("Name and email are required fields.");
      return;
    }
    const success = signup(signupName, signupEmail, signupCompany, signupRole);
    if (!success) {
      setSignupError("Unable to create account.");
    }
  };

  const handleCompleteOnboarding = () => {
    completeOnboarding(targetHourlyRate, monthlyGoal, selectedTier);
  };

  // ----------------------------------------------------
  // VIEW 1: LOGIN PAGE (Route: "/")
  // ----------------------------------------------------
  if (currentRoute === '/') {
    return (
      <div id="login-viewport" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl" />

        <div className="w-full max-w-md z-10">
          {/* Logo Heading */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-950/50 mb-4">
              <Clock className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Chronos<span className="text-blue-505">AI</span></h1>
            <p className="text-sm text-slate-400 mt-2 font-sans">Maximize your billable potential. Plug opportunity leaks.</p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-lg border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 font-sans">Access Premium Console</h2>

            {loginError && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-505 absolute left-3 top-3" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-sans"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Security Password
                  </label>
                  <a href="#forgot" className="text-xs text-blue-500 hover:text-blue-400">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-505 absolute left-3 top-3" />
                  <input
                    id="login-password-input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-sans"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg shadow-blue-950/40 hover:shadow-blue-900/50 flex items-center justify-center space-x-2 mt-2 cursor-pointer"
              >
                <span>Authorize & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
              <p className="text-xs text-slate-500">
                New to ChronosAI?{' '}
                <button
                  id="go-to-signup-btn"
                  onClick={() => navigateTo('/signup')}
                  className="text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
                >
                  Create free workspace
                </button>
              </p>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="text-center mt-8 text-xs text-slate-600 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Fully compliant with GDPR and SOC-2 standard encryption</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: SIGNUP PAGE (Route: "/signup")
  // ----------------------------------------------------
  if (currentRoute === '/signup') {
    return (
      <div id="signup-viewport" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl" />

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-950/50 mb-4">
              <Clock className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Chronos<span className="text-blue-505">AI</span></h1>
            <p className="text-sm text-slate-400 mt-2">Start your 14-day fully featured executive trial today.</p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-lg border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Create Executive Workspace</h2>

            {signupError && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 text-xs">
                {signupError}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-505 absolute left-3 top-3" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Alex Carter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-505 absolute left-3 top-3" />
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="alex@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-505 absolute left-3 top-3" />
                    <input
                      id="signup-company-input"
                      type="text"
                      value={signupCompany}
                      onChange={(e) => setSignupCompany(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="Apex Tech Labs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Professional Role
                  </label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-slate-505 absolute left-3 top-3" />
                    <input
                      id="signup-role-input"
                      type="text"
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:border-blue-500 focus:outline-none"
                      placeholder="Consultant / CEO"
                    />
                  </div>
                </div>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-50 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 mt-2 flex items-center justify-center space-x-2 mt-2 cursor-pointer"
              >
                <span>Register Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  id="go-to-login-btn"
                  onClick={() => navigateTo('/')}
                  className="text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
                >
                  Authorized Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: ONBOARDING WIZARD (Route: "/onboarding")
  // ----------------------------------------------------
  if (currentRoute === '/onboarding') {
    return (
      <div id="onboarding-viewport" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle dynamic stars/spots */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-950/20 blur-3xl animate-pulse" />
        
        <div className="w-full max-w-2xl z-10">
          {/* Onboarding Header */}
          <div className="text-center mb-8">
            <p className="text-xs text-blue-400 font-mono font-bold uppercase tracking-widest">ChronosAI Setup Engine</p>
            <h1 className="text-2xl font-bold text-white mt-2">Initialize Your Financial Value Matrix</h1>
            <p className="text-sm text-slate-400 mt-1">Calibrate ChronosAI to analyze your hourly yield leakage.</p>
            
            {/* Step indicators */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    onboardingStep === step ? 'w-10 bg-blue-500' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Core Wizard Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl relative">
            
            {/* STEP 1: TARGET HOURLY RATE */}
            {onboardingStep === 1 && (
              <div id="onboarding-step-1" className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    <DollarSign className="w-5 h-5 text-blue-400 mr-2" />
                    Determine Your Target Hourly Rate
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This benchmark is used as the baseline for your time valuations. Any unbillable hours spent on administrative tasks or operations will trigger an opportunity leakage alert calculated against this exact figure.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center">
                  <div className="text-4xl font-extrabold text-blue-500 font-mono tracking-tight">
                    ${targetHourlyRate}<span className="text-lg text-slate-500 font-sans font-normal"> / hour</span>
                  </div>
                  <input
                    id="rate-slider"
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={targetHourlyRate}
                    onChange={(e) => setTargetHourlyRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-6"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                    <span>$50/hr (Standard)</span>
                    <span>$250/hr (Strategic)</span>
                    <span>$500/hr (Enterprise Expert)</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-950/20 border border-blue-800/20 rounded-lg flex items-start space-x-3 text-xs text-blue-300 leading-relaxed">
                  <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Valuation Example:</span> If you spend 5 hours sorting unbillable emails, ChronosAI flags this as an opportunity cost leak of <span className="font-mono font-bold text-white">${5 * targetHourlyRate} USD</span>.
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    id="step1-next-btn"
                    onClick={() => setOnboardingStep(2)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Configure Revenue Target</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REVENUE GOAL */}
            {onboardingStep === 2 && (
              <div id="onboarding-step-2" className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    <Target className="w-5 h-5 text-blue-400 mr-2" />
                    Set Your Monthly Billable Revenue Target
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Set the target billing you want to unlock every month. ChronosAI will dynamically track your activity logs and meetings to measure goal progress metrics and analyze if you are on track.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center">
                  <div className="text-4xl font-extrabold text-blue-500 font-mono tracking-tight">
                    ${monthlyGoal.toLocaleString()}<span className="text-lg text-slate-500 font-sans font-normal"> / month</span>
                  </div>
                  <input
                    id="goal-slider"
                    type="range"
                    min="2000"
                    max="50000"
                    step="1000"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-6"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                    <span>$2,000/mo</span>
                    <span>$25,000/mo</span>
                    <span>$50,000/mo</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                  To hit this goal at your target rate, you must secure{' '}
                  <span className="font-mono font-bold text-blue-400">
                    {Math.ceil(monthlyGoal / targetHourlyRate)}
                  </span>{' '}
                  billable consulting hours per month (approx.{' '}
                  <span className="font-mono font-bold text-blue-400">
                    {Math.ceil((monthlyGoal / targetHourlyRate) / 4.3)}
                  </span>{' '}
                  hours / week).
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="step2-next-btn"
                    onClick={() => setOnboardingStep(3)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Choose Premium Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUBSCRIPTION PLAN */}
            {onboardingStep === 3 && (
              <div id="onboarding-step-3" className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    <Award className="w-5 h-5 text-blue-400 mr-2" />
                    Select Your ChronosAI Cloud Plan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Deploy your secure tracking server instance immediately. Cancel or downgrade anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <div
                    onClick={() => setSelectedTier('Free')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTier === 'Free'
                        ? 'bg-slate-950 border-blue-500 ring-1 ring-blue-500/20'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Starter</h4>
                    <p className="text-lg font-bold text-white mt-1">$0</p>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      Basic dashboard, 3 monthly client slots, standard unbillable cost trackers.
                    </p>
                  </div>

                  {/* Pro Plan */}
                  <div
                    onClick={() => setSelectedTier('Pro')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all relative ${
                      selectedTier === 'Pro'
                        ? 'bg-slate-950 border-blue-500 ring-1 ring-blue-500/40 shadow-blue-950/50 shadow-md'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-500 text-[8px] font-extrabold text-slate-950 uppercase tracking-wider">
                      RECOMMENDED
                    </div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Executive</h4>
                    <p className="text-lg font-bold text-white mt-1">$29<span className="text-xs text-slate-500"> / mo</span></p>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      Unlimited activities & clients, premium server-side Gemini AI insights, report export.
                    </p>
                  </div>

                  {/* Enterprise Plan */}
                  <div
                    onClick={() => setSelectedTier('Enterprise')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTier === 'Enterprise'
                        ? 'bg-slate-950 border-blue-500 ring-1 ring-blue-500/20'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Enterprise</h4>
                    <p className="text-lg font-bold text-white mt-1">$149<span className="text-xs text-slate-500"> / mo</span></p>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      Dedicated cloud instance, full SLA guarantees, custom AI prompt calibration.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="onboarding-complete-btn"
                    onClick={handleCompleteOnboarding}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-sm rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Deploy Workspace</span>
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
