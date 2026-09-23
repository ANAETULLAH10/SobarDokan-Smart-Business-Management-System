import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, Search, Filter, Eye, RotateCcw, Download,
  CheckCircle2, AlertCircle, Clock, Calendar, User, DollarSign, X
} from 'lucide-react';
import { Sale, SaleReturn, Customer, BusinessSettings, Language, PaymentMethod } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface SalesViewProps {
  lang: Language;
  settings: BusinessSettings;
  sales: Sale[];
  customers: Customer[];
  onViewInvoice: (sale: Sale) => void;
  onRefresh: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  lang,
  settings,
  sales,
  customers,
  onViewInvoice,
  onRefresh
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'returned'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Sales Return Modal State
  const [returnSale, setReturnSale] = useState<Sale | null>(null);
  const [returnItems, setReturnItems] = useState<{ productId: string; quantity: number; unitPrice: number; refundAmount: number }[]>([]);
  const [returnReason, setReturnReason] = useState('পণ্য পরিবর্তন / ডিফেক্টিভ');
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('cash');
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSalesPDF = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      await PDFGenerator.generateDailySalesReportPDF(filteredSales.length > 0 ? filteredSales : sales, settings);
    } catch (err) {
      console.error('Error exporting sales PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.invoiceNo.toLowerCase().includes(q) ||
        (s.customerName || '').toLowerCase().includes(q) ||
        (s.customerPhone || '').includes(q);

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || s.paymentMethod === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [sales, search, statusFilter, paymentFilter]);

  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.status !== 'returned' ? s.grandTotal : 0), 0);
  const totalPaidAmount = sales.reduce((sum, s) => sum + (s.status !== 'returned' ? s.paidAmount : 0), 0);
  const totalDueAmount = sales.reduce((sum, s) => sum + (s.status !== 'returned' ? s.dueAmount : 0), 0);
  const returnedCount = sales.filter(s => s.status === 'returned').length;

  const handleOpenReturnModal = (sale: Sale) => {
    setReturnSale(sale);
    setReturnItems(sale.items.map(it => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      refundAmount: it.quantity * it.unitPrice
    })));
    setRefundMethod(sale.paymentMethod || 'cash');
    setReturnReason('পণ্য ত্রুটিপূর্ণ বা কাস্টমার ফেরত দিয়েছে');
  };

  const handleExecuteReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnSale) return;

    const activeItems = returnItems.filter(it => it.quantity > 0);
    if (activeItems.length === 0) return;

    const totalRefund = activeItems.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);

    const saleReturn: SaleReturn = {
      id: 'ret-' + Date.now(),
      returnNo: 'RET-' + Date.now().toString().slice(-6),
      saleId: returnSale.id,
      invoiceNo: returnSale.invoiceNo,
      date: new Date().toISOString().split('T')[0],
      customerId: returnSale.customerId,
      customerName: returnSale.customerName,
      items: activeItems.map(it => {
        const itemInfo = returnSale.items.find(si => si.productId === it.productId);
        return {
          productId: it.productId,
          productName: itemInfo?.productName || 'Item',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          refundAmount: it.quantity * it.unitPrice
        };
      }),
      totalRefund,
      refundMethod,
      reason: returnReason,
      createdAt: new Date().toISOString()
    };

    StorageService.processSaleReturn(saleReturn);
    setReturnSale(null);
    setReturnSuccess(`রিটার্ন ভাউচার #${saleReturn.returnNo} সফলভাবে প্রক্রিয়া করা হয়েছে! স্টক বৃদ্ধি ও কাস্টমার ব্যালেন্স সমন্বয় সম্পন্ন।`);
    setTimeout(() => setReturnSuccess(null), 5000);
    onRefresh();
  };

  return (
    <div id="sales-view" className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'bn' ? 'বিক্রয় তালিকা ও ইনভয়েস হিস্ট্রি' : 'Sales History & Invoices'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
              {sales.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'সকল সম্পন্ন ও ফেরতকৃত বিক্রয়ের তালিকা, রসিদ প্রিন্ট ও বিক্রয় ফেরত' : 'Manage completed sales transactions, view receipts, and process customer returns'}
          </p>
        </div>

        <button
          onClick={handleExportSalesPDF}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? (lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...') : (lang === 'bn' ? 'বিক্রয় রিপোর্ট PDF' : 'Sales Report PDF')}</span>
        </button>
      </div>

      {returnSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{returnSuccess}</span>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">মোট বিক্রয় মূল্য (Revenue)</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {settings.currencySymbol}{totalSalesAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-indigo-300 mt-1 inline-block">
            {sales.length - returnedCount} টি বৈধ ইনভয়েস
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">নগদ/অনলাইন আদায় (Paid)</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
            {settings.currencySymbol}{totalPaidAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
            ক্যাশ ও ডিজিটাল পেমেন্ট
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">বকেয়া বিক্রয় (Due)</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">
            {settings.currencySymbol}{totalDueAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-300 mt-1 inline-block">
            বাকির খাতায় অন্তর্ভুক্ত
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">ফেরতকৃত বিক্রয় (Returned)</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">
            {returnedCount} টি
          </p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            স্টকে পুনরায় যোগ হয়েছে
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ইনভয়েস নম্বর, কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="w-full md:w-40 bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">সব স্ট্যাটাস</option>
          <option value="completed">সম্পন্ন (Completed)</option>
          <option value="returned">ফেরতকৃত (Returned)</option>
        </select>

        {/* Payment filter */}
        <select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value)}
          className="w-full md:w-40 bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">সব পেমেন্ট মাধ্যম</option>
          <option value="cash">নগদ ক্যাশ</option>
          <option value="bkash">বিকাশ</option>
          <option value="nagad">নগদ</option>
          <option value="card">কার্ড</option>
          <option value="bank">ব্যাংক</option>
        </select>
      </div>

      {/* Sales List Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1e293b] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b101d] border-b border-[#1e293b] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">ইনভয়েস নম্বর</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">কাস্টমার</th>
                <th className="py-3 px-4 text-center">আইটেম</th>
                <th className="py-3 px-4 text-right">সর্বমোট</th>
                <th className="py-3 px-4 text-right">পরিশোধ</th>
                <th className="py-3 px-4 text-right">বকেয়া</th>
                <th className="py-3 px-4 text-center">মাধ্যম</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#192238]">
              {filteredSales.length > 0 ? (
                filteredSales.map(s => {
                  const isReturned = s.status === 'returned';
                  return (
                    <tr key={s.id} className="hover:bg-[#141d30] transition-colors">
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {s.invoiceNo}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {s.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{s.customerName}</div>
                        {s.customerPhone && (
                          <div className="text-[10px] text-slate-400">{s.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-300">
                        {s.items.length} টি
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {settings.currencySymbol}{s.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-400">
                        {settings.currencySymbol}{s.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        {s.dueAmount > 0 ? `${settings.currencySymbol}${s.dueAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center uppercase font-mono text-[10px] text-indigo-300">
                        {s.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isReturned
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isReturned ? 'ফেরত' : 'সম্পন্ন'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewInvoice(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-[#1a253e]"
                            title="View / Print Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {!isReturned && (
                            <button
                              onClick={() => handleOpenReturnModal(s)}
                              className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1"
                              title="Process Sales Return"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>ফেরত</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p>কোন বিক্রয়ের রেকর্ড পাওয়া যায়নি</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Return Modal */}
      {returnSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>বিক্রয় ফেরত গ্রহণ (Sales Return)</span>
              </h3>
              <button onClick={() => setReturnSale(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1e2a47] text-xs">
              <p className="text-slate-400">ইনভয়েস নম্বর: <span className="font-bold text-white font-mono">{returnSale.invoiceNo}</span></p>
              <p className="text-slate-400 mt-1">কাস্টমার: <span className="font-semibold text-indigo-300">{returnSale.customerName}</span></p>
              <p className="text-slate-400 mt-1">মূল বিক্রয় মূল্য: <span className="font-bold text-white">{settings.currencySymbol}{returnSale.grandTotal}</span></p>
            </div>

            <form onSubmit={handleExecuteReturn} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">ফেরতকৃত পণ্য ও পরিমাণ নির্ধারণ করুন:</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {returnItems.map((it, idx) => {
                    const original = returnSale.items.find(si => si.productId === it.productId);
                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#131b2e] border border-[#1e2a47] flex items-center justify-between">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-white">{original?.productName}</p>
                          <p className="text-[10px] text-slate-400">বিক্রীত: {original?.quantity} পিস @ {settings.currencySymbol}{it.unitPrice}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">ফেরত সংখ্যা:</span>
                          <input
                            type="number"
                            min="0"
                            max={original?.quantity || 1}
                            value={it.quantity}
                            onChange={e => {
                              const qty = Math.min(original?.quantity || 1, Math.max(0, Number(e.target.value)));
                              setReturnItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
                            }}
                            className="w-16 bg-[#0b101d] border border-[#1e2a47] rounded-lg px-2 py-1 text-center text-white font-bold"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total refund calculation */}
              <div className="p-3 bg-[#0b101d] rounded-xl border border-[#1e2a47] flex items-center justify-between">
                <span className="text-slate-300 font-semibold">মোট রিফান্ড / ফেরতযোগ্য অর্থ:</span>
                <span className="text-lg font-extrabold text-rose-400">
                  {settings.currencySymbol}
                  {returnItems.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">ফেরত প্রদানের মাধ্যম</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                >
                  <option value="cash">নগদ ক্যাশ ফেরত</option>
                  <option value="bkash">বিকাশ রিফান্ড</option>
                  <option value="nagad">নগদ (Mobile)</option>
                  <option value="bank">ব্যাংক রিফান্ড</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">ফেরতের কারণ</label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="যেমন: পণ্যের মেয়াদোত্তীর্ণ বা ডিফেক্ট"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setReturnSale(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={returnItems.every(it => it.quantity === 0)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold"
                >
                  ফেরত গ্রহণ ও স্টক বৃদ্ধি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
