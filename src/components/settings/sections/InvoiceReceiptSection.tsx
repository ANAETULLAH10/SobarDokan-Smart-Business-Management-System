import React, { useState } from 'react';
import {
  Receipt, FileText, CheckCircle2, Save, Eye, Palette, Check
} from 'lucide-react';
import { InvoiceCustomConfig, Language, ReceiptCustomConfig, BusinessSettings } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface InvoiceReceiptSectionProps {
  lang: Language;
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
}

export const InvoiceReceiptSection: React.FC<InvoiceReceiptSectionProps> = ({
  lang,
  settings,
  onSaveSettings
}) => {
  const isBn = lang === 'bn';

  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceCustomConfig>(SettingsService.getInvoiceConfig());
  const [receiptConfig, setReceiptConfig] = useState<ReceiptCustomConfig>(SettingsService.getReceiptConfig());
  const [activeSubTab, setActiveSubTab] = useState<'invoice' | 'receipt'>('invoice');
  const [notification, setNotification] = useState('');

  const handleInvoiceChange = (field: keyof InvoiceCustomConfig, value: any) => {
    const updated = { ...invoiceConfig, [field]: value };
    setInvoiceConfig(updated);
    SettingsService.saveInvoiceConfig(updated);
    // Sync prefix and footer into parent BusinessSettings
    onSaveSettings({
      ...settings,
      invoicePrefix: updated.prefix,
      startingInvoiceNo: updated.startingNumber,
      invoiceFooterText: updated.footer
    });
    setNotification(isBn ? 'ইনভয়েস কনফিগারেশন সংরক্ষিত হয়েছে!' : 'Invoice settings saved!');
    setTimeout(() => setNotification(''), 2500);
  };

  const handleReceiptChange = (field: keyof ReceiptCustomConfig, value: any) => {
    const updated = { ...receiptConfig, [field]: value };
    setReceiptConfig(updated);
    SettingsService.saveReceiptConfig(updated);
    setNotification(isBn ? 'রসিদ কনফিগারেশন সংরক্ষিত হয়েছে!' : 'Receipt settings saved!');
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'ইনভয়েস ও রসিদ কাস্টমাইজেশন' : 'Invoice & Cash Receipt Customization'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'ক্যাশ মেমোর ক্রমিক সংখ্যা, ফিল্ডসমূহ, টেমপ্লেট ও প্রিন্ট লেআউট নিয়ন্ত্রণ করুন'
              : 'Customize numbering formats, visible line items, customer notes, and receipt templates'}
          </p>
        </div>

        {/* Sub Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-[#0b101d] border border-[#1e2a47] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('invoice')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'invoice'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isBn ? 'ইনভয়েস (A4/A5)' : 'Invoice (A4/A5)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('receipt')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'receipt'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{isBn ? 'থার্মাল রসিদ (POS)' : 'Thermal Receipt'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {activeSubTab === 'invoice' ? (
        /* Invoice Tab */
        <div className="space-y-6">
          {/* Template Style Selector */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? '১. ইনভয়েস ডিজাইন টেমপ্লেট' : '1. Invoice Template Layout'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['modern', 'classic', 'minimal', 'thermal', 'custom'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleInvoiceChange('template', t)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                    invoiceConfig.template === t
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold ring-1 ring-indigo-500'
                      : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <span className="capitalize text-xs font-semibold">{t}</span>
                  {invoiceConfig.template === t && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Numbering and Formatting */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? '২. ইনভয়েস নম্বরিং ফরম্যাট' : '2. Numbering & Serial Configuration'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'ইনভয়েস প্রিফিক্স' : 'Invoice Prefix'}
                </label>
                <input
                  type="text"
                  value={invoiceConfig.prefix}
                  onChange={e => handleInvoiceChange('prefix', e.target.value)}
                  placeholder="INV-"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'শুরুর ক্রমিক নম্বর' : 'Starting Serial No'}
                </label>
                <input
                  type="number"
                  value={invoiceConfig.startingNumber}
                  onChange={e => handleInvoiceChange('startingNumber', Number(e.target.value))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'নম্বরিং প্যাটার্ন' : 'Number Format'}
                </label>
                <select
                  value={invoiceConfig.numberFormat}
                  onChange={e => handleInvoiceChange('numberFormat', e.target.value as any)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="prefix-number">INV-1001</option>
                  <option value="prefix-year-number">INV-2026-1001</option>
                  <option value="prefix-month-number">INV-202609-1001</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invoiceConfig.autoNumbering}
                  onChange={e => handleInvoiceChange('autoNumbering', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-300">
                  {isBn ? 'স্বয়ংক্রিয় অটো-ইনক্রিমেন্ট নম্বরিং (Auto-Increment Serial)' : 'Enable automatic invoice numbering sequence'}
                </span>
              </label>
            </div>
          </div>

          {/* Visible Line Items / Checkboxes */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? '৩. ইনভয়েসে ফিল্ডসমূহ প্রদর্শন / হাইড করুন' : '3. Visible Fields & Line Items'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { key: 'showLogo', labelBn: 'দোকানের লোগো', labelEn: 'Store Logo' },
                { key: 'showCustomerAddress', labelBn: 'গ্রাহকের ঠিকানা', labelEn: 'Customer Address' },
                { key: 'showCustomerPhone', labelBn: 'গ্রাহকের মোবাইল', labelEn: 'Customer Phone' },
                { key: 'showSku', labelBn: 'পণ্য SKU কোড', labelEn: 'Product SKU' },
                { key: 'showBarcode', labelBn: 'বারকোড', labelEn: 'Barcode' },
                { key: 'showDiscount', labelBn: 'ডিসকাউন্ট কলাম', labelEn: 'Discount' },
                { key: 'showVat', labelBn: 'ভ্যাট / ট্যাক্স', labelEn: 'VAT / Tax' },
                { key: 'showPaidAmount', labelBn: 'পরিশোধিত টাকা', labelEn: 'Paid Amount' },
                { key: 'showDueAmount', labelBn: 'বকেয়া টাকা', labelEn: 'Due Amount' },
                { key: 'showSalesperson', labelBn: 'বিক্রয়কর্মী', labelEn: 'Salesperson' },
                { key: 'showSignature', labelBn: 'স্বাক্ষরের ঘর', labelEn: 'Signature Line' },
                { key: 'showQrCode', labelBn: 'ভেরিফিকেশন QR কোড', labelEn: 'QR Code' }
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0b101d] border border-[#1e2a47] cursor-pointer hover:border-slate-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!(invoiceConfig as any)[item.key]}
                    onChange={e => handleInvoiceChange(item.key as any, e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-medium">{isBn ? item.labelBn : item.labelEn}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? '৪. ইনভয়েস নোট ও শর্তাবলী' : '4. Notes, Terms & Conditions'}</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'ইনভয়েস ফুটার টেক্সট (ধন্যবাদ বার্তা)' : 'Invoice Footer Message'}
                </label>
                <input
                  type="text"
                  value={invoiceConfig.footer}
                  onChange={e => handleInvoiceChange('footer', e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'শর্তাবলী (Terms and Conditions)' : 'Terms and Conditions'}
                </label>
                <textarea
                  rows={3}
                  value={invoiceConfig.termsAndConditions}
                  onChange={e => handleInvoiceChange('termsAndConditions', e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Thermal Receipt Tab */
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <span>{isBn ? 'থার্মাল পিওএস রসিদ ফিল্ডসমূহ (POS Receipt Fields)' : 'POS Thermal Receipt Fields'}</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { key: 'storeLogo', labelBn: 'দোকানের লোগো', labelEn: 'Store Logo' },
              { key: 'storeName', labelBn: 'দোকানের নাম', labelEn: 'Store Name' },
              { key: 'address', labelBn: 'ঠিকানা', labelEn: 'Store Address' },
              { key: 'phone', labelBn: 'মোবাইল নম্বর', labelEn: 'Phone Number' },
              { key: 'invoiceNumber', labelBn: 'মেমো নম্বর', labelEn: 'Invoice No' },
              { key: 'date', labelBn: 'তারিখ ও সময়', labelEn: 'Date & Time' },
              { key: 'cashier', labelBn: 'ক্যাশিয়ার নাম', labelEn: 'Cashier Name' },
              { key: 'customer', labelBn: 'গ্রাহকের নাম', labelEn: 'Customer Name' },
              { key: 'products', labelBn: 'পণ্যের তালিকা', labelEn: 'Product Item List' },
              { key: 'quantity', labelBn: 'পরিমাণ (Qty)', labelEn: 'Quantity' },
              { key: 'price', labelBn: 'মূল্য (Rate)', labelEn: 'Price Rate' },
              { key: 'discount', labelBn: 'ডিসকাউন্ট', labelEn: 'Discount' },
              { key: 'vat', labelBn: 'ভ্যাট (VAT)', labelEn: 'VAT / Tax' },
              { key: 'total', labelBn: 'মোট বিল (Total)', labelEn: 'Total Amount' },
              { key: 'paid', labelBn: 'পরিশোধিত (Paid)', labelEn: 'Paid Amount' },
              { key: 'due', labelBn: 'বকেয়া (Due)', labelEn: 'Due Amount' }
            ].map(item => (
              <label
                key={item.key}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0b101d] border border-[#1e2a47] cursor-pointer hover:border-slate-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!!(receiptConfig as any)[item.key]}
                  onChange={e => handleReceiptChange(item.key as any, e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">{isBn ? item.labelBn : item.labelEn}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1e2a47]">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ধন্যবাদ বার্তা (Thank You Message)' : 'Thank You Message'}
              </label>
              <input
                type="text"
                value={receiptConfig.thankYouMessage}
                onChange={e => handleReceiptChange('thankYouMessage', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'রসিদ ফুটার টেক্সট' : 'Receipt Footer Sub-Text'}
              </label>
              <input
                type="text"
                value={receiptConfig.footerText}
                onChange={e => handleReceiptChange('footerText', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
