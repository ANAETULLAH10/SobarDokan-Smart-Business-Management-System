import React, { useState, useEffect, useRef } from 'react';
import {
  Printer, Barcode as BarcodeIcon, Settings2, Check, RefreshCw,
  Copy, Layers, ArrowLeft, Search, Plus, Filter, Tag, Sparkles,
  CheckCircle2, Zap, CheckSquare, Square, Eye, Download, FileText
} from 'lucide-react';
import { Product, BusinessSettings, Language } from '../../types';
import JsBarcode from 'jsbarcode';
import { printBarcodeContainer, downloadBarcodePDF } from '../../utils/barcodePrinter';

interface BarcodeGeneratorViewProps {
  lang: Language;
  settings: BusinessSettings;
  products: Product[];
  onNavigateTab?: (tab: any) => void;
}

export const BarcodeGeneratorView: React.FC<BarcodeGeneratorViewProps> = ({
  lang,
  settings,
  products,
  onNavigateTab
}) => {
  const isBn = lang === 'bn';
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Preset Mode: 'only_barcode' (pure barcode) | 'barcode_price' (barcode + price + sku) | 'custom'
  const [presetMode, setPresetMode] = useState<'only_barcode' | 'barcode_price' | 'custom'>('only_barcode');

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [copies, setCopies] = useState<number>(8);
  const [labelSize, setLabelSize] = useState<'50x30' | '38x25' | '40x20' | 'a4_grid'>('50x30');

  // As requested: barcode should NOT have shop name by default, only barcode!
  const [showShopName, setShowShopName] = useState<boolean>(false);
  const [showProductName, setShowProductName] = useState<boolean>(false);
  const [showPrice, setShowPrice] = useState<boolean>(false);
  const [showSku, setShowSku] = useState<boolean>(false);
  const [showBanglaName, setShowBanglaName] = useState<boolean>(false);
  const [customTagline, setCustomTagline] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<'thermal' | 'a4' | null>(null);

  // If products change, ensure a product is selected
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.banglaName && p.banglaName.includes(searchQuery)) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchQuery))
  );

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Apply Quick Preset Modes
  const handleApplyPreset = (mode: 'only_barcode' | 'barcode_price' | 'custom') => {
    setPresetMode(mode);
    if (mode === 'only_barcode') {
      setShowShopName(false);
      setShowProductName(false);
      setShowPrice(false);
      setShowSku(false);
      setShowBanglaName(false);
      setCustomTagline('');
    } else if (mode === 'barcode_price') {
      setShowShopName(false);
      setShowProductName(true);
      setShowPrice(true);
      setShowSku(true);
      setShowBanglaName(true);
      setCustomTagline('');
    }
  };

  // Re-render barcode SVG graphic
  const renderBarcodes = () => {
    if (!selectedProduct) return;
    const barcodeVal = selectedProduct.barcode || selectedProduct.sku || '100001';

    document.querySelectorAll('.barcode-svg-element').forEach((svg) => {
      try {
        JsBarcode(svg, barcodeVal, {
          format: 'CODE128',
          lineColor: '#000000',
          width: presetMode === 'only_barcode' ? 1.8 : (labelSize === '38x25' || labelSize === '40x20' ? 1.3 : 1.5),
          height: presetMode === 'only_barcode' ? 48 : (labelSize === '38x25' || labelSize === '40x20' ? 28 : 34),
          displayValue: true,
          fontSize: 11,
          font: 'monospace',
          textMargin: 2,
          margin: 2
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
  }, [selectedProduct, copies, labelSize, showShopName, showProductName, showPrice, showSku, showBanglaName, customTagline, presetMode]);

  // Download PDF Handler (Thermal roll or A4 Sheet)
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
        customTagline,
        pdfFormat: format
      });
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setIsDownloadingPDF(null);
    }
  };

  // Robust Print Handler using thermal-ready isolated iframe with auto-fallback to PDF
  const handlePrint = async () => {
    if (!selectedProduct || !printContainerRef.current) return;
    setIsPrinting(true);
    renderBarcodes();

    try {
      const ok = await printBarcodeContainer(printContainerRef.current, {
        labelSize,
        title: `${selectedProduct.banglaName || selectedProduct.name} - Barcode`
      });
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

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Top Header (Screen Only) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarcodeIcon className="w-6 h-6 text-indigo-400" />
            <span>{isBn ? 'বারকোড ও প্রাইস স্টিকার জেনারেটর' : 'Barcode & Price Sticker Generator'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'থার্মাল প্রিন্টার অথবা A4 স্টিকার শিটের জন্য কাস্টম বারকোড মেমো তৈরি, এক ক্লিকে প্রিন্ট ও PDF ডাউনলোড'
              : 'Generate custom barcode labels, print or download PDF for thermal rolls or A4 sticker sheets'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* PDF Option 1: Thermal Roll PDF */}
          <button
            type="button"
            onClick={() => handleDownloadPDF('thermal')}
            disabled={!!isDownloadingPDF || !selectedProduct}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            title={isBn ? 'থার্মাল রোল মাপের PDF ডাউনলোড করুন' : 'Download thermal roll PDF'}
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingPDF === 'thermal' ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Saving...') : (isBn ? 'PDF ডাউনলোড (থার্মাল)' : 'PDF (Thermal)')}</span>
          </button>

          {/* PDF Option 2: A4 Sheet Grid PDF */}
          <button
            type="button"
            onClick={() => handleDownloadPDF('a4')}
            disabled={!!isDownloadingPDF || !selectedProduct}
            className="px-4 py-2.5 rounded-xl bg-[#17223b] hover:bg-[#202f52] border border-[#26375f] text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            title={isBn ? 'A4 স্টিকার শিট গ্রিড PDF ডাউনলোড করুন' : 'Download A4 sheet grid PDF'}
          >
            <FileText className="w-4 h-4" />
            <span>{isDownloadingPDF === 'a4' ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Saving...') : (isBn ? 'PDF (A4 শিট)' : 'PDF (A4 Sheet)')}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting || !selectedProduct}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? (isBn ? 'প্রিন্ট হচ্ছে...' : 'Printing...') : (isBn ? 'প্রিন্ট (Print)' : 'Print')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (No-Print) */}
        <div className="no-print lg:col-span-5 space-y-4">
          
          {/* Card 0: Mode Preset Selector (Only Barcode vs Price Tag vs Full) */}
          <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'লেবেল মোড পছন্দ করুন' : 'Label Mode'}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {presetMode === 'only_barcode' ? (isBn ? 'শুধু বারকোড সক্রিয়' : 'Only Barcode Active') : ''}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('only_barcode')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  presetMode === 'only_barcode'
                    ? 'bg-gradient-to-br from-indigo-950/80 to-[#121c38] border-indigo-500 text-white shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                    : 'bg-[#080d1a] border-[#233152] text-slate-300 hover:text-white hover:bg-[#111a33]'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-center gap-1">
                  <BarcodeIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isBn ? 'শুধু বারকোড' : 'Only Barcode'}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {isBn ? 'দোকানের নাম ছাড়া' : 'No shop name'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('barcode_price')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  presetMode === 'barcode_price'
                    ? 'bg-gradient-to-br from-indigo-950/80 to-[#121c38] border-indigo-500 text-white shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                    : 'bg-[#080d1a] border-[#233152] text-slate-300 hover:text-white hover:bg-[#111a33]'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? 'বারকোড + প্রাইস' : 'Barcode + Price'}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {isBn ? 'মূল্য ও SKU সহ' : 'With Price & SKU'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPresetMode('custom')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  presetMode === 'custom'
                    ? 'bg-gradient-to-br from-indigo-950/80 to-[#121c38] border-indigo-500 text-white shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                    : 'bg-[#080d1a] border-[#233152] text-slate-300 hover:text-white hover:bg-[#111a33]'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-center gap-1">
                  <Settings2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isBn ? 'কাস্টম' : 'Custom'}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {isBn ? 'পছন্দমতো অপশন' : 'Pick options'}
                </div>
              </button>
            </div>
          </div>

          {/* Card 1: Product Selection - CUSTOM DARK CARDS (Fixes the white washed-out select issue!) */}
          <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1b2640] pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isBn ? '১. পণ্য নির্বাচন করুন' : '1. Select Product'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {filteredProducts.length} {isBn ? 'টি পণ্য' : 'products'}
              </span>
            </div>

            {/* Search filter for products */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'পণ্যের নাম বা বারকোড খুঁজুন...' : 'Search product name or barcode...'}
                className="w-full bg-[#080d1a] border border-[#233152] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Custom Product Card Selection List (No native select styling bugs!) */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#18233a]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950/70 to-[#121c36] border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/40'
                          : 'bg-[#0a0f1d] hover:bg-[#121a30] border-[#1c2742] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-[#141d33] text-slate-500'
                        }`}>
                          {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Tag className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {p.banglaName || p.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span className="bg-[#141d33] px-1.5 py-0.2 rounded text-indigo-300">
                              {p.sku}
                            </span>
                            {p.barcode && <span>• {p.barcode}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-amber-400 font-mono">
                          {settings.currencySymbol || '৳'}{p.sellingPrice}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-sans">
                          {isBn ? 'স্টক:' : 'Stock:'} {p.currentStock}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  {isBn ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Layout & Size Options */}
          <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1b2640] pb-2">
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isBn ? '২. স্টিকার সাইজ ও কপি' : '2. Label Format & Copies'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isBn ? 'কাগজ/স্টিকার সাইজ' : 'Label Dimension'}
                </label>
                <select
                  value={labelSize}
                  onChange={e => setLabelSize(e.target.value as any)}
                  className="w-full bg-[#080d1a] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="50x30">{isBn ? '50x30 মিমি (স্ট্যান্ডার্ড থার্মাল)' : '50x30 mm (Standard Thermal)'}</option>
                  <option value="38x25">{isBn ? '38x25 মিমি (জুয়েলারি/ছোট বক্স)' : '38x25 mm (Jewelry/Small)'}</option>
                  <option value="40x20">{isBn ? '40x20 মিমি (মিনি লেবেল)' : '40x20 mm (Mini Retail)'}</option>
                  <option value="a4_grid">{isBn ? 'A4 শিট (২৪ স্টিকার গ্রিড)' : 'A4 Sheet (24-up Grid)'}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isBn ? 'স্টিকার সংখ্যা (কপি)' : 'Print Quantity'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={copies}
                    onChange={e => setCopies(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-full bg-[#080d1a] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setCopies(selectedProduct?.currentStock || 10)}
                    className="px-2 py-2 rounded-xl bg-[#1b2640] hover:bg-[#25355a] text-[10px] font-bold text-indigo-300 whitespace-nowrap"
                    title={isBn ? 'বর্তমান স্টক পরিমাণ কপি করুন' : 'Match current stock'}
                  >
                    {isBn ? 'স্টক সমপরিমাণ' : 'Stock Qty'}
                  </button>
                </div>
              </div>
            </div>

            {/* Field Toggles: Shop name default unchecked as requested */}
            <div className="space-y-2 pt-2 border-t border-[#1b2640]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isBn ? 'স্টিকারে যা যা প্রদর্শন করবেন:' : 'Include on Sticker:'}
                </span>
                <span className="text-[10px] text-amber-400 font-medium">
                  {!showShopName && (isBn ? 'দোকানের নাম বন্ধ আছে' : 'Shop name excluded')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                {/* Shop Name Toggle - Unchecked by default */}
                <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-colors ${
                  showShopName ? 'bg-indigo-950/30 border-indigo-500/40 text-white' : 'bg-[#0a0f1d] border-[#1d2740] text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={showShopName}
                    onChange={e => {
                      setShowShopName(e.target.checked);
                      setPresetMode('custom');
                    }}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'দোকানের নাম (ঐচ্ছিক)' : 'Shop Name'}</span>
                </label>

                {/* Product Name Toggle */}
                <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-colors ${
                  showProductName ? 'bg-indigo-950/30 border-indigo-500/40 text-white' : 'bg-[#0a0f1d] border-[#1d2740] text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={showProductName}
                    onChange={e => {
                      setShowProductName(e.target.checked);
                      setPresetMode('custom');
                    }}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'পণ্যের নাম' : 'Product Name'}</span>
                </label>

                {/* Price (MRP) Toggle */}
                <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-colors ${
                  showPrice ? 'bg-indigo-950/30 border-indigo-500/40 text-white' : 'bg-[#0a0f1d] border-[#1d2740] text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={e => {
                      setShowPrice(e.target.checked);
                      setPresetMode('custom');
                    }}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'বিক্রয় মূল্য (MRP)' : 'Price (MRP)'}</span>
                </label>

                {/* SKU / Code Toggle */}
                <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-colors ${
                  showSku ? 'bg-indigo-950/30 border-indigo-500/40 text-white' : 'bg-[#0a0f1d] border-[#1d2740] text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={showSku}
                    onChange={e => {
                      setShowSku(e.target.checked);
                      setPresetMode('custom');
                    }}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'SKU / কোড' : 'SKU / Code'}</span>
                </label>
              </div>

              {/* Tagline / Custom text */}
              <div className="pt-2">
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  {isBn ? 'কাস্টম ট্যাগলাইন (ঐচ্ছিক)' : 'Custom Tagline / Text (Optional)'}
                </label>
                <input
                  type="text"
                  value={customTagline}
                  onChange={e => setCustomTagline(e.target.value)}
                  placeholder={isBn ? 'যেমন: নন-রিটার্নেবল / গ্যারান্টিযুক্ত' : 'e.g., Non-refundable'}
                  className="w-full bg-[#080d1a] border border-[#233152] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column (Printed on Paper) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="no-print flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isBn ? 'প্রিন্ট প্রিভিউ (আউটপুট নমুনা)' : 'Print Preview'}</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {copies} {isBn ? 'টি স্টিকার' : 'stickers'}
              </span>
              <button
                type="button"
                onClick={() => handleDownloadPDF('thermal')}
                disabled={!!isDownloadingPDF || !selectedProduct}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                title={isBn ? 'থার্মাল প্রিন্টার PDF ডাউনলোড' : 'Download Thermal PDF'}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingPDF === 'thermal' ? (isBn ? 'ডাউনলোড...' : 'Saving...') : (isBn ? 'PDF (থার্মাল)' : 'PDF (Thermal)')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPDF('a4')}
                disabled={!!isDownloadingPDF || !selectedProduct}
                className="px-3 py-1.5 rounded-xl bg-[#1b2640] hover:bg-[#25355a] border border-[#2c3d66] text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                title={isBn ? 'A4 স্টিকার শিট PDF ডাউনলোড' : 'Download A4 Sheet PDF'}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isDownloadingPDF === 'a4' ? (isBn ? 'ডাউনলোড...' : 'Saving...') : (isBn ? 'PDF (A4)' : 'PDF (A4)')}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting || !selectedProduct}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer active:scale-95 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
              </button>
            </div>
          </div>

          {/* White preview canvas wrapper */}
          <div
            id="barcode-print-wrapper"
            className="bg-slate-900 border border-[#1e2a47] rounded-2xl p-4 md:p-6 overflow-x-auto min-h-[460px] flex items-center justify-center print:border-none print:p-0 print:bg-white print:m-0"
          >
            {selectedProduct ? (
              <div
                ref={printContainerRef}
                id="barcode-print-container"
                className={`flex flex-wrap gap-3 items-center justify-center print:m-0 print:p-0 ${
                  labelSize === 'a4_grid' ? 'grid grid-cols-3 gap-2 max-w-[800px]' : ''
                }`}
              >
                {Array.from({ length: copies }).map((_, idx) => (
                  <div
                    key={idx}
                    className="barcode-sticker-item bg-white text-black p-2 rounded border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-between text-center print:border-none print:shadow-none transition-all"
                    style={{
                      width: labelSize === '50x30' ? '180px' : labelSize === '38x25' ? '145px' : labelSize === '40x20' ? '150px' : '170px',
                      height: labelSize === '50x30' ? '115px' : labelSize === '38x25' ? '95px' : labelSize === '40x20' ? '80px' : '110px',
                      pageBreakInside: 'avoid',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Header: Shop Name (ONLY if explicitly enabled by user) */}
                    {showShopName && settings.businessName && (
                      <div className="text-[10px] font-bold text-black uppercase tracking-wider truncate w-full leading-tight">
                        {settings.businessName}
                      </div>
                    )}

                    {/* Product Name (Optional) */}
                    {showProductName && (
                      <div className="text-[11px] font-extrabold text-black truncate w-full px-1 leading-tight">
                        {showBanglaName && selectedProduct.banglaName
                          ? selectedProduct.banglaName
                          : selectedProduct.name}
                      </div>
                    )}

                    {/* Barcode SVG graphic (Takes full focus in Only Barcode mode) */}
                    <div className="w-full flex-1 flex items-center justify-center -my-1 overflow-hidden">
                      <svg className="barcode-svg-element w-full max-w-full"></svg>
                    </div>

                    {/* Footer Row: SKU & Price (Optional) */}
                    {(showSku || showPrice) && (
                      <div className="flex items-center justify-between w-full px-1 pt-0.5 border-t border-slate-200 text-[10px] leading-none">
                        {showSku && (
                          <span className="font-mono text-slate-700 text-[9px]">
                            {selectedProduct.sku}
                          </span>
                        )}

                        {showPrice && (
                          <span className="font-black text-black text-[12px]">
                            {settings.currencySymbol || '৳'}{selectedProduct.sellingPrice}
                          </span>
                        )}
                      </div>
                    )}

                    {customTagline && (
                      <div className="text-[8px] text-slate-600 truncate w-full">
                        {customTagline}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                {isBn ? 'অনুগ্রহ করে প্রথমে পণ্য নির্বাচন করুন' : 'Please select a product to generate stickers'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
