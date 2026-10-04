import React, { useState } from 'react';
import {
  LogIn, UserPlus, Mail, Lock, Eye, EyeOff, User as UserIcon,
  Store, Phone, ChevronRight, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';
import { User, Language, BusinessSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { loginWithGoogle } from '../../services/firebase';

interface AuthViewProps {
  lang: Language;
  onLoginSuccess: (user: User) => void;
  settings: BusinessSettings;
  onUpdateSettings?: (settings: BusinessSettings) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  lang,
  onLoginSuccess,
  settings,
  onUpdateSettings,
}) => {
  const isBn = lang === 'bn';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const firebaseUser = await loginWithGoogle();
      if (!firebaseUser) {
        throw new Error('Google sign in was not completed');
      }

      // Check if user already exists
      const existingUser = StorageService.findUserByEmail(firebaseUser.email || '');
      const isOwner = StorageService.isOwnerEmail(firebaseUser.email);
      const ownerCfg = StorageService.getOwnerConfig();

      let userObj: User;
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      if (existingUser) {
        userObj = {
          ...existingUser,
          name: firebaseUser.displayName || existingUser.name || (isOwner ? ownerCfg.ownerName : 'দোকানদার'),
          photoURL: firebaseUser.photoURL || existingUser.photoURL,
          isOwner: isOwner || existingUser.isOwner,
          role: isOwner ? 'superadmin' : existingUser.role,
          subscriptionStatus: isOwner ? 'active' : existingUser.subscriptionStatus,
          subscriptionPlan: isOwner ? 'Lifetime Owner Unlimited' : existingUser.subscriptionPlan,
        };
      } else {
        userObj = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || (isOwner ? ownerCfg.ownerName : 'দোকানদার'),
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          role: isOwner ? 'superadmin' : 'admin',
          isOwner: Boolean(isOwner),
          businessName: settings.businessName || (isOwner ? 'SobarDokan Main Store' : 'আমার দোকান'),
          phone: isOwner ? ownerCfg.ownerPhone : '',
          createdAt: now.toISOString(),
          trialStartDate: now.toISOString(),
          trialEndsAt: isOwner
            ? new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString()
            : threeDaysLater.toISOString(),
          subscriptionStatus: isOwner ? 'active' : 'trial',
          subscriptionPlan: isOwner ? 'Lifetime Owner Unlimited' : '3-Day Free Trial',
        };
      }

      StorageService.saveUser(userObj);
      StorageService.saveRegisteredUser(userObj);
      onLoginSuccess(userObj);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.info('Google Sign In: popup closed or cancelled by user.');
        setErrorMessage(
          isBn
            ? 'গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে। আপনি সরাসরি ইমেইল ও পাসওয়ার্ড দিয়েও লগইন বা রেজিস্টার করতে পারেন।'
            : 'Google Sign-in window was closed. You can also sign in directly using email & password.'
        );
      } else if (err?.code === 'auth/popup-blocked') {
        console.warn('Google Sign In: popup was blocked by browser.');
        setErrorMessage(
          isBn
            ? 'ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজারে পপ-আপ এলাউ করুন অথবা নিচে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।'
            : 'Popup blocked by browser. Please allow popups or sign in below with email & password.'
        );
      } else {
        console.warn('Google Sign In Error:', err);
        setErrorMessage(
          isBn
            ? 'গুগল লগইন সম্পন্ন করা যায়নি: ' + (err?.message || 'নেটওয়ার্ক ত্রুটি')
            : 'Google login failed: ' + (err?.message || 'Network error')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage(isBn ? 'ইমেইল অ্যাড্রেস লিখুন।' : 'Please enter your email.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড লিখুন।' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find registered user
      const existingUser = StorageService.findUserByEmail(loginEmail.trim());
      const isOwner = StorageService.isOwnerEmail(loginEmail.trim());
      const ownerCfg = StorageService.getOwnerConfig();

      if (existingUser) {
        // If password was stored and doesn't match
        if (existingUser.password && existingUser.password !== loginPassword) {
          setErrorMessage(isBn ? 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড লিখুন।' : 'Incorrect password! Please try again.');
          setIsLoading(false);
          return;
        }

        const loggedUser: User = isOwner
          ? {
              ...existingUser,
              isOwner: true,
              role: 'superadmin',
              subscriptionStatus: 'active',
              subscriptionPlan: 'Lifetime Owner Unlimited',
            }
          : existingUser;

        StorageService.saveUser(loggedUser);
        StorageService.saveRegisteredUser(loggedUser);
        onLoginSuccess(loggedUser);
      } else {
        // Check if owner credentials
        if (isOwner) {
          const now = new Date();
          const adminUser: User = {
            uid: 'admin-owner-1',
            name: ownerCfg.ownerName || 'MD ANAETULLAH',
            email: loginEmail.trim(),
            role: 'superadmin',
            isOwner: true,
            businessName: settings.businessName || 'SobarDokan Main Store',
            phone: ownerCfg.ownerPhone || settings.phone,
            password: loginPassword,
            createdAt: now.toISOString(),
            trialStartDate: now.toISOString(),
            trialEndsAt: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
            subscriptionStatus: 'active', // Owner active account
            subscriptionPlan: 'Lifetime Owner Unlimited',
          };
          StorageService.saveUser(adminUser);
          StorageService.saveRegisteredUser(adminUser);
          onLoginSuccess(adminUser);
          setIsLoading(false);
          return;
        }

        // If user not found, advise registration
        setErrorMessage(
          isBn
            ? 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।'
            : 'No account found with this email. Please register for a 3-day free trial.'
        );
      }
      setIsLoading(false);
    }, 400);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(isBn ? 'আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!businessName.trim()) {
      setErrorMessage(isBn ? 'বিজনেসের নাম লিখুন।' : 'Please enter your business name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(isBn ? 'সঠিক ইমেইল অ্যাড্রেস লিখুন।' : 'Please enter a valid email.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(isBn ? 'ফোন নম্বর লিখুন।' : 'Please enter your phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(isBn ? 'দুই পাসওয়ার্ড মেলেনি! আবার চেক করুন।' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check if email already registered
      const alreadyExists = StorageService.findUserByEmail(email.trim());
      if (alreadyExists) {
        setErrorMessage(isBn ? 'এই ইমেইল ইতিমধ্যে নিবন্ধিত আছে। লগইন করুন।' : 'This email is already registered. Please login.');
        setIsLoading(false);
        return;
      }

      const isOwner = StorageService.isOwnerEmail(email.trim());
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const newUser: User = {
        uid: isOwner ? 'admin-owner-1' : 'usr-' + Date.now(),
        name: name.trim(),
        email: email.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        password: password,
        role: isOwner ? 'superadmin' : 'admin',
        isOwner: Boolean(isOwner),
        createdAt: now.toISOString(),
        trialStartDate: now.toISOString(),
        trialEndsAt: isOwner
          ? new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString()
          : threeDaysLater.toISOString(),
        subscriptionStatus: isOwner ? 'active' : 'trial',
        subscriptionPlan: isOwner ? 'Lifetime Owner Unlimited' : '3-Day Free Trial',
      };

      // Also customize store business settings with user's info
      const updatedSettings: BusinessSettings = {
        ...settings,
        businessName: businessName.trim(),
        ownerName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };
      StorageService.saveSettings(updatedSettings);
      if (onUpdateSettings) {
        onUpdateSettings(updatedSettings);
      }

      StorageService.saveRegisteredUser(newUser);
      StorageService.saveUser(newUser);

      setSuccessMessage(isBn ? 'অভিনন্দন! আপনার ৩ দিনের ফ্রি ট্রায়াল অ্যাকাউন্ট সক্রিয় হয়েছে।' : 'Success! Your 3-day free trial account is active.');

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(newUser);
      }, 700);
    }, 500);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Soft Radial Glow (matching design) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-200/30 via-purple-100/40 to-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full px-6 sm:px-12 py-5 flex items-center justify-between z-10">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Store className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800 font-sans">
            SobarDokan
          </span>
        </div>

        {/* Top Right Action Links */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`text-sm font-semibold transition px-3 py-2 cursor-pointer ${
              mode === 'login' ? 'text-indigo-600 font-bold' : 'text-slate-700 hover:text-indigo-600'
            }`}
          >
            {isBn ? 'লগইন' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{isBn ? 'ফ্রি ট্রায়াল শুরু করুন' : 'Start Free Trial'}</span>
          </button>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] border border-slate-100 p-8 sm:p-10 transition-all">
          
          {/* Tab Switcher Pills */}
          <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center mb-6 border border-slate-200/50">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-600 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isBn ? 'লগইন' : 'Login'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isBn ? 'রেজিস্ট্রেশন' : 'Registration'}</span>
            </button>
          </div>

          {/* Stepper Dots (Shown in Registration View, matching Screenshot 2) */}
          {mode === 'signup' && (
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100 transition-all"></div>
              <div className="w-10 h-0.5 bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 text-sm flex items-center justify-center gap-3 transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-semibold">Continue with Google</span>
          </button>

          {/* Divider with text */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80"></div>
            </div>
            <span className="relative bg-white px-3 text-xs font-medium text-slate-400">
              {mode === 'login'
                ? isBn ? 'অথবা ইমেইল দিয়ে লগইন' : 'Or login with email'
                : isBn ? 'অথবা ইমেইল দিয়ে' : 'Or register with email'}
            </span>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: LOGIN (Image 1) */}
          {mode === 'login' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-blue-500/80" />
                </div>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={isBn ? 'ইমেইল অ্যাড্রেস' : 'Email address'}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-blue-500/80" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={isBn ? 'পাসওয়ার্ড' : 'Password'}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition cursor-pointer"
                >
                  {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? (isBn ? 'লগইন হচ্ছে...' : 'Logging in...') : (isBn ? 'লগইন করুন' : 'Log In')}</span>
              </button>

              {/* Switch to Signup */}
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  {isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {isBn ? '৩ দিনের ফ্রি ট্রায়াল শুরু করুন' : 'Start 3-Day Free Trial'}
                </button>
              </div>
            </form>
          ) : (
            /* MODE: REGISTRATION (Image 2) */
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Row 1: Name and Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'আপনার নাম' : 'Your name'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={isBn ? 'বিজনেসের নাম' : 'Business name'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isBn ? 'ইমেইল অ্যাড্রেস' : 'Email address'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isBn ? 'ফোন নম্বর' : 'Phone number'}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isBn ? 'পাসওয়ার্ড' : 'Password'}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isBn ? 'আবার লিখুন' : 'Confirm password'}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 3-Day Free Trial Notice Badge */}
              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2 text-indigo-700 text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  {isBn
                    ? '🎉 রেজিস্ট্রেশন করলেই পাচ্ছেন ৩ দিনের ফ্রি আনলিমিটেড ট্রায়াল!'
                    : '🎉 Instant 3-day full-access trial! No credit card needed.'}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? (isBn ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating...') : (isBn ? 'পরবর্তী' : 'Next')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Switch to Login */}
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {isBn ? 'লগইন করুন' : 'Log In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isBn
                ? 'আপনার নিবন্ধিত ইমেইল লিখুন। পাসওয়ার্ড রিসেট লিংক বা সাময়িক পাসওয়ার্ড প্রদান করা হবে।'
                : 'Enter your registered email to receive password reset instructions.'}
            </p>
            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isBn
                    ? 'আপনার ইমেইলে পাসওয়ার্ড রিসেট নির্দেশাবলী পাঠানো হয়েছে।'
                    : 'Password reset link sent to your email.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder={isBn ? 'আপনার ইমেইল অ্যাড্রেস' : 'Your email address'}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow"
                  >
                    {isBn ? 'রিসেট লিংক পাঠান' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 font-sans z-10">
        © 2025 SobarDokan · {isBn ? 'সকল অধিকার সংরক্ষিত' : 'All rights reserved'}
      </footer>
    </div>
  );
};
