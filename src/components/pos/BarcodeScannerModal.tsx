import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera, X, Zap, ZapOff, RefreshCw, AlertCircle, CheckCircle2,
  Barcode as BarcodeIcon, Keyboard, ShoppingCart
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product, Language } from '../../types';
import { playScannerBeep } from '../../utils/scannerSound';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductScanned: (product: Product) => void;
  lang: Language;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductScanned,
  lang
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastScannedResult, setLastScannedResult] = useState<{
    code: string;
    product?: Product;
    success: boolean;
    message: string;
    timestamp: number;
  } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [continuousMode, setContinuousMode] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-barcode-scanner';
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  // Handle scanned barcode code string
  const handleBarcodeDecoded = useCallback((decodedText: string) => {
    const cleanCode = decodedText.trim();
    if (!cleanCode) return;

    const now = Date.now();
    // Prevent duplicate triggers for the same barcode within 1.4 seconds
    if (cleanCode === lastScannedCodeRef.current && (now - lastScanTimeRef.current) < 1400) {
      return;
    }

    lastScannedCodeRef.current = cleanCode;
    lastScanTimeRef.current = now;

    // Search product by barcode or SKU
    const matchedProduct = products.find(
      p => p.barcode === cleanCode || (p.sku && p.sku.toLowerCase() === cleanCode.toLowerCase())
    );

    if (matchedProduct) {
      if (matchedProduct.currentStock <= 0) {
        playScannerBeep('error');
        setLastScannedResult({
          code: cleanCode,
          product: matchedProduct,
          success: false,
          message: lang === 'bn' ? 'পণ্যটির স্টক শেষ (Out of Stock)' : 'Product is out of stock',
          timestamp: now
        });
      } else {
        playScannerBeep('success');
        onProductScanned(matchedProduct);
        setLastScannedResult({
          code: cleanCode,
          product: matchedProduct,
          success: true,
          message: lang === 'bn' ? 'কার্টে যুক্ত হয়েছে!' : 'Added to cart!',
          timestamp: now
        });

        if (!continuousMode) {
          setTimeout(() => {
            onClose();
          }, 600);
        }
      }
    } else {
      playScannerBeep('warning');
      setLastScannedResult({
        code: cleanCode,
        success: false,
        message: lang === 'bn' ? `বারকোড "${cleanCode}" পাওয়া যায়নি` : `Barcode "${cleanCode}" not found`,
        timestamp: now
      });
    }
  }, [products, lang, continuousMode, onProductScanned, onClose]);

  // Start Camera Scanner
  const startScanner = useCallback(async () => {
    setIsInitializing(true);
    setScannerError(null);

    // Stop any existing scanner
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping previous scanner:', e);
      }
      scannerRef.current = null;
    }

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.ITF
        ],
        verbose: false
      });

      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          return {
            width: Math.floor(minDim * 0.85),
            height: Math.floor(minDim * 0.6)
          };
        },
        aspectRatio: 1.333
      };

      await html5QrCode.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          handleBarcodeDecoded(decodedText);
        },
        () => {
          // Frame error (normal during camera frame capture when no barcode is visible)
        }
      );

      // Check if torch/flashlight capability is available
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const capabilities = (html5QrCode as any).getRunningTrackCapabilities?.();
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }

      setIsInitializing(false);
    } catch (err: unknown) {
      console.error('Camera scanner init failed:', err);
      setIsInitializing(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
        setScannerError(
          lang === 'bn'
            ? 'ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংসে ক্যামেরার অনুমতি চালু করুন।'
            : 'Camera permission denied. Please allow camera access in your browser settings.'
        );
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setScannerError(
          lang === 'bn'
            ? 'কোন ক্যামেরা ডিভাইস পাওয়া যায়নি।'
            : 'No camera hardware found on this device.'
        );
      } else {
        setScannerError(
          lang === 'bn'
            ? 'ক্যামেরা চালু করা সম্ভব হয়নি। নিচের বক্সে ম্যানুয়ালি বারকোড লিখে এন্টার চাপুন।'
            : 'Unable to start camera stream. You can enter barcodes manually below.'
        );
      }
    }
  }, [facingMode, handleBarcodeDecoded, lang]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextState = !torchOn;
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner during cleanup:', err);
      }
      scannerRef.current = null;
    }
  }, []);

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  // Handle Manual Barcode Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDecoded(manualCode);
    setManualCode('');
  };

  if (!isOpen) return null;

  // Sample quick barcodes from available inventory to test easily
  const sampleProductsWithBarcode = products.filter(p => p.barcode && p.currentStock > 0).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-[#111827] border-b border-[#1e2a47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {lang === 'bn' ? 'বারকোড স্ক্যানার' : 'Live Barcode Scanner'}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'ক্যামেরা তাক করুন অথবা বারকোড স্ক্যান করুন'
                  : 'Point camera at product barcode to auto-add to cart'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl border transition-all ${
                  torchOn
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-[#18233b] border-[#1e2a47] text-slate-400 hover:text-white'
                }`}
                title={torchOn ? 'Turn off light' : 'Turn on light'}
              >
                {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={flipCamera}
              className="p-2 rounded-xl bg-[#18233b] border border-[#1e2a47] text-slate-400 hover:text-white transition-colors"
              title="Flip camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#18233b] border border-[#1e2a47] text-slate-400 hover:text-white hover:bg-rose-950/40 hover:border-rose-800/60 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scanner Viewport */}
        <div className="relative bg-[#070b14] flex-1 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
          
          {/* html5-qrcode target container */}
          <div
            id={scannerContainerId}
            className="w-full max-w-[420px] aspect-[4/3] relative overflow-hidden flex items-center justify-center [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
          />

          {/* Scanner Aiming Overlay Guide */}
          {!scannerError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="relative w-64 h-44 border-2 border-indigo-500/60 rounded-2xl shadow-[0_0_0_9999px_rgba(7,11,20,0.55)]">
                {/* Corner accent marks */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
                
                {/* Animated Red Laser Scan Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-[bounce_2s_infinite]" />
              </div>
              <p className="mt-4 text-[11px] font-medium text-slate-300 bg-[#0e1424]/90 px-3 py-1 rounded-full border border-indigo-500/30 backdrop-blur-sm">
                {lang === 'bn' ? 'বারকোডটি ফ্রেমের মাঝখানে রাখুন' : 'Align barcode within the target box'}
              </p>
            </div>
          )}

          {/* Initializing Spinner */}
          {isInitializing && !scannerError && (
            <div className="absolute inset-0 bg-[#070b14]/90 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-300">
                {lang === 'bn' ? 'ক্যামেরা চালু হচ্ছে...' : 'Initializing camera stream...'}
              </p>
            </div>
          )}

          {/* Scanner Error / Permission Fallback */}
          {scannerError && (
            <div className="absolute inset-0 bg-[#070b14]/95 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                {lang === 'bn' ? 'ক্যামেরা স্ক্যানার সমস্যা' : 'Camera Unavailable'}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                {scannerError}
              </p>
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/40"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry Camera'}
              </button>
            </div>
          )}
        </div>

        {/* Last Scanned Status Alert */}
        {lastScannedResult && (
          <div
            className={`px-4 py-2.5 border-t border-b flex items-center justify-between text-xs transition-all ${
              lastScannedResult.success
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {lastScannedResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <div className="truncate">
                {lastScannedResult.product ? (
                  <span className="font-semibold text-white">
                    {lastScannedResult.product.banglaName || lastScannedResult.product.name}
                    <span className="text-emerald-400 ml-2 font-mono">
                      ৳{lastScannedResult.product.sellingPrice}
                    </span>
                  </span>
                ) : (
                  <span className="font-mono text-slate-300">
                    [{lastScannedResult.code}]
                  </span>
                )}
                <span className="mx-1.5 opacity-60">•</span>
                <span className="text-[11px]">{lastScannedResult.message}</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <ShoppingCart className="w-3 h-3" />
              {lang === 'bn' ? 'কার্টে যুক্ত' : 'In Cart'}
            </div>
          </div>
        )}

        {/* Controls & Manual Entry Section */}
        <div className="p-4 bg-[#111827] border-t border-[#1e2a47] space-y-3">
          
          {/* Mode Switch & Hardware Scanner notice */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={e => setContinuousMode(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-[#0e1424] border-[#1e2a47]"
              />
              <span className="font-medium">
                {lang === 'bn' ? 'ধারাবাহিক স্ক্যানিং (Continuous Mode)' : 'Continuous multi-scan mode'}
              </span>
            </label>

            <span className="text-[11px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-800/40">
              USB / Laser Scanner Ready
            </span>
          </div>

          {/* Manual Barcode Input Fallback */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder={lang === 'bn' ? 'বারকোড বা SKU লিখে এন্টার দিন...' : 'Type barcode or SKU and press Enter...'}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              {lang === 'bn' ? 'যুক্ত করুন' : 'Add Item'}
            </button>
          </form>

          {/* Quick Clickable Sample Barcodes for easy testing */}
          {sampleProductsWithBarcode.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                {lang === 'bn' ? 'পরীক্ষামূলক বারকোড (ক্লিক করে টেস্ট করুন):' : 'Sample Barcodes (Click to test):'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sampleProductsWithBarcode.map(sample => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleBarcodeDecoded(sample.barcode)}
                    className="px-2.5 py-1 rounded-lg bg-[#0e1424] hover:bg-indigo-950/60 border border-[#1e2a47] hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer font-mono"
                  >
                    <BarcodeIcon className="w-3 h-3 text-indigo-400" />
                    <span>{sample.barcode}</span>
                    <span className="text-[10px] text-slate-400">({sample.name.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
