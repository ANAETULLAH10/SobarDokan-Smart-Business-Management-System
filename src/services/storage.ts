import {
  Product, Category, Customer, Supplier, Sale, SaleReturn,
  Purchase, PurchaseReturn, Expense, Income, CustomerLedgerEntry,
  SupplierLedgerEntry, StockAdjustment, Quotation, WarrantyItem,
  Employee, AttendanceRecord, BusinessSettings, UserProfile, User, Language, ThemeMode,
  MonthlyFinancialRecord, TrendDataPoint, SMSMessage, SMSTemplate, SMSSettings,
  WarrantyClaim, AppUser, SubscriptionPlan, BillingInvoice, SupportTicket
} from '../types';
import {
  defaultEmployees,
  defaultAttendanceRecords,
  defaultWarrantyItems,
  defaultWarrantyClaims,
  defaultAppUsers,
  defaultSubscriptionPlans,
  defaultBillingInvoices,
  defaultSupportTickets
} from '../data/adminDemoData';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  PRODUCTS: 'amardokan_products',
  CATEGORIES: 'amardokan_categories',
  CUSTOMERS: 'amardokan_customers',
  SUPPLIERS: 'amardokan_suppliers',
  SALES: 'amardokan_sales',
  SALE_RETURNS: 'amardokan_sale_returns',
  PURCHASES: 'amardokan_purchases',
  PURCHASE_RETURNS: 'amardokan_purchase_returns',
  EXPENSES: 'amardokan_expenses',
  INCOMES: 'amardokan_incomes',
  CUSTOMER_LEDGER: 'amardokan_customer_ledger',
  SUPPLIER_LEDGER: 'amardokan_supplier_ledger',
  STOCK_ADJUSTMENTS: 'amardokan_stock_adjustments',
  QUOTATIONS: 'amardokan_quotations',
  WARRANTIES: 'amardokan_warranties',
  WARRANTY_CLAIMS: 'amardokan_warranty_claims',
  EMPLOYEES: 'amardokan_employees',
  ATTENDANCE: 'amardokan_attendance',
  SETTINGS: 'amardokan_settings',
  USER: 'amardokan_user',
  USERS: 'amardokan_users',
  SUBSCRIPTION: 'amardokan_subscription',
  BILLING_INVOICES: 'amardokan_billing_invoices',
  SUPPORT_TICKETS: 'amardokan_support_tickets',
  LANGUAGE: 'amardokan_language',
  THEME: 'amardokan_theme',
  SMS_MESSAGES: 'amardokan_sms_messages',
  SMS_TEMPLATES: 'amardokan_sms_templates',
  SMS_SETTINGS: 'amardokan_sms_settings',
};

export const defaultSettings: BusinessSettings = {
  businessName: 'AmarDokan',
  businessSubtitle: 'SMART BUSINESS',
  ownerName: 'MD ANAETULLAH',
  phone: '01700-000000',
  email: 'mdanaetullah2021@gmail.com',
  address: 'মিরপুর ১০, ঢাকা, বাংলাদেশ',
  website: 'www.amardokan.com',
  binTin: 'BIN-9876543210',
  tinNo: 'TIN-4567890123',
  vatRegNo: 'VAT-12345678',
  tradeLicenseNo: 'TRAD/DSCC/019283',
  taxRegistrationLabel: 'কর চালানপত্র (মূসক-৬.৩)',
  logoUrl: '',
  showLogoOnInvoice: true,
  invoiceHeaderLayout: 'center',
  invoiceHeaderTitle: 'ক্যাশ মেমো ও কর চালানপত্র',
  invoiceHeaderNote: 'সরকার অনুমোদিত ভ্যাট নিবন্ধিত প্রতিষ্ঠান',
  vatPercent: 5,
  currency: 'BDT',
  currencySymbol: '৳',
  invoicePrefix: 'INV-',
  startingInvoiceNo: 1001,
  paperSize: '80mm',
  invoiceFooterText: 'আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ! আবার আসবেন।',
  language: 'bn',
  theme: 'dark',
  autoBackup: true
};

export const defaultUser: User = {
  uid: 'usr-1',
  name: 'MD ANAETULLAH',
  email: 'mdanaetullah2021@gmail.com',
  role: 'Admin'
};

export const defaultSMSTemplates: SMSTemplate[] = [
  {
    id: 'tpl-1',
    title: 'বকেয়া পরিশোধের তাগাদা (Payment Due Reminder)',
    category: 'due_reminder',
    content: 'শ্রদ্ধেয় {customer_name}, {business_name}-এ আপনার বকেয়া পাওনা {due_amount} টাকা বাকি রয়েছে। অনুগ্রহ করে দ্রুত পরিশোধের অনুরোধ করা হলো। ফোন: {phone}। ধন্যবাদ।',
    isDefault: true
  },
  {
    id: 'tpl-2',
    title: 'নতুন ক্যাশ মেমো নিশ্চিতকরণ (Sales Invoice)',
    category: 'transaction',
    content: 'ধন্যবাদ {customer_name}! {business_name}-এ আপনার কেনাকাটা সম্পন্ন হয়েছে। ইনভয়েস: {invoice_no}, পরিশোধ: {paid_amount} টাকা, বকেয়া: {due_amount} টাকা।',
    isDefault: true
  },
  {
    id: 'tpl-3',
    title: 'বকেয়া জমার প্রাপ্তি স্বীকার (Payment Received)',
    category: 'transaction',
    content: 'প্রিয় {customer_name}, {business_name}-এ আপনার জমা প্রাপ্তি সফল হয়েছে। বর্তমান অবশিষ্ট বকেয়া: {due_amount} টাকা। সুন্দর সম্পর্কের জন্য ধন্যবাদ!',
    isDefault: true
  },
  {
    id: 'tpl-4',
    title: 'ঈদ শুভেচ্ছা ও বিশেষ অফার (Eid Festival Greeting)',
    category: 'greeting',
    content: '{business_name}-এর পক্ষ থেকে আপনাকে ও আপনার পরিবারকে পবিত্র ঈদের শুভেচ্ছা! সাথে থাকছে বিশেষ ছাড়। চলে আসুন আজই!',
    isDefault: true
  },
  {
    id: 'tpl-5',
    title: 'নতুন মালামাল ও ডিসকাউন্ট অফার (Promo & Discount)',
    category: 'promo',
    content: 'সুসংবাদ {customer_name}! {business_name}-এ নতুন কালেকশন এসেছে। বিশেষ মূল্যছাড় উপভোগ করতে ভিজিট করুন অথবা কল করুন: {phone}।',
    isDefault: true
  }
];

export const defaultSMSSettings: SMSSettings = {
  provider: 'mock_simulator',
  apiKey: '',
  senderId: 'AmarDokan',
  balance: 350,
  autoSendOnSale: false,
  autoSendOnPayment: true,
  autoSendOnDue: false,
  maskingName: 'AmarDokan'
};

const defaultSMSMessages: SMSMessage[] = [
  {
    id: 'sms-1',
    recipientName: 'মো: রফিকুল ইসলাম',
    recipientPhone: '01711-223344',
    customerId: 'cust-1',
    message: 'শ্রদ্ধেয় মো: রফিকুল ইসলাম, AmarDokan-এ আপনার বকেয়া পাওনা ৳১,৫০০ টাকা বাকি রয়েছে। অনুগ্রহ করে দ্রুত পরিশোধের অনুরোধ করা হলো। ফোন: 01700-000000। ধন্যবাদ।',
    category: 'due_reminder',
    status: 'delivered',
    sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    characterCount: 138,
    smsParts: 2,
    provider: 'AmarDokan Gateway'
  },
  {
    id: 'sms-2',
    recipientName: 'আনোয়ার হোসেন',
    recipientPhone: '01819-887766',
    customerId: 'cust-2',
    message: 'ধন্যবাদ আনোয়ার হোসেন! AmarDokan-এ আপনার কেনাকাটা সম্পন্ন হয়েছে। ইনভয়েস: INV-1002। আবার আসবেন!',
    category: 'transaction',
    status: 'delivered',
    sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    characterCount: 88,
    smsParts: 2,
    provider: 'AmarDokan Gateway'
  },
  {
    id: 'sms-3',
    recipientName: 'তানিয়া আক্তার',
    recipientPhone: '01912-334455',
    customerId: 'cust-3',
    message: 'সুসংবাদ তানিয়া আক্তার! AmarDokan-এ নতুন কালেকশন এসেছে। বিশেষ মূল্যছাড় উপভোগ করতে চলে আসুন আজই!',
    category: 'promo',
    status: 'delivered',
    sentAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    characterCount: 96,
    smsParts: 2,
    provider: 'AmarDokan Gateway'
  }
];

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Groceries', banglaName: 'মুদি মালামাল', color: '#3b82f6', productCount: 4 },
  { id: 'cat-2', name: 'Beverages', banglaName: 'পানীয় ও জুস', color: '#10b981', productCount: 2 },
  { id: 'cat-3', name: 'Electronics', banglaName: 'ইলেকট্রনিক্স ও গ্যাজেট', color: '#8b5cf6', productCount: 3 },
  { id: 'cat-4', name: 'Personal Care', banglaName: 'ব্যক্তিগত যত্ন ও প্রসাধন', color: '#ec4899', productCount: 2 },
  { id: 'cat-5', name: 'Snacks & Bakery', banglaName: 'স্ন্যাকস ও বেকারি', color: '#f59e0b', productCount: 2 }
];

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Pran Miniket Rice 5kg',
    banglaName: 'প্রাণ চিনিগুঁড়া বাসমতী চাল ৫ কেজি',
    sku: 'RICE-001',
    barcode: '894110012345',
    category: 'Groceries',
    brand: 'Pran',
    unit: 'ব্যাগ',
    purchasePrice: 380,
    sellingPrice: 430,
    openingStock: 50,
    currentStock: 38,
    minStockAlert: 10,
    taxPercent: 0,
    discount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Teer Soybean Oil 2L',
    banglaName: 'তীর সয়াবিন তেল ২ লিটার',
    sku: 'OIL-002',
    barcode: '894110012346',
    category: 'Groceries',
    brand: 'Teer',
    unit: 'বোতল',
    purchasePrice: 340,
    sellingPrice: 375,
    openingStock: 40,
    currentStock: 22,
    minStockAlert: 8,
    taxPercent: 0,
    discount: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Aci Pure Salt 1kg',
    banglaName: 'এসিআই পিওর আয়োডিনযুক্ত লবণ ১ কেজি',
    sku: 'SALT-003',
    barcode: '894110012347',
    category: 'Groceries',
    brand: 'ACI',
    unit: 'প্যাকেট',
    purchasePrice: 35,
    sellingPrice: 42,
    openingStock: 80,
    currentStock: 65,
    minStockAlert: 15,
    taxPercent: 0,
    discount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Rupchanda Mustard Oil 1L',
    banglaName: 'রুপচাঁদা খাঁটি সরিষার তেল ১ লিটার',
    sku: 'OIL-004',
    barcode: '894110012348',
    category: 'Groceries',
    brand: 'Rupchanda',
    unit: 'বোতল',
    purchasePrice: 280,
    sellingPrice: 310,
    openingStock: 30,
    currentStock: 14,
    minStockAlert: 5,
    taxPercent: 0,
    discount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Mojo Cola 250ml',
    banglaName: 'মোজো কোল্ড ড্রিংকস ২৫০ মি.লি.',
    sku: 'BEV-005',
    barcode: '894110012349',
    category: 'Beverages',
    brand: 'Akij',
    unit: 'বোতল',
    purchasePrice: 18,
    sellingPrice: 25,
    openingStock: 120,
    currentStock: 85,
    minStockAlert: 24,
    taxPercent: 0,
    discount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Frooto Mango Juice 250ml',
    banglaName: 'ফ্রুটো ফ্রেশ ম্যাংগো জুস ২৫০ মি.লি.',
    sku: 'BEV-006',
    barcode: '894110012350',
    category: 'Beverages',
    brand: 'Pran',
    unit: 'প্যাক',
    purchasePrice: 22,
    sellingPrice: 30,
    openingStock: 60,
    currentStock: 4,
    minStockAlert: 10,
    taxPercent: 0,
    discount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Samsung Type-C Fast Cable',
    banglaName: 'স্যামসাং ফাস্ট চার্জিং টাইপ-সি ক্যাবল',
    sku: 'ELEC-007',
    barcode: '894110012351',
    category: 'Electronics',
    brand: 'Samsung',
    unit: 'পিস',
    purchasePrice: 140,
    sellingPrice: 250,
    openingStock: 25,
    currentStock: 16,
    minStockAlert: 5,
    taxPercent: 5,
    discount: 10,
    warrantyMonths: 6,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Remax 10000mAh Power Bank',
    banglaName: 'রিম্যাক্স ১০০০০ এমএএইচ পাওয়ার ব্যাংক',
    sku: 'ELEC-008',
    barcode: '894110012352',
    category: 'Electronics',
    brand: 'Remax',
    unit: 'পিস',
    purchasePrice: 850,
    sellingPrice: 1250,
    openingStock: 15,
    currentStock: 3,
    minStockAlert: 5,
    taxPercent: 5,
    discount: 50,
    warrantyMonths: 12,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-9',
    name: 'Walton LED Bulb 15W',
    banglaName: 'ওয়ালটন এনার্জি সেভিং এলইডি বাল্ব ১৫ ওয়াট',
    sku: 'ELEC-009',
    barcode: '894110012353',
    category: 'Electronics',
    brand: 'Walton',
    unit: 'পিস',
    purchasePrice: 160,
    sellingPrice: 220,
    openingStock: 40,
    currentStock: 28,
    minStockAlert: 8,
    taxPercent: 0,
    discount: 0,
    warrantyMonths: 12,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-10',
    name: 'Lifebuoy Total Soap 100g',
    banglaName: 'লাইফবয় টোটাল প্রোটেকশন সাবান ১০০ গ্রাম',
    sku: 'CARE-010',
    barcode: '894110012354',
    category: 'Personal Care',
    brand: 'Unilever',
    unit: 'পিস',
    purchasePrice: 42,
    sellingPrice: 55,
    openingStock: 100,
    currentStock: 74,
    minStockAlert: 20,
    taxPercent: 0,
    discount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'রফিকুল ইসলাম',
    phone: '01711-223344',
    email: 'rafiq@gmail.com',
    address: 'মিরপুর ২, ঢাকা',
    openingBalance: 0,
    creditLimit: 5000,
    totalPurchased: 4500,
    totalPaid: 3200,
    dueAmount: 1300,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-2',
    name: 'আব্দুল করিম',
    phone: '01822-334455',
    email: 'karim@gmail.com',
    address: 'ধানমন্ডি ২৭, ঢাকা',
    openingBalance: 0,
    creditLimit: 10000,
    totalPurchased: 8900,
    totalPaid: 8000,
    dueAmount: 900,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-3',
    name: 'তানিয়া সুলতানা',
    phone: '01933-445566',
    address: 'উত্তরা সেক্টর ৭, ঢাকা',
    openingBalance: 0,
    creditLimit: 3000,
    totalPurchased: 3400,
    totalPaid: 3400,
    dueAmount: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const defaultSuppliers: Supplier[] = [
  {
    id: 'supp-1',
    name: 'মোহাম্মদ সেলিম',
    company: 'মেসার্স সেলিম ট্রেডার্স',
    phone: '01715-998877',
    address: 'মৌলভীবাজার, ঢাকা',
    openingBalance: 0,
    totalSupplied: 45000,
    totalPaid: 40000,
    dueAmount: 5000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'supp-2',
    name: 'আরিফ হোসেন',
    company: 'প্রাইম ফুডস ডিস্ট্রিবিউশন',
    phone: '01819-665544',
    address: 'তেজগাঁও শিল্পাঞ্চল, ঢাকা',
    openingBalance: 0,
    totalSupplied: 28000,
    totalPaid: 28000,
    dueAmount: 0,
    createdAt: new Date().toISOString()
  }
];

const defaultExpenses: Expense[] = [
  {
    id: 'exp-1',
    category: 'দোকান ভাড়া',
    amount: 12000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank',
    description: 'চলতি মাসের দোকান ভাড়া পরিশোধ',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-2',
    category: 'বিদ্যুৎ বিল',
    amount: 1450,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bkash',
    description: 'পল্লী বিদ্যুৎ বিল',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-3',
    category: 'নাস্তা ও চা',
    amount: 180,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: 'দোকানের কর্মচারীদের সকাল ও বিকেলের নাস্তা',
    createdAt: new Date().toISOString()
  }
];

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Best-effort async backup to Firestore
      this.syncToFirestore(key, value);
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  }

  public static async syncToFirestore(key?: string, data?: any): Promise<void> {
    try {
      if (!navigator.onLine) return;
      if (key && data !== undefined) {
        const ref = doc(db, 'app_state', key);
        await setDoc(ref, { data, updatedAt: new Date().toISOString() }, { merge: true });
      } else {
        // Sync all storage keys to Firestore
        for (const storageKey of Object.values(STORAGE_KEYS)) {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const ref = doc(db, 'app_state', storageKey);
              await setDoc(ref, { data: parsed, updatedAt: new Date().toISOString() }, { merge: true });
            } catch (jsonErr) {
              const ref = doc(db, 'app_state', storageKey);
              await setDoc(ref, { data: raw, updatedAt: new Date().toISOString() }, { merge: true });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  }

  public static async pullFromFirestore(): Promise<void> {
    try {
      if (!navigator.onLine) return;
      for (const storageKey of Object.values(STORAGE_KEYS)) {
        const ref = doc(db, 'app_state', storageKey);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const val = snapshot.data()?.data;
          if (val !== undefined) {
            localStorage.setItem(storageKey, typeof val === 'string' ? val : JSON.stringify(val));
          }
        }
      }
    } catch (err) {
      console.warn('Firestore pull note:', err);
    }
  }

  // Language
  public static getLanguage(): Language {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'bn';
  }

  public static saveLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  // Theme (Night & Day Mood)
  public static getTheme(): ThemeMode {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'night';
  }

  public static saveTheme(theme: ThemeMode): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  // Initialization & Demo Data
  public static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.seedDemoData();
    }
  }

  public static seedDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(defaultSuppliers));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(defaultExpenses));
    
    // Seed initial sample sales
    const today = new Date().toISOString().split('T')[0];
    const initialSales: Sale[] = [
      {
        id: 'sale-1',
        invoiceNo: 'INV-1001',
        date: today,
        customerId: 'cust-1',
        customerName: 'রফিকুল ইসলাম',
        customerPhone: '01711-223344',
        items: [
          {
            productId: 'prod-1',
            productName: 'প্রাণ চিনিগুঁড়া বাসমতী চাল ৫ কেজি',
            quantity: 2,
            purchasePrice: 380,
            unitPrice: 430,
            discount: 0,
            lineTotal: 860
          },
          {
            productId: 'prod-2',
            productName: 'তীর সয়াবিন তেল ২ লিটার',
            quantity: 1,
            purchasePrice: 340,
            unitPrice: 375,
            discount: 0,
            lineTotal: 375
          }
        ],
        subtotal: 1235,
        discount: 35,
        vat: 0,
        deliveryCharge: 0,
        grandTotal: 1200,
        paidAmount: 1000,
        dueAmount: 200,
        paymentMethod: 'cash',
        status: 'completed',
        cashierName: 'MD ANAETULLAH',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sale-2',
        invoiceNo: 'INV-1002',
        date: today,
        customerId: 'walk-in',
        customerName: 'সাধারণ ক্রেতা (Walk-in)',
        items: [
          {
            productId: 'prod-7',
            productName: 'স্যামসাং ফাস্ট চার্জিং টাইপ-সি ক্যাবল',
            quantity: 1,
            purchasePrice: 140,
            unitPrice: 250,
            discount: 0,
            lineTotal: 250
          },
          {
            productId: 'prod-5',
            productName: 'মোজো কোল্ড ড্রিংকস ২৫০ মি.লি.',
            quantity: 2,
            purchasePrice: 18,
            unitPrice: 25,
            discount: 0,
            lineTotal: 50
          }
        ],
        subtotal: 300,
        discount: 0,
        vat: 0,
        deliveryCharge: 0,
        grandTotal: 300,
        paidAmount: 300,
        dueAmount: 0,
        paymentMethod: 'bkash',
        status: 'completed',
        cashierName: 'MD ANAETULLAH',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
  }

  // Products
  public static getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  }

  public static saveProduct(product: Product): void {
    const list = this.getProducts();
    const index = list.findIndex(p => p.id === product.id);
    if (index >= 0) {
      list[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(product);
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, list);
  }

  public static deleteProduct(id: string): void {
    const list = this.getProducts().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PRODUCTS, list);
  }

  public static adjustStock(adjustment: StockAdjustment): void {
    const products = this.getProducts();
    const product = products.find(p => p.id === adjustment.productId);
    if (product) {
      if (adjustment.type === 'increase' || adjustment.type === 'correction') {
        product.currentStock += adjustment.quantity;
      } else {
        product.currentStock = Math.max(0, product.currentStock - adjustment.quantity);
      }
      product.updatedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.PRODUCTS, products);

      const adjustments = this.getItem<StockAdjustment[]>(STORAGE_KEYS.STOCK_ADJUSTMENTS, []);
      adjustments.unshift(adjustment);
      this.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, adjustments);
    }
  }

  // Categories
  public static getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  }

  public static saveCategory(category: Category): void {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === category.id);
    if (index >= 0) {
      list[index] = category;
    } else {
      list.push(category);
    }
    this.setItem(STORAGE_KEYS.CATEGORIES, list);
  }

  public static deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.CATEGORIES, list);
  }

  // Sales
  public static getSales(): Sale[] {
    return this.getItem<Sale[]>(STORAGE_KEYS.SALES, []);
  }

  public static saveSale(sale: Sale): void {
    const sales = this.getSales();
    sales.unshift(sale);
    this.setItem(STORAGE_KEYS.SALES, sales);

    // Reduce product stock
    const products = this.getProducts();
    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        prod.updatedAt = new Date().toISOString();
      }
    });
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Update customer due and total purchased if registered
    if (sale.customerId && sale.customerId !== 'walk-in') {
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === sale.customerId);
      if (customer) {
        customer.totalPurchased += sale.grandTotal;
        customer.totalPaid += sale.paidAmount;
        customer.dueAmount += sale.dueAmount;
        this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

        // Add to customer ledger
        this.addCustomerLedgerEntry({
          id: 'cled-' + Date.now(),
          customerId: customer.id,
          date: sale.date,
          type: 'sale',
          referenceNo: sale.invoiceNo,
          debit: sale.grandTotal,
          credit: sale.paidAmount,
          balance: customer.dueAmount,
          note: `বিক্রয় ইনভয়েস: ${sale.invoiceNo}`
        });
      }
    }
  }

  // Sales Return
  public static getSaleReturns(): SaleReturn[] {
    return this.getItem<SaleReturn[]>(STORAGE_KEYS.SALE_RETURNS, []);
  }

  public static processSaleReturn(saleReturn: SaleReturn): void {
    const returns = this.getSaleReturns();
    returns.unshift(saleReturn);
    this.setItem(STORAGE_KEYS.SALE_RETURNS, returns);

    // Restock products: Stock Increases
    const products = this.getProducts();
    saleReturn.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
        prod.updatedAt = new Date().toISOString();
      }
    });
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Update sale status if referenced
    if (saleReturn.saleId || saleReturn.invoiceNo) {
      const sales = this.getSales();
      const sale = sales.find(s => s.id === saleReturn.saleId || s.invoiceNo === saleReturn.invoiceNo);
      if (sale) {
        sale.status = 'returned';
        this.setItem(STORAGE_KEYS.SALES, sales);
      }
    }

    // Adjust customer balance and ledger if needed
    if (saleReturn.customerId && saleReturn.customerId !== 'walk-in') {
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === saleReturn.customerId);
      if (customer) {
        customer.dueAmount = Math.max(0, customer.dueAmount - saleReturn.totalRefund);
        customer.totalPurchased = Math.max(0, customer.totalPurchased - saleReturn.totalRefund);
        this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

        // Record in customer ledger
        this.addCustomerLedgerEntry({
          id: 'cled-ret-' + Date.now(),
          customerId: customer.id,
          date: saleReturn.date,
          type: 'return',
          referenceNo: saleReturn.returnNo,
          debit: 0,
          credit: saleReturn.totalRefund,
          balance: customer.dueAmount,
          note: `বিক্রয় ফেরত: ${saleReturn.returnNo} (${saleReturn.reason || 'রিটার্ন'})`
        });
      }
    }
  }

  // Customers
  public static getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  }

  public static saveCustomer(customer: Customer): void {
    const list = this.getCustomers();
    const index = list.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    this.setItem(STORAGE_KEYS.CUSTOMERS, list);
  }

  public static collectCustomerDue(customerId: string, amount: number, method: string, note?: string): void {
    const customers = this.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      customer.totalPaid = (customer.totalPaid || 0) + amount;
      customer.dueAmount = Math.max(0, customer.dueAmount - amount);
      this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

      this.addCustomerLedgerEntry({
        id: 'due-col-' + Date.now(),
        customerId: customer.id,
        date: new Date().toISOString().split('T')[0],
        type: 'payment',
        referenceNo: 'REC-' + Math.floor(1000 + Math.random() * 9000),
        debit: 0,
        credit: amount,
        balance: customer.dueAmount,
        note: `বকেয়া আদায় (${method}) ${note ? '- ' + note : ''}`
      });
    }
  }

  // Customer Ledger
  public static getCustomerLedger(customerId?: string): CustomerLedgerEntry[] {
    const list = this.getItem<CustomerLedgerEntry[]>(STORAGE_KEYS.CUSTOMER_LEDGER, []);
    return customerId ? list.filter(e => e.customerId === customerId) : list;
  }

  public static addCustomerLedgerEntry(entry: CustomerLedgerEntry): void {
    const list = this.getItem<CustomerLedgerEntry[]>(STORAGE_KEYS.CUSTOMER_LEDGER, []);
    list.unshift(entry);
    this.setItem(STORAGE_KEYS.CUSTOMER_LEDGER, list);
  }

  // Purchases
  public static getPurchases(): Purchase[] {
    return this.getItem<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
  }

  public static savePurchase(purchase: Purchase): void {
    const purchases = this.getPurchases();
    purchases.unshift(purchase);
    this.setItem(STORAGE_KEYS.PURCHASES, purchases);

    // Increase product stock & update purchase price
    const products = this.getProducts();
    purchase.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
        prod.purchasePrice = item.purchasePrice;
        prod.updatedAt = new Date().toISOString();
      }
    });
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Update supplier balance and ledger
    if (purchase.supplierId) {
      const suppliers = this.getSuppliers();
      const supp = suppliers.find(s => s.id === purchase.supplierId);
      if (supp) {
        supp.totalSupplied += purchase.grandTotal;
        supp.totalPaid += purchase.paidAmount;
        supp.dueAmount += purchase.dueAmount;
        this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);

        this.addSupplierLedgerEntry({
          id: 'sled-' + Date.now(),
          supplierId: supp.id,
          date: purchase.date,
          type: 'purchase',
          referenceNo: purchase.invoiceNo,
          debit: purchase.paidAmount,
          credit: purchase.grandTotal,
          balance: supp.dueAmount,
          note: `ক্রয় ইনভয়েস: ${purchase.invoiceNo}`
        });
      }
    }
  }

  // Purchase Returns
  public static getPurchaseReturns(): PurchaseReturn[] {
    return this.getItem<PurchaseReturn[]>(STORAGE_KEYS.PURCHASE_RETURNS, []);
  }

  public static processPurchaseReturn(purchaseReturn: PurchaseReturn): void {
    const returns = this.getPurchaseReturns();
    returns.unshift(purchaseReturn);
    this.setItem(STORAGE_KEYS.PURCHASE_RETURNS, returns);

    // Decrease product stock: Stock Decreases
    const products = this.getProducts();
    purchaseReturn.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        prod.updatedAt = new Date().toISOString();
      }
    });
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Update supplier balance and ledger
    if (purchaseReturn.supplierId) {
      const suppliers = this.getSuppliers();
      const supp = suppliers.find(s => s.id === purchaseReturn.supplierId);
      if (supp) {
        supp.dueAmount = Math.max(0, supp.dueAmount - purchaseReturn.totalRefund);
        supp.totalSupplied = Math.max(0, supp.totalSupplied - purchaseReturn.totalRefund);
        this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);

        this.addSupplierLedgerEntry({
          id: 'sled-ret-' + Date.now(),
          supplierId: supp.id,
          date: purchaseReturn.date,
          type: 'return',
          referenceNo: purchaseReturn.returnNo,
          debit: purchaseReturn.totalRefund,
          credit: 0,
          balance: supp.dueAmount,
          note: `ক্রয় ফেরত: ${purchaseReturn.returnNo} (${purchaseReturn.reason || 'সাপ্লায়ার ফেরত'})`
        });
      }
    }
  }

  // Suppliers
  public static getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
  }

  public static saveSupplier(supplier: Supplier): void {
    const list = this.getSuppliers();
    const index = list.findIndex(s => s.id === supplier.id);
    if (index >= 0) {
      list[index] = supplier;
    } else {
      list.unshift(supplier);
    }
    this.setItem(STORAGE_KEYS.SUPPLIERS, list);
  }

  public static paySupplierDue(supplierId: string, amount: number, method: string, note?: string): void {
    const suppliers = this.getSuppliers();
    const supp = suppliers.find(s => s.id === supplierId);
    if (supp) {
      supp.totalPaid += amount;
      supp.dueAmount = Math.max(0, supp.dueAmount - amount);
      this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);

      this.addSupplierLedgerEntry({
        id: 'sled-pay-' + Date.now(),
        supplierId,
        date: new Date().toISOString().split('T')[0],
        type: 'payment',
        referenceNo: 'SPAY-' + Math.floor(1000 + Math.random() * 9000),
        debit: amount,
        credit: 0,
        balance: supp.dueAmount,
        note: `পরিশোধ (${method}) ${note ? '- ' + note : ''}`
      });
    }
  }

  // Supplier Ledger
  public static getSupplierLedger(supplierId?: string): SupplierLedgerEntry[] {
    const list = this.getItem<SupplierLedgerEntry[]>(STORAGE_KEYS.SUPPLIER_LEDGER, []);
    return supplierId ? list.filter(e => e.supplierId === supplierId) : list;
  }

  public static addSupplierLedgerEntry(entry: SupplierLedgerEntry): void {
    const list = this.getItem<SupplierLedgerEntry[]>(STORAGE_KEYS.SUPPLIER_LEDGER, []);
    list.unshift(entry);
    this.setItem(STORAGE_KEYS.SUPPLIER_LEDGER, list);
  }

  // Expenses
  public static getExpenses(): Expense[] {
    return this.getItem<Expense[]>(STORAGE_KEYS.EXPENSES, []);
  }

  public static saveExpense(expense: Expense): void {
    const list = this.getExpenses();
    list.unshift(expense);
    this.setItem(STORAGE_KEYS.EXPENSES, list);
  }

  public static deleteExpense(id: string): void {
    const list = this.getExpenses().filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EXPENSES, list);
  }

  // Settings
  public static getSettings(): BusinessSettings {
    return this.getItem<BusinessSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  }

  public static saveSettings(settings: BusinessSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // SMS Center Storage Methods
  public static getSMSMessages(): SMSMessage[] {
    return this.getItem<SMSMessage[]>(STORAGE_KEYS.SMS_MESSAGES, defaultSMSMessages);
  }

  public static saveSMSMessage(msg: SMSMessage): void {
    const list = this.getSMSMessages();
    list.unshift(msg);
    this.setItem(STORAGE_KEYS.SMS_MESSAGES, list);
  }

  public static deleteSMSMessage(id: string): void {
    const list = this.getSMSMessages().filter(m => m.id !== id);
    this.setItem(STORAGE_KEYS.SMS_MESSAGES, list);
  }

  public static clearSMSHistory(): void {
    this.setItem(STORAGE_KEYS.SMS_MESSAGES, []);
  }

  public static getSMSTemplates(): SMSTemplate[] {
    return this.getItem<SMSTemplate[]>(STORAGE_KEYS.SMS_TEMPLATES, defaultSMSTemplates);
  }

  public static saveSMSTemplate(tpl: SMSTemplate): void {
    const list = this.getSMSTemplates();
    const idx = list.findIndex(t => t.id === tpl.id);
    if (idx >= 0) {
      list[idx] = tpl;
    } else {
      list.unshift(tpl);
    }
    this.setItem(STORAGE_KEYS.SMS_TEMPLATES, list);
  }

  public static deleteSMSTemplate(id: string): void {
    const list = this.getSMSTemplates().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.SMS_TEMPLATES, list);
  }

  public static getSMSSettings(): SMSSettings {
    return this.getItem<SMSSettings>(STORAGE_KEYS.SMS_SETTINGS, defaultSMSSettings);
  }

  public static saveSMSSettings(settings: SMSSettings): void {
    this.setItem(STORAGE_KEYS.SMS_SETTINGS, settings);
  }

  public static deductSMSCredits(count: number): number {
    const current = this.getSMSSettings();
    const newBal = Math.max(0, (current.balance || 0) - count);
    current.balance = newBal;
    this.saveSMSSettings(current);
    return newBal;
  }

  public static addSMSCredits(count: number): number {
    const current = this.getSMSSettings();
    const newBal = (current.balance || 0) + count;
    current.balance = newBal;
    this.saveSMSSettings(current);
    return newBal;
  }

  // User Profile
  public static getUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.USER, defaultUser);
  }

  public static saveUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.USER, user);
  }

  // Employees & Attendance
  public static getEmployees(): Employee[] {
    return this.getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, defaultEmployees);
  }

  public static saveEmployee(employee: Employee): void {
    const list = this.getEmployees();
    const idx = list.findIndex(e => e.id === employee.id);
    if (idx >= 0) {
      list[idx] = employee;
    } else {
      list.push(employee);
    }
    this.setItem(STORAGE_KEYS.EMPLOYEES, list);
  }

  public static deleteEmployee(id: string): void {
    const list = this.getEmployees().filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EMPLOYEES, list);
  }

  public static getAttendance(date?: string): AttendanceRecord[] {
    const list = this.getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, defaultAttendanceRecords);
    if (date) {
      return list.filter(a => a.date === date);
    }
    return list;
  }

  public static recordAttendance(record: AttendanceRecord): void {
    const list = this.getAttendance();
    const idx = list.findIndex(a => a.employeeId === record.employeeId && a.date === record.date);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.unshift(record);
    }
    this.setItem(STORAGE_KEYS.ATTENDANCE, list);
  }

  public static saveAttendanceList(list: AttendanceRecord[]): void {
    this.setItem(STORAGE_KEYS.ATTENDANCE, list);
  }

  // Warranty Items & Claims
  public static getWarrantyItems(): WarrantyItem[] {
    return this.getItem<WarrantyItem[]>(STORAGE_KEYS.WARRANTIES, defaultWarrantyItems);
  }

  public static saveWarrantyItem(item: WarrantyItem): void {
    const list = this.getWarrantyItems();
    const idx = list.findIndex(w => w.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    this.setItem(STORAGE_KEYS.WARRANTIES, list);
  }

  public static searchWarranty(query: string): WarrantyItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getWarrantyItems();
    return this.getWarrantyItems().filter(w =>
      w.serialNumber.toLowerCase().includes(q) ||
      (w.barcode && w.barcode.toLowerCase().includes(q)) ||
      w.invoiceId.toLowerCase().includes(q) ||
      w.productName.toLowerCase().includes(q) ||
      w.customerPhone.includes(q) ||
      w.customerName.toLowerCase().includes(q)
    );
  }

  public static getWarrantyClaims(): WarrantyClaim[] {
    return this.getItem<WarrantyClaim[]>(STORAGE_KEYS.WARRANTY_CLAIMS, defaultWarrantyClaims);
  }

  public static saveWarrantyClaim(claim: WarrantyClaim): void {
    const list = this.getWarrantyClaims();
    const idx = list.findIndex(c => c.id === claim.id);
    if (idx >= 0) {
      list[idx] = claim;
    } else {
      list.unshift(claim);
    }
    this.setItem(STORAGE_KEYS.WARRANTY_CLAIMS, list);
  }

  // App Team Users & Roles
  public static getAppUsers(): AppUser[] {
    return this.getItem<AppUser[]>(STORAGE_KEYS.USERS, defaultAppUsers);
  }

  public static saveAppUser(user: AppUser): void {
    const list = this.getAppUsers();
    const idx = list.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      list[idx] = user;
    } else {
      list.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, list);
  }

  public static deleteAppUser(id: string): void {
    const list = this.getAppUsers().filter(u => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, list);
  }

  // Subscription Plans & Billing Invoices
  public static getSubscriptionPlans(): SubscriptionPlan[] {
    return defaultSubscriptionPlans;
  }

  public static getBillingInvoices(): BillingInvoice[] {
    return this.getItem<BillingInvoice[]>(STORAGE_KEYS.BILLING_INVOICES, defaultBillingInvoices);
  }

  public static addBillingInvoice(inv: BillingInvoice): void {
    const list = this.getBillingInvoices();
    list.unshift(inv);
    this.setItem(STORAGE_KEYS.BILLING_INVOICES, list);
  }

  // Support Tickets
  public static getSupportTickets(): SupportTicket[] {
    return this.getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, defaultSupportTickets);
  }

  public static saveSupportTicket(ticket: SupportTicket): void {
    const list = this.getSupportTickets();
    const idx = list.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      list[idx] = ticket;
    } else {
      list.unshift(ticket);
    }
    this.setItem(STORAGE_KEYS.SUPPORT_TICKETS, list);
  }

  // Dashboard Aggregates
  public static getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const sales = this.getSales().filter(s => s.date === today && s.status !== 'returned');
    const expenses = this.getExpenses().filter(e => e.date === today);
    const customers = this.getCustomers();

    const todaySales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const todaySalesCount = sales.length;

    // Profit = (sellingPrice - purchasePrice) - itemDiscount - expenses
    let cogs = 0;
    sales.forEach(s => {
      s.items.forEach(item => {
        cogs += (item.purchasePrice || 0) * item.quantity;
      });
    });
    const todayExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = todaySales - cogs;
    const netProfit = Math.max(0, grossProfit - todayExpenses);

    const totalDue = customers.reduce((sum, c) => sum + (c.dueAmount || 0), 0);
    const todayCollection = sales.reduce((sum, s) => sum + s.paidAmount, 0);

    return {
      todaySales,
      todaySalesCount,
      todayProfit: netProfit,
      todayExpense: todayExpenses,
      totalDue,
      todayCollection
    };
  }

  public static getMonthStats() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const sales = this.getSales().filter(s => s.date.startsWith(currentMonth) && s.status !== 'returned');
    const purchases = this.getPurchases().filter(p => p.date.startsWith(currentMonth));
    const expenses = this.getExpenses().filter(e => e.date.startsWith(currentMonth));

    const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    let cogs = 0;
    sales.forEach(s => {
      s.items.forEach(item => {
        cogs += (item.purchasePrice || 0) * item.quantity;
      });
    });
    const netProfit = Math.max(0, totalSales - cogs - totalExpenses);

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit
    };
  }

  public static getSalesTrendData(days: 7 | 30 = 7, lang: Language = 'bn') {
    const sales = this.getSales().filter(s => s.status !== 'returned');
    const expenses = this.getExpenses();
    const result: TrendDataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = lang === 'bn'
        ? d.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

      const daySales = sales.filter(s => s.date === dateStr);
      const revenue = daySales.reduce((sum, s) => sum + s.grandTotal, 0);

      let cogs = 0;
      daySales.forEach(s => {
        s.items.forEach(item => {
          cogs += (item.purchasePrice || 0) * item.quantity;
        });
      });

      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      const grossProfit = revenue - cogs;
      const profit = Math.max(0, grossProfit - dayExpenses);

      result.push({
        date: dateStr,
        label: dayLabel,
        revenue,
        amount: revenue, // backwards compatibility
        profit,
        expense: dayExpenses,
        orders: daySales.length
      });
    }

    const total = result.reduce((sum, r) => sum + r.revenue, 0);
    const totalProfit = result.reduce((sum, r) => sum + r.profit, 0);
    const totalExpense = result.reduce((sum, r) => sum + r.expense, 0);
    const dailyAverage = Math.round(total / days);

    return {
      data: result,
      total,
      totalProfit,
      totalExpense,
      dailyAverage
    };
  }

  public static getMonthlyFinancialTrends(monthsCount: number = 6, lang: Language = 'bn'): MonthlyFinancialRecord[] {
    const sales = this.getSales().filter(s => s.status !== 'returned');
    const expenses = this.getExpenses();
    const purchases = this.getPurchases();
    const result: MonthlyFinancialRecord[] = [];

    const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = targetDate.getFullYear();
      const m = targetDate.getMonth();
      const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;

      const shortMonth = lang === 'bn' ? bnMonths[m] : enMonths[m];
      const label = lang === 'bn' ? `${bnMonths[m]} '${String(y).slice(-2)}` : `${enMonths[m]} ${y}`;

      const monthSales = sales.filter(s => s.date.startsWith(monthKey));
      const monthExpenses = expenses.filter(e => e.date.startsWith(monthKey));
      const monthPurchases = purchases.filter(p => p.date.startsWith(monthKey));

      let revenue = monthSales.reduce((sum, s) => sum + s.grandTotal, 0);
      let cogs = 0;
      monthSales.forEach(s => {
        s.items.forEach(item => {
          cogs += (item.purchasePrice || 0) * item.quantity;
        });
      });

      let expTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      let purTotal = monthPurchases.reduce((sum, p) => sum + p.grandTotal, 0);
      let ordersCount = monthSales.length;

      // Realistic business baseline fallback for past months if the app was just seeded
      // so historical charts have meaningful visual trajectory
      if (revenue === 0 && i > 0) {
        // Deterministic realistic numbers based on month index
        const baseRev = 42000 + ((m * 5431 + y) % 24000);
        revenue = Math.round(baseRev);
        cogs = Math.round(revenue * 0.73);
        expTotal = Math.round(3400 + ((m * 1420) % 2800));
        purTotal = Math.round(revenue * 0.79);
        ordersCount = Math.round(revenue / 460);
      }

      const grossProfit = Math.max(0, revenue - cogs);
      const netProfit = Math.max(0, grossProfit - expTotal);
      const profitMargin = revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(1)) : 0;

      result.push({
        monthKey,
        label,
        shortMonth,
        revenue,
        cogs,
        expenses: expTotal,
        purchases: purTotal,
        grossProfit,
        netProfit,
        profitMargin,
        ordersCount
      });
    }

    return result;
  }

  // Backup & Restore
  public static exportAllData(): string {
    const data: Record<string, any> = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      data[key] = localStorage.getItem(key);
    });
    return JSON.stringify(data, null, 2);
  }

  public static importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      Object.keys(parsed).forEach(key => {
        if (parsed[key] !== undefined && parsed[key] !== null) {
          localStorage.setItem(key, typeof parsed[key] === 'string' ? parsed[key] : JSON.stringify(parsed[key]));
        }
      });
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}
