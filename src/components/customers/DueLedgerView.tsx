import React, { useState } from 'react';
import { Wallet, Search, Phone, ArrowUpRight, Printer, Download, CheckCircle, X, MessageSquare, Send } from 'lucide-react';
import { Customer, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';

interface DueLedgerViewProps {
  lang: Language;
  settings: BusinessSettings;
  customers: Customer[];
  onDueCollected: () => void;
  onNavigateToSms?: (customerId?: string) => void;
}

export const DueLedgerView: React.FC<DueLedgerViewProps> = ({
  lang,
  settings,
  customers,
  onDueCollected,
  onNavigateToSms
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState('cash');

  const debtorCustomers = customers
    .filter(c => c.dueAmount > 0)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );

  const totalOutstandingDue = debtorCustomers.reduce((sum, c) => sum + c.dueAmount, 0);

  const handleOpenCollect = (c: Customer) => {
    setSelectedCustomer(c);
    setCollectAmount(c.dueAmount);
    setCollectMethod('cash');
  };

  const handleConfirmCollect = () => {
    if (!selectedCustomer || collectAmount <= 0) return;
    StorageService.collectCustomerDue(selectedCustomer.id, collectAmount, collectMethod);
    setSelectedCustomer(null);
    onDueCollected();
  };

  return (
    <div id="due-ledger-view" className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white shadow-xl shadow-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>{t.dueKhata} (Receivables)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {lang === 'bn' ? 'মোট বকেয়া পাওনা:' : 'Total Outstanding Receivables:'}{' '}
            <span className="font-extrabold">{settings.currencySymbol}{totalOutstandingDue.toLocaleString()}</span>
          </h2>
          <p className="text-xs text-amber-100/90 mt-1">
            {debtorCustomers.length} {lang === 'bn' ? 'জন কাস্টমারের কাছে বকেয়া পাওনা রয়েছে' : 'customers currently have unpaid balances'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onNavigateToSms && (
            <button
              onClick={() => onNavigateToSms()}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-400/40 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-indigo-300" />
              <span>{lang === 'bn' ? 'সকলকে SMS তাগাদা' : 'Bulk SMS Reminder'}</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white text-amber-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'বকেয়া তালিকা প্রিন্ট' : 'Print Due List'}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'বকেয়াদার কাস্টমারের নাম বা মোবাইল নম্বর খুঁজুন...' : 'Search debtor by name or phone...'}
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Debtors Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1e293b] overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0b101d] border-b border-[#1e293b] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">{t.customerName}</th>
              <th className="py-3 px-4">{t.phone}</th>
              <th className="py-3 px-4 text-right">মোট ক্রয়</th>
              <th className="py-3 px-4 text-right">মোট পরিশোধ</th>
              <th className="py-3 px-4 text-right text-amber-400">{t.dueAmount}</th>
              <th className="py-3 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#192238]">
            {debtorCustomers.length > 0 ? (
              debtorCustomers.map(c => (
                <tr key={c.id} className="hover:bg-[#141d30] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    {c.name}
                    {c.address && <p className="text-[10px] text-slate-400 font-normal">{c.address}</p>}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    <a href={`tel:${c.phone}`} className="hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{c.phone}</span>
                    </a>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {settings.currencySymbol}{c.totalPurchased.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-400">
                    {settings.currencySymbol}{c.totalPaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-400 text-sm">
                    {settings.currencySymbol}{c.dueAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onNavigateToSms && (
                        <button
                          onClick={() => onNavigateToSms(c.id)}
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all"
                          title={lang === 'bn' ? 'এসএমএস তাগাদা পাঠান' : 'Send SMS Reminder'}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenCollect(c)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow active:scale-95"
                      >
                        {t.collectDue}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                  <p className="font-bold text-slate-200">
                    {lang === 'bn' ? 'মাশাআল্লাহ! বর্তমানে কারো কোনো বকেয়া নেই।' : 'No outstanding customer dues!'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Collect Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white">বকেয়া আদায় রশিদ তৈরি</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#131b2e] rounded-xl text-xs space-y-1">
              <p className="text-slate-400">কাস্টমার: <span className="font-bold text-white">{selectedCustomer.name}</span></p>
              <p className="text-slate-400">মোট বকেয়া: <span className="font-bold text-amber-400">{settings.currencySymbol}{selectedCustomer.dueAmount}</span></p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                জমার পরিমাণ ({settings.currencySymbol}) *
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
                পেমেন্ট মেথড
              </label>
              <select
                value={collectMethod}
                onChange={e => setCollectMethod(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="cash">নগদ ক্যাশ</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ (Nagad)</option>
                <option value="bank">ব্যাংক</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2a47]">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmCollect}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                পরিশোধ নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
