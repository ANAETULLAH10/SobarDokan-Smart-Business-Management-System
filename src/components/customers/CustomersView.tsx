import React, { useState } from 'react';
import {
  Users, Plus, Search, Phone, MapPin, Wallet, Receipt,
  ArrowUpRight, Download, FileText, X, CheckCircle, MessageSquare
} from 'lucide-react';
import { Customer, CustomerLedgerEntry, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface CustomersViewProps {
  lang: Language;
  settings: BusinessSettings;
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onDueCollected: () => void;
  onNavigateToSms?: (customerId?: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  lang,
  settings,
  customers,
  onSaveCustomer,
  onDueCollected,
  onNavigateToSms
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [activeLedger, setActiveLedger] = useState<CustomerLedgerEntry[]>([]);

  // Collect due state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState('cash');
  const [collectNote, setCollectNote] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState(5000);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleOpenAdd = (c?: Customer) => {
    if (c) {
      setSelectedCustomer(c);
      setFormName(c.name);
      setFormPhone(c.phone);
      setFormEmail(c.email || '');
      setFormAddress(c.address || '');
      setFormCreditLimit(c.creditLimit || 5000);
    } else {
      setSelectedCustomer(null);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormAddress('');
      setFormCreditLimit(5000);
    }
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    const cust: Customer = {
      id: selectedCustomer ? selectedCustomer.id : 'cust-' + Date.now(),
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      openingBalance: selectedCustomer ? selectedCustomer.openingBalance : 0,
      creditLimit: Number(formCreditLimit) || 5000,
      totalPurchased: selectedCustomer ? selectedCustomer.totalPurchased : 0,
      totalPaid: selectedCustomer ? selectedCustomer.totalPaid : 0,
      dueAmount: selectedCustomer ? selectedCustomer.dueAmount : 0,
      status: 'active',
      createdAt: selectedCustomer ? selectedCustomer.createdAt : new Date().toISOString()
    };

    onSaveCustomer(cust);
    setIsAddModalOpen(false);
  };

  const handleOpenLedger = (c: Customer) => {
    setSelectedCustomer(c);
    const ledger = StorageService.getCustomerLedger(c.id);
    setActiveLedger(ledger);
    setLedgerModalOpen(true);
  };

  const handleOpenCollectDue = (c: Customer) => {
    setSelectedCustomer(c);
    setCollectAmount(c.dueAmount);
    setCollectMethod('cash');
    setCollectNote('');
    setCollectModalOpen(true);
  };

  const handleConfirmCollection = () => {
    if (!selectedCustomer || collectAmount <= 0) return;
    StorageService.collectCustomerDue(selectedCustomer.id, collectAmount, collectMethod, collectNote);
    setCollectModalOpen(false);
    onDueCollected();
  };

  const handleDownloadLedgerPDF = () => {
    if (selectedCustomer) {
      PDFGenerator.generateCustomerStatementPDF(selectedCustomer, activeLedger, settings);
    }
  };

  return (
    <div id="customers-view" className="p-6 space-y-5 max-w-[1600px] mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>{t.customers}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
              {customers.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'কাস্টমার প্রোফাইল, বকেয়া খতিয়ান ও আদায় ব্যবস্থাপনা' : 'Manage customer contacts, receivables and payment ledgers'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => PDFGenerator.generateCustomerReportPDF(customers, settings)}
            className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'গ্রাহক তালিকা PDF' : 'Customer List PDF'}</span>
          </button>
          <button
            onClick={() => handleOpenAdd()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addCustomer}</span>
          </button>
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
            placeholder={lang === 'bn' ? 'কাস্টমারের নাম বা ফোন নম্বর খুঁজুন...' : 'Search by name or phone...'}
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cust => (
          <div
            key={cust.id}
            className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b] hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{cust.name}</h3>
                  <p className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{cust.phone}</span>
                  </p>
                </div>
                {cust.dueAmount > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-extrabold border border-amber-500/30">
                    বকেয়া: {settings.currencySymbol}{cust.dueAmount}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    পরিশোধিত
                  </span>
                )}
              </div>

              {cust.address && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0b101d] border border-[#192238] text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">মোট ক্রয়</p>
                  <p className="font-bold text-slate-200">{settings.currencySymbol}{cust.totalPurchased}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">মোট পরিশোধ</p>
                  <p className="font-bold text-emerald-400">{settings.currencySymbol}{cust.totalPaid}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-[#192238] flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenLedger(cust)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.ledger}</span>
              </button>

              <div className="flex items-center gap-2">
                {onNavigateToSms && (
                  <button
                    onClick={() => onNavigateToSms(cust.id)}
                    className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all"
                    title={lang === 'bn' ? 'এসএমএস পাঠান' : 'Send SMS'}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}
                {cust.dueAmount > 0 && (
                  <button
                    onClick={() => handleOpenCollectDue(cust)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                  >
                    {t.collectDue}
                  </button>
                )}
                <button
                  onClick={() => handleOpenAdd(cust)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#19233b] hover:bg-[#202d4b] text-slate-300 text-xs font-medium transition-colors"
                >
                  {t.edit}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collect Due Modal */}
      {collectModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>বকেয়া আদায় ({selectedCustomer.name})</span>
              </h3>
              <button onClick={() => setCollectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#12192c] rounded-xl text-xs space-y-1">
              <p className="text-slate-400">বর্তমান বকেয়া:</p>
              <p className="text-xl font-extrabold text-amber-400">
                {settings.currencySymbol}{selectedCustomer.dueAmount}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                আদায়ের পরিমাণ ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                max={selectedCustomer.dueAmount}
                value={collectAmount}
                onChange={e => setCollectAmount(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                পরিশোধের মাধ্যম
              </label>
              <select
                value={collectMethod}
                onChange={e => setCollectMethod(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="cash">নগদ ক্যাশ</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক ট্রান্সফার</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2a47]">
              <button
                onClick={() => setCollectModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmCollection}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                টাকা গ্রহণ সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {ledgerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">খতিয়ান হিসাব: {selectedCustomer.name}</h3>
                <p className="text-[11px] text-slate-400">{selectedCustomer.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadLedgerPDF}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF ডাউনলোড</span>
                </button>
                <button onClick={() => setLedgerModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {activeLedger.length > 0 ? (
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#12192c] text-slate-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2">তারিখ</th>
                      <th className="p-2">রেফারেন্স</th>
                      <th className="p-2 text-right">ডেবিট (ক্রয়)</th>
                      <th className="p-2 text-right">ক্রেডিট (জমা)</th>
                      <th className="p-2 text-right">অবশিষ্ট বাকি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2a47] text-slate-300">
                    {activeLedger.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-[#151f38]">
                        <td className="p-2">{entry.date}</td>
                        <td className="p-2 font-mono text-[11px]">{entry.referenceNo}</td>
                        <td className="p-2 text-right text-rose-300">{settings.currencySymbol}{entry.debit}</td>
                        <td className="p-2 text-right text-emerald-400">{settings.currencySymbol}{entry.credit}</td>
                        <td className="p-2 text-right font-bold text-amber-400">{settings.currencySymbol}{entry.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-8 text-xs text-slate-500">কোন লেনদেন রেকর্ড নেই</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white">
                {selectedCustomer ? 'কাস্টমার তথ্য সম্পাদনা' : 'নতুন কাস্টমার যোগ করুন'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">কাস্টমারের নাম *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="যেমন: রফিকুল ইসলাম"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">ফোন নম্বর *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="01700-000000"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="মিরপুর ১০, ঢাকা"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">বাকি লিমিট (Credit Limit ৳)</label>
                <input
                  type="number"
                  value={formCreditLimit}
                  onChange={e => setFormCreditLimit(Number(e.target.value))}
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
