import { jsPDF } from 'jspdf';
import {
  Sale,
  Purchase,
  Expense,
  Income,
  Product,
  Customer,
  Supplier,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  WarrantyItem,
  Employee,
  AttendanceRecord,
  BusinessSettings
} from '../types';
import { PDFService } from '../services/pdf/pdfService';

/**
 * Universal PDF Generator facade for AmarDokan.
 * Routes all PDF generation through the centralized PDFService with embedded
 * Noto Sans Bengali Unicode font support, eliminating any broken or garbled text.
 */
export class PDFGenerator {
  // Invoice PDF (Supports Bangla Unicode and professional receipt structure)
  public static async generateInvoicePDF(sale: Sale, settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateInvoicePDF(sale, settings);
  }

  // Cash memo alias
  public static async generateCashMemoPDF(sale: Sale, settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateCashMemoPDF(sale, settings);
  }

  // Customer Statement & Ledger
  public static async generateCustomerStatementPDF(
    customer: Customer,
    ledger: CustomerLedgerEntry[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateCustomerStatementPDF(customer, ledger, settings);
  }

  // Supplier Statement & Ledger
  public static async generateSupplierStatementPDF(
    supplier: Supplier,
    ledger: SupplierLedgerEntry[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateSupplierStatementPDF(supplier, ledger, settings);
  }

  // Stock & Inventory Valuation Report
  public static async generateStockReportPDF(products: Product[], settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateStockReportPDF(products, settings);
  }

  // Daily Sales & Revenue Report
  public static async generateDailySalesReportPDF(sales: Sale[], settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateSalesReportPDF(sales, settings, 'দৈনিক বিক্রয় রিপোর্ট');
  }

  // General Sales Report
  public static async generateSalesReportPDF(
    sales: Sale[],
    settings: BusinessSettings,
    title?: string,
    dateRange?: string
  ): Promise<jsPDF> {
    return PDFService.generateSalesReportPDF(sales, settings, title, dateRange);
  }

  // Verification Test Sales Report (exact spec from prompt)
  public static async generateTestSalesReportPDF(settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateTestSalesReportPDF(settings);
  }

  // Purchase Report
  public static async generatePurchaseReportPDF(
    purchases: Purchase[],
    settings: BusinessSettings,
    title?: string
  ): Promise<jsPDF> {
    return PDFService.generatePurchaseReportPDF(purchases, settings, title);
  }

  // Profit & Loss Report
  public static async generateProfitLossPDF(
    sales: Sale[],
    purchases: Purchase[],
    expenses: Expense[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateProfitLossPDF(sales, purchases, expenses, settings);
  }

  // Expense Report
  public static async generateExpenseReportPDF(expenses: Expense[], settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateExpenseReportPDF(expenses, settings);
  }

  // Income Report
  public static async generateIncomeReportPDF(incomes: Income[], settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateIncomeReportPDF(incomes, settings);
  }

  // Customer List & Due Report
  public static async generateCustomerReportPDF(customers: Customer[], settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateCustomerReportPDF(customers, settings);
  }

  // Supplier List Report
  public static async generateSupplierReportPDF(suppliers: Supplier[], settings: BusinessSettings): Promise<jsPDF> {
    return PDFService.generateSupplierReportPDF(suppliers, settings);
  }

  // Combined Due Report
  public static async generateDueReportPDF(
    customers: Customer[],
    suppliers: Supplier[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateDueReportPDF(customers, suppliers, settings);
  }

  // Yearly Dashboard Report
  public static async generateYearlyDashboardPDF(
    sales: Sale[],
    purchases: Purchase[],
    expenses: Expense[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateYearlyDashboardPDF(sales, purchases, expenses, settings);
  }

  // Warranty Report
  public static async generateWarrantyReportPDF(
    warranties: WarrantyItem[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateWarrantyReportPDF(warranties, settings);
  }

  // Warranty Certificate (Single Item)
  public static async generateWarrantyCertificatePDF(
    item: WarrantyItem,
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateWarrantyCertificatePDF(item, settings);
  }

  // Employee Report
  public static async generateEmployeeReportPDF(
    employees: Employee[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateEmployeeReportPDF(employees, settings);
  }

  // Attendance Report
  public static async generateAttendanceReportPDF(
    records: AttendanceRecord[],
    settings: BusinessSettings
  ): Promise<jsPDF> {
    return PDFService.generateAttendanceReportPDF(records, settings);
  }
}
