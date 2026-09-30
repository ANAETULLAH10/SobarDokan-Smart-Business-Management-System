import React, { useState } from 'react';
import {
  Crown, Store, Users, UserCheck, ShieldAlert, Clock, Search, Filter,
  Plus, Edit2, Trash2, CheckCircle2, XCircle, Key, RefreshCw, Phone,
  Mail, Calendar, DollarSign, ArrowUpRight, MessageSquare, Download,
  Cloud, Save, Sparkles, AlertTriangle, ShieldCheck, Check, ChevronDown
} from 'lucide-react';
import { User, Language, OwnerConfig } from '../../types';
import { StorageService } from '../../services/storage';

interface OwnerMasterPanelProps {
  currentUser: User | null;
  lang: Language;
  onNavigateTab: (tab: any) => void;
  onRefreshAllState: () => void;
}

export const OwnerMasterPanel: React.FC<OwnerMasterPanelProps> = ({
  currentUser,
  lang,
  onNavigateTab,
  onRefreshAllState
}) => {
  const isBn = lang === 'bn';

  // State
  const [activeTab, setActiveTab] = useState<'shops' | 'payment_settings' | 'cloud_backup'>('shops');
  const [users, setUsers] = useState<User[]>(StorageService.getRegisteredUsers());
  const [ownerConfig, setOwnerConfig] = useState<OwnerConfig>(StorageService.getOwnerConfig());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'trial' | 'active' | 'suspended'>('all');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activatingUser, setActivatingUser] = useState<User | null>(null);
  const [extendingUser, setExtendingUser] = useState<User | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Add / Edit form state
  const [formName, setFormName] = useState('');
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPlan, setFormPlan] = useState('3-Day Free Trial');
  const [formStatus, setFormStatus] = useState<'trial' | 'active' | 'suspended'>('trial');
  const [formValidityDays, setFormValidityDays] = useState('3');

  // Activate modal form state
  const [selectedPlanName, setSelectedPlanName] = useState('Business Pro');
  const [customDays, setCustomDays] = useState('30');

  // Reset password state
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Payment settings form state
  const [paymentForm, setPaymentForm] = useState<OwnerConfig>(ownerConfig);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const refreshUsersList = () => {
    setUsers(StorageService.getRegisteredUsers());
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      (u.businessName && u.businessName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'trial') return u.subscriptionStatus === 'trial';
    if (statusFilter === 'active') return u.subscriptionStatus === 'active';
    if (statusFilter === 'suspended') return u.subscriptionStatus === 'suspended' || u.subscriptionStatus === 'expired';
    return true;
  });

  // Analytics Metrics
  const totalShops = users.length;
  const trialShops = users.filter((u) => u.subscriptionStatus === 'trial').length;
  const activeShops = users.filter((u) => u.subscriptionStatus === 'active').length;
  const suspendedShops = users.filter((u) => u.subscriptionStatus === 'suspended' || u.subscriptionStatus === 'expired').length;
  const estMonthlyRev = activeShops * (ownerConfig.monthlyPrice || 500);

  // Handlers
  const handleOpenAdd = () => {
    setFormName('');
    setFormBusinessName('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword('');
    setFormPlan('3-Day Free Trial');
    setFormStatus('trial');
    setFormValidityDays('3');
    setIsAddModalOpen(true);
  };

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBusinessName.trim() || !formName.trim() || !formPhone.trim()) {
      showNotification(isBn ? 'দোকানের নাম, মালিকের নাম এবং মোবাইল নম্বর আবশ্যক!' : 'Store name, owner name and phone are required!');
      return;
    }

    const now = new Date();
    const days = parseInt(formValidityDays, 10) || 3;
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const newUser: User = {
      uid: 'usr-' + Date.now(),
      name: formName.trim(),
      businessName: formBusinessName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || `${formPhone.trim()}@sobardokan.app`,
      password: formPassword.trim() || '123456',
      role: 'admin',
      createdAt: now.toISOString(),
      trialStartDate: now.toISOString(),
      trialEndsAt: expiresAt,
      subscriptionStatus: formStatus,
      subscriptionPlan: formPlan,
    };

    StorageService.saveRegisteredUser(newUser);
    refreshUsersList();
    setIsAddModalOpen(false);
    showNotification(isBn ? `"${newUser.businessName}" সফলভাবে তৈরি হয়েছে!` : `Client "${newUser.businessName}" created successfully!`);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormBusinessName(u.businessName || '');
    setFormPhone(u.phone || '');
    setFormEmail(u.email || '');
    setFormPlan(u.subscriptionPlan || '3-Day Free Trial');
    setFormStatus(u.subscriptionStatus || 'trial');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    StorageService.updateRegisteredUser(editingUser.uid, {
      name: formName.trim(),
      businessName: formBusinessName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      subscriptionPlan: formPlan,
      subscriptionStatus: formStatus,
    });

    refreshUsersList();
    setEditingUser(null);
    showNotification(isBn ? 'দোকানের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Store info updated successfully!');
  };

  const handleActivateSubscription = (u: User) => {
    setActivatingUser(u);
    setSelectedPlanName(u.subscriptionPlan || 'Business Pro');
    setCustomDays('30');
  };

  const handleConfirmActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activatingUser) return;

    const days = parseInt(customDays, 10) || 30;
    StorageService.activateUserSubscription(activatingUser.uid, selectedPlanName, days);
    refreshUsersList();
    setActivatingUser(null);
    showNotification(
      isBn
        ? `"${activatingUser.businessName || activatingUser.name}" এর সাবস্ক্রিপশন সক্রিয় করা হয়েছে!`
        : `Subscription activated for "${activatingUser.businessName || activatingUser.name}"!`
    );
  };

  const handleSuspendUser = (u: User) => {
    if (confirm(isBn ? `আপনি কি নিশ্চিত যে "${u.businessName || u.name}" এর অ্যাকাউন্ট স্থগিত করতে চান?` : `Are you sure you want to suspend "${u.businessName || u.name}"?`)) {
      StorageService.suspendUserSubscription(u.uid);
      refreshUsersList();
      showNotification(isBn ? 'অ্যাকাউন্ট স্থগিত করা হয়েছে!' : 'Account suspended successfully!');
    }
  };

  const handleExtendTrial = (u: User, days: number) => {
    StorageService.extendUserTrial(u.uid, days);
    refreshUsersList();
    setExtendingUser(null);
    showNotification(isBn ? `ট্রায়ালের মেয়াদ আরও ${days} দিন বৃদ্ধি করা হয়েছে!` : `Trial extended by ${days} days!`);
  };

  const handleConfirmPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPasswordInput.trim()) return;

    StorageService.resetUserPassword(passwordModalUser.uid, newPasswordInput.trim());
    setPasswordModalUser(null);
    setNewPasswordInput('');
    showNotification(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password reset successfully!');
  };

  const handleDeleteUser = (u: User) => {
    StorageService.deleteRegisteredUser(u.uid);
    refreshUsersList();
    setDeleteConfirmUser(null);
    showNotification(isBn ? 'দোকান অ্যাকাউন্ট ডিলিট করা হয়েছে!' : 'Shop deleted successfully!');
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveOwnerConfig(paymentForm);
    setOwnerConfig(paymentForm);
    showNotification(isBn ? 'মালিকের পেমেন্ট ও যোগাযোগের তথ্য সংরক্ষিত হয়েছে!' : 'Owner payment & contact settings saved successfully!');
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      await StorageService.syncToFirestore();
      showNotification(isBn ? 'Firestore ক্লাউডে সমস্ত ডাটা সফলভাবে ব্যাকআপ হয়েছে!' : 'Cloud backup to Firestore completed!');
    } catch (err: any) {
      showNotification(isBn ? 'সিঙ্ক ত্রুটি: ' + (err?.message || 'নেটওয়ার্ক সমস্যা') : 'Cloud sync error: ' + err?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      owner: ownerConfig,
      registeredUsers: users,
      system: 'SobarDokan POS Management System',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SobarDokan_Master_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification(isBn ? 'মাস্টার ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন হয়েছে!' : 'Master backup file downloaded!');
  };

  // Helper remaining days
  const getRemainingTime = (u: User) => {
    if (u.subscriptionStatus === 'active') {
      return { label: isBn ? 'সক্রিয় (Paid)' : 'Active Paid', isPositive: true };
    }
    if (u.subscriptionStatus === 'suspended' || u.subscriptionStatus === 'expired') {
      return { label: isBn ? 'স্থগিত (Suspended)' : 'Suspended', isPositive: false };
    }
    if (!u.trialEndsAt) {
      return { label: isBn ? 'ট্রায়াল' : 'Trial', isPositive: true };
    }
    const diff = new Date(u.trialEndsAt).getTime() - Date.now();
    if (diff <= 0) {
      return { label: isBn ? 'মেয়াদোত্তীর্ণ' : 'Expired', isPositive: false };
    }
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) {
      return { label: isBn ? `${days} দিন ${hours} ঘণ্টা বাকি` : `${days}d ${hours}h left`, isPositive: true };
    }
    return { label: isBn ? `${hours} ঘণ্টা বাকি` : `${hours}h left`, isPositive: true };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-purple-500/0 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'সুপার অ্যাডমিন ও সফটওয়্যার ওনার' : 'Super Admin & Software Owner'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isBn ? 'সবার দোকান – মাস্টার ওনার কন্ট্রোল প্যানেল' : 'SobarDokan – Master Owner Control Panel'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              {isBn
                ? 'আপনার সফটওয়্যারের সকল ক্লায়েন্ট, দোকান, ৩ দিনের ট্রায়াল, অ্যাক্টিভেশন, সাবস্ক্রিপশন ফি ও নগদ/বিকাশ পেমেন্ট এখান থেকে সম্পূর্ণরূপে পরিচালনা করুন।'
                : 'Manage all client shops, 3-day free trials, activations, subscription pricing, and bKash/Nagad payouts from here.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 border border-white/15"
            >
              <Store className="w-4 h-4 text-indigo-300" />
              <span>{isBn ? 'আমার নিজস্ব শপ ড্যাশবোর্ড' : 'My Store POS'}</span>
            </button>
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isBn ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (isBn ? 'ক্লাউড সিঙ্ক' : 'Cloud Sync')}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">{isBn ? 'মোট রেজিস্টার্ড শপ' : 'Total Shops'}</span>
              <Store className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-white">{totalShops}</div>
            <span className="text-[11px] text-cyan-300 font-medium">{isBn ? 'সবার দোকান ক্লায়েন্ট' : 'All Registered'}</span>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-md rounded-2xl p-4 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-200">{isBn ? '৩ দিনের ট্রায়ালে আছে' : 'Active 3-Day Trials'}</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-amber-300">{trialShops}</div>
            <span className="text-[11px] text-amber-300 font-medium">{isBn ? 'নতুন ইউজার' : 'Potential buyers'}</span>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200">{isBn ? 'সক্রিয় পেইড শপ' : 'Active Subscribers'}</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-emerald-300">{activeShops}</div>
            <span className="text-[11px] text-emerald-300 font-medium">{isBn ? 'প্রিমিয়াম লাইসেন্স' : 'Subscribed'}</span>
          </div>

          <div className="bg-rose-500/10 backdrop-blur-md rounded-2xl p-4 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-200">{isBn ? 'স্থগিত / মেয়াদ শেষ' : 'Suspended / Expired'}</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-rose-300">{suspendedShops}</div>
            <span className="text-[11px] text-rose-300 font-medium">{isBn ? 'অ্যাক্টিভেশন পেন্ডিং' : 'Action needed'}</span>
          </div>

          <div className="bg-purple-500/10 backdrop-blur-md rounded-2xl p-4 border border-purple-500/20 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-200">{isBn ? 'মাসিক রাজস্ব রান-রেট' : 'Monthly Run-Rate'}</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-purple-300">৳{estMonthlyRev.toLocaleString('bn-BD')}</div>
            <span className="text-[11px] text-purple-300 font-medium">{isBn ? 'সাবস্ক্রিপশন ইনকাম' : 'Est. MRR'}</span>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'shops'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{isBn ? 'সকল দোকান ও ক্লায়েন্ট তালিকা' : 'All Client Stores'}</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">{users.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('payment_settings')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'payment_settings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{isBn ? 'ওনারের পেমেন্ট ও প্যাকেজ মূল্য' : 'Owner Payment & Pricing'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud_backup')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'cloud_backup'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>{isBn ? 'ক্লাউড ব্যাকআপ ও এক্সপোর্ট' : 'Cloud Backup & Export'}</span>
        </button>
      </div>

      {/* TAB 1: SHOPS & CLIENTS MANAGEMENT */}
      {activeTab === 'shops' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? 'দোকানের নাম, মালিকের নাম, মোবাইল বা ইমেইল খুঁজুন...' : 'Search by store name, owner, phone or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'trial', 'active', 'suspended'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' && (isBn ? 'সব' : 'All')}
                  {st === 'trial' && (isBn ? '৩ দিনের ট্রায়াল' : 'Trials')}
                  {st === 'active' && (isBn ? 'সক্রিয়' : 'Active')}
                  {st === 'suspended' && (isBn ? 'স্থগিত' : 'Suspended')}
                </button>
              ))}
            </div>

            {/* Add New Client Button */}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন দোকান যুক্ত করুন' : 'Add New Client Store'}</span>
            </button>
          </div>

          {/* Shops Table / Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">{isBn ? 'দোকান ও মালিকের তথ্য' : 'Store & Owner'}</th>
                    <th className="py-4 px-4">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                    <th className="py-4 px-4">{isBn ? 'নিবন্ধনের তারিখ' : 'Registered Date'}</th>
                    <th className="py-4 px-4">{isBn ? 'বর্তমান প্যাকেজ' : 'Plan'}</th>
                    <th className="py-4 px-4">{isBn ? 'ট্রায়াল / স্ট্যাটাস' : 'Status & Trial'}</th>
                    <th className="py-4 px-6 text-right">{isBn ? 'মালিক অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        {isBn ? 'কোনো দোকান পাওয়া যায়নি।' : 'No store accounts found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const remaining = getRemainingTime(u);
                      return (
                        <tr
                          key={u.uid}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                        >
                          {/* Store & Owner Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                {u.businessName ? u.businessName[0]?.toUpperCase() : 'S'}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                  {u.businessName || (isBn ? 'নামহীন দোকান' : 'Unnamed Store')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.email === 'mdanaetullah2021@gmail.com' && (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded">
                                      Owner
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-4 px-4">
                            <div className="space-y-1 text-xs">
                              {u.phone && (
                                <a
                                  href={`tel:${u.phone}`}
                                  className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1.5"
                                >
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{u.phone}</span>
                                </a>
                              )}
                              {u.email && (
                                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate max-w-[180px]">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="truncate">{u.email}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </td>

                          {/* Current Plan */}
                          <td className="py-4 px-4">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                              {u.subscriptionPlan || '3-Day Free Trial'}
                            </span>
                          </td>

                          {/* Status & Trial remaining */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div>
                                {u.subscriptionStatus === 'active' && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{isBn ? 'সক্রিয় পেইড' : 'Active'}</span>
                                  </span>
                                )}
                                {u.subscriptionStatus === 'trial' && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                                    <Clock className="w-3 h-3" />
                                    <span>{isBn ? '৩ দিনের ট্রায়াল' : 'Trial'}</span>
                                  </span>
                                )}
                                {(u.subscriptionStatus === 'suspended' || u.subscriptionStatus === 'expired') && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/40">
                                    <XCircle className="w-3 h-3" />
                                    <span>{isBn ? 'স্থগিত / বন্ধ' : 'Suspended'}</span>
                                  </span>
                                )}
                              </div>
                              <p className={`text-[11px] font-medium ${remaining.isPositive ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500 font-bold'}`}>
                                {remaining.label}
                              </p>
                            </div>
                          </td>

                          {/* Owner Action Buttons */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Activate / Approve Button */}
                              <button
                                onClick={() => handleActivateSubscription(u)}
                                title={isBn ? 'প্যাকেজ সক্রিয় / অনুমোদন করুন' : 'Activate Subscription'}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">{isBn ? 'সক্রিয়' : 'Activate'}</span>
                              </button>

                              {/* Extend Trial */}
                              <div className="relative group/ext">
                                <button
                                  onClick={() => handleExtendTrial(u, 3)}
                                  title={isBn ? 'ট্রায়াল ৩ দিন বৃদ্ধি করুন' : 'Extend Trial +3 Days'}
                                  className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold transition flex items-center gap-0.5 cursor-pointer border border-amber-200 dark:border-amber-800"
                                >
                                  <span>+৩ দিন</span>
                                </button>
                              </div>

                              {/* Suspend Toggle */}
                              {u.subscriptionStatus !== 'suspended' && u.email !== 'mdanaetullah2021@gmail.com' && (
                                <button
                                  onClick={() => handleSuspendUser(u)}
                                  title={isBn ? 'অ্যাকাউন্ট স্থগিত করুন' : 'Suspend Account'}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              )}

                              {/* Edit details */}
                              <button
                                onClick={() => handleOpenEdit(u)}
                                title={isBn ? 'দোকানের তথ্য এডিট করুন' : 'Edit Details'}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  setPasswordModalUser(u);
                                  setNewPasswordInput('');
                                }}
                                title={isBn ? 'পাসওয়ার্ড পরিবর্তন / রিসেট' : 'Reset Password'}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition cursor-pointer"
                              >
                                <Key className="w-4 h-4" />
                              </button>

                              {/* Delete Shop */}
                              {u.email !== 'mdanaetullah2021@gmail.com' && (
                                <button
                                  onClick={() => setDeleteConfirmUser(u)}
                                  title={isBn ? 'দোকান ডিলিট / রিমুভ করুন' : 'Delete Shop'}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OWNER PAYMENT & PRICING SETTINGS */}
      {activeTab === 'payment_settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBn ? 'মালিকের পেমেন্ট ও যোগাযোগের সেটিংস' : 'Owner Payment & Contact Settings'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isBn
                  ? 'এই তথ্যগুলো ক্লায়েন্টদের ৩ দিনের ট্রায়াল শেষ হলে দেখানো হবে, যাতে তারা সরাসরি আপনার বিকাশ/নগদে টাকা পাঠিয়ে বা হোয়াটসঅ্যাপে যোগাযোগ করে অ্যাকাউন্ট চালু করতে পারে।'
                  : 'Clients will see these payment and WhatsApp details when their 3-day trial expires.'}
              </p>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ওনারের নাম (Owner Name)' : 'Owner Name'}
                  </label>
                  <input
                    type="text"
                    value={paymentForm.ownerName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, ownerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ওনারের মোবাইল নম্বর (Call Support)' : 'Support Phone'}
                  </label>
                  <input
                    type="text"
                    value={paymentForm.ownerPhone}
                    onChange={(e) => setPaymentForm({ ...paymentForm, ownerPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="01700-000000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'WhatsApp নম্বর (দেশীয় কোডসহ, যেমন 88017...)' : 'WhatsApp Number (with country code)'}
                  </label>
                  <input
                    type="text"
                    value={paymentForm.ownerWhatsApp}
                    onChange={(e) => setPaymentForm({ ...paymentForm, ownerWhatsApp: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="8801700000000"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBn ? 'ট্রায়াল পেইজে সরাসরি হোয়াটসঅ্যাপে চ্যাট করার বাটন যুক্ত হবে।' : 'Creates one-click WhatsApp chat link.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ওনারের ইমেইল (Owner Email)' : 'Owner Email'}
                  </label>
                  <input
                    type="email"
                    value={paymentForm.ownerEmail}
                    onChange={(e) => setPaymentForm({ ...paymentForm, ownerEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* MFS Payment Details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>{isBn ? 'মোবাইল ব্যাংকিং পেমেন্ট নম্বরসমূহ (MFS Numbers)' : 'Mobile Banking Accounts'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-pink-600 dark:text-pink-400 mb-1">
                      {isBn ? 'বিকাশ নম্বর (bKash)' : 'bKash Number'}
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bKashNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bKashNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-pink-500"
                      placeholder="017... (Personal)"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-orange-600 dark:text-orange-400 mb-1">
                      {isBn ? 'নগদ নম্বর (Nagad)' : 'Nagad Number'}
                    </label>
                    <input
                      type="text"
                      value={paymentForm.nagadNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, nagadNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-orange-500"
                      placeholder="017... (Personal)"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">
                      {isBn ? 'রকেট নম্বর (Rocket)' : 'Rocket Number'}
                    </label>
                    <input
                      type="text"
                      value={paymentForm.rocketNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, rocketNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500"
                      placeholder="017...-0"
                    />
                  </div>
                </div>
              </div>

              {/* Package Pricing Setup */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>{isBn ? 'সাবস্ক্রিপশন প্যাকেজের মূল্য নির্ধারণ (Pricing BDT)' : 'Package Pricing Setup (BDT)'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? 'মাসিক প্যাকেজ (টাকা)' : 'Monthly Plan (BDT)'}
                    </label>
                    <input
                      type="number"
                      value={paymentForm.monthlyPrice}
                      onChange={(e) => setPaymentForm({ ...paymentForm, monthlyPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? 'বাৎসরিক প্যাকেজ (টাকা)' : 'Yearly Plan (BDT)'}
                    </label>
                    <input
                      type="number"
                      value={paymentForm.yearlyPrice}
                      onChange={(e) => setPaymentForm({ ...paymentForm, yearlyPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? 'লাইফটাইম প্যাকেজ (টাকা)' : 'Lifetime Plan (BDT)'}
                    </label>
                    <input
                      type="number"
                      value={paymentForm.lifetimePrice}
                      onChange={(e) => setPaymentForm({ ...paymentForm, lifetimePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Owner Settings'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Preview Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ক্লায়েন্ট ভিউ প্রিভিউ' : 'Client Pay Preview'}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn
                ? 'ক্লায়েন্টের ট্রায়াল শেষ হলে তারা আপনার নিচের তথ্যগুলো দেখতে পাবে:'
                : 'Clients will see this contact info when their trial expires:'}
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <span className="text-slate-400">{isBn ? 'বিকাশ পার্সোনাল:' : 'bKash:'}</span>
                <p className="font-bold text-pink-400">{paymentForm.bKashNumber || 'N/A'}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <span className="text-slate-400">{isBn ? 'নগদ পার্সোনাল:' : 'Nagad:'}</span>
                <p className="font-bold text-orange-400">{paymentForm.nagadNumber || 'N/A'}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                <span className="text-slate-400">{isBn ? 'সরাসরি হোয়াটসঅ্যাপ লিংক:' : 'WhatsApp Direct:'}</span>
                <a
                  href={`https://wa.me/${paymentForm.ownerWhatsApp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>+{paymentForm.ownerWhatsApp || 'N/A'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLOUD BACKUP & EXPORT */}
      {activeTab === 'cloud_backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'ক্লাউড ব্যাকআপ ও ডেটা রিমোট সিঙ্ক' : 'Cloud Backup & Remote Synchronization'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'আপনার রেজিস্টার্ড ক্লায়েন্টদের ডেটা Firebase Firestore ক্লাউডে সিঙ্ক রাখুন অথবা লোকাল ব্যাকআপ হিসেবে JSON ফাইল নামিয়ে রাখুন।'
                : 'Keep all registered clients safe with Firebase Firestore cloud storage and offline JSON backups.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isBn ? 'Firestore ক্লাউড সিঙ্ক' : 'Firestore Cloud Sync'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'সমস্ত ক্লায়েন্ট লিস্ট ও শপ সেটিংস ক্লাউড ডাটাবেজে সংরক্ষণ করুন।'
                  : 'Sync all registered client stores and settings directly to Firebase.'}
              </p>
              <button
                onClick={handleCloudSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? (isBn ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (isBn ? 'এখনই ক্লাউড সিঙ্ক করুন' : 'Sync to Cloud Now')}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isBn ? 'মাস্টার JSON ব্যাকআপ এক্সপোর্ট' : 'Download Master Backup (JSON)'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'সকল ক্লায়েন্ট একাউন্ট, সাবস্ক্রিপশন হিস্ট্রি ও সেটিংস অফলাইন ফাইলে ডাউনলোড করুন।'
                  : 'Export full snapshot of all registered stores for disaster recovery.'}
              </p>
              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? 'ব্যাকআপ ডাউনলোড করুন' : 'Download Backup JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CLIENT STORE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {isBn ? 'নতুন দোকান / ক্লায়েন্ট তৈরি করুন' : 'Create New Client Store'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'সরাসরি নতুন ক্লায়েন্টের অ্যাকাউন্ট সেটআপ করুন' : 'Provision store account with custom trial or package'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'দোকানের নাম (Store Name) *' : 'Store Name *'}
                </label>
                <input
                  type="text"
                  value={formBusinessName}
                  onChange={(e) => setFormBusinessName(e.target.value)}
                  placeholder={isBn ? 'যেমন: ভাই ভাই স্টোর' : 'e.g., Bhai Bhai General Store'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মালিকের নাম (Owner Name) *' : 'Owner Name *'}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={isBn ? 'যেমন: মো: সেলিম' : 'e.g., Md. Selim'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মোবাইল নম্বর (Phone) *' : 'Phone *'}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01711-000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="selim@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্রাথমিক পাসওয়ার্ড' : 'Initial Password'}
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'সাবস্ক্রিপশন স্ট্যাটাস' : 'Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="trial">{isBn ? '৩ দিনের ফ্রি ট্রায়াল (Trial)' : '3-Day Free Trial'}</option>
                    <option value="active">{isBn ? 'সক্রিয় পেইড (Active)' : 'Active Paid'}</option>
                    <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মেয়াদ (দিন সংখ্যা)' : 'Validity (Days)'}
                  </label>
                  <input
                    type="number"
                    value={formValidityDays}
                    onChange={(e) => setFormValidityDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md shadow-indigo-600/30"
                >
                  {isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STORE INFO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isBn ? 'দোকানের তথ্য এডিট করুন' : 'Edit Store Details'}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'দোকানের নাম' : 'Store Name'}
                </label>
                <input
                  type="text"
                  value={formBusinessName}
                  onChange={(e) => setFormBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মালিকের নাম' : 'Owner Name'}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ইমেইল' : 'Email'}
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্যাকেজের নাম' : 'Subscription Plan'}
                  </label>
                  <input
                    type="text"
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'স্ট্যাটাস' : 'Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="trial">{isBn ? '৩ দিনের ট্রায়াল' : 'Trial'}</option>
                    <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md shadow-indigo-600/30"
                >
                  {isBn ? 'আপডেট করুন' : 'Update Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACTIVATE SUBSCRIPTION */}
      {activatingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isBn ? 'সাবস্ক্রিপশন সক্রিয় ও অনুমোদন' : 'Activate Subscription'}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {activatingUser.businessName || activatingUser.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmActivation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'প্যাকেজ নির্বাচন করুন' : 'Select Plan'}
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'Business Pro (Monthly)', label: isBn ? 'মাসিক প্যাকেজ (৩০ দিন)' : 'Monthly Plan (30 Days)', days: 30 },
                    { id: 'Business Pro (Yearly)', label: isBn ? 'বাৎসরিক প্যাকেজ (৩৬৫ দিন)' : 'Yearly Plan (365 Days)', days: 365 },
                    { id: 'Lifetime Unlimited', label: isBn ? 'লাইফটাইম আনলিমিটেড (আজীবন)' : 'Lifetime Unlimited', days: 3650 },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPlanName(p.id);
                        setCustomDays(String(p.days));
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        selectedPlanName === p.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{p.label}</span>
                      {selectedPlanName === p.id && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'কাস্টম মেয়াদ (দিন সংখ্যা)' : 'Validity Days'}
                </label>
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivatingUser(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-md shadow-emerald-600/30"
                >
                  {isBn ? 'অনুমোদন ও সক্রিয় করুন' : 'Confirm & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET CLIENT PASSWORD */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password'}
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {passwordModalUser.businessName || passwordModalUser.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'নতুন পাসওয়ার্ড লিখুন' : 'New Password'}
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  {isBn ? 'পাসওয়ার্ড সেট করুন' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isBn ? 'দোকান ডিলিট নিশ্চিত করুন' : 'Confirm Shop Deletion'}
                </h3>
                <p className="text-xs text-rose-500 font-medium">
                  {deleteConfirmUser.businessName || deleteConfirmUser.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {isBn
                ? 'আপনি কি নিশ্চিত যে এই দোকান অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।'
                : 'Are you sure you want to permanently delete this client store? This cannot be undone.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
