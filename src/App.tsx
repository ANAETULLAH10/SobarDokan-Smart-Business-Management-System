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
        const u: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Admin',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'admin'
        };
        setUser(u);
        StorageService.saveUser(u);

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
      } else {
        setUser(null);
        StorageService.saveUser(null);
      }
    });

    return () => unsubscribe();
  }, [refreshAllState]);

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

  // Stock alert threshold notification whenever user navigates to Dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const lowStockItems = products.filter(
        (p) => p.currentStock <= (p.minStockAlert ?? 5)
      );

      if (lowStockItems.length > 0) {
        const outOfStockCount = lowStockItems.filter((p) => p.currentStock <= 0).length;

        const timer = setTimeout(() => {
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
        }, 250);

        return () => clearTimeout(timer);
      } else {
        dismissToast('low-stock-dashboard-alert');
      }
    }
  }, [activeTab, products, lang, addToast, dismissToast]);

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
      const u: User = {
        uid: result.user.uid,
        name: result.user.displayName || 'Admin',
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        role: 'admin'
      };
      setUser(u);
      StorageService.saveUser(u);
      setIsSyncing(true);
      await StorageService.syncToFirestore();
      setIsSyncing(false);
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Google Sign-in: ' + (err?.message || 'Could not complete sign in'));
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      StorageService.saveUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
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
    settings: lang === 'bn' ? 'সেটিংস' : 'Settings'
  };

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
        />

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
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-2xl shadow-indigo-950/80 hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 group cursor-pointer border border-cyan-400/30"
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
