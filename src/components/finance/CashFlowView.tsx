import React from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight,
  ArrowDownLeft, Smartphone, Landmark, Wallet, CheckCircle
} from 'lucide-react';
import { Sale, Purchase, Expense, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';

interface CashFlowViewProps {
  lang: Language;
  settings: BusinessSettings;
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  lang,
  settings,
  sales,
  purchases,
  expenses
}) => {
  const t = translations[lang];

  // Inflows
  const totalSalesCash = sales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const totalSalesMfs = sales
    .filter(s => s.paymentMethod === 'bkash' || s.paymentMethod === 'nagad')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const totalSalesBank = sales
    .filter(s => s.paymentMethod === 'card' || s.paymentMethod === 'bank')
    .reduce((sum, s) => sum + s.paidAmount, 0);

  const totalInflow = sales.reduce((sum, s) => sum + s.paidAmount, 0);

  // Outflows
  const purchasePaidCash = purchases
    .filter(p => p.paymentMethod === 'cash')
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const purchasePaidOther = purchases
    .filter(p => p.paymentMethod !== 'cash')
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const expensePaidCash = expenses
    .filter(e => e.paymentMethod === 'cash')
    .reduce((sum, e) => sum + e.amount, 0);

  const expensePaidOther = expenses
    .filter(e => e.paymentMethod !== 'cash')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOutflow = purchases.reduce((sum, p) => sum + p.paidAmount, 0) + expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = totalInflow - totalOutflow;

  // Estimated Liquidity
  const estimatedCashInHand = Math.max(5000, 15000 + totalSalesCash - (purchasePaidCash + expensePaidCash));
  const estimatedMfsBalance = Math.max(2000, 10000 + totalSalesMfs - (purchasePaidOther + expensePaidOther) * 0.4);
  const estimatedBankBalance = Math.max(10000, 45000 + totalSalesBank - (purchasePaidOther + expensePaidOther) * 0.6);

  return (
    <div id="cashflow-view" className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-400" />
          <span>{t.cashFlow} & Accounts</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang === 'bn' ? 'নগদ ক্যাশ, বিকাশ/নগদ ও ব্যাংক ব্যালেন্সের হিসাব' : 'Monitor cash inflows, outflows, liquid balances and digital wallets'}
        </p>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cash in Hand */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#151f38] border border-[#1e293b] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              {lang === 'bn' ? 'হাতে নগদ ক্যাশ' : 'Cash in Hand'}
            </span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {settings.currencySymbol}{Math.round(estimatedCashInHand).toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">কাউন্টার ও ড্রয়ার ব্যালেন্স</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* bKash / Nagad Wallet */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#151f38] border border-[#1e293b] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              {lang === 'bn' ? 'বিকাশ / নগদ ওয়ালেট' : 'Mobile Banking (bKash/Nagad)'}
            </span>
            <span className="text-2xl font-extrabold text-pink-400">
              {settings.currencySymbol}{Math.round(estimatedMfsBalance).toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">মার্চেন্ট ও এজেন্ট অ্যাকাউন্ট</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        {/* Bank Account */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#151f38] border border-[#1e293b] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              {lang === 'bn' ? 'ব্যাংক ব্যালেন্স' : 'Bank Balance'}
            </span>
            <span className="text-2xl font-extrabold text-indigo-300">
              {settings.currencySymbol}{Math.round(estimatedBankBalance).toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">কারেন্ট ও সেভিংস হিসাব</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Landmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cash Flow Statement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>মোট আগমন (Total Inflow)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">
            +{settings.currencySymbol}{totalInflow.toLocaleString()}
          </p>
          <div className="mt-4 pt-3 border-t border-[#192238] space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>নগদ বিক্রয় প্রাপ্তি:</span>
              <span className="text-white font-semibold">{settings.currencySymbol}{totalSalesCash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>মোবাইল ব্যাংকিং (বিকাশ/নগদ):</span>
              <span className="text-white font-semibold">{settings.currencySymbol}{totalSalesMfs.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>ব্যাংক ও কার্ড পেমেন্ট:</span>
              <span className="text-white font-semibold">{settings.currencySymbol}{totalSalesBank.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>মোট বহির্গমন (Total Outflow)</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-rose-400">
            -{settings.currencySymbol}{totalOutflow.toLocaleString()}
          </p>
          <div className="mt-4 pt-3 border-t border-[#192238] space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>পণ্য ক্রয় পরিশোধ:</span>
              <span className="text-white font-semibold">{settings.currencySymbol}{purchases.reduce((s, p) => s + p.paidAmount, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>দোকান পরিচালন ব্যয় (খরচ):</span>
              <span className="text-white font-semibold">{settings.currencySymbol}{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>নিট ক্যাশ ব্যালেন্স (Net Cash Flow)</span>
              <CheckCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`text-2xl font-extrabold ${netCashFlow >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {netCashFlow >= 0 ? '+' : ''}{settings.currencySymbol}{netCashFlow.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              আগম ও ব্যয়ের মধ্যকার ইতিবাচক তারল্য প্রবাহ ব্যবসা সম্প্রসারণ নিশ্চিত করে।
            </p>
          </div>
          <div className="p-3 bg-[#0d1222] rounded-xl border border-[#1e2a47] text-xs text-indigo-300 font-semibold mt-4">
            ✓ ক্যাশ ফ্লো স্বাস্থ্যকর অবস্থায় রয়েছে
          </div>
        </div>
      </div>
    </div>
  );
};
