import React, { useState } from 'react';
import {
  Sparkles, Plus, ShoppingCart, ShoppingBag, Receipt, Wallet,
  Calendar, TrendingUp, TrendingDown, ArrowRight, Store,
  DollarSign, PackageCheck, AlertCircle
} from 'lucide-react';
import { Language, BusinessSettings, Product, Sale, TabType, Customer, Purchase, Expense } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { DashboardTrendChart } from './DashboardTrendChart';

interface DashboardViewProps {
  lang: Language;
  settings: BusinessSettings;
  products: Product[];
  customers?: Customer[];
  sales: Sale[];
  purchases?: Purchase[];
  expenses?: Expense[];
  onNavigate?: (tab: TabType) => void;
  onOpenAddProduct: () => void;
  onOpenAddPurchase?: () => void;
  onOpenQuickSale: () => void;
  onOpenPos?: () => void;
  onOpenDueKhata?: () => void;
  onOpenStockAlerts?: () => void;
  onViewSaleInvoice?: (sale: Sale) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  settings,
  products,
  sales,
  expenses = [],
  onNavigate,
  onOpenAddProduct,
  onOpenAddPurchase,
  onOpenQuickSale,
  onOpenPos,
  onOpenDueKhata,
  onOpenStockAlerts,
  onViewSaleInvoice
}) => {
  const t = translations[lang];

  const handleNav = (tab: TabType) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  // Dynamic calculations from database
  const todayStats = StorageService.getTodayStats();
  const monthStats = StorageService.getMonthStats();

  // Date formatted like in screenshot "শুক্রবার, ১১ সেপ্টেম্বর"
  const today = new Date();
  const dateFormatted = lang === 'bn'
    ? today.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })
    : today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div id="dashboard-container" className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* 1. HERO GRADIENT BANNER (Exact match to screenshot) */}
      <div
        id="hero-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl shadow-purple-950/30"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t.getStarted}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
              {products.length === 0 ? t.heroTitle : (lang === 'bn' ? `দোকান পুরোপুরি প্রস্তুত — সহজে বিক্রি করুন` : 'Your store is ready — start selling easily')}
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-purple-100/90 font-medium leading-relaxed">
              {products.length === 0 ? t.heroSubtitle : (lang === 'bn' ? `বর্তমানে ${products.length}টি পণ্য স্টকে আছে এবং আজকের মোট বিক্রি ${settings.currencySymbol}${todayStats.todaySales.toLocaleString()}।` : `${products.length} active products in stock. Total sales today is ${settings.currencySymbol}${todayStats.todaySales.toLocaleString()}.`)}
            </p>

            {/* Steps Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={onOpenAddProduct}
                className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {t.step1}
              </button>
              <ArrowRight className="w-4 h-4 text-purple-200" />
              <button
                onClick={onOpenQuickSale}
                className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {t.step2}
              </button>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex-shrink-0">
            <button
              id="btn-hero-add-product"
              onClick={onOpenAddProduct}
              className="bg-white hover:bg-purple-50 text-purple-900 font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.firstAddProductBtn}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 right-48 w-48 h-48 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. FOUR QUICK ACTION CARDS (Screenshot match) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Action 1: Add Product */}
        <button
          id="action-card-add-product"
          onClick={onOpenAddProduct}
          className="flex items-center gap-3.5 p-4 rounded-xl bg-[#111827] hover:bg-[#162035] border border-[#1e293b] text-left transition-all group cursor-pointer shadow-sm hover:border-cyan-500/40"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-200 group-hover:text-white">
            {t.addProduct}
          </span>
        </button>

        {/* Action 2: New Purchase */}
        <button
          id="action-card-add-purchase"
          onClick={() => (onOpenAddPurchase ? onOpenAddPurchase() : handleNav('purchases'))}
          className="flex items-center gap-3.5 p-4 rounded-xl bg-[#111827] hover:bg-[#162035] border border-[#1e293b] text-left transition-all group cursor-pointer shadow-sm hover:border-purple-500/40"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-200 group-hover:text-white">
            {t.addPurchase}
          </span>
        </button>

        {/* Action 3: View Invoices / POS */}
        <button
          id="action-card-view-invoices"
          onClick={() => (onOpenPos ? onOpenPos() : handleNav('pos'))}
          className="flex items-center gap-3.5 p-4 rounded-xl bg-[#111827] hover:bg-[#162035] border border-[#1e293b] text-left transition-all group cursor-pointer shadow-sm hover:border-emerald-500/40"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-200 group-hover:text-white">
            {t.viewInvoices}
          </span>
        </button>

        {/* Action 4: Due Khata */}
        <button
          id="action-card-due-khata"
          onClick={() => (onOpenDueKhata ? onOpenDueKhata() : handleNav('due_khata'))}
          className="flex items-center gap-3.5 p-4 rounded-xl bg-[#111827] hover:bg-[#162035] border border-[#1e293b] text-left transition-all group cursor-pointer shadow-sm hover:border-amber-500/40"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-200 group-hover:text-white">
            {t.dueKhata}
          </span>
        </button>
      </div>

      {/* 3. TODAY'S SUMMARY (আজকের হিসাব) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            <h2 className="text-base font-bold text-white tracking-tight">
              {t.todaySummary}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#12192c] border border-[#1e293b] text-xs font-medium text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{dateFormatted}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Sales */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.todaySales}</span>
            </div>
            <p className="text-2xl font-extrabold text-white tracking-tight">
              {settings.currencySymbol}{todayStats.todaySales.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {todayStats.todaySalesCount} {t.salesCount}
            </p>
          </div>

          {/* Card 2: Today's Profit */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.todayProfit}</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
              {settings.currencySymbol}{todayStats.todayProfit.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn' ? 'মোট বিক্রয় - ক্রয়মূল্য ও খরচ' : 'Net profit after expenses'}
            </p>
          </div>

          {/* Card 3: Today's Expense */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-rose-500/30 transition-all">
            <div className="flex items-center gap-2 text-rose-400 mb-3">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.todayExpense}</span>
            </div>
            <p className="text-2xl font-extrabold text-rose-400 tracking-tight">
              {settings.currencySymbol}{todayStats.todayExpense.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn' ? 'আজকের মোট খরচ' : "Today's expenses"}
            </p>
          </div>

          {/* Card 4: Total Due */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.totalDue}</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {settings.currencySymbol}{todayStats.totalDue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn' ? 'কাস্টমারদের কাছে বকেয়া' : 'Receivables from customers'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. THIS MONTH'S SUMMARY (এই মাসের হিসাব) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            <h2 className="text-base font-bold text-white tracking-tight">
              {t.monthSummary}
            </h2>
          </div>
          <button
            onClick={() => handleNav('reports')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>{t.details}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Month Sales */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.totalMonthSales}</span>
            </div>
            <p className="text-2xl font-extrabold text-white tracking-tight">
              {settings.currencySymbol}{monthStats.totalSales.toLocaleString()}
            </p>
          </div>

          {/* Month Purchases */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-2 text-purple-400 mb-3">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.purchaseExpense}</span>
            </div>
            <p className="text-2xl font-extrabold text-white tracking-tight">
              {settings.currencySymbol}{monthStats.totalPurchases.toLocaleString()}
            </p>
          </div>

          {/* Month Expenses */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-rose-500/30 transition-all">
            <div className="flex items-center gap-2 text-rose-400 mb-3">
              <Store className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.shopExpense}</span>
            </div>
            <p className="text-2xl font-extrabold text-white tracking-tight">
              {settings.currencySymbol}{monthStats.totalExpenses.toLocaleString()}
            </p>
          </div>

          {/* Month Net Profit */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{t.netProfit}</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
              {settings.currencySymbol}{monthStats.netProfit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM SECTION: SALES TREND & MONEY STATUS (বিক্রয়ের ধারা ও টাকার হালচাল) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Sales, Profit & Expense Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#111827] border border-[#1e293b]">
          <DashboardTrendChart
            lang={lang}
            settings={settings}
            sales={sales}
            expenses={expenses}
          />
        </div>

        {/* Right (1 Col): Money Status (টাকার হালচাল) */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-cyan-500 rounded-full" />
              <h3 className="text-sm font-bold text-white">{t.moneyStatus}</h3>
            </div>
            <p className="text-xs text-slate-400">{t.moneyStatusSub}</p>

            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#0e1d2c] to-[#0a1622] border border-cyan-900/40 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-200">{t.todayCollection}</span>
              </div>
              <p className="text-2xl font-extrabold text-cyan-300">
                {settings.currencySymbol}{todayStats.todayCollection.toLocaleString()}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <div className="p-3 rounded-lg bg-[#0b101d] border border-[#192238] flex items-center justify-between">
                <span className="text-xs text-slate-400">{t.totalDue}</span>
                <span className="text-sm font-bold text-amber-400">
                  {settings.currencySymbol}{todayStats.totalDue.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#0b101d] border border-[#192238] flex items-center justify-between">
                <span className="text-xs text-slate-400">{t.shopExpense} (আজ)</span>
                <span className="text-sm font-bold text-rose-400">
                  {settings.currencySymbol}{todayStats.todayExpense.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => (onOpenDueKhata ? onOpenDueKhata() : handleNav('due_khata'))}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1a233d] hover:bg-[#232f50] text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === 'bn' ? 'সম্পূর্ণ বাকির খাতা দেখুন' : 'View Full Due Ledger'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
