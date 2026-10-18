import React, { useState, useEffect, useRef } from 'react';
import {
  X, Printer, Barcode as BarcodeIcon, Settings2, Check, RefreshCw,
  Copy, Layers, Search, CheckCircle2, Tag, ChevronDown, Sparkles,
  Download, FileDown, FileText
} from 'lucide-react';
import { Product, BusinessSettings, Language } from '../../types';
import JsBarcode from 'jsbarcode';
import { printBarcodeContainer, downloadBarcodePDF, LABEL_DIMENSIONS } from '../../utils/barcodePrinter';

interface BarcodeStickerGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: BusinessSettings;
  lang: Language;
  initialProductId?: string;
}

export const BarcodeStickerGeneratorModal: React.FC<BarcodeStickerGeneratorModalProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  lang,
  initialProductId
}) => {
  if (!isOpen) return null;
  const isBn = lang === 'bn';

  // Determine initial valid product ID (handles 'all' or empty gracefully)
  const getInitialId = () => {
    if (initialProductId && initialProductId !== 'all') {
      const match = products.find(p => p.id === initialProductId);
      if (match) return match.id;
    }
    return products[0]?.id || '';
  };

  const [selectedProductId, setSelectedProductId] = useState<string>(getInitialId());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copies, setCopies] = useState<number>(6);
  const [labelSize, setLabelSize] = useState<'50x30' | '38x25' | '40x20' | 'a4_grid'>('50x30');
  
  // Requirement: By default ONLY BARCODE! No shop name!
  const [presetMode, setPresetMode] = useState<'only_barcode' | 'barcode_price' | 'custom'>('only_barcode');
  const [showShopName, setShowShopName] = useState<boolean>(false);
  const [showProductName, setShowProductName] = useState<boolean>(false);
  const [showPrice, setShowPrice] = useState<boolean>(false);
  const [showSku, setShowSku] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<'thermal' | 'a4' | null>(null);

  const printContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initialProductId changes
  useEffect(() => {
    if (initialProductId && initialProductId !== 'all') {
      const exists = products.find(p => p.id === initialProductId);
      if (exists) {
        setSelectedProductId(exists.id);
        return;
      }
    }
    if (products.length > 0) {
      const currentValid = products.some(p => p.id === selectedProductId);
      if (!currentValid) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [initialProductId, products]);

  // Outside click to close product dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Apply Quick Preset Modes (Default is strictly ONLY BARCODE)
  const handleApplyPreset = (mode: 'only_barcode' | 'barcode_price' | 'custom') => {
    setPresetMode(mode);
    if (mode === 'only_barcode') {
      setShowShopName(false);
      setShowProductName(false);
      setShowPrice(false);
      setShowSku(false);
    } else if (mode === 'barcode_price') {
      setShowShopName(false);
      setShowProductName(true);
      setShowPrice(true);
      setShowSku(true);
    }
  };

  // Re-generate Barcode SVGs via JsBarcode
  const renderBarcodes = () => {
    if (!selectedProduct) return;
    const barcodeVal = selectedProduct.barcode || selectedProduct.sku || '100001';

    document.querySelectorAll('.barcode-svg-element').forEach((svg) => {
      try {
        JsBarcode(svg, barcodeVal, {
          format: 'CODE128',
          lineColor: '#000000',
          width: presetMode === 'only_barcode' ? 1.8 : 1.4,
          height: presetMode === 'only_barcode' ? 44 : 32,
          displayValue: true,
          fontSize: 11,
          font: 'monospace',
          textMargin: 2,
          margin: 3
        });
      } catch (e) {
        console.warn('Barcode render notice:', e);
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      renderBarcodes();
    }, 60);
    return () => clearTimeout(timer);
  }, [selectedProduct, copies, labelSize, showShopName, showProductName, showPrice, showSku, presetMode]);

  // Download PDF Handler (Thermal roll or A4 sheet)
  const handleDownloadPDF = async (format: 'thermal' | 'a4') => {
    if (!selectedProduct) return;
    setIsDownloadingPDF(format);
    try {
      await downloadBarcodePDF({
        product: selectedProduct,
        copies,
        labelSize,
        showShopName,
        shopName: settings.businessName,
        showProductName,
        showPrice,
        showSku,
        currencySymbol: settings.currencySymbol || '৳',
        pdfFormat: format
      });
    } catch (e) {
      console.error('PDF Download failure:', e);
    } finally {
      setIsDownloadingPDF(null);
    }
  };

  // Robust Print Handler using isolated thermal-ready iframe with auto PDF fallback
  const handlePrint = async () => {
    if (!selectedProduct || !printContainerRef.current) return;
    setIsPrinting(true);
    renderBarcodes();

    try {
      const ok = await printBarcodeContainer(printContainerRef.current, {
        labelSize,
        title: `${selectedProduct.banglaName || selectedProduct.name} - Barcode`
      });
      // If browser print dialog was blocked, automatically trigger PDF download as fallback!
      if (!ok) {
        await handleDownloadPDF('thermal');
      }
    } catch (e) {
      console.warn('Print failure, auto-downloading PDF:', e);
      await handleDownloadPDF('thermal');
    } finally {
      setIsPrinting(false);
    }
  };

  // Filtered products for search
  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-6">
        
        {/* Top Header */}
        <div className="p-4 bg-[#11182c] border-b border-[#1e2a47] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isBn ? 'বারকোড স্টিকার জেনারেটর' : 'Barcode Sticker Generator'}</span>
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full font-mono border border-indigo-700/50">
                  {presetMode === 'only_barcode' ? (isBn ? 'শুধু বারকোড মোড' : 'Only Barcode Mode') : (isBn ? 'কাস্টম মোড' : 'Custom')}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isBn
                  ? 'দোকানের নাম ছাড়া পরিষ্কার বারকোড স্টিকার প্রিন্ট ও PDF ডাউনলোড করুন'
                  : 'Print clean barcode stickers or download PDF without shop name'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* PDF Option 1: Thermal Roll PDF */}
            <button
              type="button"
              onClick={() => handleDownloadPDF('thermal')}
              disabled={!!isDownloadingPDF || !selectedProduct}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              title={isBn ? 'থার্মাল প্রিন্টারের উপযোগী PDF ডাউনলোড করুন' : 'Download thermal roll PDF'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPDF === 'thermal' ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Saving...') : (isBn ? 'PDF ডাউনলোড (থার্মাল)' : 'PDF (Thermal)')}</span>
            </button>

            {/* PDF Option 2: A4 Sheet Grid PDF */}
            <button
              type="button"
              onClick={() => handleDownloadPDF('a4')}
              disabled={!!isDownloadingPDF || !selectedProduct}
              className="px-3 py-2 rounded-xl bg-[#1b2640] hover:bg-[#25355a] border border-[#2c3d66] text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              title={isBn ? 'A4 সাধারণ কাগজের শিট PDF ডাউনলোড করুন' : 'Download A4 sheet grid PDF'}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isDownloadingPDF === 'a4' ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Saving...') : (isBn ? 'PDF (A4 শিট)' : 'PDF (A4 Sheet)')}</span>
            </button>

            {/* Direct Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || !selectedProduct}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/50 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? (isBn ? 'প্রিন্ট হচ্ছে...' : 'Printing...') : (isBn ? 'প্রিন্ট' : 'Print')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-[#12192c] border-b border-[#1e2a47] space-y-3.5">
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1c2744]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-300">
                {isBn ? 'মোড:' : 'Mode:'}
              </span>
              <div className="flex items-center gap-1.5 bg-[#0a0f1d] p-1 rounded-xl border border-[#222f4c]">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('only_barcode')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    presetMode === 'only_barcode'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#151f38]'
                  }`}
                >
                  <BarcodeIcon className="w-3 h-3" />
                  <span>{isBn ? 'শুধু বারকোড (Only Barcode)' : 'Only Barcode'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('barcode_price')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    presetMode === 'barcode_price'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#151f38]'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{isBn ? 'বারকোড + প্রাইস' : 'Barcode + Price'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPresetMode('custom')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    presetMode === 'custom'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#151f38]'
                  }`}
                >
                  <Settings2 className="w-3 h-3" />
                  <span>{isBn ? 'কাস্টম' : 'Custom'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{isBn ? 'দোকানের নাম ছাড়া প্রিন্ট হবে' : 'Shop name excluded from label'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* 1. Select Product with Custom Dark Dropdown & Search (Completely avoids white background issue!) */}
            <div className="md:col-span-6 relative" ref={dropdownRef}>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                {isBn ? 'পণ্য নির্বাচন করুন *' : 'Select Product *'}
              </label>

              {/* Trigger button showing current product */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#0a0f1d] hover:bg-[#11192e] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white text-left flex items-center justify-between gap-2 transition-colors focus:outline-none focus:border-indigo-500"
              >
                {selectedProduct ? (
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="font-bold text-white truncate">
                      {selectedProduct.banglaName || selectedProduct.name}
                    </span>
                    <span className="bg-[#18233d] text-indigo-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {selectedProduct.sku}
                    </span>
                    <span className="text-amber-400 font-bold font-mono text-[11px]">
                      {settings.currencySymbol || '৳'}{selectedProduct.sellingPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">{isBn ? 'পণ্য নির্বাচন করুন...' : 'Select product...'}</span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Panel (Explicit dark theme, no white background!) */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d1424] border border-[#253556] rounded-xl shadow-2xl z-50 p-2 space-y-2 max-h-64 flex flex-col">
                  {/* Search box inside dropdown */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={isBn ? 'নাম, SKU বা বারকোড দিয়ে সার্চ...' : 'Search by name, SKU or barcode...'}
                      className="w-full bg-[#060a14] border border-[#233152] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Scrollable Products List */}
                  <div className="overflow-y-auto space-y-1 flex-1 pr-1 divide-y divide-[#18233a]">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => {
                        const isSelected = p.id === selectedProductId;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`p-2 rounded-lg cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors ${
                              isSelected
                                ? 'bg-indigo-950/80 text-white border border-indigo-500/60 font-semibold'
                                : 'bg-[#0a0f1d] hover:bg-[#152038] text-slate-200 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate text-xs">
                                {p.banglaName || p.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span className="text-indigo-300">SKU: {p.sku}</span>
                                {p.barcode && <span>• Barcode: {p.barcode}</span>}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="font-bold text-amber-400 font-mono text-xs">
                                {settings.currencySymbol || '৳'}{p.sellingPrice}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto mt-0.5" />}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500">
                        {isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Number of Copies */}
            <div className="md:col-span-3">
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                {isBn ? 'স্টিকারের সংখ্যা (কপি)' : 'Copies / Quantity'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={copies}
                  onChange={e => setCopies(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="w-full bg-[#0a0f1d] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setCopies(selectedProduct?.currentStock || 6)}
                  className="px-2.5 py-2 bg-[#18233d] hover:bg-[#223154] text-[10px] font-bold text-indigo-300 rounded-xl whitespace-nowrap"
                  title={isBn ? 'বর্তমান স্টক পরিমাণ সেট করুন' : 'Set to current stock'}
                >
                  {isBn ? 'স্টক' : 'Stock'}
                </button>
              </div>
            </div>

            {/* 3. Sticker Size */}
            <div className="md:col-span-3">
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                {isBn ? 'লেবেল সাইজ' : 'Label Size'}
              </label>
              <select
                value={labelSize}
                onChange={e => setLabelSize(e.target.value as any)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0a0f1d] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="50x30" style={{ backgroundColor: '#0d1424', color: '#ffffff' }}>
                  {isBn ? '50x30 মিমি (স্ট্যান্ডার্ড থার্মাল)' : '50x30 mm (Standard Thermal)'}
                </option>
                <option value="38x25" style={{ backgroundColor: '#0d1424', color: '#ffffff' }}>
                  {isBn ? '38x25 মিমি (ছোট লেবেল)' : '38x25 mm (Small Label)'}
                </option>
                <option value="40x20" style={{ backgroundColor: '#0d1424', color: '#ffffff' }}>
                  {isBn ? '40x20 মিমি (মিনি সাইজ)' : '40x20 mm (Mini Size)'}
                </option>
                <option value="a4_grid" style={{ backgroundColor: '#0d1424', color: '#ffffff' }}>
                  {isBn ? 'A4 শিট (মাল্টি-স্টিকার গ্রিড)' : 'A4 Sheet (Multi-label Grid)'}
                </option>
              </select>
            </div>
          </div>

          {/* Optional Toggles for Custom Mode */}
          {presetMode === 'custom' && (
            <div className="p-3 bg-[#0a0f1d] border border-[#1b2640] rounded-xl flex flex-wrap items-center gap-4 text-xs text-slate-300 animate-in fade-in">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={e => setShowProductName(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-[#080d1a]"
                />
                <span>{isBn ? 'পণ্যের নাম দেখান' : 'Show Product Name'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-[#080d1a]"
                />
                <span>{isBn ? 'বিক্রয়মূল্য (MRP) দেখান' : 'Show Price (MRP)'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSku}
                  onChange={e => setShowSku(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-[#080d1a]"
                />
                <span>{isBn ? 'SKU কোড দেখান' : 'Show SKU'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={showShopName}
                  onChange={e => setShowShopName(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-[#080d1a]"
                />
                <span>{isBn ? 'দোকানের নাম (ঐচ্ছিক)' : 'Show Shop Name (Optional)'}</span>
              </label>
            </div>
          )}
        </div>

        {/* Printable Preview Canvas */}
        <div className="p-6 bg-[#080c16] flex-1 overflow-y-auto max-h-[58vh]">
          {selectedProduct ? (
            <div
              ref={printContainerRef}
              id="barcode-modal-print-container"
              className={`grid gap-3 justify-center items-center ${
                labelSize === 'a4_grid'
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              }`}
            >
              {Array.from({ length: copies }).map((_, idx) => (
                <div
                  key={idx}
                  className="barcode-sticker-item bg-white text-black p-2.5 rounded-lg border border-dashed border-slate-400 flex flex-col items-center justify-center text-center shadow-md select-none transition-all"
                  style={{
                    width: labelSize === '50x30' ? '190px' : labelSize === '38x25' ? '150px' : labelSize === '40x20' ? '155px' : '180px',
                    height: labelSize === '50x30' ? '118px' : labelSize === '38x25' ? '96px' : labelSize === '40x20' ? '82px' : '110px',
                    pageBreakInside: 'avoid',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Shop Name - ONLY rendered if explicitly enabled (strictly disabled by default) */}
                  {showShopName && (
                    <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-800 line-clamp-1 border-b border-black/15 pb-0.5 w-full">
                      {settings.businessName}
                    </p>
                  )}

                  {/* Optional Product Title (only if enabled) */}
                  {showProductName && (
                    <div className="my-0.5 w-full">
                      <p className="text-xs font-bold text-black line-clamp-1 leading-tight">
                        {selectedProduct.banglaName || selectedProduct.name}
                      </p>
                      {showSku && (
                        <p className="text-[9px] font-mono text-slate-600">
                          SKU: {selectedProduct.sku}
                        </p>
                      )}
                    </div>
                  )}

                  {/* SVG Barcode - MAIN FOCUS (Pure barcode display) */}
                  <div className="flex items-center justify-center w-full overflow-hidden flex-1 py-1">
                    <svg className="barcode-svg-element w-full max-h-12" />
                  </div>

                  {/* Optional Price Tag */}
                  {showPrice && (
                    <div className="w-full flex items-center justify-between border-t border-black/15 pt-0.5 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-700">MRP</span>
                      <span className="text-xs font-black text-black font-mono">
                        {settings.currencySymbol || '৳'}{selectedProduct.sellingPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              {isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products available to generate barcodes'}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#11182c] border-t border-[#1e2a47] flex items-center justify-between text-xs text-slate-400">
          <span>
            {copies} {isBn ? 'টি স্টিকার তৈরি হয়েছে' : 'stickers generated'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPDF('thermal')}
              disabled={!!isDownloadingPDF || !selectedProduct}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
              title={isBn ? 'থার্মাল প্রিন্টারের উপযোগী PDF ফাইল ডাউনলোড' : 'Download Thermal PDF'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPDF === 'thermal' ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Saving...') : (isBn ? 'PDF ডাউনলোড (থার্মাল)' : 'PDF (Thermal)')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPDF('a4')}
              disabled={!!isDownloadingPDF || !selectedProduct}
              className="px-3 py-1.5 rounded-xl bg-[#1b2640] hover:bg-[#25355a] border border-[#2c3d66] text-indigo-300 hover:text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
              title={isBn ? 'A4 সাধারণ কাগজের জন্য PDF ডাউনলোড' : 'Download A4 Sheet PDF'}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isDownloadingPDF === 'a4' ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Saving...') : (isBn ? 'PDF (A4 শিট)' : 'PDF (A4)')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || !selectedProduct}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? (isBn ? 'প্রিন্ট হচ্ছে...' : 'Printing...') : (isBn ? 'প্রিন্ট' : 'Print')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
