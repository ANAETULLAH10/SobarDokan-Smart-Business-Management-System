import React, { useState } from 'react';
import {
  Coins, Percent, Plus, Trash2, Edit2, CheckCircle2, AlertCircle,
  Eye, Check, X
} from 'lucide-react';
import { CurrencyConfig, Language, TaxRateRecord, BusinessSettings } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface CurrencyTaxSectionProps {
  lang: Language;
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
}

export const CurrencyTaxSection: React.FC<CurrencyTaxSectionProps> = ({
  lang,
  settings,
  onSaveSettings
}) => {
  const isBn = lang === 'bn';

  // Currency State
  const [currency, setCurrency] = useState<CurrencyConfig>(SettingsService.getCurrencyConfig());
  const [taxes, setTaxes] = useState<TaxRateRecord[]>(SettingsService.getTaxRates());

  // Editing Tax Rate State
  const [editingTax, setEditingTax] = useState<TaxRateRecord | null>(null);
  const [isAddingTax, setIsAddingTax] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState<number>(5);
  const [taxRegNo, setTaxRegNo] = useState('');
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [taxDefault, setTaxDefault] = useState(false);
  const [taxDisplayOnInvoice, setTaxDisplayOnInvoice] = useState(true);

  const [notification, setNotification] = useState('');

  // Save Currency
  const handleCurrencyChange = (field: keyof CurrencyConfig, value: any) => {
    const updated = { ...currency, [field]: value };
    setCurrency(updated);
    SettingsService.saveCurrencyConfig(updated);
    // Also sync to parent BusinessSettings
    onSaveSettings({
      ...settings,
      currency: updated.currencyCode,
      currencySymbol: updated.currencySymbol
    });
    setNotification(isBn ? 'মুদ্রা সেটিংস হালনাগাদ হয়েছে!' : 'Currency settings updated!');
    setTimeout(() => setNotification(''), 2500);
  };

  // Tax Management
  const openAddTax = () => {
    setTaxName('');
    setTaxRate(5);
    setTaxRegNo(settings.binTin || '');
    setTaxInclusive(false);
    setTaxDefault(false);
    setTaxDisplayOnInvoice(true);
    setIsAddingTax(true);
    setEditingTax(null);
  };

  const openEditTax = (t: TaxRateRecord) => {
    setTaxName(t.name);
    setTaxRate(t.rate);
    setTaxRegNo(t.taxNumber || '');
    setTaxInclusive(t.isInclusive);
    setTaxDefault(t.isDefault);
    setTaxDisplayOnInvoice(t.displayOnInvoice);
    setEditingTax(t);
    setIsAddingTax(false);
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName.trim()) return;

    if (isAddingTax) {
      SettingsService.addTaxRate({
        name: taxName,
        rate: Number(taxRate),
        taxNumber: taxRegNo,
        isInclusive: taxInclusive,
        isDefault: taxDefault,
        status: 'active',
        applyToProduct: true,
        displayOnInvoice: taxDisplayOnInvoice
      });
      setNotification(isBn ? 'নতুন ভ্যাট/ট্যাক্স হার যুক্ত করা হয়েছে' : 'Tax rate added successfully');
    } else if (editingTax) {
      SettingsService.updateTaxRate({
        ...editingTax,
        name: taxName,
        rate: Number(taxRate),
        taxNumber: taxRegNo,
        isInclusive: taxInclusive,
        isDefault: taxDefault,
        displayOnInvoice: taxDisplayOnInvoice
      });
      setNotification(isBn ? 'ভ্যাট/ট্যাক্স হার হালনাগাদ করা হয়েছে' : 'Tax rate updated');
    }

    setTaxes(SettingsService.getTaxRates());
    setIsAddingTax(false);
    setEditingTax(null);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleDeleteTax = (id: string, name: string) => {
    if (confirm(isBn ? `আপনি কি "${name}" ভ্যাট হার মুছে ফেলতে চান?` : `Delete tax rate "${name}"?`)) {
      SettingsService.deleteTaxRate(id);
      setTaxes(SettingsService.getTaxRates());
      setNotification(isBn ? 'ট্যাক্স হার মুছে ফেলা হয়েছে' : 'Tax rate deleted');
      setTimeout(() => setNotification(''), 2500);
    }
  };

  // Toggle Global Tax in BusinessSettings
  const handleToggleGlobalTax = (enabled: boolean) => {
    onSaveSettings({
      ...settings,
      enableVat: enabled
    });
    setNotification(isBn ? `ভ্যাট/ট্যাক্স সিস্টেম ${enabled ? 'চালু' : 'বন্ধ'} করা হয়েছে` : `Tax system ${enabled ? 'enabled' : 'disabled'}`);
    setTimeout(() => setNotification(''), 2500);
  };

  // Sample formatted preview
  const sampleAmount = 14500.75;
  const sampleFormatted = SettingsService.formatCurrency(sampleAmount, currency);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1e2a47] pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-indigo-400" />
          <span>{isBn ? 'মুদ্রা ও ভ্যাট/ট্যাক্স কনফিগারেশন' : 'Currency & Tax / VAT Configuration'}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {isBn
            ? 'টাকার সিম্বল, ফরম্যাটিং এবং পণ্যের উপর ভ্যাট/ট্যাক্স হিসেব ও রসিদে প্রদর্শনের নীতিমালা'
            : 'Configure system-wide currency formatting and official VAT / tax rate schedules'}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Currency Settings Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-400" />
            <span>{isBn ? '১. মুদ্রা ফরম্যাটিং (Currency Formatting)' : '1. Currency Settings'}</span>
          </h4>

          {/* Live Preview Pill */}
          <div className="flex items-center gap-2 bg-[#0b101d] px-3 py-1.5 rounded-xl border border-indigo-500/30">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] text-slate-400">{isBn ? 'নমুনা প্রিভিউ:' : 'Live Sample:'}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{sampleFormatted}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'মুদ্রার নাম' : 'Currency Name'}
            </label>
            <input
              type="text"
              value={currency.currencyName}
              onChange={e => handleCurrencyChange('currencyName', e.target.value)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'মুদ্রা কোড (Currency Code)' : 'Currency Code'}
            </label>
            <input
              type="text"
              value={currency.currencyCode}
              onChange={e => handleCurrencyChange('currencyCode', e.target.value)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'মুদ্রার প্রতীক (Symbol) *' : 'Currency Symbol *'}
            </label>
            <input
              type="text"
              value={currency.currencySymbol}
              onChange={e => handleCurrencyChange('currencySymbol', e.target.value)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'প্রতীকের অবস্থান' : 'Symbol Position'}
            </label>
            <select
              value={currency.symbolPosition}
              onChange={e => handleCurrencyChange('symbolPosition', e.target.value as any)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="before">{isBn ? 'সংখ্যার পূর্বে (যেমন: ৳ ১,০০০)' : 'Before Amount (e.g. ৳ 1,000)'}</option>
              <option value="after">{isBn ? 'সংখ্যার পরে (যেমন: ১,০০০ ৳)' : 'After Amount (e.g. 1,000 ৳)'}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'দশমিক স্থান (Decimals)' : 'Decimal Places'}
            </label>
            <select
              value={currency.decimalPlaces}
              onChange={e => handleCurrencyChange('decimalPlaces', Number(e.target.value))}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value={0}>{isBn ? 'দশমিক ছাড়া (০)' : '0 (No Decimals)'}</option>
              <option value={2}>{isBn ? '২ দশমিক স্থান (.০০)' : '2 (e.g. .00)'}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'হাজারের বিভাজক (Thousand)' : 'Thousand Separator'}
            </label>
            <select
              value={currency.thousandSeparator}
              onChange={e => handleCurrencyChange('thousandSeparator', e.target.value as any)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value=",">কমা ( , )</option>
              <option value=".">বিন্দু ( . )</option>
              <option value=" ">স্পেস ( Space )</option>
              <option value="">কোনটি নয় (None)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'দশমিক বিভাজক' : 'Decimal Separator'}
            </label>
            <select
              value={currency.decimalSeparator}
              onChange={e => handleCurrencyChange('decimalSeparator', e.target.value as any)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value=".">বিন্দু ( . )</option>
              <option value=",">কমা ( , )</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Tax & VAT Rates Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? '২. ভ্যাট ও ট্যাক্স হারসমূহ (VAT / Tax Rates)' : '2. VAT & Tax Rates'}</span>
            </h4>

            {/* Global Tax Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-[#0b101d] px-3 py-1 rounded-xl border border-[#1e2a47]">
              <input
                type="checkbox"
                checked={settings.enableVat !== false}
                onChange={e => handleToggleGlobalTax(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <span className="text-xs text-white font-medium">
                {settings.enableVat !== false ? (isBn ? 'ভ্যাট চালু আছে' : 'Tax Active') : (isBn ? 'ভ্যাট বন্ধ' : 'Tax Disabled')}
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={openAddTax}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isBn ? 'নতুন ভ্যাট রেট যোগ' : 'Add Tax Rate'}</span>
          </button>
        </div>

        {/* Tax Rates Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1e2a47]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101d] text-slate-400 border-b border-[#1e2a47]">
              <tr>
                <th className="p-3 font-semibold">{isBn ? 'ট্যাক্সের নাম' : 'Tax Name'}</th>
                <th className="p-3 font-semibold">{isBn ? 'হার (Rate %)' : 'Rate (%)'}</th>
                <th className="p-3 font-semibold">{isBn ? 'রেজিস্ট্রেশন নম্বর' : 'Tax Number'}</th>
                <th className="p-3 font-semibold">{isBn ? 'ধরন' : 'Type'}</th>
                <th className="p-3 font-semibold">{isBn ? 'ইনভয়েসে দৃশ্যমান' : 'Display'}</th>
                <th className="p-3 font-semibold text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]/60 text-slate-300">
              {taxes.map(tax => (
                <tr key={tax.id} className="hover:bg-[#131b2e]/60 transition-colors">
                  <td className="p-3 font-semibold text-white flex items-center gap-2">
                    <span>{tax.name}</span>
                    {tax.isDefault && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                        {isBn ? 'ডিফল্ট' : 'Default'}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold font-mono text-emerald-400">
                    {tax.rate}%
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {tax.taxNumber || '—'}
                  </td>
                  <td className="p-3">
                    <span className="text-slate-400">
                      {tax.isInclusive ? (isBn ? 'অন্তর্ভুক্ত (Inclusive)' : 'Inclusive') : (isBn ? 'অতিরিক্ত (Exclusive)' : 'Exclusive')}
                    </span>
                  </td>
                  <td className="p-3">
                    {tax.displayOnInvoice ? (
                      <span className="text-emerald-400 font-semibold">{isBn ? 'হ্যাঁ' : 'Yes'}</span>
                    ) : (
                      <span className="text-slate-500">{isBn ? 'না' : 'No'}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditTax(tax)}
                        className="p-1 rounded-lg bg-[#131b2e] hover:bg-[#1a253e] text-indigo-300"
                        title={isBn ? 'এডিট' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTax(tax.id, tax.name)}
                        className="p-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-300"
                        title={isBn ? 'মুছুন' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tax Modal */}
      {(isAddingTax || editingTax) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-400" />
                <span>{isAddingTax ? (isBn ? 'নতুন ট্যাক্স হার যোগ' : 'Add Tax Rate') : (isBn ? 'ট্যাক্স হার সম্পাদনা' : 'Edit Tax Rate')}</span>
              </h4>
              <button
                onClick={() => { setIsAddingTax(false); setEditingTax(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTax} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'ট্যাক্সের নাম *' : 'Tax Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={taxName}
                  onChange={e => setTaxName(e.target.value)}
                  placeholder="যেমন: স্ট্যান্ডার্ড ভ্যাট (5%)"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'শতকরা হার (%) *' : 'Rate (%) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'রেজিস্ট্রেশন নম্বর (BIN/TIN)' : 'Tax/BIN Number'}
                  </label>
                  <input
                    type="text"
                    value={taxRegNo}
                    onChange={e => setTaxRegNo(e.target.value)}
                    placeholder="BIN-9876543210"
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1e2a47]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxInclusive}
                    onChange={e => setTaxInclusive(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">
                    {isBn ? 'মূল্যের সাথে অন্তর্ভুক্ত ভ্যাট (Inclusive Tax)' : 'Inclusive in product price'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxDefault}
                    onChange={e => setTaxDefault(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">
                    {isBn ? 'ডিফল্ট ভ্যাট হিসেবে নির্ধারণ করুন' : 'Set as default tax rate'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxDisplayOnInvoice}
                    onChange={e => setTaxDisplayOnInvoice(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">
                    {isBn ? 'ইনভয়েস ও ক্যাশ মেমোতে ভ্যাট আলাদা প্রদর্শন' : 'Show breakdown on invoice'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => { setIsAddingTax(false); setEditingTax(null); }}
                  className="px-3.5 py-2 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  {isBn ? 'সংরক্ষণ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
