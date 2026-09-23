export type AdminRole = 'Owner' | 'Admin' | 'Manager' | 'Cashier' | 'Accountant' | 'Salesman';

export interface AdminProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: AdminRole;
  employeeId: string;
  dateJoined: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  language: 'bn' | 'en';
  timezone: string;
  photoURL?: string;
  avatar?: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: AdminRole;
  branch: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  avatar?: string;
  password?: string;
  createdAt: string;
}

export interface PasswordSecurityData {
  passwordHash?: string; // Stored hashed/salted locally or ready for backend sync
  lastChanged: string;
  requirePasswordChangeNextLogin: boolean;
  failedAttempts: number;
  lockedUntil?: string;
}

export interface TwoFactorAuthSettings {
  enabled: boolean;
  secret: string;
  qrCodeUrl?: string;
  recoveryCodes: string[];
  lastVerifiedAt?: string;
  phoneNumber?: string;
}

export interface SecurityPolicySettings {
  rememberMe: boolean;
  autoLogout: boolean;
  sessionTimeoutMinutes: number; // e.g. 15, 30, 60, 120, 0 (disabled)
  loginNotification: boolean;
  failedLoginProtection: boolean;
  maxLoginAttempts: number;
  passwordExpirationDays: number;
  requirePasswordChange: boolean;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  userName: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  loginDate: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface BranchRecord {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
  isDefault: boolean;
  createdAt: string;
}

export interface CurrencyConfig {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandSeparator: ',' | '.' | ' ' | '';
  decimalSeparator: '.' | ',';
}

export interface TaxRateRecord {
  id: string;
  name: string;
  rate: number;
  taxNumber?: string;
  isInclusive: boolean;
  isDefault: boolean;
  status: 'active' | 'inactive';
  applyToProduct: boolean;
  displayOnInvoice: boolean;
}

export interface InvoiceCustomConfig {
  prefix: string;
  startingNumber: number;
  autoNumbering: boolean;
  numberFormat: 'prefix-number' | 'prefix-year-number' | 'prefix-month-number';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'DD-MMM-YYYY';
  footer: string;
  notes: string;
  termsAndConditions: string;
  showLogo: boolean;
  showCustomerAddress: boolean;
  showCustomerPhone: boolean;
  showSku: boolean;
  showBarcode: boolean;
  showDiscount: boolean;
  showVat: boolean;
  showPaidAmount: boolean;
  showDueAmount: boolean;
  showSalesperson: boolean;
  showSignature: boolean;
  showQrCode: boolean;
  template: 'modern' | 'classic' | 'minimal' | 'thermal' | 'custom';
}

export interface PrintCustomConfig {
  paperSize: 'a4' | 'a5' | '58mm' | '80mm';
  printerName: string;
  defaultPrinter: string;
  autoPrintAfterSale: boolean;
  printDuplicateCopy: boolean;
  copiesCount: number;
  showLogo: boolean;
  showFooter: boolean;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
}

export interface ReceiptCustomConfig {
  storeLogo: boolean;
  storeName: boolean;
  address: boolean;
  phone: boolean;
  invoiceNumber: boolean;
  date: boolean;
  cashier: boolean;
  customer: boolean;
  products: boolean;
  quantity: boolean;
  price: boolean;
  discount: boolean;
  vat: boolean;
  total: boolean;
  paid: boolean;
  due: boolean;
  thankYouMessage: string;
  footerText: string;
}

export interface PaymentMethodRecord {
  id: string;
  name: string;
  code: 'cash' | 'card' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'other';
  icon: string;
  accountRef: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  instructions?: string;
}

export interface DateTimeConfig {
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD MMM YYYY';
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 'saturday' | 'sunday' | 'monday';
  timezone: string;
}

export interface AppearanceConfig {
  theme: 'dark' | 'light' | 'system';
  accentColor: 'indigo' | 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red';
  uiMode: 'compact' | 'comfortable';
  sidebarExpanded: boolean;
  rememberSidebarState: boolean;
  showAnimations: boolean;
  reduceMotion: boolean;
  showMenuLabels: boolean;
  showSectionHeadings: boolean;
  sidebarPosition: 'left' | 'right';
}

export interface NotificationPreferences {
  lowStock: boolean;
  outOfStock: boolean;
  customerDue: boolean;
  supplierDue: boolean;
  warrantyExpiry: boolean;
  productExpiry: boolean;
  newSale: boolean;
  newPurchase: boolean;
  backupReminder: boolean;
  loginNotification: boolean;
  defaultMinStock: number;
  alertFrequency: 'realtime' | 'daily' | 'weekly';
  showDashboardWarning: boolean;
  showBadge: boolean;
}

export interface AuditRecord {
  id: string;
  user: string;
  userRole?: string;
  action: string;
  module: string;
  recordId?: string;
  timestamp: string;
  description: string;
  status: 'success' | 'warning' | 'failed';
  ip?: string;
}

export interface BackupHistoryItem {
  id: string;
  date: string;
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  status: 'completed' | 'restored' | 'failed';
  type: 'manual' | 'auto';
  recordsCount: number;
}

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print: boolean;
}

export type SystemModule =
  | 'dashboard'
  | 'pos'
  | 'quickSale'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'sales'
  | 'saleReturns'
  | 'purchases'
  | 'purchaseReturns'
  | 'customers'
  | 'suppliers'
  | 'payments'
  | 'expenses'
  | 'income'
  | 'reports'
  | 'employees'
  | 'attendance'
  | 'warranty'
  | 'settings'
  | 'users'
  | 'backup'
  | 'auditLog';

export type RolePermissionMatrix = Record<AdminRole, Record<SystemModule, ModulePermissions>>;

export interface CompleteSettingsState {
  adminProfile: AdminProfile;
  securityPolicies: SecurityPolicySettings;
  twoFactor: TwoFactorAuthSettings;
  branches: BranchRecord[];
  currency: CurrencyConfig;
  taxes: TaxRateRecord[];
  invoice: InvoiceCustomConfig;
  print: PrintCustomConfig;
  receipt: ReceiptCustomConfig;
  paymentMethods: PaymentMethodRecord[];
  dateTime: DateTimeConfig;
  appearance: AppearanceConfig;
  notifications: NotificationPreferences;
  rolePermissions: RolePermissionMatrix;
}
