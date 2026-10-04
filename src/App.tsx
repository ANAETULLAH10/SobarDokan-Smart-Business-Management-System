import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { QuickSaleModal } from './components/pos/QuickSaleModal';
import { InvoiceModal } from './components/pos/InvoiceModal';
import { ProductsView } from './components/products/ProductsView';
import { ProductFormModal } from './components/products/ProductFormModal';
import { CustomersView } from './components/customers/CustomersView';
import { DueLedgerView } from './components/customers/DueLedgerView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { CashFlowView } from './components/finance/CashFlowView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView, SettingsTabId } from './components/settings/SettingsView';
import { SalesView } from './components/sales/SalesView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { SMSCenterView } from './components/sms/SMSCenterView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { WarrantyCheckView } from './components/warranty/WarrantyCheckView';
import { UserManagementView } from './components/users/UserManagementView';
import { BillingUpgradeView } from './components/billing/BillingUpgradeView';
import { CustomerSupportView } from './components/support/CustomerSupportView';
import { VoiceConversationView } from './components/voice/VoiceConversationView';
import { VoiceConversationModal } from './components/voice/VoiceConversationModal';
import { ToastContainer } from './components/common/ToastContainer';
import { PDFPreviewModal } from './components/common/PDFPreviewModal';
import { AuthView } from './components/auth/AuthView';
import { TrialSuspendedView } from './components/auth/TrialSuspendedView';
import { OwnerMasterPanel } from './components/admin/OwnerMasterPanel';
import { Sparkles } from 'lucide-react';

import {
  Language, ThemeMode, TabType, Product, Customer, Supplier,
  Sale, Purchase, Expense, Category, BusinessSettings, User,
  ToastNotification
} from './types';
import { translations } from './i18n/translations';
import { StorageService } from './services/storage';
import { auth, googleProvider } from './services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export const App: React.FC = () => {
  // Application State
  const [lang, setLang] = useState<Language>(StorageService.getLanguage());
  const [theme, setTheme] = useState<ThemeMode>(StorageService.getTheme());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Business Data State
  const [settings, setSettings] = useState<BusinessSettings>(StorageService.getSettings());
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories());
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(StorageService.getSuppliers());
  const [sales, setSales] = useState<Sale[]>(StorageService.getSales());
  const [purchases, setPurchases] = useState<Purchase[]>(StorageService.getPurchases());
  const [expenses, setExpenses] = useState<Expense[]>(StorageService.getExpenses());

  // User & Sync State
  const [user, setUser] = useState<User | null>(StorageService.getUser());
  const [isSyncing, setIsSyncing] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabId>('profile');

  // Modals State
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [activeInvoiceSale, setActiveInvoiceSale] = useState<Sale | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [productsInitialStockFilter, setProductsInitialStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [smsCustomerId, setSmsCustomerId] = useState<string | undefined>(undefined);

  const handleNavigateToSms = useCallback((customerId?: string) => {
    setSmsCustomerId(customerId);
    setActiveTab('sms_center');
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'> & { id?: string }) => {
    const id = toast.id || 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => {
      const withoutSameId = prev.filter((t) => t.id !== id);
      return [...withoutSameId, { ...toast, id, timestamp: Date.now() }];
    });
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Refresh all state from local-first storage
  const refreshAllState = useCallback(() => {
    setProducts(StorageService.getProducts());
    setCustomers(StorageService.getCustomers());
    setSuppliers(StorageService.getSuppliers());
    setSales(StorageService.getSales());
    setPurchases(StorageService.getPurchases());
    setExpenses(StorageService.getExpenses());
    setCategories(StorageService.getCategories());
    setSettings(StorageService.getSettings());
  }, []);

  // Firebase Auth Listener & Initial Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const existing = StorageService.findUserByEmail(firebaseUser.email || '');
        const now = new Date();
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const isOwner = firebaseUser.email === 'mdanaetullah2021@gmail.com' || existing?.isOwner;
        const u: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || existing?.name || (isOwner ? 'MD ANAETULLAH' : 'দোকানদার'),
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          role: isOwner ? 'superadmin' : 'admin',
          isOwner,
          businessName: existing?.businessName || settings.businessName,
          phone: existing?.phone || '',
          createdAt: existing?.createdAt || now.toISOString(),
          trialStartDate: existing?.trialStartDate || now.toISOString(),
          trialEndsAt: isOwner
            ? new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000).toISOString()
            : existing?.trialEndsAt || threeDaysLater.toISOString(),
          subscriptionStatus: isOwner ? 'active' : existing?.subscriptionStatus || 'trial',
          subscriptionPlan: isOwner ? 'Lifetime Owner Unlimited' : existing?.subscriptionPlan || '3-Day Free Trial',
        };
        setUser(u);
        StorageService.saveUser(u);
        StorageService.saveRegisteredUser(u);

        // Background sync to Firestore
        try {
          setIsSyncing(true);
          await StorageService.pullFromFirestore();
          refreshAllState();
        } catch (e) {
          console.warn('Initial cloud pull skipped/failed:', e);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, [refreshAllState, settings.businessName]);

  // Global Keyboard Shortcuts (F1: POS, F2: Quick Sale, F3: Products)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F2' && activeTab !== 'pos') {
        e.preventDefault();
        setIsQuickSaleOpen(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('products');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Stock alert threshold notification whenever logged-in user is on Dashboard
  // CRITICAL: Absolutely never show on login/auth view or when user is not logged in!
  useEffect(() => {
    if (!user || activeTab !== 'dashboard') {
      dismissToast('low-stock-dashboard-alert');
      return;
    }

    const lowStockItems = products.filter(
      (p) => p.currentStock <= (p.minStockAlert ?? 5)
    );

    if (lowStockItems.length > 0) {
      const outOfStockCount = lowStockItems.filter((p) => p.currentStock <= 0).length;

      const timer = setTimeout(() => {
        // Ensure user is still actively logged in before adding toast
        if (StorageService.getUser()) {
          addToast({
            id: 'low-stock-dashboard-alert',
            type: 'warning',
            title: lang === 'bn' ? 'স্টক সতর্কবার্তা!' : 'Low Stock Alert!',
            message:
              lang === 'bn'
                ? `${lowStockItems.length}টি পণ্যের স্টক ন্যূনতম সতর্কসীমায় নেমে এসেছে${
                    outOfStockCount > 0 ? ` (${outOfStockCount}টি পণ্য স্টক শূন্য)` : ''
                  }:`
                : `${lowStockItems.length} product(s) reached their minimum stock alert threshold${
                    outOfStockCount > 0 ? ` (${outOfStockCount} out of stock)` : ''
                  }:`,
            productDetails: lowStockItems.map((p) => ({
              id: p.id,
              name: p.name,
              banglaName: p.banglaName,
              currentStock: p.currentStock,
              minStockAlert: p.minStockAlert,
              unit: p.unit
            })),
            action: {
              label: lang === 'bn' ? 'কম স্টকের পণ্য দেখুন' : 'View Low Stock Items',
              onClick: () => {
                setProductsInitialStockFilter('low');
                setActiveTab('products');
              }
            },
            duration: 8500
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      dismissToast('low-stock-dashboard-alert');
    }
  }, [user, activeTab, products, lang, addToast, dismissToast]);

  // Ensure that if user logs out or is on auth view, all stock alerts and toasts are cleared
  useEffect(() => {
    if (!user) {
      dismissToast('low-stock-dashboard-alert');
      if (toasts.length > 0) {
        setToasts([]);
      }
    }
  }, [user, toasts.length, dismissToast]);

  // Apply Day / Night mood class to document root
  useEffect(() => {
    if (theme === 'day') {
      document.documentElement.classList.add('day-mood');
      document.documentElement.classList.remove('night-mood');
    } else {
      document.documentElement.classList.add('night-mood');
      document.documentElement.classList.remove('day-mood');
    }
  }, [theme]);

  // Handlers
  const handleLanguageToggle = () => {
    const next = lang === 'bn' ? 'en' : 'bn';
    setLang(next);
    StorageService.saveLanguage(next);
  };

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = theme === 'night' ? 'day' : 'night';
    setTheme(nextTheme);
    StorageService.saveTheme(nextTheme);
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isOwner = StorageService.isOwnerEmail(result.user.email);
      const existing = StorageService.findUserByEmail(result.user.email || '');
      const u: User = {
        uid: result.user.uid,
        name: result.user.displayName || existing?.name || (isOwner ? 'MD ANAETULLAH' : 'Admin'),
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        role: isOwner ? 'superadmin' : 'admin',
        isOwner: Boolean(isOwner),
        subscriptionStatus: isOwner ? 'active' : (existing?.subscriptionStatus || 'trial'),
        subscriptionPlan: isOwner ? 'Lifetime Owner Unlimited' : (existing?.subscriptionPlan || '3-Day Free Trial'),
      };
      setUser(u);
      StorageService.saveUser(u);
      setIsSyncing(true);
      await StorageService.syncToFirestore();
      setIsSyncing(false);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        console.info('Google login popup cancelled by user.');
      } else {
        console.warn('Login error:', err);
        addToast({
          type: 'warning',
          title: lang === 'bn' ? 'লগইন বার্তা' : 'Sign-in Notice',
          message: err?.message || 'Could not complete sign in',
        });
      }
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    StorageService.saveUser(null);
    dismissToast('low-stock-dashboard-alert');
    setToasts([]);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await StorageService.syncToFirestore();
      refreshAllState();
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNavigateSettings = (tab: SettingsTabId = 'profile') => {
    setSettingsInitialTab(tab);
    setActiveTab('settings');
  };

  const handleSaleCompleted = (sale: Sale) => {
    refreshAllState();
    setActiveInvoiceSale(sale);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveProduct = (product: Product) => {
    StorageService.saveProduct(product);
    refreshAllState();
  };

  const handleDeleteProduct = (id: string) => {
    StorageService.deleteProduct(id);
    refreshAllState();
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicate: Product = {
      ...product,
      id: 'prod-' + Date.now(),
      name: `${product.name} (Copy)`,
      banglaName: product.banglaName ? `${product.banglaName} (কপি)` : '',
      barcode: `8941${Date.now().toString().slice(-8)}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageService.saveProduct(duplicate);
    refreshAllState();
  };

  const handleSaveCustomer = (customer: Customer) => {
    StorageService.saveCustomer(customer);
    refreshAllState();
  };

  const handleDueCollected = () => {
    refreshAllState();
  };

  const handleSaveSettings = (newSettings: BusinessSettings) => {
    StorageService.saveSettings(newSettings);
    setTimeout(() => {
      setSettings(newSettings);
    }, 0);
  };

  const handleResetData = () => {
    localStorage.clear();
    setProducts(StorageService.getProducts());
    setCustomers(StorageService.getCustomers());
    setSuppliers(StorageService.getSuppliers());
    setSales(StorageService.getSales());
    setPurchases(StorageService.getPurchases());
    setExpenses(StorageService.getExpenses());
    setCategories(StorageService.getCategories());
    setSettings(StorageService.getSettings());
    alert('ডেটা সফলভাবে রিসেট করা হয়েছে!');
  };

  // Get current view title
  const t = translations[lang];
  const tabTitles: Record<TabType, string> = {
    dashboard: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    pos: lang === 'bn' ? 'POS বিক্রয়' : 'POS Sales',
    products: lang === 'bn' ? 'সকল পণ্য' : 'All Products',
    categories: lang === 'bn' ? 'ক্যাটাগরি' : 'Categories',
    sales: lang === 'bn' ? 'বিক্রয় তালিকা ও ফেরত' : 'Sales & Returns',
    purchases: lang === 'bn' ? 'ক্রয় ও সরবরাহ' : 'Purchases & Supplies',
    customers: lang === 'bn' ? 'কাস্টমার তালিকা' : 'Customers',
    due_khata: lang === 'bn' ? 'বকেয়া খাতা' : 'Due Ledger',
    suppliers: lang === 'bn' ? 'সরবরাহকারী' : 'Suppliers',
    expenses: lang === 'bn' ? 'দোকানের খরচ' : 'Expenses',
    cash_flow: lang === 'bn' ? 'ক্যাশ ফ্লো' : 'Cash Flow',
    sms_center: lang === 'bn' ? 'SMS কেন্দ্র' : 'SMS Center',
    reports: lang === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics',
    attendance: lang === 'bn' ? 'স্টাফ হাজিরা' : 'Attendance',
    warranty_check: lang === 'bn' ? 'ওয়ারেন্টি চেক' : 'Warranty Check',
    users_management: lang === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'User Management',
    billing_upgrade: lang === 'bn' ? 'বিলিং ও আপগ্রেড' : 'Billing & Upgrade',
    customer_support: lang === 'bn' ? 'কাস্টমার সাপোর্ট' : 'Customer Support',
    voice_assistant: lang === 'bn' ? 'ভয়েস কথোপকথন (Live)' : 'Voice Assistant (Live)',
    settings: lang === 'bn' ? 'সেটিংস' : 'Settings',
    owner_master: lang === 'bn' ? 'মালিক ও সুপার অ্যাডমিন প্যানেল' : 'Owner Master Control Panel'
  };

  // Check if trial has expired
  const isTrialExpired = (u: User | null): boolean => {
    if (!u) return false;
    // App Owner / Super Admin never expires
    if (u.email === 'mdanaetullah2021@gmail.com' || u.role === 'superadmin' || u.isOwner) return false;
    if (u.subscriptionStatus === 'active') return false;
    if (u.subscriptionStatus === 'suspended' || u.subscriptionStatus === 'expired') return true;
    if (!u.trialEndsAt) return false;
    return Date.now() > new Date(u.trialEndsAt).getTime();
  };

  const getTrialRemainingText = (u: User) => {
    if (!u.trialEndsAt) return lang === 'bn' ? '৩ দিন' : '3 days';
    const diff = new Date(u.trialEndsAt).getTime() - Date.now();
    if (diff <= 0) return lang === 'bn' ? 'মেয়াদ শেষ' : 'Expired';
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) {
      return lang === 'bn' ? `বাকি: ${days} দিন ${hours} ঘণ্টা` : `${days}d ${hours}h left`;
    }
    return lang === 'bn' ? `বাকি: ${hours} ঘণ্টা` : `${hours}h left`;
  };

  // If no user is logged in, show Auth View (Login / Registration)
  if (!user) {
    return (
      <AuthView
        lang={lang}
        settings={settings}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          addToast({
            type: 'success',
            title: lang === 'bn' ? 'স্বাগতম!' : 'Welcome!',
            message:
              loggedInUser.subscriptionStatus === 'trial'
                ? (lang === 'bn'
                    ? 'আপনার ৩ দিনের ফ্রি ট্রায়াল সক্রিয় রয়েছে।'
                    : 'Your 3-day free trial is now active.')
                : (lang === 'bn' ? 'লগইন সফল হয়েছে।' : 'Successfully logged in.'),
          });
        }}
        onUpdateSettings={setSettings}
      />
    );
  }

  // If trial has expired, show Trial Suspended View
  if (isTrialExpired(user)) {
    return (
      <>
        <TrialSuspendedView
          user={user}
          lang={lang}
          settings={settings}
          onUpgradeSuccess={(upgraded) => {
            setUser(upgraded);
            addToast({
              type: 'success',
              title: lang === 'bn' ? 'সাবস্ক্রিপশন সক্রিয়!' : 'Subscription Activated!',
              message: lang === 'bn' ? 'আপনার প্যাকেজ সফলভাবে সক্রিয় হয়েছে।' : 'Your subscription has been renewed.',
            });
          }}
          onLogout={handleLogout}
        />
        <ToastContainer toasts={toasts} lang={lang} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden">
      
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        lang={lang}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        user={user}
        onOpenQuickSale={() => setIsQuickSaleOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header
          title={tabTitles[activeTab]}
          user={user}
          lang={lang}
          theme={theme}
          onLanguageToggle={handleLanguageToggle}
          onThemeToggle={handleThemeToggle}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onQuickSale={() => setIsQuickSaleOpen(true)}
          onAddProduct={() => {
            setProductToEdit(null);
            setIsProductModalOpen(true);
          }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isSyncing={isSyncing}
          onManualSync={handleManualSync}
          lowStockProducts={products.filter(p => p.currentStock <= p.minStockAlert)}
          onNavigateSettings={handleNavigateSettings}
          onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
          onNavigateOwnerMaster={() => setActiveTab('owner_master')}
        />

        {/* Trial Active Banner for New Clients */}
        {user?.subscriptionStatus === 'trial' && !user?.isOwner && user?.email !== 'mdanaetullah2021@gmail.com' && (
          <div className="bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md z-30">
            <div className="flex items-center gap-2 max-w-4xl">
              <span className="animate-pulse text-base">⏳</span>
              <span>
                {lang === 'bn'
                  ? `আপনার সবার দোকান ৩ দিনের ফ্রি ট্রায়াল চলছে (${getTrialRemainingText(user)})। সফটওয়্যারটি আনলিমিটেড ব্যবহার করতে প্যাকেজ আপগ্রেড করুন।`
                  : `Your SobarDokan 3-Day Free Trial is active (${getTrialRemainingText(user)}). Upgrade your plan for full access.`}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('billing_upgrade')}
              className="ml-3 px-3 py-1 rounded-lg bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 transition whitespace-nowrap cursor-pointer shadow-sm"
            >
              {lang === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade Plan'}
            </button>
          </div>
        )}

        {/* View Router */}
        <main className="flex-1 overflow-y-auto bg-[#070b14]">
          {activeTab === 'dashboard' && (
            <DashboardView
              lang={lang}
              settings={settings}
              products={products}
              customers={customers}
              sales={sales}
              purchases={purchases}
              expenses={expenses}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenQuickSale={() => setIsQuickSaleOpen(true)}
              onOpenAddProduct={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onOpenAddPurchase={() => setActiveTab('purchases')}
              onOpenPos={() => setActiveTab('pos')}
              onOpenDueKhata={() => setActiveTab('due_khata')}
              onOpenStockAlerts={() => {
                setProductsInitialStockFilter('low');
                setActiveTab('products');
              }}
              onViewSaleInvoice={(sale) => {
                setActiveInvoiceSale(sale);
                setIsInvoiceModalOpen(true);
              }}
            />
          )}

          {activeTab === 'pos' && (
            <PosView
              lang={lang}
              settings={settings}
              products={products}
              customers={customers}
              onSaleCompleted={handleSaleCompleted}
              onOpenAddCustomer={() => setActiveTab('customers')}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              lang={lang}
              settings={settings}
              products={products}
              categories={categories}
              initialStockFilter={productsInitialStockFilter}
              onAddProduct={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setProductToEdit(p);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              lang={lang}
              settings={settings}
              sales={sales}
              products={products}
              customers={customers}
              onSaleUpdated={refreshAllState}
              onViewInvoice={(sale) => {
                setActiveInvoiceSale(sale);
                setIsInvoiceModalOpen(true);
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              lang={lang}
              settings={settings}
              customers={customers}
              onSaveCustomer={handleSaveCustomer}
              onDueCollected={handleDueCollected}
              onNavigateToSms={handleNavigateToSms}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              lang={lang}
              settings={settings}
              suppliers={suppliers}
              onSupplierUpdated={refreshAllState}
            />
          )}

          {activeTab === 'due_khata' && (
            <DueLedgerView
              lang={lang}
              settings={settings}
              customers={customers}
              onDueCollected={handleDueCollected}
              onNavigateToSms={handleNavigateToSms}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView
              lang={lang}
              settings={settings}
              purchases={purchases}
              suppliers={suppliers}
              products={products}
              onPurchaseCreated={refreshAllState}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              lang={lang}
              settings={settings}
              expenses={expenses}
              onExpenseSaved={refreshAllState}
              onExpenseDeleted={(id) => {
                StorageService.deleteExpense(id);
                refreshAllState();
              }}
            />
          )}

          {activeTab === 'cash_flow' && (
            <CashFlowView
              lang={lang}
              settings={settings}
              sales={sales}
              purchases={purchases}
              expenses={expenses}
            />
          )}

          {activeTab === 'sms_center' && (
            <SMSCenterView
              lang={lang}
              settings={settings}
              customers={customers}
              initialCustomerId={smsCustomerId}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              lang={lang}
              settings={settings}
              sales={sales}
              purchases={purchases}
              expenses={expenses}
              products={products}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === 'warranty_check' && (
            <WarrantyCheckView
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === 'users_management' && (
            <UserManagementView
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === 'billing_upgrade' && (
            <BillingUpgradeView
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === 'customer_support' && (
            <CustomerSupportView
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === 'voice_assistant' && (
            <VoiceConversationView
              lang={lang}
              settings={settings}
              products={products}
              sales={sales}
              customers={customers}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              lang={lang}
              settings={settings}
              user={user}
              initialTab={settingsInitialTab}
              onSaveSettings={handleSaveSettings}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onResetData={handleResetData}
            />
          )}

          {activeTab === 'owner_master' && (
            <OwnerMasterPanel
              currentUser={user}
              lang={lang}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefreshAllState={refreshAllState}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}

      {/* Quick Sale F2 Modal */}
      {isQuickSaleOpen && (
        <QuickSaleModal
          isOpen={isQuickSaleOpen}
          onClose={() => setIsQuickSaleOpen(false)}
          lang={lang}
          settings={settings}
          products={products}
          customers={customers}
          onSaleCompleted={handleSaleCompleted}
        />
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          onSave={handleSaveProduct}
          productToEdit={productToEdit}
          categories={categories}
          settings={settings}
          lang={lang}
        />
      )}

      {/* Invoice Print & PDF Modal */}
      {isInvoiceModalOpen && activeInvoiceSale && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setActiveInvoiceSale(null);
          }}
          sale={activeInvoiceSale}
          settings={settings}
          lang={lang}
        />
      )}

      {/* Gemini Live Voice Conversation Modal */}
      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        lang={lang}
        settings={settings}
        products={products}
        sales={sales}
        customers={customers}
      />

      {/* Floating Live Voice Assistant Button */}
      {activeTab !== 'voice_assistant' && (
        <button
          id="btn-floating-voice-live"
          onClick={() => setIsVoiceModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-2xl shadow-indigo-950/80 hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 group cursor-pointer border border-cyan-400/30 animate-bounce-slow"
          title={lang === 'bn' ? 'লাইভ ভয়েস সহকারী (gemini-3.8-live)' : 'Live Voice Assistant (gemini-3.8-live)'}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {lang === 'bn' ? 'ভয়েস AI (Live)' : 'Live Voice AI'}
          </span>
        </button>
      )}

      {/* A4 Document Print & Export Preview Modal */}
      <PDFPreviewModal lang={lang} onToast={addToast} />

      {/* Toast Notification System */}
      <ToastContainer
        toasts={toasts}
        lang={lang}
        onDismiss={dismissToast}
      />

    </div>
  );
};

export default App;
