import React, { useState } from 'react';
import {
  AlertTriangle, ShieldAlert, Check, Sparkles, LogOut,
  CreditCard, ArrowRight, Zap, Phone, CheckCircle2, MessageSquare,
  Copy, Lock, Key
} from 'lucide-react';
import { User, Language, BusinessSettings } from '../../types';
import { StorageService } from '../../services/storage';

interface TrialSuspendedViewProps {
  user: User;
  lang: Language;
  settings: BusinessSettings;
  onUpgradeSuccess: (updatedUser: User) => void;
  onLogout: () => void;
}

export const TrialSuspendedView: React.FC<TrialSuspendedViewProps> = ({
  user,
  lang,
  settings,
  onUpgradeSuccess,
  onLogout,
}) => {
  const isBn = lang === 'bn';
  const ownerConfig = StorageService.getOwnerConfig();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Card'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const plans = [
    {
      id: 'monthly',
      name: isBn ? 'বেসিক প্ল্যান (১ মাস)' : 'Basic Monthly Plan',
      price: `৳ ${ownerConfig.monthlyPrice || 500}`,
      period: isBn ? '/মাস' : '/month',
      desc: isBn ? 'ছোট দোকান ও একক ব্যবস্থাপনার জন্য উপযুক্ত' : 'Ideal for small retail shops',
      features: [
        isBn ? 'আনলিমিটেড প্রোডাক্ট ও সেলস' : 'Unlimited Products & Sales',
        isBn ? 'ইনভয়েস ও মেমো প্রিন্ট (A4/POS)' : 'A4 & POS Invoice Printing',
        isBn ? 'ডিউ খাতা ও বাকি হিসাব' : 'Due Ledger Management',
        isBn ? 'Gemini Live AI ভয়েস সহকারী' : 'Gemini Live AI Voice Assistant',
      ],
    },
    {
      id: 'yearly',
      name: isBn ? 'বিজনেস প্রো (১ বছর)' : 'Business Pro Yearly',
      price: `৳ ${ownerConfig.yearlyPrice || 5000}`,
      period: isBn ? '/বছর' : '/year',
      popular: true,
      desc: isBn ? 'মাঝারি ও বড় দোকানের জন্য সর্বোচ্চ সুবিধাযুক্ত' : 'Best value for growing businesses',
      features: [
        isBn ? 'বেসিকের সকল ফিচার' : 'All Basic Features',
        isBn ? '২ মাস ফ্রি (সাশ্রয়ী)' : '2 Months Free Savings',
        isBn ? 'ক্লাউড অটো-ব্যাকআপ ও সিঙ্ক' : 'Cloud Auto-Backup & Sync',
        isBn ? 'বারকোড স্ক্যানার ও প্রিন্টিং' : 'Barcode Scanning & Printing',
        isBn ? '২৪/৭ প্রিমিয়াম কাস্টমার সাপোর্ট' : '24/7 Priority Support',
      ],
    },
    {
      id: 'lifetime',
      name: isBn ? 'লাইফটাইম আনলিমিটেড' : 'Lifetime Unlimited',
      price: `৳ ${ownerConfig.lifetimePrice || 9999}`,
      period: isBn ? 'এককালীন' : 'one-time',
      desc: isBn ? 'একবার কিনুন, আজীবন নিশ্চিত ব্যবহার করুন' : 'One-time payment for lifetime',
      features: [
        isBn ? 'আজীবন সফটওয়্যার লাইসেন্স' : 'Lifetime Software License',
        isBn ? 'কোনো মাসিক বা বাৎসরিক ফি নেই' : 'No Monthly or Yearly Fees',
        isBn ? 'সকল ভবিষ্যৎ নতুন ফিচার ফ্রি' : 'All Future Updates Included',
        isBn ? 'ভিআইপি সাপোর্ট ও সেটআপ হেল্প' : 'VIP Dedicated Support',
      ],
    },
  ];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleConfirmUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const planObj = plans.find((p) => p.id === selectedPlan);
      const days = selectedPlan === 'monthly' ? 30 : selectedPlan === 'yearly' ? 365 : 3650;
      const updatedUser = StorageService.activateUserSubscription(user.uid, planObj?.name || 'Business Pro', days);

      setIsProcessing(false);
      setSuccess(true);

      setTimeout(() => {
        if (updatedUser) {
          onUpgradeSuccess(updatedUser);
        } else {
          onUpgradeSuccess({
            ...user,
            subscriptionStatus: 'active',
            subscriptionPlan: planObj?.name || 'Business Pro'
          });
        }
      }, 900);
    }, 800);
  };

  const handleAdminPinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Owner PIN or 1234
    if (adminPin === '9988' || adminPin === '1234' || adminPin === 'sobardokan') {
      const updatedUser = StorageService.activateUserSubscription(user.uid, 'Business Pro (Owner Unlock)', 365);
      setShowAdminPinModal(false);
      setSuccess(true);
      setTimeout(() => {
        if (updatedUser) onUpgradeSuccess(updatedUser);
      }, 700);
    } else {
      setPinError(true);
    }
  };

  const whatsAppMessage = encodeURIComponent(
    `আসসালামু আলাইকুম। আমি সবার দোকান (SobarDokan) অ্যাপের প্যাকেজ অ্যাক্টিভ করতে চাই। আমার দোকান: "${user.businessName || user.name}", মোবাইল: ${user.phone || ''}, প্যাকেজ: ${selectedPlan}`
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-rose-500 selection:text-white">
      {/* Top Banner Warning */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white px-6 py-3.5 flex items-center justify-between text-xs sm:text-sm font-medium shadow-lg z-20">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
          <span>
            {isBn
              ? 'সতর্কতা: আপনার ৩ দিনের ফ্রি ট্রায়ালের মেয়াদ শেষ হয়েছে! অ্যাকাউন্টটি বর্তমানে সাসপেন্ড রয়েছে।'
              : 'Alert: Your 3-day free trial has expired! Your account is currently suspended.'}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-xs bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isBn ? 'লগআউট' : 'Logout'}</span>
        </button>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col items-center justify-center z-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4 shadow-xl shadow-rose-950/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {isBn ? 'সবার দোকান – সাবস্ক্রিপশন প্ল্যানে আপগ্রেড করুন' : 'SobarDokan – Upgrade Subscription'}
          </h1>
          <p className="text-sm text-slate-400">
            {isBn
              ? `শ্রদ্ধেয় ${user.name || 'দোকানদার'}, আপনার ৩ দিনের ফ্রি ট্রায়াল শেষ হয়েছে। আপনার সকল সেলস, প্রোডাক্ট ও বাকি খাতার ডাটা ১০০% সুরক্ষিত রয়েছে। নির্বিঘ্নে সবার দোকান ব্যবহার করতে একটি প্ল্যান নির্বাচন করুন অথবা অ্যাপ ওনারের সাথে যোগাযোগ করুন।`
              : `Hello ${user.name}, your 3-day trial has ended. Your sales & inventory data is 100% safe. Choose a plan or contact app owner to restore full access.`}
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="w-full max-w-md bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-4 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              {isBn
                ? 'অভিনন্দন! আপনার সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে।'
                : 'Congratulations! Your subscription is now active.'}
            </span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-8">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id as any)}
                className={`relative rounded-3xl p-6 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900/60 to-slate-900 border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-[10px] uppercase tracking-wider shadow">
                    {isBn ? 'জনপ্রিয় পছন্দ' : 'Most Popular'}
                  </span>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  <span className="text-xs text-slate-400 font-medium">{p.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Owner & Direct Payment Hub */}
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* WhatsApp Owner */}
          <a
            href={`https://wa.me/${ownerConfig.ownerWhatsApp || '8801700000000'}?text=${whatsAppMessage}`}
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 transition flex items-center gap-3.5 group cursor-pointer text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                {isBn ? 'সরাসরি হোয়াটসঅ্যাপ' : 'Direct WhatsApp'}
              </span>
              <p className="text-sm font-bold text-white group-hover:underline">
                {isBn ? 'সবার দোকান কাস্টমার কেয়ার' : 'SobarDokan Customer Care'}
              </p>
              <p className="text-[11px] text-slate-400">+{ownerConfig.ownerWhatsApp || '8801700000000'}</p>
            </div>
          </a>

          {/* Direct Phone Call */}
          <a
            href={`tel:${ownerConfig.ownerPhone || '01700-000000'}`}
            className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 transition flex items-center gap-3.5 group cursor-pointer text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                {isBn ? 'হেল্পলাইন কল সাপোর্ট' : 'Direct Helpline'}
              </span>
              <p className="text-sm font-bold text-white group-hover:underline">
                {ownerConfig.ownerPhone || '01700-000000'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'সবার দোকান অফিশিয়াল সাপোর্ট' : 'SobarDokan Official Support'}
              </p>
            </div>
          </a>
        </div>

        {/* Quick Checkout Form */}
        <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? 'পেমেন্ট ও সক্রিয়করণ' : 'Payment & Activation'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdminPinModal(true)}
              className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition"
            >
              <Key className="w-3 h-3" />
              <span>{isBn ? 'মাস্টার পিন আনলক' : 'Master PIN Unlock'}</span>
            </button>
          </h3>

          <form onSubmit={handleConfirmUpgrade} className="space-y-4">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'Nagad', 'Card'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === m
                      ? 'border-indigo-500 bg-indigo-600/20 text-white shadow'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{m}</span>
                </button>
              ))}
            </div>

            {/* Instruction */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              {paymentMethod === 'bKash' && (
                <div className="flex items-center justify-between">
                  <span>
                    বিকাশ নম্বর: <strong className="text-pink-400">{ownerConfig.bKashNumber || '01700-000000'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(ownerConfig.bKashNumber || '01700000000')}
                    className="px-2 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
              )}
              {paymentMethod === 'Nagad' && (
                <div className="flex items-center justify-between">
                  <span>
                    নগদ নম্বর: <strong className="text-orange-400">{ownerConfig.nagadNumber || '01700-000000'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(ownerConfig.nagadNumber || '01700000000')}
                    className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
              )}
              {paymentMethod === 'Card' && (
                <p>ভিসা, মাস্টারকার্ড বা ব্যাংক ট্রান্সফারের মাধ্যমে সরাসরি পেমেন্ট করতে কল বা হোয়াটসঅ্যাপ করুন।</p>
              )}
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                টাকা পাঠিয়ে নিচে TrxID লিখে সাবমিট করুন অথবা <strong>"আপগ্রেড নিশ্চিত করুন"</strong> চাপুন।
              </p>
            </div>

            {/* TrxID / Reference */}
            <div>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder={isBn ? 'ট্রানজেকশন আইডি (TrxID) - ঐচ্ছিক' : 'Transaction ID (TrxID) - Optional'}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Confirm CTA */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {isProcessing
                  ? (isBn ? 'সক্রিয় করা হচ্ছে...' : 'Activating...')
                  : (isBn ? 'প্যাকেজে আপগ্রেড নিশ্চিত করুন' : 'Confirm & Restore Access')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Help Contact */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isBn ? 'ওনার হেল্পলাইন:' : 'Owner Helpline:'} {ownerConfig.ownerPhone || '01700-000000'}</span>
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              {isBn ? 'অন্য অ্যাকাউন্টে লগইন' : 'Switch Account'}
            </button>
          </div>
        </div>
      </main>

      {/* MODAL: ADMIN PIN UNLOCK */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {isBn ? 'ওনার মাস্টার পিন আনলক' : 'Owner Master PIN Unlock'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn ? 'ওনার পিন দিয়ে সরাসরি সফটওয়্যার আনলক করুন' : 'Unlock directly using Owner Secret PIN'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminPinUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Master PIN (e.g. 1234 / 9988)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1">ভুল পিন! সঠিক পিন লিখুন।</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  আনলক করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 z-10 border-t border-slate-900">
        © 2025 SobarDokan · {isBn ? 'সকল অধিকার সংরক্ষিত' : 'All rights reserved'}
      </footer>
    </div>
  );
};
