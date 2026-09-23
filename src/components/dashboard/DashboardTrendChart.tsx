import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Eye, EyeOff, Layers } from 'lucide-react';
import { Language, BusinessSettings, Sale, Expense } from '../../types';
import { StorageService } from '../../services/storage';

interface DashboardTrendChartProps {
  lang: Language;
  settings: BusinessSettings;
  sales: Sale[];
  expenses?: Expense[];
}

export const DashboardTrendChart: React.FC<DashboardTrendChartProps> = ({
  lang,
  settings,
  sales,
  expenses = []
}) => {
  const [range, setRange] = useState<'7' | '30' | 'monthly'>('7');
  const [showRevenue, setShowRevenue] = useState(true);
  const [showProfit, setShowProfit] = useState(true);
  const [showExpense, setShowExpense] = useState(true);

  // Compute data based on selected range
  const { chartData, totals } = useMemo(() => {
    if (range === 'monthly') {
      const monthly = StorageService.getMonthlyFinancialTrends(6, lang);
      const data = monthly.map(m => ({
        label: m.label,
        revenue: m.revenue,
        profit: m.netProfit,
        expense: m.expenses,
        orders: m.ordersCount
      }));

      const totalRev = data.reduce((s, d) => s + d.revenue, 0);
      const totalProf = data.reduce((s, d) => s + d.profit, 0);
      const totalExp = data.reduce((s, d) => s + d.expense, 0);
      const avg = Math.round(totalRev / (data.length || 1));

      return {
        chartData: data,
        totals: {
          revenue: totalRev,
          profit: totalProf,
          expense: totalExp,
          average: avg,
          avgLabel: lang === 'bn' ? 'মাসিক গড়' : 'Monthly Avg'
        }
      };
    } else {
      const days = range === '7' ? 7 : 30;
      const trend = StorageService.getSalesTrendData(days, lang);
      const data = trend.data.map(d => ({
        label: d.label,
        revenue: d.revenue,
        profit: d.profit,
        expense: d.expense,
        orders: d.orders
      }));

      return {
        chartData: data,
        totals: {
          revenue: trend.total,
          profit: trend.totalProfit,
          expense: trend.totalExpense,
          average: trend.dailyAverage,
          avgLabel: lang === 'bn' ? 'দৈনিক গড়' : 'Daily Avg'
        }
      };
    }
  }, [range, lang, sales, expenses]);

  // Format large currency numbers (e.g. 15.5k)
  const formatYAxis = (val: number) => {
    if (val >= 100000) return `${settings.currencySymbol}${(val / 1000).toFixed(0)}k`;
    if (val >= 1000) return `${settings.currencySymbol}${(val / 1000).toFixed(1)}k`;
    return `${settings.currencySymbol}${val}`;
  };

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const revItem = payload.find((p: any) => p.dataKey === 'revenue');
      const profItem = payload.find((p: any) => p.dataKey === 'profit');
      const expItem = payload.find((p: any) => p.dataKey === 'expense');
      const orders = payload[0]?.payload?.orders ?? 0;

      return (
        <div className="bg-[#0b101d]/95 backdrop-blur-md border border-[#1e293b] rounded-xl p-3 shadow-2xl text-xs space-y-2 min-w-[170px]">
          <p className="font-bold text-slate-200 border-b border-[#1e293b] pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            {orders > 0 && (
              <span className="text-[10px] text-slate-400 font-normal">
                {orders} {lang === 'bn' ? 'অর্ডার' : 'orders'}
              </span>
            )}
          </p>

          <div className="space-y-1.5">
            {revItem && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>{lang === 'bn' ? 'বিক্রি' : 'Revenue'}:</span>
                </span>
                <span className="font-mono font-bold text-white">
                  {settings.currencySymbol}{Number(revItem.value).toLocaleString()}
                </span>
              </div>
            )}

            {profItem && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{lang === 'bn' ? 'নিট লাভ' : 'Net Profit'}:</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {settings.currencySymbol}{Number(profItem.value).toLocaleString()}
                </span>
              </div>
            )}

            {expItem && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>{lang === 'bn' ? 'খরচ' : 'Expense'}:</span>
                </span>
                <span className="font-mono font-bold text-rose-400">
                  {settings.currencySymbol}{Number(expItem.value).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-trend-chart-card" className="space-y-4">
      
      {/* Header controls & time toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
          <h3 className="text-sm font-bold text-white">
            {lang === 'bn' ? 'আয়, ব্যয় ও লাভের গতিধারা' : 'Revenue, Profit & Expense Trends'}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Visibility Toggles */}
          <div className="flex items-center gap-1 bg-[#0b101d] border border-[#1e293b] p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setShowRevenue(prev => !prev)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-all ${
                showRevenue
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>{lang === 'bn' ? 'বিক্রি' : 'Revenue'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProfit(prev => !prev)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-all ${
                showProfit
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{lang === 'bn' ? 'লাভ' : 'Profit'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExpense(prev => !prev)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-all ${
                showExpense
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{lang === 'bn' ? 'খরচ' : 'Expense'}</span>
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#0b101d] border border-[#1e293b]">
            <button
              type="button"
              onClick={() => setRange('7')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                range === '7' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? '৭ দিন' : '7 Days'}
            </button>
            <button
              type="button"
              onClick={() => setRange('30')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                range === '30' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? '৩০ দিন' : '30 Days'}
            </button>
            <button
              type="button"
              onClick={() => setRange('monthly')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                range === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? '৬ মাস' : '6 Months'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0b101d] border border-[#192238]">
          <p className="text-[11px] text-slate-400 font-medium">{lang === 'bn' ? 'মোট বিক্রয়' : 'Total Revenue'}</p>
          <p className="text-lg font-extrabold text-white mt-0.5">
            {settings.currencySymbol}{totals.revenue.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[#0b101d] border border-[#192238]">
          <p className="text-[11px] text-emerald-400/90 font-medium">{lang === 'bn' ? 'নিট মুনাফা' : 'Net Profit'}</p>
          <p className="text-lg font-extrabold text-emerald-400 mt-0.5">
            {settings.currencySymbol}{totals.profit.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[#0b101d] border border-[#192238]">
          <p className="text-[11px] text-rose-400/90 font-medium">{lang === 'bn' ? 'মোট খরচ' : 'Total Expenses'}</p>
          <p className="text-lg font-extrabold text-rose-400 mt-0.5">
            {settings.currencySymbol}{totals.expense.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[#0b101d] border border-[#192238]">
          <p className="text-[11px] text-indigo-400/90 font-medium">{totals.avgLabel}</p>
          <p className="text-lg font-extrabold text-indigo-300 mt-0.5">
            {settings.currencySymbol}{totals.average.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recharts Area Visualization */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />

            {showRevenue && (
              <Area
                type="monotone"
                dataKey="revenue"
                name={lang === 'bn' ? 'বিক্রি' : 'Revenue'}
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
                activeDot={{ r: 5, stroke: '#818cf8', strokeWidth: 2, fill: '#1e1b4b' }}
              />
            )}

            {showProfit && (
              <Area
                type="monotone"
                dataKey="profit"
                name={lang === 'bn' ? 'নিট লাভ' : 'Profit'}
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#profitGrad)"
                activeDot={{ r: 5, stroke: '#34d399', strokeWidth: 2, fill: '#064e3b' }}
              />
            )}

            {showExpense && (
              <Area
                type="monotone"
                dataKey="expense"
                name={lang === 'bn' ? 'খরচ' : 'Expense'}
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGrad)"
                activeDot={{ r: 5, stroke: '#fb7185', strokeWidth: 2, fill: '#4c0519' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
