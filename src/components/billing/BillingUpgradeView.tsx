import React, { useState, useEffect } from 'react';
import {
  CreditCard, Sparkles, Check, CheckCircle2, Shield,
  Zap, ArrowRight, Download, Receipt, Clock, AlertCircle,
  MessageSquare, HelpCircle, X
} from 'lucide-react';
import { Language, BusinessSettings, SubscriptionPlan, BillingInvoice } from '../../types';
import { StorageService } from '../../services/storage';

interface BillingUpgradeViewProps {
  lang: Language;
  settings: BusinessSettings;
}

export const BillingUpgradeView: React.FC<BillingUpgradeViewProps> = ({ lang, settings }) => {
  const isBn = lang === 'bn';

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Card'>('bKash');
  const [phoneNumber, setPhoneNumber] = useState('01700-000000');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // SMS Bundle purchase
  const [selectedSmsBundle, setSelectedSmsBundle] = useState<{ count: number; price: number; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPlans(StorageService.getSubscriptionPlans());
    setInvoices(StorageService.getBillingInvoices());
  };

  const handleOpenUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setSelectedSmsBundle(null);
    setTrxId('');
    setPaymentSuccess(false);
    setIsPaymentModalOpen(true);
  };

  const handleOpenSmsRecharge = (bundle: { count: number; price: number; name: string }) => {
    setSelectedSmsBundle(bundle);
    setSelectedPlan(null);
    setTrxId('');
    setPaymentSuccess(false);
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      const amount = selectedPlan ? selectedPlan.price : (selectedSmsBundle?.price || 500);
      const planName = selectedPlan ? selectedPlan.name : (selectedSmsBundle?.name || 'SMS Bundle');

      // Add billing invoice
      const newInvoice: BillingInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        planName,
        amount,
        status: 'paid',
        paymentMethod
      };

      StorageService.addBillingInvoice(newInvoice);

      // If SMS bundle, add credits
      if (selectedSmsBundle) {
        StorageService.addSMSCredits(selectedSmsBundle.count);
      }

      loadData();
    }, 1200);
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e1424] via-[#161c32] to-[#0e1424] p-6 rounded-3xl border border-[#212d4d] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 flex-shrink-0">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isBn ? 'বিলিং ও সফটওয়্যার লাইসেন্স আপগ্রেড' : 'Billing & Subscription Upgrade'}
              </h1>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBn
                ? 'আপনার দোকানের জন্য সক্রিয় প্যাকেজ, মেয়াদ, এসএমএস বান্ডেল এবং পেমেন্ট রশিদ'
                : 'Manage your software subscription, purchase SMS credits, and view invoice history'}
            </p>
          </div>
        </div>

        <div className="relative z-10 bg-[#090d18]/90 border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {isBn ? 'বর্তমান প্ল্যান' : 'Current Plan'}
            </span>
            <span className="font-bold text-white text-sm">Pro Business Plan</span>
            <span className="block text-[11px] text-emerald-400 font-semibold">
              {isBn ? 'মেয়াদ বাকি: আগামী ১১ মাস' : '11 Months Remaining'}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {isBn ? 'পরবর্তী রিনিউ' : 'Next Renewal'}
            </span>
            <span className="font-mono text-slate-200">2025-07-01</span>
          </div>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-lg md:text-xl font-black text-white">
            {isBn ? 'আপনার ব্যবসার সাইজ অনুযায়ী সেরা প্ল্যানটি বেছে নিন' : 'Choose the Best Plan for Your Business'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isBn ? 'যেকোনো সময় প্ল্যান আপগ্রেড বা পরিবর্তন করতে পারবেন' : 'Upgrade, switch or renew your software plan anytime'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === 'plan-pro';
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#161f36] to-[#0e1424] border-amber-500/50 shadow-2xl shadow-amber-500/10 scale-[1.02]'
                    : 'bg-[#0e1424] border-[#1e2a47] hover:border-slate-700 shadow-xl'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                    {isBn ? 'বর্তমানে সক্রিয়' : 'Current Active Plan'}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-black text-white">{plan.banglaName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.name}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">
                      {plan.price === 0 ? (isBn ? 'ফ্রি' : 'Free') : `৳${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-slate-400">/{isBn ? 'মাসিক' : 'mo'}</span>
                    )}
                  </div>

                  <div className="mt-6 space-y-2.5 pt-4 border-t border-[#1e2a47]">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  {isCurrent ? (
                    <button
                      onClick={() => handleOpenUpgrade(plan)}
                      className="w-full py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors"
                    >
                      {isBn ? 'লাইসেন্স রিনিউ করুন' : 'Renew Subscription'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenUpgrade(plan)}
                      className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                    >
                      {isBn ? 'এই প্ল্যানে আপগ্রেড করুন' : 'Upgrade Plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SMS Credits Recharge Section */}
      <div className="bg-[#0e1424] border border-[#1e2a47] rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isBn ? 'কাস্টমার SMS ক্রেডিট রিচার্জ প্যাক' : 'Customer SMS Credit Bundles'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? 'মেমো তৈরি ও বকেয়া তাগাদার জন্য সরকারি অনুমোদিত ব্রান্ডেড বাল্ক এসএমএস'
                  : 'Official BTCL registered mask SMS bundles for invoices and due notices'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { count: 500, price: 250, name: '৫০০ SMS স্টার্টার প্যাক' },
            { count: 1500, price: 650, name: '১,৫০০ SMS সুপার সেভার (জনপ্রিয়)', popular: true },
            { count: 5000, price: 1950, name: '৫,০০০ SMS মেগা বিজনেস প্যাক' }
          ].map((bundle) => (
            <div
              key={bundle.count}
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                bundle.popular
                  ? 'bg-[#151d33] border-sky-500/40 shadow-lg shadow-sky-500/10'
                  : 'bg-[#090d18] border-[#1e2a47]'
              }`}
            >
              <div>
                {bundle.popular && (
                  <span className="inline-block mb-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-white uppercase">
                    Best Value
                  </span>
                )}
                <h4 className="font-bold text-white text-sm">{bundle.name}</h4>
                <p className="text-xl font-black text-sky-400 mt-2">৳{bundle.price}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  প্রতি SMS মাত্র {(bundle.price / bundle.count).toFixed(2)} টাকা
                </p>
              </div>

              <button
                onClick={() => handleOpenSmsRecharge(bundle)}
                className="mt-4 w-full py-2 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 rounded-xl text-xs font-bold transition-all"
              >
                {isBn ? 'রিচার্জ করুন' : 'Purchase SMS'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Invoices & Receipts History */}
      <div className="bg-[#0e1424] border border-[#1e2a47] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#1e2a47] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-white text-sm">
              {isBn ? 'বিলিং ও পেমেন্ট হিস্ট্রি (ইনভয়েস রশিদ)' : 'Billing & Invoice Receipts'}
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e2a47] bg-[#090d18]/80 text-slate-400">
                <th className="py-3 px-4 font-semibold">{isBn ? 'ইনভয়েস নম্বর' : 'Invoice No'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'প্যাকেজের বিবরণ' : 'Description'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'টাকা' : 'Amount'}</th>
                <th className="py-3 px-4 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3 px-4 font-semibold text-right">{isBn ? 'রশিদ ডাউনলোড' : 'Download'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#131b2e]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-semibold text-white">{inv.planName}</td>
                  <td className="py-3 px-4 text-slate-400">{inv.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#192238] text-slate-300 border border-[#2b3a5d]">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">৳{inv.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Paid
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(isBn ? `রশিদ ${inv.invoiceNumber} প্রিন্ট প্রস্তুত!` : `Invoice ${inv.invoiceNumber} ready!`)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#192238] hover:bg-[#202d4a] text-slate-200 border border-[#2b3a5d] text-[11px] font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 inline mr-1" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {isBn ? 'নিরাপদ পেমেন্ট গেটওয়ে' : 'Secure Payment Checkout'}
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">
                    {isBn ? 'পেমেন্ট সফল হয়েছে!' : 'Payment Successful!'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isBn
                      ? 'আপনার লাইসেন্স বা এসএমএস ব্যালেন্স সাথে সাথে সক্রিয় করা হয়েছে।'
                      : 'Your plan or SMS package has been activated immediately.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  {isBn ? 'ঠিক আছে' : 'Done'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="p-5 space-y-4">
                <div className="bg-[#090d18] p-3.5 rounded-2xl border border-[#1e2a47] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      {isBn ? 'প্যাকেজ' : 'Package'}
                    </span>
                    <p className="font-bold text-white text-sm">
                      {selectedPlan ? selectedPlan.name : selectedSmsBundle?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      {isBn ? 'মোট মূল্য' : 'Total'}
                    </span>
                    <p className="font-black text-amber-400 text-base">
                      ৳{selectedPlan ? selectedPlan.price.toLocaleString() : selectedSmsBundle?.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    {isBn ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Select Payment Method'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['bKash', 'Nagad', 'Rocket', 'Card'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                          paymentMethod === m
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow'
                            : 'bg-[#090d18] border-[#1e2a47] text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {paymentMethod} {isBn ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01700-000000"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {paymentMethod} {isBn ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="BL7849201"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono uppercase"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#1e2a47] text-xs font-bold text-slate-300 hover:bg-[#131b2e]"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span>{isBn ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                    ) : (
                      <span>{isBn ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
