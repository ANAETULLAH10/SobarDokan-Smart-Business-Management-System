import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  X,
  ArrowRight,
  Package,
  Layers
} from 'lucide-react';
import { ToastNotification, Language } from '../../types';

interface ToastItemProps {
  toast: ToastNotification;
  lang: Language;
  onDismiss: (id: string) => void;
}

const ToastItemCard: React.FC<ToastItemProps> = ({ toast, lang, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const duration = toast.duration ?? 7000;
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  // Play audio chime on mount (safe Web Audio API)
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          // Will resume if allowed by user gesture
          ctx.resume().catch(() => {});
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Pleasant warning chime
        if (toast.type === 'warning') {
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.12);
        } else if (toast.type === 'success') {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
        } else {
          osc.frequency.setValueAtTime(400, ctx.currentTime);
        }
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio not supported or blocked, fail silently
    }
  }, [toast.type]);

  // Handle countdown & progress bar with pause on hover
  useEffect(() => {
    if (duration <= 0) return; // sticky toast

    let animFrame: number;
    let lastTime = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lastTime;
      lastTime = now;

      if (!isHovered) {
        remainingTimeRef.current -= elapsed;
        const pct = Math.max(0, (remainingTimeRef.current / duration) * 100);
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          onDismiss(toast.id);
          return;
        }
      }

      animFrame = requestAnimationFrame(updateTimer);
    };

    animFrame = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(animFrame);
  }, [duration, isHovered, onDismiss, toast.id]);

  const getStyleConfig = () => {
    switch (toast.type) {
      case 'warning':
        return {
          border: 'border-amber-500/40 hover:border-amber-400/60',
          bg: 'bg-[#0f172a]/95 backdrop-blur-xl',
          glow: 'shadow-2xl shadow-amber-950/40',
          badgeBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 ring-4 ring-amber-500/10',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />,
          titleColor: 'text-amber-300',
          progressBg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
          actionBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
        };
      case 'error':
        return {
          border: 'border-rose-500/40 hover:border-rose-400/60',
          bg: 'bg-[#0f172a]/95 backdrop-blur-xl',
          glow: 'shadow-2xl shadow-rose-950/40',
          badgeBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 ring-4 ring-rose-500/10',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
          titleColor: 'text-rose-300',
          progressBg: 'bg-gradient-to-r from-rose-500 to-red-400',
          actionBtn: 'bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-lg shadow-rose-500/20'
        };
      case 'success':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400/60',
          bg: 'bg-[#0f172a]/95 backdrop-blur-xl',
          glow: 'shadow-2xl shadow-emerald-950/40',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ring-4 ring-emerald-500/10',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          titleColor: 'text-emerald-300',
          progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          actionBtn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
        };
      case 'info':
      default:
        return {
          border: 'border-cyan-500/40 hover:border-cyan-400/60',
          bg: 'bg-[#0f172a]/95 backdrop-blur-xl',
          glow: 'shadow-2xl shadow-cyan-950/40',
          badgeBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 ring-4 ring-cyan-500/10',
          icon: <Info className="w-5 h-5 text-cyan-400" />,
          titleColor: 'text-cyan-300',
          progressBg: 'bg-gradient-to-r from-cyan-500 to-blue-400',
          actionBtn: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20'
        };
    }
  };

  const style = getStyleConfig();
  const products = toast.productDetails || [];
  const displayProducts = products.slice(0, 3);
  const remainingCount = products.length - displayProducts.length;

  return (
    <motion.div
      id={`toast-item-${toast.id}`}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${style.border} ${style.bg} ${style.glow} transition-all duration-200`}
    >
      <div className="p-4 space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${style.badgeBg} flex-shrink-0`}>
              {style.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`text-sm font-bold tracking-tight ${style.titleColor}`}>
                  {toast.title}
                </h4>
                {products.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {lang === 'bn' ? `${products.length}টি পণ্য` : `${products.length} Items`}
                  </span>
                )}
              </div>
              {toast.message && (
                <p className="text-xs text-slate-300/90 mt-0.5 font-medium leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
          </div>

          <button
            id={`btn-close-toast-${toast.id}`}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Mini-Preview (When low stock items are provided) */}
        {displayProducts.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 space-y-1.5 divide-y divide-white/5">
              {displayProducts.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                return (
                  <div key={p.id} className="flex items-center justify-between text-xs pt-1.5 first:pt-0">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate font-medium text-slate-200">
                        {lang === 'bn' && p.banglaName ? p.banglaName : p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {lang === 'bn' ? 'স্টক নেই (০)' : 'Out of Stock (0)'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {lang === 'bn' 
                            ? `স্টক: ${p.currentStock} / সতর্কতা: ${p.minStockAlert}`
                            : `Stock: ${p.currentStock} / Alert: ${p.minStockAlert}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {remainingCount > 0 && (
                <div className="pt-1.5 text-center">
                  <span className="text-[11px] font-medium text-slate-400">
                    {lang === 'bn' 
                      ? `+ আরও ${remainingCount}টি পণ্য কম স্টকে আছে`
                      : `+ ${remainingCount} more products with low stock`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {toast.action && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              id={`btn-toast-action-${toast.id}`}
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className={`flex-1 py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${style.actionBtn}`}
            >
              <span>{toast.action.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDismiss(toast.id)}
              className="py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'বাদ দিন' : 'Dismiss'}
            </button>
          </div>
        )}
      </div>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
          <div
            className={`h-full ${style.progressBg} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastNotification[];
  lang: Language;
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, lang, onDismiss }) => {
  return (
    <div
      id="toast-container"
      aria-live="polite"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItemCard
            key={toast.id}
            toast={toast}
            lang={lang}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
