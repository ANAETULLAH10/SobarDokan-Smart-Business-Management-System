import React, { useState, useMemo } from 'react';
import {
  User, Building2, Phone, Search, CheckCircle2, ChevronRight
} from 'lucide-react';
import { BUSINESS_CATEGORIES, BusinessCategoryItem } from '../../data/businessCategories';

interface SignupOnboardingViewProps {
  email: string;
  provider: 'google' | 'email';
  initialName?: string;
  initialBusinessName?: string;
  initialPhone?: string;
  onBack: () => void;
  onComplete: (data: {
    name: string;
    businessName: string;
    phone: string;
    businessCategory: BusinessCategoryItem;
  }) => void;
}

export const SignupOnboardingView: React.FC<SignupOnboardingViewProps> = ({
  email,
  provider = 'google',
  initialName = '',
  initialBusinessName = '',
  initialPhone = '',
  onBack,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Form State
  const [name, setName] = useState(initialName);
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [phone, setPhone] = useState(initialPhone);
  const [formError, setFormError] = useState<string | null>(null);

  // Step 2 Category Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('mobile-shop');

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return BUSINESS_CATEGORIES;
    return BUSINESS_CATEGORIES.filter((cat) =>
      cat.title.toLowerCase().includes(q) ||
      cat.subtitle.toLowerCase().includes(q) ||
      cat.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!businessName.trim()) {
      setFormError('বিজনেসের নাম লিখুন।');
      return;
    }
    if (!phone.trim()) {
      setFormError('সঠিক ফোন নম্বর লিখুন।');
      return;
    }

    setStep(2);
  };

  const handleCompleteRegistration = () => {
    const chosenCat =
      BUSINESS_CATEGORIES.find((c) => c.id === selectedCategoryId) ||
      BUSINESS_CATEGORIES[0];

    onComplete({
      name: name.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
      businessCategory: chosenCat,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center py-8 px-4 relative overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Background Soft Radial Glow (pixel matching Image 1 & 2) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-gradient-to-tr from-indigo-200/30 via-purple-100/40 to-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Empty space for balance */}
      <div />

      {/* Main Container Card */}
      {step === 1 ? (
        /* ======================== STEP 1 (IMAGE 1) ======================== */
        <div className="w-full max-w-[480px] bg-white rounded-3xl p-7 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Google Connected Box */}
          <div className="bg-[#f0f5ff] border border-[#dbe6fd] rounded-2xl p-4 flex items-center gap-3.5">
            {provider === 'google' ? (
              <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            ) : (
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs flex-shrink-0">
                @
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-800 leading-tight">
                {provider === 'google' ? 'Google সংযুক্ত হয়েছে' : 'ইমেইল সংযুক্ত হয়েছে'}
              </h3>
              <p className="text-xs text-blue-600 font-medium truncate mt-0.5">
                {email}
              </p>
            </div>
          </div>

          {/* Stepper (2 Dots with Connecting Line) */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full bg-violet-600 ring-4 ring-violet-200" />
            <div className="w-14 h-0.5 bg-slate-200" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
          </div>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-slate-600 font-medium text-center -mt-2">
            রেজিস্ট্রেশন সম্পন্ন করতে আর কয়েকটি তথ্য দিন:
          </p>

          {/* Error Message if any */}
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
              {formError}
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleStep1Next} className="space-y-3.5">
            {/* Input 1: Full Name */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 transition-all focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100 hover:border-slate-300 shadow-sm">
              <User className="w-5 h-5 text-violet-500 flex-shrink-0 mr-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পুরো নাম"
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none bg-transparent"
                autoFocus
              />
            </div>

            {/* Input 2: Business Name */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 transition-all focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100 hover:border-slate-300 shadow-sm">
              <Building2 className="w-5 h-5 text-violet-500 flex-shrink-0 mr-3" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="বিজনেসের নাম"
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none bg-transparent"
              />
            </div>

            {/* Input 3: Phone Number */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 transition-all focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100 hover:border-slate-300 shadow-sm">
              <Phone className="w-5 h-5 text-violet-500 flex-shrink-0 mr-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ফোন নম্বর"
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none bg-transparent"
              />
            </div>

            {/* Next Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 md:py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-violet-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>পরবর্তী</span>
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800 text-center font-medium cursor-pointer transition-colors block mx-auto -mt-2"
          >
            ← ফিরে যান
          </button>
        </div>
      ) : (
        /* ======================== STEP 2 (IMAGE 2) ======================== */
        <div className="w-full max-w-[760px] bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col gap-4 md:gap-5 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Google Connected Box */}
          <div className="bg-[#f0f5ff] border border-[#dbe6fd] rounded-2xl p-4 flex items-center gap-3.5">
            {provider === 'google' ? (
              <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            ) : (
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs flex-shrink-0">
                @
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-800 leading-tight">
                {provider === 'google' ? 'Google সংযুক্ত হয়েছে' : 'ইমেইল সংযুক্ত হয়েছে'}
              </h3>
              <p className="text-xs text-blue-600 font-medium truncate mt-0.5">
                {email}
              </p>
            </div>
          </div>

          {/* Stepper (Step 1 Completed -> Step 2 Active) */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-violet-600" />
            <div className="w-14 h-0.5 bg-violet-600" />
            <div className="w-4 h-4 rounded-full bg-violet-600 ring-4 ring-violet-200" />
          </div>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-slate-600 font-medium text-center md:text-left -mt-1">
            আপনার ব্যবসার ধরন নির্বাচন করুন (পরে সেটিংস থেকে পরিবর্তন করা যাবে):
          </p>

          {/* Search Input Bar */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 transition-all focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="খুঁজুন... যেমন: কাপড়, মুদি, grocery"
              className="w-full text-xs md:text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Cards (2 Columns Grid matching Image 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedCategoryId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCategoryId(item.id)}
                    className={`p-3 md:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/50 ring-2 ring-violet-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Left Icon Box */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBgColor} ${item.iconColor}`}
                    >
                      <IconComponent className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    {/* Middle Title & Subtitle */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Right Radio Circle */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'border-violet-600 bg-violet-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 py-8 text-center text-xs text-slate-500 font-medium">
                কোনো ব্যবসার ধরন মেলেনি — তালিকার নিচে &ldquo;অন্যান্য&rdquo; নির্বাচন করতে পারেন।
              </div>
            )}
          </div>

          {/* Bottom Complete Registration Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleCompleteRegistration}
              className="w-full py-3.5 md:py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>রেজিস্ট্রেশন সম্পন্ন</span>
            </button>

            {/* Terms and Privacy policy note */}
            <p className="text-[11px] md:text-xs text-slate-500 text-center font-normal leading-relaxed px-2">
              &ldquo;রেজিস্ট্রেশন সম্পন্ন&rdquo; চাপলে আপনি আমাদের{' '}
              <span className="text-violet-600 font-medium underline underline-offset-2 cursor-pointer">
                শর্তাবলী ও প্রাইভেসি পলিসি
              </span>
              -তে সম্মত হচ্ছেন।
            </p>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-slate-500 hover:text-slate-800 text-center font-medium cursor-pointer transition-colors block mx-auto -mt-1"
          >
            ← ফিরে যান
          </button>
        </div>
      )}

      {/* Footer Branding (Exact match to screenshot) */}
      <footer className="text-xs text-slate-400 font-medium text-center pt-6">
        © 2025 AmarDokan · সকল অধিকার সংরক্ষিত
      </footer>
    </div>
  );
};
