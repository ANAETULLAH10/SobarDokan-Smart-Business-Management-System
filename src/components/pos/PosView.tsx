import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Barcode, ShoppingCart, Trash2, Plus, Minus,
  User, CreditCard, DollarSign, Smartphone, Landmark,
  Receipt, ArrowRight, PauseCircle, PlayCircle, CheckCircle2,
  RefreshCw, Package, Camera, AlertCircle, X
} from 'lucide-react';
import { Product, Customer, CartItem, PaymentMethod, Sale, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { playScannerBeep } from '../../utils/scannerSound';

interface PosViewProps {
  lang: Language;
  settings: BusinessSettings;
  products: Product[];
  customers: Customer[];
  onSaleCompleted: (sale: Sale) => void;
  onOpenAddCustomer: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  lang,
  settings,
  products,
  customers,
  onSaleCompleted,
  onOpenAddCustomer
}) => {
  const t = translations[lang];

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState<string>('');
  const [heldSales, setHeldSales] = useState<{ id: string; time: string; cart: CartItem[] }[]>([]);

  // Barcode Scanner states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanNotification, setScanNotification] = useState<{
    message: string;
    success: boolean;
    productName?: string;
    price?: number;
  } | null>(null);

  // Unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...cats];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
        (p.barcode || '').includes(q) ||
        (p.sku || '').toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev;
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discount: product.discount || 0,
          total: product.sellingPrice
        }
      ];
    });
  };

  // Direct Barcode Lookup & Add Action
  const handleBarcodeScan = (rawCode: string) => {
    const cleanCode = rawCode.trim();
    if (!cleanCode) return;

    // Search by exact barcode or SKU first
    const matched = products.find(
      p => p.barcode === cleanCode || (p.sku && p.sku.toLowerCase() === cleanCode.toLowerCase())
    );

    if (matched) {
      if (matched.currentStock <= 0) {
        playScannerBeep('error');
        setScanNotification({
          message: lang === 'bn' ? `${matched.banglaName || matched.name} - স্টক শেষ (Out of Stock)!` : `${matched.name} - Out of stock!`,
          success: false
        });
      } else {
        addToCart(matched);
        playScannerBeep('success');
        setScanNotification({
          message: lang === 'bn' ? 'কার্টে যুক্ত করা হয়েছে!' : 'Added to cart!',
          success: true,
          productName: matched.banglaName || matched.name,
          price: matched.sellingPrice
        });
        setSearchQuery('');
      }
    } else {
      playScannerBeep('warning');
      setScanNotification({
        message: lang === 'bn' ? `বারকোড "${cleanCode}" পাওয়া যায়নি` : `Barcode "${cleanCode}" not found`,
        success: false
      });
    }

    setTimeout(() => {
      setScanNotification(null);
    }, 3200);
  };

  // Hardware / USB Laser Barcode Scanner Wedge Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      const isSearchInput = target?.id === 'pos-search-input';

      // If user is editing a form field other than the POS search bar, do not capture keystrokes
      if (isInput && !isSearchInput) {
        return;
      }

      const currentTime = Date.now();
      // Hardware scanners typically transmit consecutive keystrokes within 50ms
      if (currentTime - lastKeyTime > 90) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          const scannedCode = buffer.trim();
          buffer = '';
          handleBarcodeScan(scannedCode);
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, lang]);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.currentStock) return item;
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setDeliveryCharge(0);
    setPaidAmount('');
    setNotes('');
  };

  // Totals calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const vat = settings.vatPercent > 0 ? Math.round((subtotal - discountAmount) * (settings.vatPercent / 100)) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + vat + deliveryCharge);
  const actualPaid = paidAmount === '' ? grandTotal : Number(paidAmount);
  const dueAmount = Math.max(0, grandTotal - actualPaid);

  // Hold / Resume sales
  const handleHoldSale = () => {
    if (cart.length === 0) return;
    setHeldSales(prev => [
      ...prev,
      { id: 'hold-' + Date.now(), time: new Date().toLocaleTimeString(), cart }
    ]);
    clearCart();
  };

  const handleResumeSale = (held: { id: string; cart: CartItem[] }) => {
    setCart(held.cart);
    setHeldSales(prev => prev.filter(h => h.id !== held.id));
  };

  // Checkout execution
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const invoiceNo = `${settings.invoicePrefix}${Date.now().toString().slice(-6)}`;

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNo,
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomerId,
      customerName: selectedCustomer ? selectedCustomer.name : t.walkInCustomer,
      customerPhone: selectedCustomer?.phone,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.banglaName || item.product.name,
        quantity: item.quantity,
        purchasePrice: item.product.purchasePrice,
        unitPrice: item.unitPrice,
        discount: item.discount,
        lineTotal: item.total
      })),
      subtotal,
      discount: discountAmount,
      vat,
      deliveryCharge,
      grandTotal,
      paidAmount: actualPaid,
      dueAmount,
      paymentMethod,
      status: 'completed',
      notes,
      cashierName: 'MD ANAETULLAH',
      createdAt: new Date().toISOString()
    };

    StorageService.saveSale(newSale);
    clearCart();
    onSaleCompleted(newSale);
  };

  return (
    <div id="pos-screen" className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-[#0a0e19]">
      
      {/* LEFT AREA: Product Catalog & Search (approx 65% width) */}
      <div className="flex-1 flex flex-col border-r border-[#192238] overflow-hidden p-4 space-y-4">
        
        {/* Search Bar & Barcode Scanner */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="pos-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBarcodeScan(searchQuery);
                  }
                }}
                placeholder={lang === 'bn' ? 'বারকোড স্ক্যান করুন বা নাম লিখুন (Enter চাপুন)...' : 'Scan barcode or type name (Press Enter)...'}
                className="w-full bg-[#111827] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
            </div>

            {/* Camera Barcode Scanner Trigger */}
            <button
              type="button"
              id="btn-open-camera-scanner"
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer shrink-0 active:scale-95"
              title={lang === 'bn' ? 'ক্যামেরা দিয়ে বারকোড স্ক্যান করুন' : 'Scan Barcode with Camera'}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'ক্যামেরা স্ক্যানার' : 'Scanner'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-2.5 rounded-xl bg-[#111827] border border-[#1e2a47] text-slate-400 hover:text-white transition-colors"
              title="Reset Search"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Scan Toast / Notification Banner */}
          {scanNotification && (
            <div
              className={`px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs transition-all shadow-md backdrop-blur-md animate-in fade-in slide-in-from-top-1 ${
                scanNotification.success
                  ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-600/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {scanNotification.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div className="truncate">
                  <span className="font-bold">{scanNotification.message}</span>
                  {scanNotification.price && (
                    <span className="ml-2 font-mono text-emerald-300 font-extrabold">
                      {settings.currencySymbol}{scanNotification.price}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScanNotification(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/40'
                  : 'bg-[#111827] text-slate-300 hover:text-white hover:bg-[#18233b] border border-[#1e2a47]'
              }`}
            >
              {cat === 'all' ? t.allCategories : cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 content-start">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const isOutOfStock = product.currentStock <= 0;
              const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStockAlert;
              return (
                <div
                  key={product.id}
                  id={`pos-product-${product.id}`}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all select-none cursor-pointer group ${
                    isOutOfStock
                      ? 'bg-[#0e1320] border-[#182033] opacity-60 cursor-not-allowed'
                      : 'bg-[#111827] hover:bg-[#162035] border-[#1e2a47] hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/20 active:scale-[0.98]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#19243d] text-indigo-300 font-medium truncate max-w-[120px]">
                        {product.category}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          isOutOfStock
                            ? 'bg-rose-500/20 text-rose-400'
                            : isLowStock
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {isOutOfStock
                          ? t.outOfStock
                          : `${product.currentStock} ${product.unit}`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {product.banglaName || product.name}
                    </h4>
                    {product.banglaName && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {product.name}
                      </p>
                    )}

                    {/* Barcode Tag Indicator */}
                    {product.barcode && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Barcode className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{product.barcode}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1a243c] flex items-center justify-between">
                    <span className="text-sm font-extrabold text-indigo-300">
                      {settings.currencySymbol}{product.sellingPrice}
                    </span>
                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) addToCart(product);
                      }}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium">{lang === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Cart & Payment Checkout Panel (approx 35% width) */}
      <div className="w-full lg:w-[420px] flex flex-col bg-[#0d1222] overflow-hidden">
        
        {/* Customer Select Header */}
        <div className="p-3.5 border-b border-[#192238] bg-[#0b0f1b] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.customerName}</span>
            </span>
            <button
              onClick={onOpenAddCustomer}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>{lang === 'bn' ? '+ নতুন কাস্টমার' : '+ New Customer'}</span>
            </button>
          </div>

          <select
            id="pos-customer-select"
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="walk-in">{t.walkInCustomer}</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) {c.dueAmount > 0 ? `[বকেয়া: ৳${c.dueAmount}]` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {cart.length > 0 ? (
            cart.map(item => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-[#111728] border border-[#192238] flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {item.product.banglaName || item.product.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {settings.currencySymbol}{item.unitPrice} × {item.quantity} ={' '}
                    <span className="font-bold text-slate-200">
                      {settings.currencySymbol}{item.total}
                    </span>
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1.5 bg-[#090d18] border border-[#192238] rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1a233d] transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1a233d] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <ShoppingCart className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">{t.emptyCart}</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mt-1">
                {t.emptyCartDesc}
              </p>
            </div>
          )}
        </div>

        {/* Held Sales Banner if any */}
        {heldSales.length > 0 && (
          <div className="px-3.5 py-1.5 bg-[#19233c] border-t border-[#1e2a47] flex items-center justify-between text-xs text-indigo-300">
            <span>{heldSales.length} {t.resumeSale}</span>
            <button
              onClick={() => handleResumeSale(heldSales[0])}
              className="font-bold underline text-white hover:text-indigo-200"
            >
              {lang === 'bn' ? 'পুনরুদ্ধার করুন' : 'Resume'}
            </button>
          </div>
        )}

        {/* Calculation & Payment Section */}
        <div className="p-4 border-t border-[#192238] bg-[#090d18] space-y-3">
          {/* Subtotal & Adjustments */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>{t.subtotal}:</span>
              <span className="font-semibold">{settings.currencySymbol}{subtotal}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>{t.discount}:</span>
              <div className="flex items-center gap-1 w-24">
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#111827] border border-[#1e2a47] rounded px-2 py-0.5 text-xs text-right text-white"
                />
              </div>
            </div>

            {vat > 0 && (
              <div className="flex justify-between">
                <span>{t.taxVat} ({settings.vatPercent}%):</span>
                <span>{settings.currencySymbol}{vat}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-[#192238]">
              <span className="text-sm font-bold text-white">{t.grandTotal}:</span>
              <span className="text-lg font-extrabold text-indigo-400">
                {settings.currencySymbol}{grandTotal}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { id: 'cash', label: t.cash, icon: DollarSign },
              { id: 'bkash', label: t.bkash, icon: Smartphone },
              { id: 'nagad', label: t.nagad, icon: Smartphone },
              { id: 'card', label: t.card, icon: CreditCard }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                className={`p-2 rounded-xl text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === m.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[#12192c] text-slate-300 hover:text-white border border-[#1e2a47]'
                }`}
              >
                <m.icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Paid amount & Due */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                {t.paidAmount} ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={String(grandTotal)}
                className="w-full bg-[#111827] border border-[#1e2a47] rounded-xl px-3 py-1.5 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                {t.dueAmount} ({settings.currencySymbol})
              </label>
              <div className="w-full bg-[#111827] border border-[#1e2a47] rounded-xl px-3 py-1.5 text-xs font-bold text-amber-400">
                {settings.currencySymbol}{dueAmount}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleHoldSale}
              disabled={cart.length === 0}
              className="py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] disabled:opacity-50 text-slate-300 hover:text-white text-xs font-semibold border border-[#1e2a47] transition-colors"
            >
              {t.holdSale}
            </button>
            <button
              id="btn-complete-sale"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="col-span-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.completeSale}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Camera Live Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        onProductScanned={addToCart}
        lang={lang}
      />

    </div>
  );
};
