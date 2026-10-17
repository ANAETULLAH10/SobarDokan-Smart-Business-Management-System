import React, { useState, useEffect } from 'react';
import {
  DollarSign, Clock, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, TrendingDown, FileText, Lock, Unlock, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { CashRegisterShift, BusinessSettings, Language } from '../../types';
import { StorageService } from '../../services/storage';

interface CashRegisterViewProps {
  lang: Language;
  settings: BusinessSettings;
  onRefreshAllState?: () => void;
}

export const CashRegisterView: React.FC<CashRegisterViewProps> = ({
  lang,
  settings,
  onRefreshAllState
}) => {
  const isBn = lang === 'bn';

  const [shifts, setShifts] = useState<CashRegisterShift[]>([]);
  const [activeShift, setActiveShift] = useState<CashRegisterShift | null>(null);

  // Modals
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Form states
  const [openingCashInput, setOpeningCashInput] = useState<number>(0);
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState<string>('');

  const loadData = () => {
    const all = StorageService.getCashRegisterShifts();
    setShifts(all);
    const active = StorageService.getActiveShift();
    setActiveShift(active);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    const cashierName = StorageService.getUser()?.name || 'ক্যাশিয়ার';
    const newShift = StorageService.openShift(openingCashInput, cashierName);
    setActiveShift(newShift);
    setIsOpeningModal(false);
    loadData();
    onRefreshAllState?.();
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.closeShift(actualCashInput, closingNotes);
    setIsClosingModal(false);
    loadData();
    onRefreshAllState?.();
  };

  // Live calculations for active shift
  const todaySales = activeShift
    ? StorageService.getSales()
        .filter(s => s.date === activeShift.date && s.paymentMethod === 'cash')
        .reduce((sum, s) => sum + s.paidAmount, 0)
    : 0;

  const todayExpenses = activeShift
    ? StorageService.getExpenses()
        .filter(e => e.date === activeShift.date && (e.paymentMethod === 'cash' || !e.paymentMethod))
        .reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const liveExpectedCash = activeShift
    ? activeShift.openingCash + todaySales + activeShift.cashIn - todayExpenses - activeShift.cashOut
    : 0;

  return (
    <div id="cash-register-view" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>{isBn ? 'ক্যাশ রেজিস্টার ও দৈনিক শিফট ক্লোজিং' : 'Daily Cash Register & Shift'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'দোকান খোলার প্রারম্ভিক ক্যাশ, সারাদিনের নগদ বিক্রি ও দিন শেষে ক্যাশ ড্রয়ার মিলকরণ'
              : 'Opening cash drawer balance, daily cash flow reconciliation, and shift balancing'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeShift ? (
            <button
              onClick={() => {
                setActualCashInput(liveExpectedCash);
                setClosingNotes('');
                setIsClosingModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/40 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isBn ? 'শিফট ক্লোজ ও ক্যাশ মিলান' : 'Close Shift & Balance Cash'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setOpeningCashInput(0);
                setIsOpeningModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isBn ? 'আজকের নতুন শিফট শুরু করুন' : 'Start Today\'s Shift'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Card Banner */}
      {activeShift ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121c33] via-[#0d1629] to-[#0a1020] border border-emerald-500/30 shadow-xl relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Unlock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {isBn ? 'বর্তমান শিফট সক্রিয় রয়েছে' : 'Active Shift In Progress'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    {isBn ? 'ওপেন' : 'OPEN'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn ? 'ক্যাশিয়ার:' : 'Cashier:'} {activeShift.cashierName} • {isBn ? 'শুরু:' : 'Opened:'} {new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 block">{isBn ? 'ড্রয়ারে সম্ভাব্য ক্যাশ (Expected):' : 'Expected in Drawer:'}</span>
              <span className="text-2xl font-black text-emerald-400">৳{liveExpectedCash.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#0b0f19] border border-[#1e2a47]">
              <span className="text-[11px] text-slate-400 block">{isBn ? '১. প্রারম্ভিক ক্যাশ' : 'Opening Cash'}</span>
              <span className="text-base font-bold text-white">৳{activeShift.openingCash.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0b0f19] border border-[#1e2a47]">
              <span className="text-[11px] text-slate-400 block">{isBn ? '২. নগদ বিক্রয় (+)' : 'Cash Sales (+)'}</span>
              <span className="text-base font-bold text-emerald-400">+৳{todaySales.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0b0f19] border border-[#1e2a47]">
              <span className="text-[11px] text-slate-400 block">{isBn ? '৩. নগদ খরচ (-)' : 'Cash Expenses (-)'}</span>
              <span className="text-base font-bold text-rose-400">-৳{todayExpenses.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0b0f19] border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-[11px] text-emerald-300 block">{isBn ? '৪. বর্তমান মোট ক্যাশ' : 'Expected Balance'}</span>
              <span className="text-base font-black text-emerald-300">৳{liveExpectedCash.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#0e1424] border border-dashed border-[#1e2a47] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {isBn ? 'আজকে এখনো কোনো ক্যাশ শিফট চালু করা হয়নি' : 'No Active Shift Currently Open'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isBn
              ? 'দোকান খোলার পর ক্যাশ ড্রয়ারে থাকা শুরু নগদ টাকা এন্ট্রি করে শিফট চালু করুন।'
              : 'Record your opening drawer cash balance to start accurate shift tracking.'}
          </p>
          <button
            onClick={() => {
              setOpeningCashInput(0);
              setIsOpeningModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/50"
          >
            <Unlock className="w-4 h-4" />
            <span>{isBn ? 'শিফট শুরু করুন' : 'Start Shift'}</span>
          </button>
        </div>
      )}

      {/* Historical Shifts Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? 'পূর্ববর্তী শিফট ক্লোজিং ও ক্যাশ অডিট হিস্টোরি' : 'Shift History & Cash Audit Log'}</span>
        </h3>

        <div className="rounded-2xl bg-[#0e1424] border border-[#1e2a47] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12192c] text-slate-400 border-b border-[#1e2a47] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                  <th className="p-3.5">{isBn ? 'ক্যাশিয়ার' : 'Cashier'}</th>
                  <th className="p-3.5 text-right">{isBn ? 'প্রারম্ভিক ক্যাশ' : 'Opening Cash'}</th>
                  <th className="p-3.5 text-right">{isBn ? 'নগদ বিক্রয়' : 'Cash Sales'}</th>
                  <th className="p-3.5 text-right">{isBn ? 'প্রত্যাশিত ক্যাশ' : 'Expected'}</th>
                  <th className="p-3.5 text-right">{isBn ? 'প্রকৃত ক্যাশ' : 'Actual Count'}</th>
                  <th className="p-3.5 text-center">{isBn ? 'পার্থক্য / ব্যালেন্স' : 'Difference'}</th>
                  <th className="p-3.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a47]">
                {shifts.map(shift => {
                  const diff = shift.difference || 0;
                  const isExact = diff === 0;
                  const isShortage = diff < 0;

                  return (
                    <tr key={shift.id} className="hover:bg-[#12192c]/50 transition-colors">
                      <td className="p-3.5 text-slate-200">
                        <span className="font-semibold block">{shift.date}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(shift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {shift.closedAt && ` - ${new Date(shift.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium text-white">{shift.cashierName}</td>

                      <td className="p-3.5 text-right font-mono text-slate-300">
                        ৳{shift.openingCash.toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-mono text-emerald-400">
                        +৳{shift.cashSales.toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-mono text-white font-bold">
                        ৳{shift.expectedCash.toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-200">
                        {shift.actualCash !== undefined ? `৳${shift.actualCash.toLocaleString()}` : '—'}
                      </td>

                      <td className="p-3.5 text-center">
                        {shift.status === 'closed' ? (
                          isExact ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {isBn ? 'সঠিক (৳০)' : 'Exact Match'}
                            </span>
                          ) : isShortage ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              {isBn ? `ঘাটতি ৳${Math.abs(diff).toLocaleString()}` : `Short ৳${Math.abs(diff)}`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                              <TrendingUp className="w-3 h-3 text-indigo-400" />
                              {isBn ? `উদ্বৃত্ত +৳${diff.toLocaleString()}` : `Surplus +৳${diff}`}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[10px]">চলমান...</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            shift.status === 'open'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {shift.status === 'open' ? (isBn ? 'সক্রিয়' : 'OPEN') : (isBn ? 'ক্লোজড' : 'CLOSED')}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      {isBn ? 'এখনো কোনো ক্যাশ রেজিস্টার রেকর্ড নেই' : 'No cash register shifts recorded yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Start Shift Modal */}
      {isOpeningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'আজকের শিফট শুরু করুন' : 'Start Today\'s Shift'}</span>
              </h3>
              <button onClick={() => setIsOpeningModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'প্রারম্ভিক ড্রয়ার ক্যাশ (Opening Cash) *' : 'Opening Cash Drawer Balance *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={openingCashInput || ''}
                    onChange={e => setOpeningCashInput(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl pl-9 pr-3 py-2.5 text-base text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                  <span className="text-slate-400 text-xs absolute left-3.5 top-3 font-bold">৳</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isBn ? 'দোকান খোলার সময় ক্যাশ ড্রয়ারে থাকা ভাংতি বা নোটের মোট হিসাব লিখুন।' : 'Initial float in the cash drawer at the start of shift.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpeningModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2d] text-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold"
                >
                  {isBn ? 'শিফট শুরু করুন' : 'Start Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {isClosingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>{isBn ? 'শিফট ক্লোজ ও ক্যাশ মিলকরণ' : 'Close Shift & Reconcile'}</span>
              </h3>
              <button onClick={() => setIsClosingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#12192c] border border-[#1e2a47] flex items-center justify-between text-xs">
                <span className="text-slate-400">{isBn ? 'ড্রয়ারে প্রত্যাশিত হিসাব:' : 'Expected Cash:'}</span>
                <span className="text-base font-bold text-white">৳{liveExpectedCash.toLocaleString()}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'ড্রয়ারে গুনে পাওয়া আসল ক্যাশ (Actual Cash) *' : 'Actual Cash Counted *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={actualCashInput || ''}
                    onChange={e => setActualCashInput(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl pl-9 pr-3 py-2.5 text-base text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                  <span className="text-slate-400 text-xs absolute left-3.5 top-3 font-bold">৳</span>
                </div>
              </div>

              {/* Difference Preview */}
              <div className="p-3 rounded-xl bg-[#0b0f19] border border-[#1e2a47] flex items-center justify-between text-xs">
                <span className="text-slate-400">{isBn ? 'পার্থক্য (Difference):' : 'Difference:'}</span>
                <span
                  className={`font-bold text-sm ${
                    actualCashInput - liveExpectedCash === 0
                      ? 'text-emerald-400'
                      : actualCashInput - liveExpectedCash < 0
                      ? 'text-rose-400'
                      : 'text-indigo-400'
                  }`}
                >
                  {actualCashInput - liveExpectedCash === 0
                    ? (isBn ? 'নিখুঁত মিল (৳০)' : '0 (Match)')
                    : actualCashInput - liveExpectedCash < 0
                    ? (isBn ? `ঘাটতি -৳${Math.abs(actualCashInput - liveExpectedCash).toLocaleString()}` : `-৳${Math.abs(actualCashInput - liveExpectedCash)}`)
                    : (isBn ? `উদ্বৃত্ত +৳${(actualCashInput - liveExpectedCash).toLocaleString()}` : `+৳${actualCashInput - liveExpectedCash}`)}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'ক্লোজিং নোট (ঐচ্ছিক)' : 'Closing Notes'}
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                  placeholder={isBn ? 'ক্যাশ জমা সংক্রান্ত কোনো মন্তব্য থাকলে লিখুন...' : 'Add any notes...'}
                  className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClosingModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2d] text-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold"
                >
                  {isBn ? 'শিফট ক্লোজ নিশ্চিত করুন' : 'Confirm Close Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
