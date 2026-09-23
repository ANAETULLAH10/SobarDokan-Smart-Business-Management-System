import React, { useState } from 'react';
import {
  Truck, Plus, Search, Phone, Mail, MapPin, DollarSign,
  FileText, ArrowUpRight, CheckCircle2, X, Edit2, ShieldAlert, Download
} from 'lucide-react';
import { Supplier, SupplierLedgerEntry, BusinessSettings, Language, PaymentMethod } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface SuppliersViewProps {
  lang: Language;
  settings: BusinessSettings;
  suppliers: Supplier[];
  onRefresh: () => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  lang,
  settings,
  suppliers,
  onRefresh
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Pay Supplier Modal
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNote, setPayNote] = useState('');

  // Ledger Statement Modal
  const [viewingLedgerSupplier, setViewingLedgerSupplier] = useState<Supplier | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<SupplierLedgerEntry[]>([]);

  // Add / Edit Form State
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const totalSupplied = suppliers.reduce((sum, s) => sum + (s.totalSupplied || 0), 0);
  const totalPaid = suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
  const totalDue = suppliers.reduce((sum, s) => sum + (s.dueAmount || 0), 0);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormCompany('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (supp: Supplier) => {
    setEditingSupplier(supp);
    setFormName(supp.name);
    setFormCompany(supp.company);
    setFormPhone(supp.phone);
    setFormEmail(supp.email || '');
    setFormAddress(supp.address || '');
    setFormNotes(supp.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formPhone) return;

    const newSupplier: Supplier = {
      id: editingSupplier ? editingSupplier.id : 'supp-' + Date.now(),
      name: formName || formCompany,
      company: formCompany,
      phone: formPhone,
      email: formEmail,
      address: formAddress,
      notes: formNotes,
      openingBalance: editingSupplier ? editingSupplier.openingBalance : 0,
      totalSupplied: editingSupplier ? editingSupplier.totalSupplied : 0,
      totalPaid: editingSupplier ? editingSupplier.totalPaid : 0,
      dueAmount: editingSupplier ? editingSupplier.dueAmount : 0,
      createdAt: editingSupplier ? editingSupplier.createdAt : new Date().toISOString()
    };

    StorageService.saveSupplier(newSupplier);
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleOpenPay = (supp: Supplier) => {
    setPayingSupplier(supp);
    setPayAmount(supp.dueAmount > 0 ? supp.dueAmount : '');
    setPayMethod('cash');
    setPayNote('');
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || !payAmount || Number(payAmount) <= 0) return;

    StorageService.paySupplierDue(payingSupplier.id, Number(payAmount), payMethod, payNote);
    setPayingSupplier(null);
    onRefresh();
  };

  const handleOpenLedger = (supp: Supplier) => {
    setViewingLedgerSupplier(supp);
    const entries = StorageService.getSupplierLedger(supp.id);
    setLedgerEntries(entries);
  };

  return (
    <div id="suppliers-view" className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-400" />
            <span>{lang === 'bn' ? 'সরবরাহকারী তালিকা ও দেনা হিসাব' : 'Suppliers & Accounts Payable'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
              {suppliers.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'পণ্য সরবরাহকারীদের তথ্য, ক্রয়ের দেনা ও খতিয়ান পরিশোধ ব্যবস্থাপনা' : 'Manage vendor relationships, purchase payables, and payment settlements'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => PDFGenerator.generateSupplierReportPDF(suppliers, settings)}
            className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সরবরাহকারী তালিকা PDF' : 'Supplier List PDF'}</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'bn' ? 'নতুন সরবরাহকারী যোগ করুন' : 'Add Supplier'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">{lang === 'bn' ? 'মোট সরবরাহ মূল্য' : 'Total Supplied Value'}</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {settings.currencySymbol}{totalSupplied.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {suppliers.length} জন সরবরাহকারী
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">{lang === 'bn' ? 'পরিশোধিত অর্থ' : 'Total Paid'}</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
            {settings.currencySymbol}{totalPaid.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
            পরিশোধ সম্পন্ন
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">{lang === 'bn' ? 'মোট পাওনাদার দেনা (Payable)' : 'Total Due (Payable)'}</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">
            {settings.currencySymbol}{totalDue.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-400 font-semibold mt-1 inline-block">
            পরিশোধযোগ্য বাকি
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'সরবরাহকারী কোম্পানি, নাম বা ফোন নম্বর খুঁজুন...' : 'Search supplier company, contact, or phone...'}
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1e293b] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b101d] border-b border-[#1e293b] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">প্রতিষ্ঠান / কোম্পানি</th>
                <th className="py-3 px-4">যোগাযোগকারী ব্যক্তি</th>
                <th className="py-3 px-4">ফোন ও ঠিকানা</th>
                <th className="py-3 px-4 text-right">মোট সরবরাহ</th>
                <th className="py-3 px-4 text-right">পরিশোধ</th>
                <th className="py-3 px-4 text-right">দেনা (Due)</th>
                <th className="py-3 px-4 text-right">কার্যক্রম (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#192238]">
              {filtered.length > 0 ? (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-[#141d30] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {s.company}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{s.phone}</div>
                      {s.address && <div className="text-[11px] text-slate-500">{s.address}</div>}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {settings.currencySymbol}{(s.totalSupplied || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-400">
                      {settings.currencySymbol}{(s.totalPaid || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-400">
                      {settings.currencySymbol}{(s.dueAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPay(s)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1"
                          title="Pay Due"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>পরিশোধ</span>
                        </button>
                        <button
                          onClick={() => handleOpenLedger(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-[#1a253e]"
                          title="Ledger Statement"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a253e]"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p>{lang === 'bn' ? 'কোন সরবরাহকারী পাওয়া যায়নি' : 'No suppliers found'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>{editingSupplier ? 'সরবরাহকারী সম্পাদনা' : 'নতুন সরবরাহকারী নিবন্ধন'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">প্রতিষ্ঠানের নাম (Company / Brand) *</label>
                <input
                  type="text"
                  required
                  value={formCompany}
                  onChange={e => setFormCompany(e.target.value)}
                  placeholder="যেমন: প্রাণ আরএফএল গ্রুপ"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">যোগাযোগকারীর নাম (Contact Person)</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="যেমন: মো: আরিফুল ইসলাম"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">ফোন নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">ইমেইল</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="supplier@mail.com"
                    className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">ঠিকানা</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="দোকান বা ডিপো ঠিকানা"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Due Modal */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>সরবরাহকারীকে দেনা পরিশোধ</span>
              </h3>
              <button onClick={() => setPayingSupplier(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-3 text-xs">
              <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1e2a47]">
                <p className="text-slate-400">সরবরাহকারী:</p>
                <p className="text-sm font-bold text-white mt-0.5">{payingSupplier.company} ({payingSupplier.name})</p>
                <p className="text-slate-400 mt-2">বর্তমান মোট দেনা:</p>
                <p className="text-lg font-extrabold text-rose-400">{settings.currencySymbol}{payingSupplier.dueAmount.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">পরিশোধের পরিমাণ *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="পরিমাণ লিখুন"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">পরিশোধের মাধ্যম</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                >
                  <option value="cash">নগদ ক্যাশ</option>
                  <option value="bank">ব্যাংক ট্রান্সফার</option>
                  <option value="bkash">বিকাশ</option>
                  <option value="nagad">নগদ</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">নোট / মন্তব্য</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  placeholder="যেমন: চেক নম্বর বা রসিদ"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  পরিশোধ সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Statement Modal */}
      {viewingLedgerSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>সরবরাহকারী খতিয়ান (Supplier Ledger)</span>
                </h3>
                <p className="text-xs text-slate-400">{viewingLedgerSupplier.company} - {viewingLedgerSupplier.phone}</p>
              </div>
              <button onClick={() => setViewingLedgerSupplier(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111827] border-b border-[#1e293b] text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">বিবরণ / রেফারেন্স</th>
                    <th className="py-2.5 px-3 text-right">পরিশোধ (Dr)</th>
                    <th className="py-2.5 px-3 text-right">ক্রয় (Cr)</th>
                    <th className="py-2.5 px-3 text-right">বর্তমান দেনা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#192238]">
                  {ledgerEntries.length > 0 ? (
                    ledgerEntries.map(e => (
                      <tr key={e.id} className="hover:bg-[#131b2e]">
                        <td className="py-2 px-3 text-slate-400">{e.date}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-white">{e.referenceNo}</span>
                          {e.note && <span className="text-[11px] text-slate-400 block">{e.note}</span>}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-medium">
                          {e.debit > 0 ? `${settings.currencySymbol}${e.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-purple-300 font-medium">
                          {e.credit > 0 ? `${settings.currencySymbol}${e.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-rose-400">
                          {settings.currencySymbol}{e.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        কোন খতিয়ান এন্ট্রি নেই
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#1e2a47]">
              <button
                type="button"
                onClick={() => {
                  if (viewingLedgerSupplier) {
                    PDFGenerator.generateSupplierStatementPDF(viewingLedgerSupplier, ledgerEntries, settings);
                  }
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>খতিয়ান PDF</span>
              </button>

              <button
                onClick={() => setViewingLedgerSupplier(null)}
                className="px-4 py-2 bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 text-xs font-semibold rounded-xl"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
