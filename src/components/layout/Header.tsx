import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, Plus, Globe, Sun, Moon,
  AlertTriangle, Check, RefreshCw, Menu, Zap, Sparkles
} from 'lucide-react';
import { Language, ThemeMode, User, Product } from '../../types';
import { translations } from '../../i18n/translations';
import { SettingsTabId } from '../settings/SettingsView';
import { UserAvatarDropdown } from './UserAvatarDropdown';

interface HeaderProps {
  title: string;
  user: User | null;
  lang: Language;
  theme: ThemeMode;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onQuickSale: () => void;
  onAddProduct: () => void;
  onToggleMobileMenu?: () => void;
  isSyncing?: boolean;
  onManualSync?: () => void;
  lowStockProducts?: Product[];
  onNavigateSettings?: (tab?: SettingsTabId) => void;
  onOpenVoiceAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  user,
  lang,
  theme,
  onLanguageToggle,
  onThemeToggle,
  onLogin,
  onLogout,
  onQuickSale,
  onAddProduct,
  onToggleMobileMenu,
  isSyncing = false,
  onManualSync,
  lowStockProducts = [],
  onNavigateSettings,
  onOpenVoiceAssistant
}) => {
  const t = translations[lang];
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  const dateFormatted = lang === 'bn'
    ? today.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })
    : today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header
      id="main-header"
      className="h-16 px-4 md:px-6 bg-[#0b101d] border-b border-[#192238] flex items-center justify-between z-20 flex-shrink-0"
    >
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <p className="text-[11px] text-slate-400 capitalize hidden sm:block">{dateFormatted}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Voice AI Live Assistant Button */}
        {onOpenVoiceAssistant && (
          <button
            id="header-btn-voice-live"
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/40 transition-all active:scale-95 cursor-pointer"
            title={lang === 'bn' ? 'লাইভ ভয়েস সহকারী (gemini-3.8-live)' : 'Live Voice Assistant (gemini-3.8-live)'}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'ভয়েস AI' : 'Voice AI'}</span>
          </button>
        )}

        {/* Quick Sale F2 Button */}
        <button
          id="header-btn-quick-sale"
          onClick={onQuickSale}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/30 transition-all active:scale-95"
          title="Quick Sale / দ্রুত বিক্রয় (F2)"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          <span>{t.quickSale}</span>
        </button>

        {/* Quick Add Product Button */}
        <button
          id="header-btn-add-product"
          onClick={onAddProduct}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/40 transition-all active:scale-95"
          title={t.addProduct}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.addProduct}</span>
        </button>

        {/* Cloud Sync Status / Button */}
        {onManualSync && (
          <button
            id="header-btn-sync"
            onClick={onManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#12192c] hover:bg-[#1a233d] border border-[#1e2a47] text-xs font-medium text-slate-300 hover:text-white transition-colors"
            title={lang === 'bn' ? 'ক্লাউড সিঙ্ক করুন' : 'Sync to Cloud'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline text-[11px]">
              {isSyncing ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'সিঙ্ক' : 'Sync')}
            </span>
          </button>
        )}

        {/* Language Switcher */}
        <button
          id="btn-language-toggle"
          onClick={onLanguageToggle}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#12192c] hover:bg-[#1a233d] border border-[#1e2a47] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          title="Switch Language / ভাষা পরিবর্তন"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-bold">{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
        </button>

        {/* Day / Night Mood Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={onThemeToggle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#12192c] hover:bg-[#1a233d] border border-[#1e2a47] text-xs font-medium text-slate-300 hover:text-white transition-all active:scale-95"
          title={
            theme === 'night'
              ? (lang === 'bn' ? 'দিন মুড চালু করুন (Day Mode)' : 'Switch to Day Mode')
              : (lang === 'bn' ? 'রাত মুড চালু করুন (Night Mode)' : 'Switch to Night Mode')
          }
        >
          {theme === 'night' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-[spin_12s_linear_infinite]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span className="text-[11px] font-semibold hidden sm:inline">
            {theme === 'night' ? (lang === 'bn' ? 'দিন' : 'Day') : (lang === 'bn' ? 'রাত' : 'Night')}
          </span>
        </button>

        {/* Low Stock Alerts / Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl bg-[#12192c] hover:bg-[#1a233d] border border-[#1e2a47] text-slate-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#12192c] border border-[#1e2a47] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between border-b border-[#1e2a47] pb-2 mb-2">
                <p className="text-xs font-bold text-white">
                  {lang === 'bn' ? 'স্টক এলার্ট ও নোটিফিকেশন' : 'Stock Alerts & Notifications'}
                </p>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                  {lowStockProducts.length}
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#18223c] text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-200">{p.banglaName || p.name}</p>
                        <p className="text-[11px] text-amber-300/90">
                          {lang === 'bn'
                            ? `স্টক মাত্র ${p.currentStock} ${p.unit} বাকি!`
                            : `Low Stock: only ${p.currentStock} ${p.unit} left!`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p>{lang === 'bn' ? 'কোন স্টক সমস্যা নেই' : 'Stock levels healthy'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu: UserAvatarDropdown Component */}
        <UserAvatarDropdown
          user={user}
          lang={lang}
          onNavigateSettings={onNavigateSettings}
          onLogout={onLogout}
          onLogin={onLogin}
        />
      </div>
    </header>
  );
};
