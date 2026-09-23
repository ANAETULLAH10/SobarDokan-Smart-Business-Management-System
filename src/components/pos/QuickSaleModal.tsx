import React, { useState, useEffect, useRef } from 'react';
import {
  X, Search, Zap, CheckCircle2, User, Plus, Minus,
  Trash2, DollarSign, Smartphone, CreditCard
} from 'lucide-react';
import { Product, Customer, CartItem, PaymentMethod, Sale, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  settings: BusinessSettings;
  products: Product[];
  customers: Customer[];
  onSaleCompleted: (sale: Sale) => void;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  products,
  customers,
  onSaleCompleted
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState('walk-in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | ''>('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const customerSelectRef = useRef<HTMLSelectElement>(null);
  const paymentRef = useRef<HTMLInputElement>(null);

  // Focus search on open
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        customerSelectRef.current?.focus();
      } else if (e.key === 'F8') {
        e.preventDefault();
        paymentRef.current?.focus();
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0) handleFinishSale();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerId, paymentMethod, discount, paidAmount]);

  const filteredProducts = products.filter(p => {
    if (!search.trim()) return false;
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
      (p.barcode || '').includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    );
  }).slice(0, 6);

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discount: 0,
          total: product.sellingPrice
        }
      ];
    });
    setSearch('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.product.id === id) {
            const nq = i.quantity + delta;
            if (nq <= 0) return null;
            return { ...i, quantity: nq, total: nq * i.unitPrice };
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.total, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const actualPaid = paidAmount === '' ? grandTotal : Number(paidAmount);
  const due = Math.max(0, grandTotal - actualPaid);

  const handleFinishSale = () => {
    if (cart.length === 0) return;
    const customer = customers.find(c => c.id === customerId);
    const sale: Sale = {
      id: 'qsale-' + Date.now(),
      invoiceNo: `${settings.invoicePrefix}Q${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString().split('T')[0],
      customerId,
      customerName: customer ? customer.name : t.walkInCustomer,
      customerPhone: customer?.phone,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.banglaName || i.product.name,
        quantity: i.quantity,
        purchasePrice: i.product.purchasePrice,
        unitPrice: i.unitPrice,
        discount: 0,
        lineTotal: i.total
      })),
      subtotal,
      discount,
      vat: 0,
      deliveryCharge: 0,
      grandTotal,
      paidAmount: actualPaid,
      dueAmount: due,
      paymentMethod,
      status: 'completed',
      cashierName: 'MD ANAETULLAH',
      createdAt: new Date().toISOString()
    };

    StorageService.saveSale(sale);
    onClose();
    onSaleCompleted(sale);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'দ্রুত বিক্রয় (Quick Sale)' : 'Quick Sale Checkout'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Shortcuts: F2 (Search) | F4 (Customer) | F8 (Payment) | F12 (Complete) | ESC (Close)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a243c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'bn' ? 'পণ্যের নাম বা বারকোড টাইপ করুন (F2)...' : 'Type product name or barcode (F2)...'}
              className="w-full bg-[#141c30] border border-[#223052] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            {/* Search Dropdown preview */}
            {filteredProducts.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#141c30] border border-[#223052] rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-[#1e2a47]">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="p-2.5 flex items-center justify-between hover:bg-[#1c2847] cursor-pointer text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{p.banglaName || p.name}</p>
                      <p className="text-[10px] text-slate-400">Stock: {p.currentStock} {p.unit}</p>
                    </div>
                    <span className="font-bold text-indigo-400">{settings.currencySymbol}{p.sellingPrice}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-300">
              {lang === 'bn' ? 'নির্বাচিত পণ্যসমূহ' : 'Selected Products'} ({cart.length})
            </p>
            {cart.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-[#131b2e] border border-[#1e2a47] flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 truncate pr-2">
                      <p className="font-bold text-white truncate">{item.product.banglaName || item.product.name}</p>
                      <p className="text-[10px] text-slate-400">{settings.currencySymbol}{item.unitPrice} each</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#0b0f1b] border border-[#1e2a47] rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="w-20 text-right font-bold text-indigo-300">
                      {settings.currencySymbol}{item.total}
                    </span>
                    <button
                      onClick={() => setCart(cart.filter(i => i.product.id !== item.product.id))}
                      className="ml-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-slate-500 bg-[#131b2e]/40 rounded-xl border border-[#1e2a47]/50">
                {lang === 'bn' ? 'কোন পণ্য যোগ করা হয়নি। উপরে খুঁজুন।' : 'No products added yet. Search above.'}
              </p>
            )}
          </div>

          {/* Customer & Payment Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                {t.customerName} (F4)
              </label>
              <select
                ref={customerSelectRef}
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full bg-[#141c30] border border-[#223052] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="walk-in">{t.walkInCustomer}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                {t.paymentMethod}
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#141c30] border border-[#223052] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="cash">{t.cash}</option>
                <option value="bkash">{t.bkash}</option>
                <option value="nagad">{t.nagad}</option>
                <option value="card">{t.card}</option>
                <option value="due">{t.due}</option>
              </select>
            </div>
          </div>

          {/* Amount info */}
          <div className="p-3.5 rounded-xl bg-[#090d18] border border-[#192238] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">{t.grandTotal}</p>
              <p className="text-xl font-extrabold text-indigo-400">
                {settings.currencySymbol}{grandTotal}
              </p>
            </div>

            <div className="w-32">
              <label className="text-[10px] text-slate-400 block mb-1">{t.paidAmount} (F8)</label>
              <input
                ref={paymentRef}
                type="number"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={String(grandTotal)}
                className="w-full bg-[#141c30] border border-[#223052] rounded-lg px-2.5 py-1 text-xs text-right font-bold text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#11182c] border-t border-[#1e2a47] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            {t.cancel} (ESC)
          </button>
          <button
            onClick={handleFinishSale}
            disabled={cart.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.completeSale} (F12)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
