import React, { useState, useEffect } from 'react';
import {
  Settings, User, Lock, Shield, Store, Building2, Coins,
  Receipt, Printer, CreditCard, Users, ShieldCheck, FileText,
  Globe, Bell, Database, Cloud, RefreshCw, LogIn, LogOut,
  ChevronRight, CheckCircle2, Sparkles, Search
} from 'lucide-react';
import { BusinessSettings, Language, User as AuthUser } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { SettingsService } from '../../services/settingsService';

import {
  AdminProfileSection,
  SecurityPasswordSection,
  SessionsSection,
  BusinessProfileSection,
  BranchesSection,
  CurrencyTaxSection,
  InvoiceReceiptSection,
  PrintSection,
  PaymentMethodsSection,
  UserManagementSection,
  RolesPermissionsSection,
  SystemSettingsSection,
  NotificationSettingsSection,
  BackupDataSection,
  AuditLogSection
} from './sections';

export type SettingsTabId =
  | 'profile'
  | 'security'
  | 'sessions'
  | 'business'
  | 'branches'
  | 'currency-tax'
  | 'invoice-receipt'
  | 'print'
  | 'payments'
  | 'users'
  | 'roles-permissions'
  | 'system'
  | 'notifications'
  | 'backup'
  | 'audit';

interface SettingsViewProps {
  lang: Language;
  settings: BusinessSettings;
  user: AuthUser | null;
  onSaveSettings: (settings: BusinessSettings) => void;
  onLogin: () => void;
  onLogout: () => void;
  onResetData: () => void;
  initialTab?: SettingsTabId;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  settings,
  user,
  onSaveSettings,
  onLogin,
  onLogout,
  onResetData,
  initialTab = 'profile'
}) => {
  const isBn = lang === 'bn';
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(lang);

  // Sync state if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await StorageService.syncToFirestore();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const navCategories = [
    {
      groupBn: 'প্রোফাইল ও নিরাপত্তা',
      groupEn: 'Profile & Security',
      items: [
        { id: 'profile' as SettingsTabId, labelBn: 'অ্যাডমিন প্রোফাইল', labelEn: 'Admin Profile', icon: User },
        { id: 'security' as SettingsTabId, labelBn: 'পাসওয়ার্ড ও নিরাপত্তা', labelEn: 'Password & 2FA', icon: Lock },
        { id: 'sessions' as SettingsTabId, labelBn: 'সক্রিয় সেশনসমূহ', labelEn: 'Active Sessions', icon: Shield }
      ]
    },
    {
      groupBn: 'ব্যবসা ও শাখা',
      groupEn: 'Business & Branches',
      items: [
        { id: 'business' as SettingsTabId, labelBn: 'ব্যবসায়ের প্রোফাইল', labelEn: 'Business Profile', icon: Store },
        { id: 'branches' as SettingsTabId, labelBn: 'শাখা ব্যবস্থাপনা', labelEn: 'Branch Management', icon: Building2 },
        { id: 'currency-tax' as SettingsTabId, labelBn: 'মুদ্রা ও ভ্যাট/ট্যাক্স', labelEn: 'Currency & Tax/VAT', icon: Coins }
      ]
    },
    {
      groupBn: 'ইনভয়েস ও পেমেন্ট',
      groupEn: 'Invoice & POS Hardware',
      items: [
        { id: 'invoice-receipt' as SettingsTabId, labelBn: 'ইনভয়েস ও রসিদ', labelEn: 'Invoice & Receipts', icon: Receipt },
        { id: 'print' as SettingsTabId, labelBn: 'প্রিন্টার ও সাইজ', labelEn: 'Printer & Margins', icon: Printer },
        { id: 'payments' as SettingsTabId, labelBn: 'পেমেন্ট মাধ্যমসমূহ', labelEn: 'Payment Gateways', icon: CreditCard }
      ]
    },
    {
      groupBn: 'কর্মী ও রোল পারমিশন',
      groupEn: 'Users & Access Control',
      items: [
        { id: 'users' as SettingsTabId, labelBn: 'ইউজার ম্যানেজমেন্ট', labelEn: 'Staff & Users', icon: Users },
        { id: 'roles-permissions' as SettingsTabId, labelBn: 'রোল ও পারমিশন', labelEn: 'Roles & Permissions', icon: ShieldCheck },
        { id: 'audit' as SettingsTabId, labelBn: 'অডিট ও লগ ট্রেইল', labelEn: 'Audit & Activity Log', icon: FileText }
      ]
    },
    {
      groupBn: 'সিস্টেম ও ব্যাকআপ',
      groupEn: 'System & Data Management',
      items: [
        { id: 'system' as SettingsTabId, labelBn: 'সিস্টেম ও থিম', labelEn: 'System & Appearance', icon: Globe },
        { id: 'notifications' as SettingsTabId, labelBn: 'অ্যালার্ট ও নোটিফিকেশন', labelEn: 'Alerts & Stock Policy', icon: Bell },
        { id: 'backup' as SettingsTabId, labelBn: 'ব্যাকআপ ও রিস্টোর', labelEn: 'Backup & Restore', icon: Database }
      ]
    }
  ];

  const currentTabItem = navCategories.flatMap(g => g.items).find(i => i.id === activeTab);

  return (
    <div id="settings-view" className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Top Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'অ্যাডমিন প্রোফাইল ও সিস্টেম সেটিংস' : 'Admin Profile & System Settings'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'দোকানের পরিচিতি, অ্যাডমিন নিরাপত্তা, কর্মী অনুমতি, ইনভয়েস ডিজাইন এবং ক্লাউড ব্যাকআপ'
              : 'Manage administrator credentials, branch networks, invoice formatting, and complete system policies'}
          </p>
        </div>

        {/* Cloud Status Pill & Sync Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] border border-[#233153] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title={isBn ? 'ক্লাউড সিঙ্ক' : 'Sync to Cloud'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? (isBn ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (isBn ? 'ক্লাউড সিঙ্ক' : 'Cloud Sync')}</span>
          </button>

          {user ? (
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isBn ? 'গুগল লগইন' : 'Google Sync'}</span>
            </button>
          )}
        </div>
      </div>

      {syncSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? 'সকল তথ্য সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে!' : 'Data synchronized successfully to cloud database!'}</span>
        </div>
      )}

      {/* Main Settings Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar (lg:col-span-3) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="p-3 rounded-2xl bg-[#0d1424] border border-[#1e293b] space-y-4 shadow-xl">
            
            {/* Quick Admin Summary Badge */}
            <div className="p-3 rounded-xl bg-[#111827] border border-[#1e2a47] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow">
                {(SettingsService.getAdminProfile().photoURL || SettingsService.getAdminProfile().avatar) ? (
                  <img
                    src={SettingsService.getAdminProfile().photoURL || SettingsService.getAdminProfile().avatar}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  SettingsService.getAdminProfile().name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{SettingsService.getAdminProfile().name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="capitalize">{SettingsService.getAdminProfile().role}</span>
                </div>
              </div>
            </div>

            {/* Nav Groups */}
            <nav className="space-y-4">
              {navCategories.map(group => (
                <div key={group.groupEn} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">
                    {isBn ? group.groupBn : group.groupEn}
                  </span>

                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/50'
                              : 'text-slate-400 hover:text-white hover:bg-[#131b2e]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{isBn ? item.labelBn : item.labelEn}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Pane (lg:col-span-9) */}
        <main className="lg:col-span-9 space-y-6">
          {activeTab === 'profile' && (
            <AdminProfileSection
              lang={lang}
              onProfileUpdated={() => {
                // Force header/avatar re-render
              }}
            />
          )}

          {activeTab === 'security' && (
            <SecurityPasswordSection lang={lang} />
          )}

          {activeTab === 'sessions' && (
            <SessionsSection lang={lang} />
          )}

          {activeTab === 'business' && (
            <BusinessProfileSection
              lang={lang}
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}

          {activeTab === 'branches' && (
            <BranchesSection lang={lang} />
          )}

          {activeTab === 'currency-tax' && (
            <CurrencyTaxSection
              lang={lang}
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}

          {activeTab === 'invoice-receipt' && (
            <InvoiceReceiptSection
              lang={lang}
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}

          {activeTab === 'print' && (
            <PrintSection
              lang={lang}
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentMethodsSection lang={lang} />
          )}

          {activeTab === 'users' && (
            <UserManagementSection lang={lang} />
          )}

          {activeTab === 'roles-permissions' && (
            <RolesPermissionsSection lang={lang} />
          )}

          {activeTab === 'system' && (
            <SystemSettingsSection
              lang={lang}
              onLanguageChange={(newLang) => {
                setCurrentLang(newLang);
                // Also trigger storage save for language
                localStorage.setItem('amardokan_lang', newLang);
                window.location.reload();
              }}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettingsSection lang={lang} />
          )}

          {activeTab === 'backup' && (
            <BackupDataSection lang={lang} />
          )}

          {activeTab === 'audit' && (
            <AuditLogSection lang={lang} />
          )}
        </main>
      </div>
    </div>
  );
};
