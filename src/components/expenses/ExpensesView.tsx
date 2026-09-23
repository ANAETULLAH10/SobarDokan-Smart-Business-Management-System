import React, { useState } from 'react';
import { DollarSign, Plus, Search, Trash2, Calendar, TrendingDown, X, Download } from 'lucide-react';
import { Expense, BusinessSettings, Language, PaymentMethod } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface ExpensesViewProps {
  lang: Language;
  settings: BusinessSettings;
  expenses: Expense[];
  onExpenseSaved: () => void;
  onExpenseDeleted: (id: string) => void;
}

const DEFAULT_CATEGORIES = [
  'দোকান ভাড়া',
  'বিদ্যুৎ বিল',
  'কর্মচারীর বেতন',
  'নাস্তা ও চা',
  'যাতায়াত খরচ',
  'ইন্টারনেট বিল',
  'মেরামত ও রক্ষণাবেক্ষণ',
  'অন্যান্য'
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  lang,
  settings,
  expenses,
  onExpenseSaved,
  onExpenseDeleted
}) => {
  const t = translations[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form State
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [description, setDescription] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayTotal = expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
  const monthPrefix = today.substring(0, 7);
  const monthTotal = expenses.filter(e => e.date.startsWith(monthPrefix)).reduce((sum, e) => sum + e.amount, 0);

  const filtered = expenses.filter(e => {
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
    const matchSearch = !search.trim() || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.includes(search);
    return matchCat && matchSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      category,
      amount,
      date,
      paymentMethod,
      description: description.trim(),
      createdAt: new Date().toISOString()
    };

    StorageService.saveExpense(newExpense);
    setIsModalOpen(false);
    setAmount(0);
    setDescription('');
    onExpenseSaved();
  };

  return (
    <div id="expenses-view" className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose-400" />
            <span>{t.expenses}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
              {expenses.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'দোকানের যাবতীয় খরচ হিসাব ও মাসিক বাজেট নিয়ন্ত্রণ' : 'Track daily and monthly operating store expenses'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => PDFGenerator.generateExpenseReportPDF(expenses, settings)}
            className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'খরচ রিপোর্ট PDF' : 'Expense Report PDF'}</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-950 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addExpense}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">{t.todayExpense}</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">
            {settings.currencySymbol}{todayTotal.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">{t.shopExpense} (চলতি মাস)</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {settings.currencySymbol}{monthTotal.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1e293b]">
          <span className="text-xs text-slate-400">মোট খরচের এন্ট্রি</span>
          <p className="text-2xl font-extrabold text-indigo-300 mt-1">
            {expenses.length} টি
          </p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'খরচের বিবরণ বা খাত খুঁজুন...' : 'Search expense details...'}
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="w-full md:w-56 bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="all">সকল খাতের খরচ</option>
          {DEFAULT_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-[#111827] border border-[#1e293b] overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0b101d] border-b border-[#1e293b] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">{t.date}</th>
              <th className="py-3 px-4">খাত (Category)</th>
              <th className="py-3 px-4">{t.description}</th>
              <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
              <th className="py-3 px-4 text-right">{t.total}</th>
              <th className="py-3 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#192238]">
            {filtered.length > 0 ? (
              filtered.map(exp => (
                <tr key={exp.id} className="hover:bg-[#141d30] transition-colors">
                  <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 text-[11px] font-semibold border border-rose-500/20">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{exp.description || 'N/A'}</td>
                  <td className="py-3 px-4 font-mono uppercase text-[11px] text-slate-400">{exp.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-rose-400">
                    {settings.currencySymbol}{exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onExpenseDeleted(exp.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#2b161f]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>কোন খরচ পাওয়া যায়নি</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-400" />
                <span>{t.addExpense}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">খরচের খাত *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {DEFAULT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  খরচের পরিমাণ ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={e => setAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">পেমেন্ট মাধ্যম</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="cash">নগদ ক্যাশ</option>
                    <option value="bkash">বিকাশ</option>
                    <option value="nagad">নগদ</option>
                    <option value="bank">ব্যাংক</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="খরচের বিস্তারিত..."
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
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
