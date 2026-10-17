import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Barcode as BarcodeIcon, Settings2, Check, RefreshCw, Copy, Layers } from 'lucide-react';
import { Product, BusinessSettings, Language } from '../../types';
import JsBarcode from 'jsbarcode';

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

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || products[0]?.id || '');
  const [copies, setCopies] = useState<number>(4);
  const [labelSize, setLabelSize] = useState<'50x30' | '38x25' | 'a4_grid'>('50x30');
  const [showShopName, setShowShopName] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showSku, setShowSku] = useState<boolean>(true);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (selectedProduct) {
      setTimeout(() => {
        document.querySelectorAll('.barcode-svg-element').forEach((svg) => {
          try {
            JsBarcode(svg, selectedProduct.barcode || selectedProduct.sku || '100001', {
              format: 'CODE128',
              lineColor: '#000000',
              width: 1.5,
              height: 36,
              displayValue: true,
              fontSize: 10,
              font: 'monospace',
              margin: 4
            });
          } catch (e) {
            console.warn('Barcode render note:', e);
          }
        });
      }, 50);
    }
  }, [selectedProduct, copies, labelSize, showShopName, showPrice, showSku]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in print:p-0 print:static print:bg-white">
      <div className="w-full max-w-3xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Top Header (No print) */}
        <div className="no-print p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <BarcodeIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isBn ? 'বারকোড স্টিকার ও লেবেল প্রিন্টার' : 'Barcode Sticker Generator'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'থার্মাল প্রিন্টার অথবা সাধারণ কাগজের জন্য বারকোড মেমো তৈরি' : 'Print barcode labels for thermal printers or A4 sheets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্টিকার প্রিন্ট করুন' : 'Print Stickers'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Bar (No print) */}
        <div className="no-print p-4 bg-[#12192c] border-b border-[#1e2a47] grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 1. Select Product */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              {isBn ? 'পণ্য নির্বাচন করুন *' : 'Select Product *'}
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.banglaName || p.name} ({p.sku}) - ৳{p.sellingPrice}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Number of Copies */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              {isBn ? 'স্টিকারের সংখ্যা' : 'Copies / Quantity'}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={copies}
              onChange={e => setCopies(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          {/* 3. Sticker Size */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              {isBn ? 'লেবেল সাইজ' : 'Label Size'}
            </label>
            <select
              value={labelSize}
              onChange={e => setLabelSize(e.target.value as any)}
              className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="50x30">50mm x 30mm (Standard Thermal)</option>
              <option value="38x25">38mm x 25mm (Small Label)</option>
              <option value="a4_grid">A4 Sheet Grid (Multi-label)</option>
            </select>
          </div>
        </div>

        {/* Toggles (No print) */}
        <div className="no-print px-4 py-2 bg-[#0a0e19] border-b border-[#192238] flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showShopName}
              onChange={e => setShowShopName(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>{isBn ? 'দোকানের নাম দেখান' : 'Show Shop Name'}</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPrice}
              onChange={e => setShowPrice(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>{isBn ? 'বিক্রয়মূল্য (MRP) দেখান' : 'Show Price (MRP)'}</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSku}
              onChange={e => setShowSku(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>{isBn ? 'SKU কোড দেখান' : 'Show SKU'}</span>
          </label>
        </div>

        {/* Printable Preview Canvas */}
        <div className="p-6 bg-[#080c16] flex-1 overflow-y-auto max-h-[60vh] print:bg-white print:p-0 print:max-h-none print:overflow-visible">
          {selectedProduct ? (
            <div
              className={`grid gap-4 justify-center print:gap-2 print:m-0 ${
                labelSize === 'a4_grid'
                  ? 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-2'
              }`}
            >
              {Array.from({ length: copies }).map((_, idx) => (
                <div
                  key={idx}
                  className={`bg-white text-black p-3 rounded-lg border border-dashed border-slate-400 print:border print:border-black/30 flex flex-col items-center justify-between text-center shadow-md print:shadow-none select-none ${
                    labelSize === '38x25' ? 'w-[160px] h-[110px] p-2' : 'w-[200px] h-[135px]'
                  }`}
                  style={{ pageBreakInside: 'avoid' }}
                >
                  {/* Shop Name */}
                  {showShopName && (
                    <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-800 line-clamp-1 border-b border-black/15 pb-0.5 w-full">
                      {settings.businessName || 'আমার দোকান'}
                    </p>
                  )}

                  {/* Product Title */}
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

                  {/* SVG Barcode */}
                  <div className="flex items-center justify-center w-full overflow-hidden">
                    <svg className="barcode-svg-element w-full max-h-11" />
                  </div>

                  {/* Price Tag */}
                  {showPrice && (
                    <div className="w-full flex items-center justify-between border-t border-black/15 pt-0.5 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-700">MRP</span>
                      <span className="text-xs font-black text-black">
                        ৳{selectedProduct.sellingPrice.toLocaleString()}
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

        {/* Print Stylesheet Hook */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              .no-print { display: none !important; }
              #pos-screen, #main-sidebar, header { display: none !important; }
              .barcode-svg-element { visibility: visible !important; }
              .fixed { position: static !important; }
              .bg-black\\/80 { background: white !important; }
              .bg-\\[\\#080c16\\] { background: white !important; }
              .bg-white { background: white !important; visibility: visible !important; }
              .bg-white * { visibility: visible !important; }
            }
          `
        }} />
      </div>
    </div>
  );
};
