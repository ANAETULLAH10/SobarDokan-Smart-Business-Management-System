import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3,
  Percent, ArrowRight, ShieldCheck, Sparkles, Filter, CheckCircle2,
  AlertTriangle, Calculator, FileText, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Language, BusinessSettings, Sale, Expense } from '../../types';

interface DailyNetProfitReportProps {
  lang: Language;
  settings: BusinessSettings;
  sales: Sale[];
  expenses: Expense[];
  onNavigateToReports?: () => void;
  onNavigateToExpenses?: () => void;
}

export const DailyNetProfitReport: React.FC<DailyNetProfitReportProps> = ({
  lang,
  settings,
  sales = [],
  expenses = [],
  onNavigateToReports,
  onNavigateToExpenses
}) => {
  const isBn = lang === 'bn';
  const currency = settings.currencySymbol || '৳';

  // Timeframe filter state: 7, 14, 30 days
  const [timeframe, setTimeframe] = useState<'7' | '14' | '30'>('7');
  const [viewTab, setViewTab] = useState<'visual' | 'breakdown'>('visual');

  // Calculate daily data
  const { dailyData, summary } = useMemo(() => {
    const daysCount = parseInt(timeframe);
    const now = new Date();
    const list = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayLabel = isBn
        ? d.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric', month: 'short' })
        : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

      const dayShort = isBn
        ? d.toLocaleDateString('bn-BD', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { weekday: 'short' });

      // Daily Total Sales
      const daySales = sales.filter(s => s.date === dateStr && s.status !== 'returned');
      const totalSales = daySales.reduce((acc, s) => acc + s.grandTotal, 0);

      // Daily Total Expenses
      const dayExp = expenses.filter(e => e.date === dateStr);
      const totalExpense = dayExp.reduce((acc, e) => acc + e.amount, 0);

      // Daily Net Profit = Total Sales - Expenses
      const netProfit = totalSales - totalExpense;
      const margin = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;

      list.push({
        date: dateStr,
        label: dayLabel,
        shortLabel: dayShort,
        sales: totalSales,
        expenses: totalExpense,
        netProfit: netProfit,
        margin: margin,
        orderCount: daySales.length,
        expenseCount: dayExp.length,
        isProfitable: netProfit >= 0,
        isToday: i === 0
      });
    }

    const totalSalesPeriod = list.reduce((sum, item) => sum + item.sales, 0);
    const totalExpensesPeriod = list.reduce((sum, item) => sum + item.expenses, 0);
    const totalNetProfitPeriod = totalSalesPeriod - totalExpensesPeriod;
    const avgDailyNetProfit = Math.round(totalNetProfitPeriod / daysCount);
    const overallMargin = totalSalesPeriod > 0 ? Math.round((totalNetProfitPeriod / totalSalesPeriod) * 100) : 0;

    // Find best profit day
    let bestDay = list[0];
    for (const item of list) {
      if (item.netProfit > (bestDay?.netProfit || 0)) {
        bestDay = item;
      }
    }

    // Today's specific net profit
    const todayItem = list[list.length - 1];

    const profitableDaysCount = list.filter(item => item.netProfit > 0).length;

    return {
      dailyData: list,
      summary: {
        totalSales: totalSalesPeriod,
        totalExpenses: totalExpensesPeriod,
        totalNetProfit: totalNetProfitPeriod,
        avgDailyNetProfit,
        overallMargin,
        todayNetProfit: todayItem ? todayItem.netProfit : 0,
        todaySales: todayItem ? todayItem.sales : 0,
        todayExpense: todayItem ? todayItem.expenses : 0,
        bestDay: bestDay || null,
        profitableDaysCount,
        totalDays: daysCount
      }
    };
  }, [sales, expenses, timeframe, isBn]);

  const formatNumber = (num: number) => {
    return Math.abs(num).toLocaleString('en-US');
  };

  const formatYAxis = (val: number) => {
    if (Math.abs(val) >= 100000) return `${currency}${(val / 1000).toFixed(0)}k`;
    if (Math.abs(val) >= 1000) return `${currency}${(val / 1000).toFixed(1)}k`;
    return `${currency}${val}`;
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      return (
        <div className="bg-[#0b101d] border border-[#233152] rounded-xl p-3 shadow-2xl text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-[#192238] pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{data.label}</span>
            </span>
            {data.isToday && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                {isBn ? 'আজ' : 'Today'}
              </span>
            )}
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between text-indigo-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>{isBn ? 'মোট বিক্রয়' : 'Total Sales'}:</span>
              </span>
              <span className="font-bold font-mono">+{currency}{formatNumber(data.sales)}</span>
            </div>

            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{isBn ? 'মোট খরচ' : 'Expenses'}:</span>
              </span>
              <span className="font-bold font-mono">−{currency}{formatNumber(data.expenses)}</span>
            </div>

            <div className="pt-1.5 border-t border-[#192238] flex items-center justify-between font-bold">
              <span className="flex items-center gap-1 text-white">
                <span className={`w-2 h-2 rounded-full ${data.netProfit >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{isBn ? 'নিট লাভ (বিক্রয় − খরচ)' : 'Net Profit'}:</span>
              </span>
              <span className={`font-mono text-sm ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.netProfit >= 0 ? '+' : '−'}{currency}{formatNumber(data.netProfit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>{isBn ? 'প্রফিট মার্জিন' : 'Profit Margin'}:</span>
              <span className={`font-semibold ${data.margin >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {data.margin}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="daily-net-profit-report"
      className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#0c1222] via-[#0d1527] to-[#0a0f1d] border border-[#1e2a47] shadow-xl space-y-6"
    >
      {/* 1. Header with Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2640] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>{isBn ? 'দৈনিক নিট লাভ রিপোর্ট (বিক্রয় − খরচ)' : 'Daily Net Profit Report (Sales − Expenses)'}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              {isBn ? 'স্বয়ংক্রিয় হিসাব' : 'Auto Calculated'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isBn
              ? 'প্রতিদিনের মোট বিক্রয় থেকে দোকানের খরচ বিয়োগ করে প্রকৃত নিট লাভের পরিমাণ ও গ্রাফিকাল বিশ্লেষণ'
              : 'Calculate and visualize daily net profit by subtracting operating expenses from total sales'}
          </p>
        </div>

        {/* Action Controls: Timeframe Pills & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="inline-flex rounded-xl bg-[#12192d] p-1 border border-[#1e293b]">
            <button
              type="button"
              onClick={() => setTimeframe('7')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === '7'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? '৭ দিন' : '7 Days'}
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('14')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === '14'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? '১৪ দিন' : '14 Days'}
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('30')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === '30'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? '৩০ দিন' : '30 Days'}
            </button>
          </div>

          {/* View Tab Toggle */}
          <div className="inline-flex rounded-xl bg-[#12192d] p-1 border border-[#1e293b]">
            <button
              type="button"
              onClick={() => setViewTab('visual')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewTab === 'visual'
                  ? 'bg-[#1e2c4c] text-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isBn ? 'ভিজ্যুয়াল গ্রাফ' : 'Visual Graph'}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isBn ? 'গ্রাফ' : 'Graph'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('breakdown')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewTab === 'breakdown'
                  ? 'bg-[#1e2c4c] text-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isBn ? 'দৈনিক তালিকা' : 'Daily Breakdown'}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isBn ? 'তালিকা' : 'Table'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Visual KPI Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Net Profit (আজকের নিট লাভ) */}
        <div className="p-4 rounded-xl bg-[#10172a] border border-[#1e2a47] hover:border-emerald-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'আজকের নিট লাভ' : "Today's Net Profit"}</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              summary.todayNetProfit >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {summary.todayNetProfit >= 0 ? (isBn ? 'লাভজনক' : 'Profit') : (isBn ? 'ঘাটতি' : 'Loss')}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-emerald-400">
              {summary.todayNetProfit >= 0 ? '+' : '−'}{currency}{formatNumber(summary.todayNetProfit)}
            </span>
          </div>

          <div className="pt-1 border-t border-[#1b2640] text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>{currency}{formatNumber(summary.todaySales)} (বিক্রি)</span>
            <span>−</span>
            <span>{currency}{formatNumber(summary.todayExpense)} (খরচ)</span>
          </div>
        </div>

        {/* Card 2: Period Total Net Profit (নির্বাচিত সময়ের মোট নিট লাভ) */}
        <div className="p-4 rounded-xl bg-[#10172a] border border-[#1e2a47] hover:border-teal-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-400" />
              <span>{isBn ? `${timeframe} দিনের মোট লাভ` : `${timeframe}D Net Profit`}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
              {summary.overallMargin}% {isBn ? 'মার্জিন' : 'Margin'}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-teal-300">
              {summary.totalNetProfit >= 0 ? '+' : '−'}{currency}{formatNumber(summary.totalNetProfit)}
            </span>
          </div>

          <div className="pt-1 border-t border-[#1b2640] text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>বিক্রি: {currency}{formatNumber(summary.totalSales)}</span>
            <span>খরচ: {currency}{formatNumber(summary.totalExpenses)}</span>
          </div>
        </div>

        {/* Card 3: Daily Average Net Profit (দৈনিক গড় নিট লাভ) */}
        <div className="p-4 rounded-xl bg-[#10172a] border border-[#1e2a47] hover:border-cyan-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBn ? 'দৈনিক গড় নিট লাভ' : 'Daily Avg Profit'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {summary.profitableDaysCount}/{summary.totalDays} {isBn ? 'দিন পজিটিভ' : 'days +'}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-cyan-300">
              {currency}{formatNumber(summary.avgDailyNetProfit)}
            </span>
            <span className="text-xs text-slate-400">/{isBn ? 'দিন' : 'day'}</span>
          </div>

          <div className="pt-1 border-t border-[#1b2640] text-[11px] text-slate-400">
            {isBn
              ? `প্রতিদিন গড়ে নিট লাভ থাকে প্রায় ${currency}${formatNumber(summary.avgDailyNetProfit)}`
              : `Average daily take-home after expenses`}
          </div>
        </div>

        {/* Card 4: Best Profit Day (সর্বোচ্চ লাভের দিন) */}
        <div className="p-4 rounded-xl bg-[#10172a] border border-[#1e2a47] hover:border-amber-500/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'সর্বোচ্চ লাভের দিন' : 'Best Profit Day'}</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold">
              {summary.bestDay?.label || '-'}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-amber-300">
              +{currency}{formatNumber(summary.bestDay?.netProfit || 0)}
            </span>
          </div>

          <div className="pt-1 border-t border-[#1b2640] text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>বিক্রি: {currency}{formatNumber(summary.bestDay?.sales || 0)}</span>
            <span>খরচ: {currency}{formatNumber(summary.bestDay?.expenses || 0)}</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Content: Either Chart OR Detailed Breakdown Table */}
      {viewTab === 'visual' ? (
        <div className="space-y-4">
          {/* Chart Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? `গত ${timeframe} দিনের বিক্রয়, খরচ ও নিট লাভ গ্রাফ:` : `Sales, Expenses & Net Profit Trend (${timeframe} Days):`}</span>
            </span>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-500/80 inline-block" />
                <span>{isBn ? 'মোট বিক্রয়' : 'Total Sales'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/80 inline-block" />
                <span>{isBn ? 'মোট খরচ' : 'Expenses'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="font-bold text-emerald-400">{isBn ? 'নিট লাভ (Net Profit)' : 'Net Profit'}</span>
              </span>
            </div>
          </div>

          {/* Recharts Visual Canvas */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a47" vertical={false} opacity={0.6} />

                <XAxis
                  dataKey="shortLabel"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1e2a47' }}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1e2a47' }}
                  tickFormatter={formatYAxis}
                />

                <Tooltip content={<CustomTooltip />} />

                <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />

                {/* Sales Bar */}
                <Bar
                  dataKey="sales"
                  name={isBn ? 'মোট বিক্রয়' : 'Total Sales'}
                  fill="url(#salesBarGrad)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />

                {/* Expenses Bar */}
                <Bar
                  dataKey="expenses"
                  name={isBn ? 'খরচ' : 'Expenses'}
                  fill="url(#expenseBarGrad)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />

                {/* Net Profit Line */}
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name={isBn ? 'নিট লাভ (Sales − Expense)' : 'Net Profit'}
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', stroke: '#0b101d', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Detailed Breakdown Table */
        <div className="overflow-x-auto rounded-xl border border-[#1e2a47] bg-[#0b101d]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#12192d] text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-[#1e2a47]">
              <tr>
                <th className="py-2.5 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-2.5 px-4 text-right">{isBn ? 'মোট বিক্রয় (+)' : 'Total Sales (+)'}</th>
                <th className="py-2.5 px-4 text-right">{isBn ? 'দোকান খরচ (−)' : 'Expenses (−)'}</th>
                <th className="py-2.5 px-4 text-right">{isBn ? 'নিট লাভ (=)' : 'Net Profit (=)'}</th>
                <th className="py-2.5 px-4 text-right">{isBn ? 'মার্জিন' : 'Margin %'}</th>
                <th className="py-2.5 px-4 text-center">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]/60 font-mono">
              {dailyData.slice().reverse().map((item, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-[#141d33] transition-colors ${
                    item.isToday ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.isToday && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
                        {isBn ? 'আজ' : 'Today'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-indigo-300 font-bold">
                    {currency}{formatNumber(item.sales)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-400 font-bold">
                    {currency}{formatNumber(item.expenses)}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-extrabold ${
                    item.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {item.netProfit >= 0 ? '+' : '−'}{currency}{formatNumber(item.netProfit)}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-bold ${
                    item.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {item.margin}%
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                      item.netProfit > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.netProfit === 0
                        ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {item.netProfit > 0 ? (isBn ? 'লাভ' : 'Profit') : item.netProfit === 0 ? (isBn ? 'সমান' : 'Even') : (isBn ? 'ঘাটতি' : 'Loss')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Bottom Daily Equation Breakdown Cards (প্রতিদিনের ভিজ্যুয়াল সমীকরণ কার্ড) */}
      <div className="space-y-3 pt-2 border-t border-[#1b2640]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBn ? 'প্রতিদিনের নিট লাভ সমীকরণ (Visual Breakdown):' : 'Daily Net Profit Equation:'}</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {isBn ? '[বিক্রয় − খরচ = নিট লাভ]' : '[Sales − Expenses = Net Profit]'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dailyData.slice(-6).reverse().map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                item.isToday
                  ? 'bg-gradient-to-br from-[#121b33] to-[#0d162a] border-indigo-500/40 shadow-md'
                  : 'bg-[#0e1526] border-[#1d2740] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{item.label}</span>
                  {item.isToday && (
                    <span className="text-[9px] px-1.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {isBn ? 'আজ' : 'Today'}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {item.margin}% {isBn ? 'মার্জিন' : 'Margin'}
                </span>
              </div>

              {/* Progress/Ratio bar of Sales vs Expense */}
              <div className="w-full bg-[#1b253d] h-2 rounded-full overflow-hidden flex mb-2">
                <div
                  className="bg-indigo-500 h-full"
                  style={{
                    width: `${item.sales + item.expenses > 0 ? Math.min(100, Math.round((item.sales / (item.sales + item.expenses)) * 100)) : 50}%`
                  }}
                  title={`Sales: ${currency}${item.sales}`}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{
                    width: `${item.sales + item.expenses > 0 ? Math.min(100, Math.round((item.expenses / (item.sales + item.expenses)) * 100)) : 50}%`
                  }}
                  title={`Expenses: ${currency}${item.expenses}`}
                />
              </div>

              {/* Math Equation Formula Row */}
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <div className="flex items-center gap-1 text-slate-300">
                  <span className="text-indigo-300 font-bold">{currency}{formatNumber(item.sales)}</span>
                  <span className="text-slate-500">−</span>
                  <span className="text-rose-400 font-bold">{currency}{formatNumber(item.expenses)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500">=</span>
                  <span className={`font-black text-sm ${
                    item.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {item.netProfit >= 0 ? '+' : '−'}{currency}{formatNumber(item.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Business Financial Insights Box */}
      <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#1e2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">
              {isBn ? 'আর্থিক বিশ্লেষণ ও সিদ্ধান্ত:' : 'Financial Takeaways:'}
            </span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {isBn
                ? `নির্বাচিত ${timeframe} দিনে মোট বিক্রয় ${currency}${formatNumber(summary.totalSales)} হতে ${currency}${formatNumber(summary.totalExpenses)} খরচ বাদ দিয়ে প্রকৃত নিট লাভ হয়েছে ${currency}${formatNumber(summary.totalNetProfit)} (মার্জিন: ${summary.overallMargin}%)।`
                : `Total sales of ${currency}${formatNumber(summary.totalSales)} minus ${currency}${formatNumber(summary.totalExpenses)} in expenses yields a net profit of ${currency}${formatNumber(summary.totalNetProfit)} (${summary.overallMargin}% margin).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onNavigateToExpenses && (
            <button
              type="button"
              onClick={onNavigateToExpenses}
              className="px-3 py-1.5 rounded-lg bg-[#18233d] hover:bg-[#202f52] text-slate-300 hover:text-white font-medium text-[11px] border border-[#233152] transition-colors cursor-pointer"
            >
              {isBn ? 'খরচ তালিকা' : 'View Expenses'}
            </button>
          )}

          {onNavigateToReports && (
            <button
              type="button"
              onClick={onNavigateToReports}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span>{isBn ? 'বিস্তারিত রিপোর্ট' : 'Full Reports'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
