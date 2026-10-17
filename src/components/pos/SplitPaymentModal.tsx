import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Smartphone, CreditCard, Landmark, Wallet, AlertCircle, ArrowRight } from 'lucide-react';
import { PaymentMethod, Language } from '../../types';

export interface SplitPaymentEntry {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  lang: Language;
  onConfirm: (splits: SplitPaymentEntry[]) => void;
  initialPaid?: number;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  lang,
  onConfirm,
  initialPaid = 0
}) => {
  if (!isOpen) return null;
  const isBn = lang === 'bn';

  const [cashAmount, setCashAmount] = useState<number>(initialPaid > 0 ? initialPaid : 0);
  const [bkashAmount, setBkashAmount] = useState<number>(0);
  const [bkashRef, setBkashRef] = useState<string>('');
  const [nagadAmount, setNagadAmount] = useState<number>(0);
  const [nagadRef, setNagadRef] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [cardRef, setCardRef] = useState<string>('');
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [bankRef, setBankRef] = useState<string>('');

  const totalSplitPaid = cashAmount + bkashAmount + nagadAmount + cardAmount + bankAmount;
  const remainingDue = Math.max(0, grandTotal - totalSplitPaid);
  const changeAmount = Math.max(0, totalSplitPaid - grandTotal);

  const handleFillRemaining = (method: 'cash' | 'bkash' | 'nagad' | 'card') => {
    const currentWithoutMethod =
      (method === 'cash' ? 0 : cashAmount) +
      (method === 'bkash' ? 0 : bkashAmount) +
      (method === 'nagad' ? 0 : nagadAmount) +
      (method === 'card' ? 0 : cardAmount) +
      bankAmount;
    const diff = Math.max(0, grandTotal - currentWithoutMethod);

    if (method === 'cash') setCashAmount(diff);
    if (method === 'bkash') setBkashAmount(diff);
    if (method === 'nagad') setNagadAmount(diff);
    if (method === 'card') setCardAmount(diff);
  };

  const handleClearAll = () => {
    setCashAmount(0);
    setBkashAmount(0);
    setBkashRef('');
    setNagadAmount(0);
    setNagadRef('');
    setCardAmount(0);
    setCardRef('');
    setBankAmount(0);
    setBankRef('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const splits: SplitPaymentEntry[] = [];
    if (cashAmount > 0) splits.push({ method: 'cash', amount: cashAmount });
    if (bkashAmount > 0) splits.push({ method: 'bkash', amount: bkashAmount, reference: bkashRef });
    if (nagadAmount > 0) splits.push({ method: 'nagad', amount: nagadAmount, reference: nagadRef });
    if (cardAmount > 0) splits.push({ method: 'card', amount: cardAmount, reference: cardRef });
    if (bankAmount > 0) splits.push({ method: 'bank', amount: bankAmount, reference: bankRef });
    if (remainingDue > 0) splits.push({ method: 'due', amount: remainingDue });

    onConfirm(splits);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isBn ? 'স্প্লিট পেমেন্ট (Split Payment)' : 'Split Payment'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'একাধিক মাধ্যমে মোট বিল সমন্বয় করুন' : 'Split bill across multiple payment methods'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bill Overview Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0e1424] border-b border-[#1e2a47] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">{isBn ? 'মোট প্রদেয় বিল' : 'Grand Total'}</span>
            <span className="text-xl font-black text-indigo-300">৳{grandTotal.toLocaleString()}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">
              {remainingDue > 0 ? (isBn ? 'অবশিষ্ট বাকি (Due)' : 'Remaining Due') : (isBn ? 'ফেরত (Change)' : 'Change')}
            </span>
            <span className={`text-base font-bold ${remainingDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ৳{(remainingDue > 0 ? remainingDue : changeAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Channels Input */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 1. Cash */}
          <div className="p-3 rounded-xl bg-[#12192c] border border-[#1e2a47] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'নগদ টাকা (Cash)' : 'Cash Payment'}</span>
              </label>
              <button
                type="button"
                onClick={() => handleFillRemaining('cash')}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
              >
                {isBn ? 'বাকি অংশ বসান' : 'Fill Balance'}
              </button>
            </div>
            <input
              type="number"
              min="0"
              value={cashAmount || ''}
              onChange={e => setCashAmount(Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#0b0f19] border border-[#233152] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          {/* 2. bKash */}
          <div className="p-3 rounded-xl bg-[#12192c] border border-[#1e2a47] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                <span>{isBn ? 'বিকাশ (bKash)' : 'bKash Payment'}</span>
              </label>
              <button
                type="button"
                onClick={() => handleFillRemaining('bkash')}
                className="text-[10px] text-pink-400 hover:text-pink-300 underline font-semibold cursor-pointer"
              >
                {isBn ? 'বাকি অংশ বসান' : 'Fill Balance'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={bkashAmount || ''}
                onChange={e => setBkashAmount(Math.max(0, Number(e.target.value) || 0))}
                placeholder={isBn ? 'টাকা' : 'Amount'}
                className="w-full bg-[#0b0f19] border border-[#233152] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500 font-bold"
              />
              <input
                type="text"
                value={bkashRef}
                onChange={e => setBkashRef(e.target.value)}
                placeholder={isBn ? 'TrxID / মোবাইল' : 'TrxID / Mobile'}
                className="w-full bg-[#0b0f19] border border-[#233152] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          {/* 3. Nagad */}
          <div className="p-3 rounded-xl bg-[#12192c] border border-[#1e2a47] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span>{isBn ? 'নগদ (Nagad)' : 'Nagad Payment'}</span>
              </label>
              <button
                type="button"
                onClick={() => handleFillRemaining('nagad')}
                className="text-[10px] text-orange-400 hover:text-orange-300 underline font-semibold cursor-pointer"
              >
                {isBn ? 'বাকি অংশ বসান' : 'Fill Balance'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={nagadAmount || ''}
                onChange={e => setNagadAmount(Math.max(0, Number(e.target.value) || 0))}
                placeholder={isBn ? 'টাকা' : 'Amount'}
                className="w-full bg-[#0b0f19] border border-[#233152] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-bold"
              />
              <input
                type="text"
                value={nagadRef}
                onChange={e => setNagadRef(e.target.value)}
                placeholder={isBn ? 'TrxID' : 'TrxID'}
                className="w-full bg-[#0b0f19] border border-[#233152] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          {/* 4. Card */}
          <div className="p-3 rounded-xl bg-[#12192c] border border-[#1e2a47] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isBn ? 'কার্ড (Card)' : 'Card Payment'}</span>
              </label>
              <button
                type="button"
                onClick={() => handleFillRemaining('card')}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
              >
                {isBn ? 'বাকি অংশ বসান' : 'Fill Balance'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={cardAmount || ''}
                onChange={e => setCardAmount(Math.max(0, Number(e.target.value) || 0))}
                placeholder={isBn ? 'টাকা' : 'Amount'}
                className="w-full bg-[#0b0f19] border border-[#233152] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
              <input
                type="text"
                value={cardRef}
                onChange={e => setCardRef(e.target.value)}
                placeholder={isBn ? 'কার্ড লাস্ট ৪ ডিজিট / স্লিপ নং' : 'Card last 4 / Slip #'}
                className="w-full bg-[#0b0f19] border border-[#233152] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Summary / Progress bar */}
          <div className="p-3 rounded-xl bg-[#090d18] border border-[#1a233a] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{isBn ? 'মোট সংগৃহীত:' : 'Total Collected:'}</span>
              <span className="font-bold text-white">৳{totalSplitPaid.toLocaleString()} / ৳{grandTotal.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (totalSplitPaid / (grandTotal || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
            >
              {isBn ? 'সব রিসেট করুন' : 'Clear All'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#141b2d] hover:bg-[#1a233a] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isBn ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Split Payment'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
