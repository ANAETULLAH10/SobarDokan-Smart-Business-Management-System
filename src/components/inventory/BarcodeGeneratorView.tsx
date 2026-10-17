import React, { useState, useEffect, useRef } from 'react';
import {
  Printer, Barcode as BarcodeIcon, Settings2, Check, RefreshCw,
  Copy, Layers, ArrowLeft, Search, Plus, Filter, Tag, Sparkles
} from 'lucide-react';
import { Product, BusinessSettings, Language } from '../../types';
import JsBarcode from 'jsbarcode';

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

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [copies, setCopies] = useState<number>(8);
  const [labelSize, setLabelSize] = useState<'50x30' | '38x25' | '40x20' | 'a4_grid'>('50x30');
  const [showShopName, setShowShopName] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showSku, setShowSku] = useState<boolean>(true);
  const [showBanglaName, setShowBanglaName] = useState<boolean>(true);
  const [customTagline, setCustomTagline] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.banglaName && p.banglaName.includes(searchQuery)) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchQuery))
  );

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (selectedProduct) {
      setTimeout(() => {
        document.querySelectorAll('.barcode-svg-element').forEach((svg) => {
          try {
            JsBarcode(svg, selectedProduct.barcode || selectedProduct.sku || '100001', {
              format: 'CODE128',
              lineColor: '#000000',
              width: labelSize === '38x25' || labelSize === '40x20' ? 1.2 : 1.5,
              height: labelSize === '38x25' || labelSize === '40x20' ? 28 : 36,
              displayValue: true,
              fontSize: 10,
              font: 'monospace',
              margin: 2
            });
          } catch (e) {
            console.warn('Barcode render error:', e);
          }
        });
      }, 60);
    }
  }, [selectedProduct, copies, labelSize, showShopName, showPrice, showSku, showBanglaName, customTagline]);

  const handlePrint = () => {
    window.print();
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
              ? 'থার্মাল প্রিন্টার অথবা A4 স্টিকার শিটের জন্য কাস্টম বারকোড মেমো তৈরি ও এক ক্লিকে প্রিন্ট'
              : 'Generate custom barcode labels for POS thermal rolls or A4 sticker sheets'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'স্টিকার প্রিন্ট করুন (Print)' : 'Print Labels'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (No-Print) */}
        <div className="no-print lg:col-span-5 space-y-4">
          {/* Card 1: Product Selection */}
          <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1b2640] pb-2">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isBn ? '১. পণ্য নির্বাচন' : '1. Select Product'}</span>
            </h3>

            {/* Search filter for products */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'পণ্য বা বারকোড খুঁজুন...' : 'Search product or barcode...'}
                className="w-full bg-[#080d1a] border border-[#233152] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              size={6}
              className="w-full bg-[#080d1a] border border-[#233152] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium space-y-1 overflow-y-auto"
            >
              {filteredProducts.map(p => (
                <option
                  key={p.id}
                  value={p.id}
                  className="py-1 px-2 rounded hover:bg-indigo-600/30 cursor-pointer text-slate-200"
                >
                  {p.banglaName || p.name} ({p.sku}) — ৳{p.sellingPrice} (স্টক: {p.currentStock})
                </option>
              ))}
            </select>
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

            {/* Field Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#1b2640]">
              <span className="text-[11px] font-bold text-slate-400 block">
                {isBn ? 'স্টিকারে যা যা প্রদর্শন করবেন:' : 'Include on Sticker:'}
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={showShopName}
                    onChange={e => setShowShopName(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'দোকানের নাম' : 'Shop Name'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={e => setShowPrice(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'বিক্রয় মূল্য (MRP)' : 'Price (MRP)'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={showSku}
                    onChange={e => setShowSku(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'SKU / কোড' : 'SKU / Code'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={showBanglaName}
                    onChange={e => setShowBanglaName(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 bg-[#080d1a] border-[#233152]"
                  />
                  <span>{isBn ? 'বাংলা নাম অগ্রাধিকার' : 'Bangla Name'}</span>
                </label>
              </div>

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
            <span className="text-[11px] text-slate-500">
              {copies} {isBn ? 'টি স্টিকার তৈরি হচ্ছে' : 'stickers generated'}
            </span>
          </div>

          {/* White preview canvas */}
          <div className="bg-slate-900 border border-[#1e2a47] rounded-2xl p-4 overflow-x-auto min-h-[460px] flex items-center justify-center print:border-none print:p-0 print:bg-white print:m-0">
            {selectedProduct ? (
              <div
                id="barcode-print-container"
                className={`flex flex-wrap gap-3 items-center justify-center print:m-0 print:p-0 ${
                  labelSize === 'a4_grid' ? 'grid grid-cols-3 gap-2 max-w-[800px]' : ''
                }`}
              >
                {Array.from({ length: copies }).map((_, idx) => (
                  <div
                    key={idx}
                    className="barcode-sticker-item bg-white text-black p-2 rounded border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-between text-center print:border-none print:shadow-none"
                    style={{
                      width: labelSize === '50x30' ? '180px' : labelSize === '38x25' ? '145px' : labelSize === '40x20' ? '150px' : '170px',
                      height: labelSize === '50x30' ? '115px' : labelSize === '38x25' ? '95px' : labelSize === '40x20' ? '80px' : '110px',
                      pageBreakInside: 'avoid',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Header: Shop Name */}
                    {showShopName && (
                      <div className="text-[10px] font-bold text-black uppercase tracking-wider truncate w-full leading-tight">
                        {settings.businessName || 'আমার দোকান POS'}
                      </div>
                    )}

                    {/* Product Name */}
                    <div className="text-[11px] font-extrabold text-black truncate w-full px-1 leading-tight">
                      {showBanglaName && selectedProduct.banglaName
                        ? selectedProduct.banglaName
                        : selectedProduct.name}
                    </div>

                    {/* Barcode SVG graphic */}
                    <div className="w-full flex justify-center -my-1 overflow-hidden">
                      <svg className="barcode-svg-element"></svg>
                    </div>

                    {/* Footer Row: SKU & Price */}
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
