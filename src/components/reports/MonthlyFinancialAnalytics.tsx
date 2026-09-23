import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar,
  BarChart2, Activity, PieChart, Layers, CheckCircle2,
  Percent, ArrowUpRight, ShoppingCart
} from 'lucide-react';
import { Language, BusinessSettings, Sale, Purchase, Expense } from '../../types';
import { StorageService } from '../../services/storage';

interface MonthlyFinancialAnalyticsProps {
  lang: Language;
  settings: BusinessSettings;
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
}

export const MonthlyFinancialAnalytics: React.FC<MonthlyFinancialAnalyticsProps> = ({
  lang,
  settings,
  sales,
  purchases,
  expenses
}) => {
  const [horizonMonths, setHorizonMonths] = useState<6 | 12>(6);
  const [chartType, setChartType] = useState<'area' | 'bar' | 'composed'>('composed');

  // Fetch monthly records dynamically
  const monthlyData = useMemo(() => {
    return StorageService.getMonthlyFinancialTrends(horizonMonths, lang);
  }, [horizonMonths, lang, sales, purchases, expenses]);

  // Aggregate summary metrics
  const summary = useMemo(() => {
    const totalRev = monthlyData.reduce((s, m) => s + m.revenue, 0);
    const totalProf = monthlyData.reduce((s, m) => s + m.netProfit, 0);
    const totalExp = monthlyData.reduce((s, m) => s + m.expenses, 0);
    const totalPur = monthlyData.reduce((s, m) => s + m.purchases, 0);

    const avgRev = Math.round(totalRev / (monthlyData.length || 1));
    const avgProf = Math.round(totalProf / (monthlyData.length || 1));
    const avgExp = Math.round(totalExp / (monthlyData.length || 1));
    const avgMargin = totalRev > 0 ? Number(((totalProf / totalRev) * 100).toFixed(1)) : 0;

    // Best month
    const bestMonth = [...monthlyData].sort((a, b) => b.revenue - a.revenue)[0];

    return {
      totalRev,
      totalProf,
      totalExp,
      totalPur,
      avgRev,
      avgProf,
      avgExp,
      avgMargin,
      bestMonth
    };
  }, [monthlyData]);

  // Format currency for Y Axis
  const formatYAxis = (val: number) => {
    if (val >= 100000) return `${settings.currencySymbol}${(val / 1000).toFixed(0)}k`;
    if (val >= 1000) return `${settings.currencySymbol}${(val / 1000).toFixed(1)}k`;
    return `${settings.currencySymbol}${val}`;
  };

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0]?.payload;
      return (
        <div className="bg-[#0b101d]/95 backdrop-blur-md border border-[#1e2a47] rounded-xl p-3.5 shadow-2xl text-xs space-y-2.5 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-[#1e2a47] pb-1.5">
            <span className="font-bold text-white text-sm">{label}</span>
            {dataItem?.profitMargin !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                {dataItem.profitMargin}% {lang === 'bn' ? 'মার্জিন' : 'Margin'}
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-indigo-300 font-sans text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>{lang === 'bn' ? 'মাসিক বিক্রি' : 'Revenue'}:</span>
              </span>
              <span className="font-bold text-white">
                {settings.currencySymbol}{Number(dataItem?.revenue || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-emerald-300 font-sans text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{lang === 'bn' ? 'নিট লাভ' : 'Net Profit'}:</span>
              </span>
              <span className="font-bold text-emerald-400">
                {settings.currencySymbol}{Number(dataItem?.netProfit || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-rose-300 font-sans text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>{lang === 'bn' ? 'দোকানের খরচ' : 'Expenses'}:</span>
              </span>
              <span className="font-bold text-rose-400">
                {settings.currencySymbol}{Number(dataItem?.expenses || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-cyan-300 font-sans text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{lang === 'bn' ? 'মালামাল ক্রয়' : 'Purchases'}:</span>
              </span>
              <span className="font-bold text-cyan-300">
                {settings.currencySymbol}{Number(dataItem?.purchases || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {dataItem?.ordersCount > 0 && (
            <div className="pt-1.5 border-t border-[#1e2a47] flex items-center justify-between text-[11px] text-slate-400">
              <span>{lang === 'bn' ? 'মোট সফল অর্ডার' : 'Total Orders'}:</span>
              <span className="font-bold text-slate-200">{dataItem.ordersCount}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="monthly-financial-analytics" className="space-y-6">
      
      {/* Container Box */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'মাসিক আয়, ব্যয় ও মুনাফা ট্রেন্ড (Monthly Financial Trends)' : 'Monthly Revenue, Profit & Expense Trends'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'মাসের পর মাস ব্যবসার বিক্রয় বৃদ্ধি, পরিচালনা খরচ ও নিট লাভের তুলনামূলক চিত্র'
                : 'Month-over-month trajectory of sales turnover, operating overheads, and net earnings'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Chart Type Selector */}
            <div className="flex items-center p-1 rounded-xl bg-[#0b101d] border border-[#1e293b] text-xs">
              <button
                type="button"
                onClick={() => setChartType('composed')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartType === 'composed'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Composed Bar & Line"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'মিশ্র বিশ্লেষণ' : 'Composed'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Area Trend"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'এরিয়া ট্রেন্ড' : 'Area Trend'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bar Chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'তুলনামূলক বার' : 'Bar Chart'}</span>
              </button>
            </div>

            {/* Horizon Filter (6 vs 12 months) */}
            <div className="flex items-center p-1 rounded-xl bg-[#0b101d] border border-[#1e293b] text-xs">
              <button
                type="button"
                onClick={() => setHorizonMonths(6)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  horizonMonths === 6
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'গত ৬ মাস' : 'Last 6 Months'}
              </button>
              <button
                type="button"
                onClick={() => setHorizonMonths(12)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  horizonMonths === 12
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'গত ১২ মাস' : 'Last 12 Months'}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Financial Health KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{lang === 'bn' ? 'গড় মাসিক বিক্রি' : 'Avg Monthly Revenue'}</span>
            </span>
            <p className="text-2xl font-extrabold text-white tracking-tight">
              {settings.currencySymbol}{summary.avgRev.toLocaleString()}
            </p>
            <p className="text-[11px] text-indigo-300 font-medium">
              {lang === 'bn' ? `মোট: ${settings.currencySymbol}${summary.totalRev.toLocaleString()}` : `Total: ${settings.currencySymbol}${summary.totalRev.toLocaleString()}`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-1">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{lang === 'bn' ? 'গড় মাসিক নিট লাভ' : 'Avg Monthly Net Profit'}</span>
            </span>
            <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">
              {settings.currencySymbol}{summary.avgProf.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-300/80 font-medium">
              {lang === 'bn' ? `মোট লাভ: ${settings.currencySymbol}${summary.totalProf.toLocaleString()}` : `Total Profit: ${settings.currencySymbol}${summary.totalProf.toLocaleString()}`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-1">
            <span className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{lang === 'bn' ? 'গড় মাসিক খরচ' : 'Avg Monthly Expense'}</span>
            </span>
            <p className="text-2xl font-extrabold text-rose-400 tracking-tight">
              {settings.currencySymbol}{summary.avgExp.toLocaleString()}
            </p>
            <p className="text-[11px] text-rose-300/80 font-medium">
              {lang === 'bn' ? `মোট খরচ: ${settings.currencySymbol}${summary.totalExp.toLocaleString()}` : `Total Expenses: ${settings.currencySymbol}${summary.totalExp.toLocaleString()}`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-1">
            <span className="text-xs text-purple-400 font-medium flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'গড় প্রফিট মার্জিন' : 'Avg Net Profit Margin'}</span>
            </span>
            <p className="text-2xl font-extrabold text-purple-300 tracking-tight">
              {summary.avgMargin}%
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {summary.bestMonth ? (
                <span>
                  {lang === 'bn' ? 'শীর্ষ মাস' : 'Peak'}: <strong className="text-slate-200">{summary.bestMonth.label}</strong>
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'composed' ? (
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="compRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="compExpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px' }}
                  formatter={(val) => <span className="text-xs text-slate-300 font-semibold">{val}</span>}
                />
                <Bar
                  dataKey="revenue"
                  name={lang === 'bn' ? 'মোট বিক্রি (Revenue)' : 'Revenue'}
                  fill="url(#compRevGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="expenses"
                  name={lang === 'bn' ? 'দোকানের খরচ (Expenses)' : 'Expenses'}
                  fill="url(#compExpGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name={lang === 'bn' ? 'নিট লাভ (Net Profit)' : 'Net Profit'}
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#064e3b' }}
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#022c22' }}
                />
              </ComposedChart>
            ) : chartType === 'area' ? (
              <AreaChart data={monthlyData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px' }}
                  formatter={(val) => <span className="text-xs text-slate-300 font-semibold">{val}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name={lang === 'bn' ? 'বিক্রি' : 'Revenue'}
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaRev)"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  name={lang === 'bn' ? 'নিট লাভ' : 'Net Profit'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaProf)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name={lang === 'bn' ? 'খরচ' : 'Expenses'}
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaExp)"
                />
              </AreaChart>
            ) : (
              <BarChart data={monthlyData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px' }}
                  formatter={(val) => <span className="text-xs text-slate-300 font-semibold">{val}</span>}
                />
                <Bar
                  dataKey="revenue"
                  name={lang === 'bn' ? 'বিক্রি' : 'Revenue'}
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="netProfit"
                  name={lang === 'bn' ? 'নিট লাভ' : 'Net Profit'}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name={lang === 'bn' ? 'খরচ' : 'Expenses'}
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="purchases"
                  name={lang === 'bn' ? 'পণ্য ক্রয়' : 'Purchases'}
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Detailed Month-by-Month Financial Breakdown Table */}
        <div className="pt-2 border-t border-[#1e293b]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200">
              {lang === 'bn' ? 'মাসভিত্তিক বিস্তারিত হিসাব বিবরণী' : 'Monthly Financial Breakdown'}
            </h4>
            <span className="text-[11px] text-slate-400">
              {horizonMonths} {lang === 'bn' ? 'মাসের তথ্য প্রদর্শিত' : 'months displayed'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1e2a47]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b101d] text-slate-400 border-b border-[#1e2a47]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">{lang === 'bn' ? 'মাস' : 'Month'}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{lang === 'bn' ? 'মোট বিক্রি' : 'Revenue'}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{lang === 'bn' ? 'মালের ব্যয় (COGS)' : 'COGS'}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{lang === 'bn' ? 'দোকান খরচ' : 'Expenses'}</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-emerald-400">{lang === 'bn' ? 'নিট লাভ' : 'Net Profit'}</th>
                  <th className="py-2.5 px-3 font-semibold text-right">{lang === 'bn' ? 'মার্জিন' : 'Margin %'}</th>
                  <th className="py-2.5 px-3 font-semibold text-center">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a47] font-mono">
                {monthlyData.map((row) => (
                  <tr key={row.monthKey} className="hover:bg-[#162035] transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">
                      {settings.currencySymbol}{row.revenue.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {settings.currencySymbol}{row.cogs.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-semibold">
                      {settings.currencySymbol}{row.expenses.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {settings.currencySymbol}{row.netProfit.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-300 font-bold">
                      {row.profitMargin}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {row.profitMargin >= 18 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                          {lang === 'bn' ? 'উচ্চ লাভজনক' : 'High Profit'}
                        </span>
                      ) : row.profitMargin >= 10 ? (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold">
                          {lang === 'bn' ? 'স্বাভাবিক লাভ' : 'Normal'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          {lang === 'bn' ? 'নজরদারি' : 'Low Margin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
