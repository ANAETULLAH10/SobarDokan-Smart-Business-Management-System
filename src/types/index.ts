export type Language = 'bn' | 'en';
export type ThemeMode = 'night' | 'day';

export interface Product {
  id: string;
  name: string;
  banglaName?: string;
  sku: string;
  barcode: string;
  category: string;
  brand?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  minSellingPrice?: number;
  openingStock: number;
  currentStock: number;
  minStockAlert: number;
  supplierId?: string;
  supplierName?: string;
  taxPercent: number;
  discount: number;
  image?: string;
  warrantyMonths?: number;
  expiryDate?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  banglaName: string;
  icon?: string;
  color?: string;
  productCount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: number;
  creditLimit?: number;
  totalPurchased: number;
  totalPaid: number;
  dueAmount: number;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: number;
  totalSupplied: number;
  totalPaid: number;
  dueAmount: number;
  notes?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'bkash' | 'nagad' | 'bank' | 'due';

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  vat: number;
  deliveryCharge: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  status: 'completed' | 'hold' | 'returned';
  notes?: string;
  cashierName?: string;
  createdAt: string;
}

export interface SaleReturn {
  id: string;
  returnNo: string;
  saleId: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
  }[];
  totalRefund: number;
  refundMethod: PaymentMethod;
  reason: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  vat: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  returnNo: string;
  purchaseId: string;
  invoiceNo?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
  }[];
  totalRefund: number;
  reason: string;
  createdAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'sale' | 'payment' | 'return' | 'adjustment';
  referenceNo: string;
  debit: number; // customer owes more
  credit: number; // customer paid
  balance: number;
  note?: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  date: string;
  type: 'purchase' | 'payment' | 'return' | 'adjustment';
  referenceNo: string;
  debit: number; // paid to supplier
  credit: number; // bought from supplier
  balance: number;
  note?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  referenceNo?: string;
  createdAt: string;
}

export interface Income {
  id: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  date: string;
  type: 'increase' | 'decrease' | 'damage' | 'lost' | 'correction';
  quantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quoteNo: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
}

export interface WarrantyItem {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  serialNo?: string;
  serialNumber?: string;
  imei?: string;
  barcode?: string;
  invoiceNo?: string;
  invoiceId?: string;
  productId?: string;
  purchaseDate: string;
  warrantyPeriodMonths: number;
  warrantyExpiryDate: string;
  status: 'valid' | 'expired' | 'claimed' | 'active' | 'expiring_soon';
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  position?: string;
  designation?: string;
  department?: string;
  role?: 'Owner' | 'Admin' | 'Manager' | 'Cashier' | 'Accountant' | string;
  salary: number;
  salaryType?: 'monthly' | 'daily';
  joiningDate: string;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'half_day';
  workingHours?: number;
  notes?: string;
}

export interface BusinessSettings {
  businessName: string;
  businessSubtitle: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  binTin: string;
  tinNo?: string;
  vatRegNo?: string;
  tradeLicenseNo?: string;
  taxRegistrationLabel?: string;
  logoUrl?: string;
  showLogoOnInvoice?: boolean;
  invoiceHeaderLayout?: 'center' | 'split' | 'compact';
  invoiceHeaderTitle?: string;
  invoiceHeaderNote?: string;
  vatPercent: number;
  currency: string;
  currencySymbol: string;
  invoicePrefix: string;
  startingInvoiceNo: number;
  paperSize: '80mm' | '58mm' | 'a4';
  invoiceFooterText: string;
  language: Language;
  theme: 'dark' | 'light';
  autoBackup: boolean;
  banglaBusinessName?: string;
  englishBusinessName?: string;
  altPhone?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  businessRegNo?: string;
}

export type TabType =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'categories'
  | 'sales'
  | 'purchases'
  | 'customers'
  | 'due_khata'
  | 'suppliers'
  | 'expenses'
  | 'cash_flow'
  | 'reports'
  | 'sms_center'
  | 'settings'
  | 'attendance'
  | 'warranty_check'
  | 'users_management'
  | 'billing_upgrade'
  | 'customer_support'
  | 'voice_assistant';

export interface WarrantyClaim {
  id: string;
  warrantyItemId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  serialNumber: string;
  issueDescription: string;
  claimDate: string;
  estimatedReturnDate?: string;
  status: 'pending' | 'under_repair' | 'repaired' | 'replaced' | 'delivered';
  technicianNotes?: string;
  repairCost?: number;
}

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'salesperson';
  pin: string;
  status: 'active' | 'inactive';
  permissions: {
    canPos: boolean;
    canDiscount: boolean;
    canEditProducts: boolean;
    canViewReports: boolean;
    canDeleteRecords: boolean;
    canAccessSettings: boolean;
  };
  lastActive?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  banglaName: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  planName: string;
  amount: number;
  status: 'paid' | 'pending';
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Card';
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'pos' | 'printer' | 'scanner' | 'sms' | 'billing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  response?: string;
}

export interface SMSMessage {
  id: string;
  recipientName: string;
  recipientPhone: string;
  customerId?: string;
  message: string;
  category: 'due_reminder' | 'promo' | 'transaction' | 'greeting' | 'custom';
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
  characterCount: number;
  smsParts: number;
  provider?: string;
}

export interface SMSTemplate {
  id: string;
  title: string;
  category: 'due_reminder' | 'promo' | 'transaction' | 'greeting' | 'custom';
  content: string;
  isDefault?: boolean;
}

export interface SMSSettings {
  provider: 'mock_simulator' | 'greenweb' | 'bulksms_bd' | 'alphasms' | 'mimsms' | 'twilio' | 'custom_api';
  apiKey: string;
  senderId: string;
  balance: number;
  autoSendOnSale: boolean;
  autoSendOnPayment: boolean;
  autoSendOnDue: boolean;
  maskingName?: string;
  webhookUrl?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Cashier';
  avatar?: string;
  online: boolean;
}

export type ToastType = 'warning' | 'error' | 'success' | 'info';

export interface ToastProductDetail {
  id: string;
  name: string;
  banglaName?: string;
  currentStock: number;
  minStockAlert: number;
  unit?: string;
}

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  productDetails?: ToastProductDetail[];
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // In milliseconds (default: 6000, 0 for sticky)
  timestamp?: number;
}

export interface MonthlyFinancialRecord {
  monthKey: string;
  label: string;
  shortMonth: string;
  revenue: number;
  cogs: number;
  expenses: number;
  purchases: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  ordersCount: number;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  revenue: number;
  amount: number; // alias for revenue
  profit: number;
  expense: number;
  orders: number;
}

export * from './settings';

