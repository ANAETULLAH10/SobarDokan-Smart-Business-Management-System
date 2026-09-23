import {
  AdminProfile,
  SecurityPolicySettings,
  TwoFactorAuthSettings,
  UserSessionRecord,
  BranchRecord,
  CurrencyConfig,
  TaxRateRecord,
  InvoiceCustomConfig,
  PrintCustomConfig,
  ReceiptCustomConfig,
  PaymentMethodRecord,
  DateTimeConfig,
  AppearanceConfig,
  NotificationPreferences,
  AuditRecord,
  BackupHistoryItem,
  RolePermissionMatrix,
  AdminRole,
  SystemModule,
  ModulePermissions,
  ManagedUser
} from '../types/settings';
import { StorageService } from './storage';
import { BusinessSettings } from '../types';

const STORAGE_KEYS = {
  ADMIN_PROFILE: 'amardokan_admin_profile',
  PASSWORD_SECURITY: 'amardokan_password_security',
  TWO_FACTOR: 'amardokan_two_factor',
  SECURITY_POLICIES: 'amardokan_security_policies',
  SESSIONS: 'amardokan_user_sessions',
  BRANCHES: 'amardokan_branches',
  CURRENCY: 'amardokan_currency',
  TAXES: 'amardokan_taxes',
  INVOICE_CONFIG: 'amardokan_invoice_config',
  PRINT_CONFIG: 'amardokan_print_config',
  RECEIPT_CONFIG: 'amardokan_receipt_config',
  PAYMENT_METHODS: 'amardokan_payment_methods',
  DATETIME_CONFIG: 'amardokan_datetime_config',
  APPEARANCE_CONFIG: 'amardokan_appearance_config',
  NOTIFICATION_PREFS: 'amardokan_notification_prefs',
  AUDIT_LOGS: 'amardokan_audit_logs',
  BACKUP_HISTORY: 'amardokan_backup_history',
  ROLE_PERMISSIONS: 'amardokan_role_permissions',
  MANAGED_USERS: 'amardokan_managed_users',
};

// Default initial state
export const defaultAdminProfile: AdminProfile = {
  id: 'adm-001',
  name: 'MD ANAETULLAH',
  username: 'admin',
  email: 'mdanaetullah2021@gmail.com',
  phone: '01700-000000',
  address: 'মিরপুর ১০, ঢাকা ১২১৬, বাংলাদেশ',
  role: 'Owner',
  employeeId: 'EMP-001',
  dateJoined: '2024-01-01',
  accountStatus: 'active',
  lastLogin: new Date().toISOString(),
  language: 'bn',
  timezone: 'Asia/Dhaka',
  photoURL: ''
};

export const defaultSecurityPolicies: SecurityPolicySettings = {
  rememberMe: true,
  autoLogout: true,
  sessionTimeoutMinutes: 60,
  loginNotification: true,
  failedLoginProtection: true,
  maxLoginAttempts: 5,
  passwordExpirationDays: 90,
  requirePasswordChange: false
};

export const defaultTwoFactor: TwoFactorAuthSettings = {
  enabled: false,
  secret: 'JBSWY3DPEHPK3PXP',
  recoveryCodes: [
    'ADM-4829-1092',
    'ADM-9938-2841',
    'ADM-5510-9943',
    'ADM-7712-4039',
    'ADM-1129-8834',
    'ADM-6391-7201'
  ]
};

export const defaultSessions: UserSessionRecord[] = [
  {
    id: 'sess-current',
    userId: 'adm-001',
    userName: 'MD ANAETULLAH (Owner)',
    device: 'Desktop Workstation',
    browser: 'Chrome 128 (Windows 11)',
    os: 'Windows 11 Pro 64-bit',
    ip: '103.145.120.45 (Dhaka, BD)',
    location: 'Dhaka, Bangladesh',
    loginDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastActive: 'এখনই সক্রিয় (Just now)',
    isCurrent: true
  },
  {
    id: 'sess-pos-terminal',
    userId: 'adm-001',
    userName: 'POS Counter 01',
    device: 'Thermal POS Tablet',
    browser: 'Android Webview / Chrome Mobile',
    os: 'Android 14',
    ip: '192.168.1.105 (LAN Store)',
    location: 'Mirpur Shop, Dhaka',
    loginDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastActive: '২ ঘণ্টা আগে (2 hours ago)',
    isCurrent: false
  },
  {
    id: 'sess-mobile',
    userId: 'adm-001',
    userName: 'Owner Mobile App',
    device: 'Samsung Galaxy S24 Ultra',
    browser: 'Mobile Safari / Chrome',
    os: 'Android 14',
    ip: '103.145.120.89 (Dhaka, BD)',
    location: 'Dhaka, Bangladesh',
    loginDate: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastActive: 'গতকাল (Yesterday)',
    isCurrent: false
  }
];

export const defaultBranches: BranchRecord[] = [
  {
    id: 'br-main',
    name: 'প্রধান শাখা – মিরপুর ১০',
    code: 'BR-MIRPUR-01',
    address: 'প্লট ১২, রোড ৪, সেকশন ১০, মিরপুর, ঢাকা ১২১৬',
    phone: '01700-000000',
    manager: 'MD ANAETULLAH (Owner)',
    status: 'active',
    isDefault: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'br-uttara',
    name: 'উত্তরা শাখা (আউটলেট ২)',
    code: 'BR-UTTARA-02',
    address: 'হাউস ৪৫, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা ১২৩০',
    phone: '01800-112233',
    manager: 'মোঃ তানভীর আহমেদ (Manager)',
    status: 'active',
    isDefault: false,
    createdAt: '2024-06-15'
  },
  {
    id: 'br-dhanmondi',
    name: 'ধানমন্ডি শো-রুম (আউটলেট ৩)',
    code: 'BR-DHAN-03',
    address: 'সাত মসজিদ রোড, ধানমন্ডি, ঢাকা ১২০৫',
    phone: '01900-445566',
    manager: 'রাকিবুল হাসান (Manager)',
    status: 'active',
    isDefault: false,
    createdAt: '2024-11-01'
  }
];

export const defaultCurrencyConfig: CurrencyConfig = {
  currencyName: 'Bangladeshi Taka',
  currencyCode: 'BDT',
  currencySymbol: '৳',
  symbolPosition: 'before',
  decimalPlaces: 2,
  thousandSeparator: ',',
  decimalSeparator: '.'
};

export const defaultTaxRates: TaxRateRecord[] = [
  {
    id: 'tax-standard',
    name: 'স্ট্যান্ডার্ড ভ্যাট (Standard VAT 5%)',
    rate: 5,
    taxNumber: 'BIN-9876543210',
    isInclusive: false,
    isDefault: true,
    status: 'active',
    applyToProduct: true,
    displayOnInvoice: true
  },
  {
    id: 'tax-zero',
    name: 'শূন্য হার ভ্যাট (Zero Rated 0%)',
    rate: 0,
    taxNumber: 'BIN-9876543210',
    isInclusive: false,
    isDefault: false,
    status: 'active',
    applyToProduct: false,
    displayOnInvoice: true
  },
  {
    id: 'tax-reduced',
    name: 'রেয়াতি ভ্যাট (Reduced Rate 7.5%)',
    rate: 7.5,
    taxNumber: 'BIN-9876543210',
    isInclusive: false,
    isDefault: false,
    status: 'active',
    applyToProduct: true,
    displayOnInvoice: true
  }
];

export const defaultInvoiceConfig: InvoiceCustomConfig = {
  prefix: 'INV-',
  startingNumber: 1001,
  autoNumbering: true,
  numberFormat: 'prefix-number',
  dateFormat: 'DD/MM/YYYY',
  footer: 'আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ! পণ্য পরিবর্তনের জন্য ৭ দিনের মধ্যে ক্যাশ মেমোসহ যোগাযোগ করুন।',
  notes: 'বিক্রিত মাল ৭ দিনের মধ্যে ইনভয়েসসহ ফেরতযোগ্য। সফটওয়্যার বা ইলেকট্রনিক্স পণ্যে শর্ত প্রযোজ্য।',
  termsAndConditions: '১. ক্যাশ মেমো ব্যতীত কোনো দাবি গ্রহণযোগ্য নহে।\n২. ওয়ারেন্টিযুক্ত পণ্যের ক্ষেত্রে প্রস্তুতকারক প্রতিষ্ঠানের ওয়ারেন্টি নীতিমালা প্রযোজ্য।',
  showLogo: true,
  showCustomerAddress: true,
  showCustomerPhone: true,
  showSku: true,
  showBarcode: true,
  showDiscount: true,
  showVat: true,
  showPaidAmount: true,
  showDueAmount: true,
  showSalesperson: true,
  showSignature: true,
  showQrCode: true,
  template: 'modern'
};

export const defaultPrintConfig: PrintCustomConfig = {
  paperSize: '80mm',
  printerName: 'POS-80 Series Thermal Printer',
  defaultPrinter: 'System Default',
  autoPrintAfterSale: true,
  printDuplicateCopy: false,
  copiesCount: 1,
  showLogo: true,
  showFooter: true,
  marginTopMm: 5,
  marginBottomMm: 5,
  marginLeftMm: 5,
  marginRightMm: 5
};

export const defaultReceiptConfig: ReceiptCustomConfig = {
  storeLogo: true,
  storeName: true,
  address: true,
  phone: true,
  invoiceNumber: true,
  date: true,
  cashier: true,
  customer: true,
  products: true,
  quantity: true,
  price: true,
  discount: true,
  vat: true,
  total: true,
  paid: true,
  due: true,
  thankYouMessage: 'ধন্যবাদ, আবার আসবেন!',
  footerText: 'AmarDokan POS – Smart Business Management'
};

export const defaultPaymentMethods: PaymentMethodRecord[] = [
  {
    id: 'pm-cash',
    name: 'নগদ ক্যাশ (Cash)',
    code: 'cash',
    icon: 'Banknote',
    accountRef: 'Cash Register Drawer 01',
    isDefault: true,
    status: 'active',
    instructions: 'দোকানের ক্যাশ কাউন্টারে সরাসরি নগদ গ্রহণ'
  },
  {
    id: 'pm-bkash',
    name: 'বিকাশ মার্চেন্ট (bKash Merchant)',
    code: 'bkash',
    icon: 'Smartphone',
    accountRef: '01700-000000 (Merchant)',
    isDefault: false,
    status: 'active',
    instructions: 'bKash QR স্ক্যান অথবা মার্চেন্ট পেমেন্ট নম্বর'
  },
  {
    id: 'pm-nagad',
    name: 'নগদ ব্যবসা (Nagad Islamic/Sheba)',
    code: 'nagad',
    icon: 'Smartphone',
    accountRef: '01800-112233 (Merchant)',
    isDefault: false,
    status: 'active',
    instructions: 'নগদ মার্চেন্ট পেমেন্ট গেটওয়ে'
  },
  {
    id: 'pm-rocket',
    name: 'রকেট ডিবিবিএল (Rocket DBBL)',
    code: 'rocket',
    icon: 'Smartphone',
    accountRef: '01900-445566-7 (Merchant)',
    isDefault: false,
    status: 'active',
    instructions: 'ডাচ-বাংলা রকেট মোবাইল ব্যাংকিং'
  },
  {
    id: 'pm-card',
    name: 'ভিসা / মাস্টারকার্ড POS (POS Card)',
    code: 'card',
    icon: 'CreditCard',
    accountRef: 'City Bank POS Terminal #49281',
    isDefault: false,
    status: 'active',
    instructions: 'POS মেশিন বা সোয়াইপ টার্মিনাল'
  },
  {
    id: 'pm-bank',
    name: 'ব্যাংক স্থানান্তর (Bank Transfer/EFT)',
    code: 'bank',
    icon: 'Building2',
    accountRef: 'BRAC Bank A/C: 15012048291001',
    isDefault: false,
    status: 'active',
    instructions: 'অনলাইন ব্যাংক ট্রান্সফার বা চেক ডিপোজিট'
  }
];

export const defaultDateTimeConfig: DateTimeConfig = {
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  firstDayOfWeek: 'saturday',
  timezone: 'Asia/Dhaka'
};

export const defaultAppearanceConfig: AppearanceConfig = {
  theme: 'dark',
  accentColor: 'indigo',
  uiMode: 'comfortable',
  sidebarExpanded: true,
  rememberSidebarState: true,
  showAnimations: true,
  reduceMotion: false,
  showMenuLabels: true,
  showSectionHeadings: true,
  sidebarPosition: 'left'
};

export const defaultNotificationPrefs: NotificationPreferences = {
  lowStock: true,
  outOfStock: true,
  customerDue: true,
  supplierDue: true,
  warrantyExpiry: true,
  productExpiry: true,
  newSale: true,
  newPurchase: true,
  backupReminder: true,
  loginNotification: true,
  defaultMinStock: 5,
  alertFrequency: 'realtime',
  showDashboardWarning: true,
  showBadge: true
};

export const defaultAuditLogs: AuditRecord[] = [
  {
    id: 'aud-001',
    user: 'MD ANAETULLAH',
    userRole: 'Owner',
    action: 'Settings Updated',
    module: 'Business Profile',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    description: 'দোকানের ঠিকানা ও ইনভয়েস প্রিভিউ আপডেট করা হয়েছে',
    status: 'success'
  },
  {
    id: 'aud-002',
    user: 'MD ANAETULLAH',
    userRole: 'Owner',
    action: 'User Login',
    module: 'Security & Auth',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    description: 'সিস্টেমে অ্যাডমিন প্রোফাইলে সফল লগইন সম্পন্ন হয়েছে',
    status: 'success',
    ip: '103.145.120.45'
  },
  {
    id: 'aud-003',
    user: 'মোঃ তানভীর আহমেদ',
    userRole: 'Manager',
    action: 'Product Added',
    module: 'Inventory',
    recordId: 'PRD-1004',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    description: 'নতুন পণ্য "Samsung Galaxy A55 5G" ক্যাটালগে যুক্ত করা হয়েছে',
    status: 'success'
  },
  {
    id: 'aud-004',
    user: 'রাকিবুল হাসান',
    userRole: 'Cashier',
    action: 'Sale Created',
    module: 'POS Sales',
    recordId: 'INV-1048',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    description: 'ক্যাশ মেমো #INV-1048 (টাকা ৩৫,২০০) সম্পন্ন হয়েছে',
    status: 'success'
  },
  {
    id: 'aud-005',
    user: 'MD ANAETULLAH',
    userRole: 'Owner',
    action: 'Backup Created',
    module: 'Backup & Restore',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    description: 'সম্পূর্ণ ডাটাবেস ব্যাকআপ (.json) ডাউনলোড করা হয়েছে',
    status: 'success'
  }
];

export const defaultBackupHistory: BackupHistoryItem[] = [
  {
    id: 'bak-001',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    filename: 'AmarDokan_AutoBackup_2026-09-12.json',
    sizeBytes: 148200,
    sizeFormatted: '144.7 KB',
    status: 'completed',
    type: 'auto',
    recordsCount: 412
  },
  {
    id: 'bak-002',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    filename: 'AmarDokan_Manual_Full_Backup.json',
    sizeBytes: 142100,
    sizeFormatted: '138.8 KB',
    status: 'completed',
    type: 'manual',
    recordsCount: 395
  }
];

// Helper to build permission matrix
const fullAccess: ModulePermissions = { view: true, create: true, edit: true, delete: true, export: true, print: true };
const readPrintOnly: ModulePermissions = { view: true, create: false, edit: false, delete: false, export: false, print: true };
const cashierAccess: ModulePermissions = { view: true, create: true, edit: false, delete: false, export: false, print: true };
const noAccess: ModulePermissions = { view: false, create: false, edit: false, delete: false, export: false, print: false };

export const defaultRolePermissions: RolePermissionMatrix = {
  Owner: {
    dashboard: fullAccess,
    pos: fullAccess,
    quickSale: fullAccess,
    products: fullAccess,
    categories: fullAccess,
    inventory: fullAccess,
    sales: fullAccess,
    saleReturns: fullAccess,
    purchases: fullAccess,
    purchaseReturns: fullAccess,
    customers: fullAccess,
    suppliers: fullAccess,
    payments: fullAccess,
    expenses: fullAccess,
    income: fullAccess,
    reports: fullAccess,
    employees: fullAccess,
    attendance: fullAccess,
    warranty: fullAccess,
    settings: fullAccess,
    users: fullAccess,
    backup: fullAccess,
    auditLog: fullAccess
  },
  Admin: {
    dashboard: fullAccess,
    pos: fullAccess,
    quickSale: fullAccess,
    products: fullAccess,
    categories: fullAccess,
    inventory: fullAccess,
    sales: fullAccess,
    saleReturns: fullAccess,
    purchases: fullAccess,
    purchaseReturns: fullAccess,
    customers: fullAccess,
    suppliers: fullAccess,
    payments: fullAccess,
    expenses: fullAccess,
    income: fullAccess,
    reports: fullAccess,
    employees: fullAccess,
    attendance: fullAccess,
    warranty: fullAccess,
    settings: { ...fullAccess, delete: false },
    users: { ...fullAccess, delete: false },
    backup: { ...fullAccess, delete: false },
    auditLog: readPrintOnly
  },
  Manager: {
    dashboard: fullAccess,
    pos: fullAccess,
    quickSale: fullAccess,
    products: fullAccess,
    categories: fullAccess,
    inventory: fullAccess,
    sales: fullAccess,
    saleReturns: fullAccess,
    purchases: fullAccess,
    purchaseReturns: fullAccess,
    customers: fullAccess,
    suppliers: fullAccess,
    payments: fullAccess,
    expenses: fullAccess,
    income: fullAccess,
    reports: fullAccess,
    employees: { view: true, create: true, edit: true, delete: false, export: true, print: true },
    attendance: fullAccess,
    warranty: fullAccess,
    settings: readPrintOnly,
    users: readPrintOnly,
    backup: { view: true, create: true, edit: false, delete: false, export: true, print: false },
    auditLog: readPrintOnly
  },
  Cashier: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: false, print: false },
    pos: fullAccess,
    quickSale: fullAccess,
    products: { view: true, create: false, edit: false, delete: false, export: false, print: true },
    categories: { view: true, create: false, edit: false, delete: false, export: false, print: false },
    inventory: { view: true, create: false, edit: false, delete: false, export: false, print: true },
    sales: cashierAccess,
    saleReturns: { view: true, create: true, edit: false, delete: false, export: false, print: true },
    purchases: noAccess,
    purchaseReturns: noAccess,
    customers: { view: true, create: true, edit: true, delete: false, export: false, print: true },
    suppliers: { view: true, create: false, edit: false, delete: false, export: false, print: false },
    payments: cashierAccess,
    expenses: { view: true, create: true, edit: false, delete: false, export: false, print: true },
    income: { view: true, create: true, edit: false, delete: false, export: false, print: true },
    reports: noAccess,
    employees: noAccess,
    attendance: { view: true, create: true, edit: false, delete: false, export: false, print: false },
    warranty: { view: true, create: true, edit: false, delete: false, export: false, print: true },
    settings: noAccess,
    users: noAccess,
    backup: noAccess,
    auditLog: noAccess
  },
  Accountant: {
    dashboard: fullAccess,
    pos: readPrintOnly,
    quickSale: noAccess,
    products: readPrintOnly,
    categories: readPrintOnly,
    inventory: readPrintOnly,
    sales: { view: true, create: false, edit: false, delete: false, export: true, print: true },
    saleReturns: { view: true, create: false, edit: false, delete: false, export: true, print: true },
    purchases: { view: true, create: true, edit: true, delete: false, export: true, print: true },
    purchaseReturns: { view: true, create: true, edit: true, delete: false, export: true, print: true },
    customers: fullAccess,
    suppliers: fullAccess,
    payments: fullAccess,
    expenses: fullAccess,
    income: fullAccess,
    reports: fullAccess,
    employees: readPrintOnly,
    attendance: readPrintOnly,
    warranty: readPrintOnly,
    settings: noAccess,
    users: noAccess,
    backup: { view: true, create: true, edit: false, delete: false, export: true, print: false },
    auditLog: readPrintOnly
  },
  Salesman: {
    dashboard: { view: true, create: false, edit: false, delete: false, export: false, print: false },
    pos: cashierAccess,
    quickSale: cashierAccess,
    products: readPrintOnly,
    categories: readPrintOnly,
    inventory: readPrintOnly,
    sales: cashierAccess,
    saleReturns: noAccess,
    purchases: noAccess,
    purchaseReturns: noAccess,
    customers: { view: true, create: true, edit: false, delete: false, export: false, print: true },
    suppliers: noAccess,
    payments: cashierAccess,
    expenses: noAccess,
    income: noAccess,
    reports: noAccess,
    employees: noAccess,
    attendance: { view: true, create: true, edit: false, delete: false, export: false, print: false },
    warranty: readPrintOnly,
    settings: noAccess,
    users: noAccess,
    backup: noAccess,
    auditLog: noAccess
  }
};

export class SettingsService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error loading key: ${key}`, e);
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving key: ${key}`, e);
    }
  }

  // Admin Profile
  public static getAdminProfile(): AdminProfile {
    return this.getItem<AdminProfile>(STORAGE_KEYS.ADMIN_PROFILE, defaultAdminProfile);
  }

  public static saveAdminProfile(profile: AdminProfile): void {
    this.setItem(STORAGE_KEYS.ADMIN_PROFILE, profile);
    // Also sync user in StorageService if applicable
    const currentUser = StorageService.getUser();
    if (currentUser) {
      StorageService.saveUser({
        ...currentUser,
        name: profile.name,
        email: profile.email,
        photoURL: profile.photoURL || currentUser.photoURL,
        role: profile.role
      });
    }
    this.logAudit(profile.name, 'Admin Profile Updated', 'Admin Profile', 'প্রোফাইল তথ্য ও ছবি সফলভাবে আপডেট করা হয়েছে', 'success');
  }

  public static resetAdminProfile(): AdminProfile {
    this.setItem(STORAGE_KEYS.ADMIN_PROFILE, defaultAdminProfile);
    return defaultAdminProfile;
  }

  // Password Security
  public static verifyCurrentPassword(password: string): boolean {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSWORD_SECURITY);
    if (!saved) {
      // Default initial password is "admin123" or "123456"
      return password === 'admin123' || password === '123456';
    }
    try {
      const parsed = JSON.parse(saved);
      return parsed.passwordHash === this.hashPassword(password);
    } catch {
      return password === 'admin123';
    }
  }

  public static changePassword(newPassword: string): boolean {
    const data = {
      passwordHash: this.hashPassword(newPassword),
      lastChanged: new Date().toISOString(),
      requirePasswordChangeNextLogin: false,
      failedAttempts: 0
    };
    this.setItem(STORAGE_KEYS.PASSWORD_SECURITY, data);
    const profile = this.getAdminProfile();
    this.logAudit(profile.name, 'Password Changed', 'Security', 'অ্যাডমিন অ্যাকাউন্ট পাসওয়ার্ড পরিবর্তন করা হয়েছে', 'success');
    return true;
  }

  private static hashPassword(plain: string): string {
    // Client-side SHA-256 equivalent mock-hashing for local-first storage
    let hash = 0;
    for (let i = 0; i < plain.length; i++) {
      const char = plain.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_sec_${Math.abs(hash)}_${plain.length}`;
  }

  // Two-Factor Authentication
  public static getTwoFactorSettings(): TwoFactorAuthSettings {
    return this.getItem<TwoFactorAuthSettings>(STORAGE_KEYS.TWO_FACTOR, defaultTwoFactor);
  }

  public static saveTwoFactorSettings(settings: TwoFactorAuthSettings): void {
    this.setItem(STORAGE_KEYS.TWO_FACTOR, settings);
    const profile = this.getAdminProfile();
    const action = settings.enabled ? '2FA Enabled' : '2FA Disabled';
    this.logAudit(profile.name, action, 'Security & 2FA', `টু-ফ্যাক্টর অথেনটিকেশন ${settings.enabled ? 'চালু' : 'বন্ধ'} করা হয়েছে`, 'success');
  }

  public static generateTwoFactorSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  public static generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 6; i++) {
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      codes.push(`ADM-${part1}-${part2}`);
    }
    return codes;
  }

  // Security Policies
  public static getSecurityPolicies(): SecurityPolicySettings {
    return this.getItem<SecurityPolicySettings>(STORAGE_KEYS.SECURITY_POLICIES, defaultSecurityPolicies);
  }

  public static saveSecurityPolicies(policies: SecurityPolicySettings): void {
    this.setItem(STORAGE_KEYS.SECURITY_POLICIES, policies);
  }

  // Active Sessions
  public static getSessions(): UserSessionRecord[] {
    return this.getItem<UserSessionRecord[]>(STORAGE_KEYS.SESSIONS, defaultSessions);
  }

  public static terminateSession(sessionId: string): void {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
    const profile = this.getAdminProfile();
    this.logAudit(profile.name, 'Session Terminated', 'Security', `সেশন ID ${sessionId} লগ আউট করা হয়েছে`, 'warning');
  }

  public static terminateOtherSessions(): void {
    const current = this.getSessions().filter(s => s.isCurrent);
    this.setItem(STORAGE_KEYS.SESSIONS, current);
    const profile = this.getAdminProfile();
    this.logAudit(profile.name, 'All Other Sessions Terminated', 'Security', 'অন্যান্য সমস্ত ডিভাইস ও ব্রাউজার সেশন বন্ধ করা হয়েছে', 'warning');
  }

  // Branches
  public static getBranches(): BranchRecord[] {
    return this.getItem<BranchRecord[]>(STORAGE_KEYS.BRANCHES, defaultBranches);
  }

  public static addBranch(branch: Omit<BranchRecord, 'id' | 'createdAt'>): BranchRecord {
    const list = this.getBranches();
    const newBranch: BranchRecord = {
      ...branch,
      id: `br-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (newBranch.isDefault) {
      list.forEach(b => { b.isDefault = false; });
    }
    list.push(newBranch);
    this.setItem(STORAGE_KEYS.BRANCHES, list);
    const profile = this.getAdminProfile();
    this.logAudit(profile.name, 'Branch Created', 'Branches', `নতুন শাখা "${newBranch.name}" যুক্ত করা হয়েছে`, 'success', newBranch.id);
    return newBranch;
  }

  public static updateBranch(branch: BranchRecord): void {
    const list = this.getBranches();
    const idx = list.findIndex(b => b.id === branch.id);
    if (idx >= 0) {
      if (branch.isDefault) {
        list.forEach(b => { b.isDefault = false; });
      }
      list[idx] = branch;
      this.setItem(STORAGE_KEYS.BRANCHES, list);
      const profile = this.getAdminProfile();
      this.logAudit(profile.name, 'Branch Updated', 'Branches', `শাখা "${branch.name}" তথ্য হালনাগাদ করা হয়েছে`, 'success', branch.id);
    }
  }

  public static deleteBranch(id: string): boolean {
    const list = this.getBranches();
    const target = list.find(b => b.id === id);
    if (!target) return false;
    if (target.isDefault) return false; // cannot delete default
    const filtered = list.filter(b => b.id !== id);
    this.setItem(STORAGE_KEYS.BRANCHES, filtered);
    const profile = this.getAdminProfile();
    this.logAudit(profile.name, 'Branch Deleted', 'Branches', `শাখা "${target.name}" মুছে ফেলা হয়েছে`, 'warning', id);
    return true;
  }

  public static setDefaultBranch(id: string): void {
    const list = this.getBranches();
    list.forEach(b => {
      b.isDefault = b.id === id;
    });
    this.setItem(STORAGE_KEYS.BRANCHES, list);
  }

  // Currency
  public static getCurrencyConfig(): CurrencyConfig {
    return this.getItem<CurrencyConfig>(STORAGE_KEYS.CURRENCY, defaultCurrencyConfig);
  }

  public static saveCurrencyConfig(config: CurrencyConfig): void {
    this.setItem(STORAGE_KEYS.CURRENCY, config);
    // Also sync symbol to BusinessSettings in storage
    const currentSettings = StorageService.getSettings();
    if (currentSettings) {
      StorageService.saveSettings({
        ...currentSettings,
        currency: config.currencyCode,
        currencySymbol: config.currencySymbol
      });
    }
  }

  public static formatCurrency(amount: number, config?: CurrencyConfig): string {
    const c = config || this.getCurrencyConfig();
    const parts = amount.toFixed(c.decimalPlaces).split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';

    if (c.thousandSeparator) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, c.thousandSeparator);
    }

    const formattedNumber = decimalPart ? `${integerPart}${c.decimalSeparator}${decimalPart}` : integerPart;

    return c.symbolPosition === 'before'
      ? `${c.currencySymbol} ${formattedNumber}`
      : `${formattedNumber} ${c.currencySymbol}`;
  }

  // Tax Rates
  public static getTaxRates(): TaxRateRecord[] {
    return this.getItem<TaxRateRecord[]>(STORAGE_KEYS.TAXES, defaultTaxRates);
  }

  public static addTaxRate(tax: Omit<TaxRateRecord, 'id'>): TaxRateRecord {
    const list = this.getTaxRates();
    const newTax: TaxRateRecord = {
      ...tax,
      id: `tax-${Date.now()}`
    };
    if (newTax.isDefault) {
      list.forEach(t => { t.isDefault = false; });
    }
    list.push(newTax);
    this.setItem(STORAGE_KEYS.TAXES, list);
    return newTax;
  }

  public static updateTaxRate(tax: TaxRateRecord): void {
    const list = this.getTaxRates();
    const idx = list.findIndex(t => t.id === tax.id);
    if (idx >= 0) {
      if (tax.isDefault) {
        list.forEach(t => { t.isDefault = false; });
      }
      list[idx] = tax;
      this.setItem(STORAGE_KEYS.TAXES, list);
    }
  }

  public static deleteTaxRate(id: string): void {
    const list = this.getTaxRates().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TAXES, list);
  }

  // Invoice Config
  public static getInvoiceConfig(): InvoiceCustomConfig {
    return this.getItem<InvoiceCustomConfig>(STORAGE_KEYS.INVOICE_CONFIG, defaultInvoiceConfig);
  }

  public static saveInvoiceConfig(config: InvoiceCustomConfig): void {
    this.setItem(STORAGE_KEYS.INVOICE_CONFIG, config);
    // Sync to BusinessSettings
    const current = StorageService.getSettings();
    if (current) {
      StorageService.saveSettings({
        ...current,
        invoicePrefix: config.prefix,
        startingInvoiceNo: config.startingNumber,
        invoiceFooterText: config.footer
      });
    }
  }

  // Print Config
  public static getPrintConfig(): PrintCustomConfig {
    return this.getItem<PrintCustomConfig>(STORAGE_KEYS.PRINT_CONFIG, defaultPrintConfig);
  }

  public static savePrintConfig(config: PrintCustomConfig): void {
    this.setItem(STORAGE_KEYS.PRINT_CONFIG, config);
    // Sync paper size to BusinessSettings
    const current = StorageService.getSettings();
    if (current) {
      StorageService.saveSettings({
        ...current,
        paperSize: config.paperSize === '80mm' ? '80mm' : config.paperSize === '58mm' ? '58mm' : 'a4'
      });
    }
  }

  // Receipt Config
  public static getReceiptConfig(): ReceiptCustomConfig {
    return this.getItem<ReceiptCustomConfig>(STORAGE_KEYS.RECEIPT_CONFIG, defaultReceiptConfig);
  }

  public static saveReceiptConfig(config: ReceiptCustomConfig): void {
    this.setItem(STORAGE_KEYS.RECEIPT_CONFIG, config);
  }

  // Payment Methods
  public static getPaymentMethods(): PaymentMethodRecord[] {
    return this.getItem<PaymentMethodRecord[]>(STORAGE_KEYS.PAYMENT_METHODS, defaultPaymentMethods);
  }

  public static addPaymentMethod(method: Omit<PaymentMethodRecord, 'id'>): PaymentMethodRecord {
    const list = this.getPaymentMethods();
    const newMethod: PaymentMethodRecord = {
      ...method,
      id: `pm-${Date.now()}`
    };
    if (newMethod.isDefault) {
      list.forEach(m => { m.isDefault = false; });
    }
    list.push(newMethod);
    this.setItem(STORAGE_KEYS.PAYMENT_METHODS, list);
    return newMethod;
  }

  public static updatePaymentMethod(method: PaymentMethodRecord): void {
    const list = this.getPaymentMethods();
    const idx = list.findIndex(m => m.id === method.id);
    if (idx >= 0) {
      if (method.isDefault) {
        list.forEach(m => { m.isDefault = false; });
      }
      list[idx] = method;
      this.setItem(STORAGE_KEYS.PAYMENT_METHODS, list);
    }
  }

  public static deletePaymentMethod(id: string): void {
    const list = this.getPaymentMethods().filter(m => m.id !== id);
    this.setItem(STORAGE_KEYS.PAYMENT_METHODS, list);
  }

  // Date Time Config
  public static getDateTimeConfig(): DateTimeConfig {
    return this.getItem<DateTimeConfig>(STORAGE_KEYS.DATETIME_CONFIG, defaultDateTimeConfig);
  }

  public static saveDateTimeConfig(config: DateTimeConfig): void {
    this.setItem(STORAGE_KEYS.DATETIME_CONFIG, config);
  }

  // Appearance Config
  public static getAppearanceConfig(): AppearanceConfig {
    return this.getItem<AppearanceConfig>(STORAGE_KEYS.APPEARANCE_CONFIG, defaultAppearanceConfig);
  }

  public static saveAppearanceConfig(config: AppearanceConfig): void {
    this.setItem(STORAGE_KEYS.APPEARANCE_CONFIG, config);
  }

  // Notification Preferences
  public static getNotificationPreferences(): NotificationPreferences {
    return this.getItem<NotificationPreferences>(STORAGE_KEYS.NOTIFICATION_PREFS, defaultNotificationPrefs);
  }

  public static saveNotificationPreferences(prefs: NotificationPreferences): void {
    this.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, prefs);
  }

  // Audit Logs
  public static getAuditLogs(): AuditRecord[] {
    return this.getItem<AuditRecord[]>(STORAGE_KEYS.AUDIT_LOGS, defaultAuditLogs);
  }

  public static logAudit(
    user: string,
    action: string,
    module: string,
    description: string,
    status: 'success' | 'warning' | 'failed' = 'success',
    recordId?: string
  ): void {
    const logs = this.getAuditLogs();
    const record: AuditRecord = {
      id: `aud-${Date.now()}`,
      user,
      action,
      module,
      recordId,
      timestamp: new Date().toISOString(),
      description,
      status,
      ip: '103.145.120.45'
    };
    logs.unshift(record);
    // Keep last 500 audit logs
    if (logs.length > 500) logs.length = 500;
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  public static clearAuditLogs(): void {
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // Backup History & Operations
  public static getBackupHistory(): BackupHistoryItem[] {
    return this.getItem<BackupHistoryItem[]>(STORAGE_KEYS.BACKUP_HISTORY, defaultBackupHistory);
  }

  public static addBackupHistory(item: BackupHistoryItem): void {
    const list = this.getBackupHistory();
    list.unshift(item);
    this.setItem(STORAGE_KEYS.BACKUP_HISTORY, list);
  }

  // Role Permissions
  public static getRolePermissions(): RolePermissionMatrix {
    return this.getItem<RolePermissionMatrix>(STORAGE_KEYS.ROLE_PERMISSIONS, defaultRolePermissions);
  }

  public static saveRolePermissions(matrix: RolePermissionMatrix): void {
    this.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, matrix);
    const profile = this.getAdminProfile();
    this.logAudit(profile.name, 'Permissions Updated', 'Roles & Permissions', 'ভূমিকা ও পারমিশন মেট্রিক্স হালনাগাদ করা হয়েছে', 'success');
  }

  public static checkPermission(
    role: AdminRole,
    module: SystemModule,
    action: keyof ModulePermissions
  ): boolean {
    const matrix = this.getRolePermissions();
    const rolePerms = matrix[role];
    if (!rolePerms) return false;
    const modulePerms = rolePerms[module];
    if (!modulePerms) return false;
    return !!modulePerms[action];
  }

  // Managed Users (Staff Accounts)
  public static getUsers(): ManagedUser[] {
    return this.getItem<ManagedUser[]>(STORAGE_KEYS.MANAGED_USERS, defaultManagedUsers);
  }

  public static addUser(user: Omit<ManagedUser, 'id' | 'createdAt'>): ManagedUser {
    const users = this.getUsers();
    const newUser: ManagedUser = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    users.unshift(newUser);
    this.setItem(STORAGE_KEYS.MANAGED_USERS, users);
    const profile = this.getAdminProfile();
    this.logAudit(profile.name, 'User Added', 'User Management', `নতুন ব্যবহারকারী যোগ করা হয়েছে: ${newUser.name} (${newUser.role})`, 'success');
    return newUser;
  }

  public static updateUser(idOrUser: string | ManagedUser, updates?: Partial<ManagedUser>): void {
    const id = typeof idOrUser === 'string' ? idOrUser : idOrUser.id;
    const patch = typeof idOrUser === 'string' ? (updates || {}) : idOrUser;
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...patch };
      this.setItem(STORAGE_KEYS.MANAGED_USERS, users);
      const profile = this.getAdminProfile();
      this.logAudit(profile.name, 'User Updated', 'User Management', `ব্যবহারকারী তথ্য পরিবর্তন: ${users[index].name}`, 'success');
    }
  }

  public static deleteUser(id: string): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);
    const filtered = users.filter(u => u.id !== id);
    this.setItem(STORAGE_KEYS.MANAGED_USERS, filtered);
    if (user) {
      const profile = this.getAdminProfile();
      this.logAudit(profile.name, 'User Deleted', 'User Management', `ব্যবহারকারী ডিলিট করা হয়েছে: ${user.name}`, 'warning');
    }
  }
}

export const defaultManagedUsers: ManagedUser[] = [
  {
    id: 'usr-1',
    name: 'তানভীর আহমেদ (Tanvir)',
    username: 'tanvir',
    email: 'tanvir@amardokan.com',
    phone: '01811-223344',
    role: 'Manager',
    branch: 'প্রধান শাখা - মিরপুর',
    status: 'active',
    lastLogin: '2025-05-12T10:15:00Z',
    createdAt: '2024-02-01'
  },
  {
    id: 'usr-2',
    name: 'ফারহানা ইসলাম (Farhana)',
    username: 'farhana',
    email: 'farhana@amardokan.com',
    phone: '01922-334455',
    role: 'Cashier',
    branch: 'প্রধান শাখা - মিরপুর',
    status: 'active',
    lastLogin: '2025-05-12T09:30:00Z',
    createdAt: '2024-03-15'
  },
  {
    id: 'usr-3',
    name: 'সাকিব হাসান (Sakib)',
    username: 'sakib',
    email: 'sakib@amardokan.com',
    phone: '01633-445566',
    role: 'Accountant',
    branch: 'উত্তরা শাখা',
    status: 'active',
    lastLogin: '2025-05-11T16:45:00Z',
    createdAt: '2024-04-10'
  }
];
