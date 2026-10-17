import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Trash2, Printer, CheckCircle2,
  Clock, Share2, ArrowRight, User, Phone, Check, X, Sparkles
} from 'lucide-react';
import { Quotation, Product, Customer, BusinessSettings, Language, Sale } from '../../types';
import { StorageService } from '../../services/storage';

interface QuotationsViewProps {
  lang: Language;
  settings: BusinessSettings;
  products: Product[];
  customers: Customer[];
  onSaleCreated?: (sale: Sale) => void;
  onRefreshAllState?: () => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  lang,
  settings,
  products,
  customers,
  onSaleCreated,
  onRefreshAllState
}) => {
  const isBn = lang === 'bn';

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);

  // Form states for creating quote
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [validDays, setValidDays] = useState<number>(7);
  const [quoteItems, setQuoteItems] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }[]>([]);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0);
  const [quoteVat, setQuoteVat] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  const loadData = () => {
    const list = StorageService.getQuotations();
    setQuotations(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProductToQuote = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setQuoteItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.unitPrice - i.discount }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.banglaName || prod.name,
          quantity: 1,
          unitPrice: prod.sellingPrice,
          discount: 0,
          lineTotal: prod.sellingPrice
        }
      ];
    });
  };

  const handleRemoveQuoteItem = (productId: string) => {
    setQuoteItems(prev => prev.filter(i => i.productId !== productId));
  };

  const quoteSubtotal = quoteItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const quoteGrandTotal = Math.max(0, quoteSubtotal - quoteDiscount + quoteVat);

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) return;

    const customer = customers.find(c => c.id === selectedCustomerId);
    const now = new Date();
    const validUntilDate = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newQuote: Quotation = {
      id: 'quote-' + Date.now(),
      quoteNo: `EST-${Date.now().toString().slice(-6)}`,
      date: now.toISOString().split('T')[0],
      validUntil: validUntilDate,
      customerId: selectedCustomerId,
      customerName: customer ? customer.name : (isBn ? 'সাধারণ গ্রাহক' : 'Walk-in Customer'),
      customerPhone: customer?.phone,
      items: quoteItems,
      subtotal: quoteSubtotal,
      discount: quoteDiscount,
      vat: quoteVat,
      grandTotal: quoteGrandTotal,
      status: 'draft',
      notes: quoteNotes,
      createdAt: now.toISOString()
    };

    StorageService.saveQuotation(newQuote);
    setIsCreateModalOpen(false);
    setQuoteItems([]);
    setQuoteDiscount(0);
    setQuoteVat(0);
    setQuoteNotes('');
    loadData();
    onRefreshAllState?.();
  };

  const handleConvertToSale = (quote: Quotation) => {
    if (!confirm(isBn ? 'আপনি কি এই কোটেশনটিকে আসল বিক্রয়ে রূপান্তর করতে চান?' : 'Convert this quotation into a completed sale?')) {
      return;
    }

    const invoiceNo = `${settings.invoicePrefix || 'INV-'}${Date.now().toString().slice(-6)}`;
    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNo,
      date: new Date().toISOString().split('T')[0],
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      items: quote.items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          purchasePrice: prod ? prod.purchasePrice : 0,
          unitPrice: item.unitPrice,
          discount: item.discount,
          lineTotal: item.lineTotal
        };
      }),
      subtotal: quote.subtotal,
      discount: quote.discount,
      vat: quote.vat,
      deliveryCharge: 0,
      grandTotal: quote.grandTotal,
      paidAmount: quote.grandTotal,
      dueAmount: 0,
      paymentMethod: 'cash',
      status: 'completed',
      notes: `কোটেশন ${quote.quoteNo} হতে রূপান্তরিত বিক্রয়। ${quote.notes || ''}`,
      cashierName: StorageService.getUser()?.name || 'ক্যাশিয়ার',
      createdAt: new Date().toISOString()
    };

    StorageService.saveSale(newSale);
    // Mark quote as converted
    quote.status = 'converted';
    StorageService.saveQuotation(quote);

    loadData();
    onSaleCreated?.(newSale);
    onRefreshAllState?.();
    alert(isBn ? `সফলভাবে বিক্রয় ইনভয়েস ${invoiceNo} তৈরি হয়েছে!` : `Successfully converted to invoice ${invoiceNo}!`);
  };

  const filteredQuotes = quotations.filter(q =>
    q.quoteNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.customerPhone && q.customerPhone.includes(searchQuery))
  );

  return (
    <div id="quotations-view" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'কোটেশন ও এস্টিমেট বিল (Estimates)' : 'Quotations & Estimates'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'গ্রাহককে অগ্রিম পণ্যের দাম ও বাজেট মেমো দিন এবং ১-ক্লিকেই বিক্রয়ে রূপান্তর করুন'
              : 'Create formal estimate sheets and convert directly to sales invoices with 1 click'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/50 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{isBn ? 'নতুন কোটেশন তৈরি' : 'New Quotation'}</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'কোটেশন নং বা কাস্টমার খুঁজুন...' : 'Search quote or customer...'}
            className="w-full bg-[#111827] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isBn ? 'মোট কোটেশন:' : 'Total Quotes:'} <b className="text-white">{quotations.length}</b></span>
          <span>•</span>
          <span>{isBn ? 'বিক্রয়ে রূপান্তরিত:' : 'Converted:'} <b className="text-emerald-400">{quotations.filter(q => q.status === 'converted').length}</b></span>
        </div>
      </div>

      {/* Quotations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuotes.map(quote => {
          const isConverted = quote.status === 'converted';

          return (
            <div
              key={quote.id}
              className="p-4 rounded-2xl bg-[#0e1424] border border-[#1e2a47] hover:border-indigo-500/40 transition-all space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-400 block">{quote.quoteNo}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{quote.customerName}</h4>
                    {quote.customerPhone && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{quote.customerPhone}</span>
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isConverted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {isConverted ? (isBn ? 'বিক্রয় সম্পন্ন' : 'Converted') : (isBn ? 'খসড়া / সক্রিয়' : 'Active')}
                  </span>
                </div>

                {/* Items preview */}
                <div className="p-2.5 rounded-xl bg-[#080c16] border border-[#192238] space-y-1.5 text-xs">
                  {quote.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span className="truncate flex-1">{item.productName} × {item.quantity}</span>
                      <span className="font-mono text-white font-semibold">৳{item.lineTotal.toLocaleString()}</span>
                    </div>
                  ))}
                  {quote.items.length > 3 && (
                    <p className="text-[10px] text-slate-500 pt-1">
                      +{quote.items.length - 3} {isBn ? 'টি আরও পণ্য' : 'more items'}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#1e2a47] pt-2">
                  <span className="text-xs text-slate-400">{isBn ? 'মেয়াদ শেষ:' : 'Valid Until:'} {quote.validUntil}</span>
                  <span className="text-base font-black text-indigo-300">৳{quote.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setViewingQuotation(quote)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#141b2d] hover:bg-[#1a253e] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isBn ? 'দেখুন' : 'View'}</span>
                </button>

                {!isConverted && (
                  <button
                    type="button"
                    onClick={() => handleConvertToSale(quote)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
                    title={isBn ? 'কোটেশনটিকে বিক্রয়ে কনভার্ট করুন' : 'Convert to sale'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'বিক্রয় করুন' : 'Convert'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredQuotes.length === 0 && (
          <div className="col-span-full p-12 text-center bg-[#0e1424] border border-dashed border-[#1e2a47] rounded-2xl space-y-3">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">{isBn ? 'কোনো কোটেশন পাওয়া যায়নি' : 'No Quotations Found'}</h4>
            <p className="text-xs text-slate-400">
              {isBn ? 'নতুন কাস্টমারদের জন্য অগ্রিম বাজেট বা কোটেশন তৈরি করতে উপরের বাটনে চাপুন।' : 'Create professional estimates for your potential buyers.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Quotation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{isBn ? 'নতুন এস্টিমেট বা কোটেশন তৈরি' : 'Create New Quotation / Estimate'}</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Customer & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'কাস্টমার নির্বাচন করুন *' : 'Customer *'}
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="walk-in">{isBn ? 'সাধারণ গ্রাহক (Walk-in)' : 'Walk-in Customer'}</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'কোটেশনের মেয়াদ' : 'Validity Duration'}
                  </label>
                  <select
                    value={validDays}
                    onChange={e => setValidDays(Number(e.target.value))}
                    className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={3}>{isBn ? '৩ দিন' : '3 Days'}</option>
                    <option value={7}>{isBn ? '৭ দিন (১ সপ্তাহ)' : '7 Days'}</option>
                    <option value={15}>{isBn ? '১৫ দিন' : '15 Days'}</option>
                    <option value={30}>{isBn ? '৩০ দিন (১ মাস)' : '30 Days'}</option>
                  </select>
                </div>
              </div>

              {/* Add Product Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'পণ্য যোগ করুন' : 'Add Item to Quote'}
                </label>
                <select
                  onChange={e => {
                    if (e.target.value) {
                      handleAddProductToQuote(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2.5 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">{isBn ? '-- পণ্য নির্বাচন করুন --' : '-- Choose product to add --'}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.banglaName || p.name} (স্টক: {p.currentStock}) - ৳{p.sellingPrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-[#1e2a47] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12192c] text-slate-400 font-bold text-[10px]">
                    <tr>
                      <th className="p-2.5">{isBn ? 'পণ্য' : 'Item'}</th>
                      <th className="p-2.5 text-center">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                      <th className="p-2.5 text-right">{isBn ? 'দর' : 'Price'}</th>
                      <th className="p-2.5 text-right">{isBn ? 'মোট' : 'Total'}</th>
                      <th className="p-2.5 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2a47]">
                    {quoteItems.map(item => (
                      <tr key={item.productId} className="hover:bg-[#12192c]/40">
                        <td className="p-2.5 text-white font-medium">{item.productName}</td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => {
                              const qty = Math.max(1, Number(e.target.value) || 1);
                              setQuoteItems(prev =>
                                prev.map(i =>
                                  i.productId === item.productId
                                    ? { ...i, quantity: qty, lineTotal: qty * i.unitPrice - i.discount }
                                    : i
                                )
                              );
                            }}
                            className="w-16 bg-[#0b0f19] border border-[#233152] rounded px-1.5 py-0.5 text-center text-xs text-white"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-300">৳{item.unitPrice}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-400">৳{item.lineTotal.toLocaleString()}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveQuoteItem(item.productId)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {quoteItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500 text-xs">
                          {isBn ? 'কোনো পণ্য যুক্ত করা হয়নি' : 'No items added yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'মন্তব্য বা শর্তাবলী' : 'Notes / Terms'}
                  </label>
                  <textarea
                    rows={3}
                    value={quoteNotes}
                    onChange={e => setQuoteNotes(e.target.value)}
                    placeholder={isBn ? 'যেমন: পণ্যের দর ৭ দিন কার্যকর থাকবে...' : 'Terms & conditions...'}
                    className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-2 text-xs bg-[#12192c] p-3 rounded-xl border border-[#1e2a47]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isBn ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                    <span className="font-bold text-white">৳{quoteSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isBn ? 'বিশেষ ছাড়:' : 'Discount:'}</span>
                    <input
                      type="number"
                      min="0"
                      value={quoteDiscount || ''}
                      onChange={e => setQuoteDiscount(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="0"
                      className="w-24 bg-[#0b0f19] border border-[#233152] rounded px-2 py-0.5 text-right text-xs text-amber-400 font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-[#1e2a47] pt-1.5">
                    <span className="font-bold text-white">{isBn ? 'সর্বমোট প্রাক্কলন:' : 'Grand Estimate:'}</span>
                    <span className="text-base font-black text-indigo-300">৳{quoteGrandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2d] text-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={quoteItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isBn ? 'কোটেশন সংরক্ষণ করুন' : 'Save Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View & Print Quotation Modal */}
      {viewingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in print:p-0 print:static print:bg-white">
          <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
            <div className="no-print p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
              <span className="text-xs font-bold text-white">{viewingQuotation.quoteNo}</span>
              <div className="flex items-center gap-2">
                {viewingQuotation.customerPhone && (
                  <a
                    href={`https://wa.me/88${viewingQuotation.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম! ${settings.businessName} হতে আপনার জন্য এস্টিমেট/কোটেশন (${viewingQuotation.quoteNo}): মোট ৳${viewingQuotation.grandTotal.toLocaleString()}। ধন্যবাদ!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1 font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1 font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
                </button>
                <button onClick={() => setViewingQuotation(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Quotation Sheet */}
            <div className="p-6 bg-white text-black space-y-4 print:p-0">
              <div className="text-center border-b border-black/20 pb-3">
                <h3 className="text-base font-black uppercase text-black">{settings.businessName || 'আমার দোকান'}</h3>
                <p className="text-xs text-slate-700">{settings.address || 'ঢাকা, বাংলাদেশ'}</p>
                <p className="text-xs text-slate-700 font-mono">{settings.phone}</p>
                <span className="inline-block mt-2 px-3 py-0.5 border border-black text-[11px] font-bold uppercase tracking-wider">
                  {isBn ? 'মূল্য প্রাক্কলন ও কোটেশন (QUOTATION)' : 'PRICE ESTIMATE & QUOTATION'}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-800">
                <div>
                  <p><b>গ্রাহকের নাম:</b> {viewingQuotation.customerName}</p>
                  {viewingQuotation.customerPhone && <p><b>মোবাইল:</b> {viewingQuotation.customerPhone}</p>}
                </div>
                <div className="text-right">
                  <p><b>কোটেশন নং:</b> {viewingQuotation.quoteNo}</p>
                  <p><b>তারিখ:</b> {viewingQuotation.date}</p>
                  <p><b>মেয়াদ:</b> {viewingQuotation.validUntil}</p>
                </div>
              </div>

              <table className="w-full text-xs border border-black/30">
                <thead className="bg-slate-100 border-b border-black/30 text-black">
                  <tr>
                    <th className="p-1.5 text-left">বিবরণ</th>
                    <th className="p-1.5 text-center">পরিমাণ</th>
                    <th className="p-1.5 text-right">দর</th>
                    <th className="p-1.5 text-right">মোট (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/15">
                  {viewingQuotation.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5 font-medium">{item.productName}</td>
                      <td className="p-1.5 text-center">{item.quantity}</td>
                      <td className="p-1.5 text-right">৳{item.unitPrice}</td>
                      <td className="p-1.5 text-right font-bold">৳{item.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end text-xs space-y-1">
                <div className="w-48 text-right space-y-0.5">
                  <div className="flex justify-between">
                    <span>সাবটোটাল:</span>
                    <span className="font-bold">৳{viewingQuotation.subtotal.toLocaleString()}</span>
                  </div>
                  {viewingQuotation.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>ছাড়:</span>
                      <span>-৳{viewingQuotation.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-black pt-1 text-sm font-black">
                    <span>সর্বমোট:</span>
                    <span>৳{viewingQuotation.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {viewingQuotation.notes && (
                <p className="text-[11px] text-slate-700 italic border-t border-black/20 pt-2">
                  শর্তাবলী: {viewingQuotation.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
