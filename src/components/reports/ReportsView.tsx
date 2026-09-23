import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, Download, Calendar, ArrowUpRight,
  Package, DollarSign, PieChart, FileText
} from 'lucide-react';
import { Sale, Purchase, Expense, Product, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { PDFGenerator } from '../../utils/pdfGenerator';
import { MonthlyFinancialAnalytics } from './MonthlyFinancialAnalytics';

interface ReportsViewProps {
  lang: Language;
  settings: BusinessSettings;
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  products: Product[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  lang,
  settings,
  sales,
  purchases,
  expenses,
  products
}) => {
  const t = translations[lang];
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExport = async (generatorFn: () => Promise<any>) => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await generatorFn();
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Calculations
  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCostOfGoods = sales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, it) => iSum + (it.purchasePrice * it.quantity), 0);
  }, 0);
  const grossProfit = totalSales - totalCostOfGoods;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpense;

  const totalStockItems = products.reduce((sum, p) => sum + p.currentStock, 0);
  const stockPurchaseValue = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
  const stockRetailValue = products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);

  return (
    <div id="reports-view" className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>{t.reports} & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'বিক্রয় পরিসংখ্যান, লাভ-লোকসান ও স্টক মূল্যের বিস্তারিত বিশ্লেষণ' : 'Comprehensive sales analytics, profit/loss and inventory valuation'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dedicated Verification Test Button */}
          <button
            id="btn-test-sales-pdf"
            onClick={() => handleExport(() => PDFGenerator.generateTestSalesReportPDF(settings))}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            title="Generate test sales report with Bengali values (মোঃ আব্দুর রহমান, স্যামসাং গ্যালাক্সি A15, ৳ 63,986)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'তৈরি হচ্ছে...' : '🧪 টেস্ট সেলস রিপোর্ট (Test PDF)'}</span>
          </button>

          <button
            id="btn-sales-pdf"
            onClick={() => handleExport(() => PDFGenerator.generateDailySalesReportPDF(sales, settings))}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>বিক্রয় PDF</span>
          </button>

          <button
            id="btn-profit-loss-pdf"
            onClick={() => handleExport(() => PDFGenerator.generateProfitLossPDF(sales, purchases, expenses, settings))}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>লাভ-লোকসান PDF</span>
          </button>

          <button
            id="btn-stock-pdf"
            onClick={() => handleExport(() => PDFGenerator.generateStockReportPDF(products, settings))}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>স্টক ভ্যালুয়েশন PDF</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">মোট বিক্রয় (Revenue)</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {settings.currencySymbol}{totalSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-2 inline-block">
            {sales.length} টি সফল ইনভয়েস
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">বিক্রীত মালের ক্রয়মূল্য (COGS)</span>
          <p className="text-2xl font-extrabold text-slate-300 mt-1">
            {settings.currencySymbol}{totalCostOfGoods.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 inline-block">
            পণ্য সংগ্রহ ব্যয়
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">মোট লাভ (Gross Profit)</span>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">
            {settings.currencySymbol}{grossProfit.toLocaleString()}
          </p>
          <span className="text-[11px] text-indigo-300 mt-2 inline-block">
            মার্জিন: {totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">নিট লাভ (Net Profit)</span>
          <p className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'} mt-1`}>
            {settings.currencySymbol}{netProfit.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 inline-block">
            খরচ বাদ দেওয়ার পর
          </span>
        </div>
      </div>

      {/* Monthly Financial Trends & Visualizations (Recharts) */}
      <MonthlyFinancialAnalytics
        lang={lang}
        settings={settings}
        sales={sales}
        purchases={purchases}
        expenses={expenses}
      />

      {/* Inventory Valuation Section */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" />
          <span>বর্তমান গুদাম ও স্টক মূল্যমান (Inventory Valuation)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
            <span className="text-xs text-slate-400">মোট মজুদ একক</span>
            <p className="text-xl font-bold text-white mt-1">{totalStockItems.toLocaleString()} পিস/কেজি</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
            <span className="text-xs text-slate-400">স্টক ক্রয়মূল্য (Asset Cost)</span>
            <p className="text-xl font-bold text-indigo-300 mt-1">{settings.currencySymbol}{stockPurchaseValue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
            <span className="text-xs text-slate-400">সম্ভাব্য বিক্রয়মূল্য (Retail Value)</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{settings.currencySymbol}{stockRetailValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Top Selling Products List */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h3 className="text-sm font-bold text-white">সর্বোচ্চ বিক্রীত শীর্ষ পণ্যসমূহ (Top Performing Items)</h3>
        
        <div className="divide-y divide-[#1e2a47]">
          {products.slice(0, 5).map((p, idx) => (
            <div key={p.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#1a253e] text-indigo-300 font-bold flex items-center justify-center text-[11px]">
                  #{idx + 1}
                </span>
                <div>
                  <p className="font-bold text-white">{p.banglaName || p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-300">{settings.currencySymbol}{p.sellingPrice}</p>
                <p className="text-[11px] text-slate-400">মজুদ: {p.currentStock} {p.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
