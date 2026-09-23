import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Wallet,
  ShoppingBag, DollarSign, Banknote, BarChart3, Settings,
  Store, Zap, ChevronLeft, ChevronRight, X, MessageSquare,
  Clock, ShieldCheck, CreditCard, Headphones, UserCheck, Sparkles
} from 'lucide-react';
import { Language, TabType, User } from '../../types';
import { translations } from '../../i18n/translations';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  lang: Language;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  user?: User | null;
  onOpenQuickSale?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  lang,
  isMobileOpen = false,
  onCloseMobile,
  user,
  onOpenQuickSale
}) => {
  const t = translations[lang];

  const menuSections = [
    {
      title: lang === 'bn' ? 'প্রধান কার্যক্রম' : 'Core Business',
      items: [
        { id: 'dashboard' as TabType, label: t.dashboard, icon: LayoutDashboard },
        { id: 'pos' as TabType, label: t.pos, icon: ShoppingCart },
        { id: 'voice_assistant' as TabType, label: lang === 'bn' ? 'ভয়েস কথোপকথন' : 'Voice Assistant', icon: Sparkles },
        { id: 'sales' as TabType, label: lang === 'bn' ? 'বিক্রয় তালিকা ও ফেরত' : 'Sales & Returns', icon: ShoppingBag },
        { id: 'due_khata' as TabType, label: t.dueKhata, icon: Wallet },
      ]
    },
    {
      title: lang === 'bn' ? 'ইনভেন্টরি ও ক্রয়' : 'Inventory & Purchase',
      items: [
        { id: 'products' as TabType, label: lang === 'bn' ? 'সকল পণ্য' : 'All Products', icon: Package },
        { id: 'purchases' as TabType, label: lang === 'bn' ? 'ক্রয় ও সরবরাহ' : 'Purchases & Supplies', icon: ShoppingBag },
        { id: 'suppliers' as TabType, label: lang === 'bn' ? 'সরবরাহকারী' : 'Suppliers', icon: Users },
      ]
    },
    {
      title: lang === 'bn' ? 'হিসাব ও অর্থ' : 'Finance & Ledger',
      items: [
        { id: 'customers' as TabType, label: t.customers, icon: Users },
        { id: 'expenses' as TabType, label: t.expenses, icon: DollarSign },
        { id: 'cash_flow' as TabType, label: t.cashFlow, icon: Banknote },
        { id: 'sms_center' as TabType, label: t.smsCenter || (lang === 'bn' ? 'SMS কেন্দ্র' : 'SMS Center'), icon: MessageSquare },
      ]
    },
    {
      title: t.admin || (lang === 'bn' ? 'অ্যাডমিন' : 'ADMIN'),
      items: [
        { id: 'attendance' as TabType, label: t.attendance || 'Attendance', icon: Clock },
        { id: 'warranty_check' as TabType, label: t.warrantyCheck || 'Warranty Check', icon: ShieldCheck },
        { id: 'reports' as TabType, label: t.reports, icon: BarChart3 },
        { id: 'users_management' as TabType, label: t.userManagement || (lang === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'User Management'), icon: Users },
        { id: 'billing_upgrade' as TabType, label: t.billingUpgrade || (lang === 'bn' ? 'বিলিং ও আপগ্রেড' : 'Billing & Upgrade'), icon: CreditCard },
        { id: 'customer_support' as TabType, label: t.customerSupport || (lang === 'bn' ? 'কাস্টমার সাপোর্ট' : 'Customer Support'), icon: Headphones },
        { id: 'settings' as TabType, label: t.settings, icon: Settings },
      ]
    }
  ];

  const userName = user?.name || (lang === 'bn' ? 'এডমিন' : 'Admin');
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="main-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0b101d] border-r border-[#192238] transition-all duration-300 select-none flex-shrink-0 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#192238]">
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-950/60 flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                  {t.appName}
                </h1>
                <p className="text-[10px] font-semibold text-indigo-400 tracking-wider">
                  {t.appSubtitle}
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Sale Action Button */}
        {onOpenQuickSale && (
          <div className="px-3 pt-4 pb-2">
            <button
              id="btn-quick-sale-sidebar"
              onClick={() => {
                onOpenQuickSale();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 px-3.5 rounded-xl flex items-center justify-between shadow-md shadow-indigo-900/40 transition-all active:scale-95 group"
              title={t.quickSale}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform" />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="text-sm font-semibold">{t.quickSale} (F2)</span>
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <p className="px-2 text-[10px] font-bold text-slate-400/80 tracking-wider uppercase">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/50'
                          : 'text-slate-300 hover:text-white hover:bg-[#131b2e]'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {(!isCollapsed || isMobileOpen) && isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Profile / Account Card */}
        <div className="p-3 border-t border-[#192238] bg-[#090d18]">
          <div
            id="user-profile-widget"
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#131b2e] cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-inner">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={userName} className="w-full h-full rounded-xl object-cover" />
              ) : (
                userInitials
              )}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user ? user.email || 'Cloud Synced' : (lang === 'bn' ? 'লোকাল মোড' : 'Local Mode')}
                </p>
              </div>
            )}
            {(!isCollapsed || isMobileOpen) && (
              <Settings className="w-4 h-4 text-slate-400 hover:text-white" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
