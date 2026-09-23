import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Trash2, CheckCircle2, Truck, Calendar, X, RotateCcw, Download } from 'lucide-react';
import { Purchase, PurchaseReturn, Supplier, Product, BusinessSettings, Language, PaymentMethod } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface PurchasesViewProps {
  lang: Language;
  settings: BusinessSettings;
  purchases: Purchase[];
  suppliers: Supplier[];
  products: Product[];
  onPurchaseCreated: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  lang,
  settings,
  purchases,
  suppliers,
  products,
  onPurchaseCreated
}) => {
  const t = translations[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  // Purchase Return Modal State
  const [returnPurchase, setReturnPurchase] = useState<Purchase | null>(null);
  const [returnItems, setReturnItems] = useState<{ productId: string; quantity: number; purchasePrice: number }[]>([]);
  const [returnReason, setReturnReason] = useState('পণ্য নষ্ট / ডিফেক্টিভ');

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [items, setItems] = useState<{ productId: string; quantity: number; purchasePrice: number }[]>([]);
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState<number>(0);

  const filtered = purchases.filter(p =>
    p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    setItems(prev => [
      ...prev,
      { productId: prod.id, quantity: 10, purchasePrice: prod.purchasePrice }
    ]);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const actualPaid = paidAmount === '' ? grandTotal : Number(paidAmount);
  const due = Math.max(0, grandTotal - actualPaid);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const supp = suppliers.find(s => s.id === supplierId);
    const newPurchase: Purchase = {
      id: 'purch-' + Date.now(),
      invoiceNo: `PUR-${Date.now().toString().slice(-6)}`,
      supplierId: supplierId || 'supp-1',
      supplierName: supp ? supp.name : 'Unknown Supplier',
      date: new Date().toISOString().split('T')[0],
      items: items.map(item => {
        const p = products.find(prod => prod.id === item.productId);
        return {
          productId: item.productId,
          productName: p?.banglaName || p?.name || 'Item',
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          lineTotal: item.quantity * item.purchasePrice
        };
      }),
      subtotal,
      discount,
      vat: 0,
      grandTotal,
      paidAmount: actualPaid,
      dueAmount: due,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    StorageService.savePurchase(newPurchase);
    setIsModalOpen(false);
    setItems([]);
    setPaidAmount('');
    onPurchaseCreated();
  };

  const handleOpenReturn = (p: Purchase) => {
    setReturnPurchase(p);
    setReturnItems(p.items.map(it => ({
      productId: it.productId,
      quantity: it.quantity,
      purchasePrice: it.purchasePrice
    })));
    setReturnReason('নষ্ট বা ডিফেক্ট পণ্য ফেরত');
  };

  const handleExecutePurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnPurchase) return;

    const activeItems = returnItems.filter(it => it.quantity > 0);
    if (activeItems.length === 0) return;

    const totalRefund = activeItems.reduce((sum, it) => sum + (it.quantity * it.purchasePrice), 0);

    const purchaseReturn: PurchaseReturn = {
      id: 'pret-' + Date.now(),
      returnNo: 'PRET-' + Date.now().toString().slice(-6),
      purchaseId: returnPurchase.id,
      invoiceNo: returnPurchase.invoiceNo,
      date: new Date().toISOString().split('T')[0],
      supplierId: returnPurchase.supplierId,
      supplierName: returnPurchase.supplierName,
      items: activeItems.map(it => {
        const itemInfo = returnPurchase.items.find(pi => pi.productId === it.productId);
        return {
          productId: it.productId,
          productName: itemInfo?.productName || 'Item',
          quantity: it.quantity,
          unitPrice: it.purchasePrice,
          refundAmount: it.quantity * it.purchasePrice
        };
      }),
      totalRefund,
      reason: returnReason,
      createdAt: new Date().toISOString()
    };

    StorageService.processPurchaseReturn(purchaseReturn);
    setReturnPurchase(null);
    setReturnSuccess(`ক্রয় ফেরত ভাউচার #${purchaseReturn.returnNo} সফল হয়েছে! স্টক হ্রাস ও সরবরাহকারী দেনা সমন্বয় সম্পন্ন।`);
    setTimeout(() => setReturnSuccess(null), 5000);
    onPurchaseCreated();
  };

  return (
    <div id="purchases-view" className="p-6 space-y-5 max-w-[1600px] mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span>{t.purchaseSupply}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
              {purchases.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'সাপ্লায়ারদের থেকে পণ্য ক্রয়, স্টক বৃদ্ধি ও ক্রয় ফেরত' : 'Purchase stock from suppliers, stock sync, and purchase returns'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => PDFGenerator.generatePurchaseReportPDF(purchases, settings)}
            className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ক্রয় রিপোর্ট PDF' : 'Purchase Report PDF'}</span>
          </button>
          <button
            onClick={() => {
              if (products.length > 0) addItem(products[0].id);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addPurchase}</span>
          </button>
        </div>
      </div>

      {returnSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{returnSuccess}</span>
        </div>
      )}

      {/* Search */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'ইনভয়েস বা সাপ্লায়ারের নাম খুঁজুন...' : 'Search purchase invoice or supplier...'}
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1e293b] overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0b101d] border-b border-[#1e293b] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">ইনভয়েস নম্বর</th>
              <th className="py-3 px-4">তারিখ</th>
              <th className="py-3 px-4">সাপ্লায়ার</th>
              <th className="py-3 px-4 text-center">আইটেম সংখ্যা</th>
              <th className="py-3 px-4 text-right">{t.total}</th>
              <th className="py-3 px-4 text-right">{t.paid}</th>
              <th className="py-3 px-4 text-right">{t.due}</th>
              <th className="py-3 px-4 text-right">কার্যক্রম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#192238]">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#141d30] transition-colors">
                  <td className="py-3 px-4 font-bold text-white font-mono">{p.invoiceNo}</td>
                  <td className="py-3 px-4 text-slate-400">{p.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{p.supplierName}</td>
                  <td className="py-3 px-4 text-center">{p.items.length} টি</td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {settings.currencySymbol}{p.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-400">
                    {settings.currencySymbol}{p.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-400">
                    {settings.currencySymbol}{p.dueAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenReturn(p)}
                      className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 ml-auto"
                      title="Purchase Return"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ক্রয় ফেরত</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>{lang === 'bn' ? 'কোন ক্রয়ের রেকর্ড নেই' : 'No purchase records found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Purchase Return Modal */}
      {returnPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>সরবরাহকারীকে ক্রয় ফেরত (Purchase Return)</span>
              </h3>
              <button onClick={() => setReturnPurchase(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1e2a47] text-xs">
              <p className="text-slate-400">ইনভয়েস নম্বর: <span className="font-bold text-white font-mono">{returnPurchase.invoiceNo}</span></p>
              <p className="text-slate-400 mt-1">সরবরাহকারী: <span className="font-semibold text-purple-300">{returnPurchase.supplierName}</span></p>
              <p className="text-slate-400 mt-1">ক্রয় মূল্য: <span className="font-bold text-white">{settings.currencySymbol}{returnPurchase.grandTotal}</span></p>
            </div>

            <form onSubmit={handleExecutePurchaseReturn} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">ফেরতযোগ্য পণ্য ও সংখ্যা নির্ধারণ করুন:</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {returnItems.map((it, idx) => {
                    const original = returnPurchase.items.find(pi => pi.productId === it.productId);
                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#131b2e] border border-[#1e2a47] flex items-center justify-between">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-white">{original?.productName}</p>
                          <p className="text-[10px] text-slate-400">ক্রয়: {original?.quantity} পিস @ {settings.currencySymbol}{it.purchasePrice}</p>
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
                <span className="text-slate-300 font-semibold">মোট ফেরতযোগ্য মূল্য (দেনা হ্রাস):</span>
                <span className="text-lg font-extrabold text-rose-400">
                  {settings.currencySymbol}
                  {returnItems.reduce((sum, it) => sum + (it.quantity * it.purchasePrice), 0).toLocaleString()}
                </span>
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
                  onClick={() => setReturnPurchase(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={returnItems.every(it => it.quantity === 0)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold"
                >
                  ফেরত নিশ্চিত করুন (স্টক হ্রাস)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <span>{t.addPurchase} (New Stock Purchase)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">সরবরাহকারী (Supplier) *</label>
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.company} - {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Items in Purchase */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">ক্রয়কৃত পণ্যসমূহ</span>
                  <button
                    type="button"
                    onClick={() => products.length > 0 && addItem(products[0].id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + পণ্য যোগ করুন
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#131b2e] border border-[#1e2a47] flex items-center gap-2 text-xs">
                      <select
                        value={item.productId}
                        onChange={e => {
                          const val = e.target.value;
                          const p = products.find(prod => prod.id === val);
                          setItems(prev => prev.map((it, i) => i === idx ? { ...it, productId: val, purchasePrice: p?.purchasePrice || it.purchasePrice } : it));
                        }}
                        className="flex-1 bg-[#0b101d] border border-[#1e2a47] rounded-lg px-2 py-1 text-white text-xs"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.banglaName || p.name}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 w-24">
                        <span className="text-[10px] text-slate-400">পরিমাণ:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                          }}
                          className="w-14 bg-[#0b101d] border border-[#1e2a47] rounded px-1.5 py-0.5 text-right text-white font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-1 w-28">
                        <span className="text-[10px] text-slate-400">দর:</span>
                        <input
                          type="number"
                          min="0"
                          value={item.purchasePrice}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setItems(prev => prev.map((it, i) => i === idx ? { ...it, purchasePrice: val } : it));
                          }}
                          className="w-16 bg-[#0b101d] border border-[#1e2a47] rounded px-1.5 py-0.5 text-right text-white font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total and Paid */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#090d18] rounded-xl text-xs">
                <div>
                  <span className="text-slate-400">মোট ক্রয়মূল্য:</span>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {settings.currencySymbol}{grandTotal}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">পরিশোধ:</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={String(grandTotal)}
                    className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-lg px-2 py-1 text-xs text-white font-bold mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400">বকেয়া:</span>
                  <p className="text-base font-extrabold text-amber-400 mt-0.5">
                    {settings.currencySymbol}{due}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold"
                >
                  ক্রয় সম্পন্ন ও স্টক বৃদ্ধি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
