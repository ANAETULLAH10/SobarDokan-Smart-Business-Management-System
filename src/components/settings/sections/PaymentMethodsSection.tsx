import React, { useState } from 'react';
import {
  CreditCard, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  Smartphone, Building2, Banknote, Star, Check, X
} from 'lucide-react';
import { Language, PaymentMethodRecord } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface PaymentMethodsSectionProps {
  lang: Language;
}

export const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [methods, setMethods] = useState<PaymentMethodRecord[]>(SettingsService.getPaymentMethods());
  const [editingMethod, setEditingMethod] = useState<PaymentMethodRecord | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState<PaymentMethodRecord['code']>('other');
  const [accountRef, setAccountRef] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isDefault, setIsDefault] = useState(false);

  const getIcon = (c: PaymentMethodRecord['code']) => {
    switch (c) {
      case 'cash':
        return <Banknote className="w-5 h-5 text-emerald-400" />;
      case 'bkash':
      case 'nagad':
      case 'rocket':
        return <Smartphone className="w-5 h-5 text-pink-400" />;
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'bank':
        return <Building2 className="w-5 h-5 text-purple-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
    }
  };

  const openAdd = () => {
    setName('');
    setCode('other');
    setAccountRef('');
    setInstructions('');
    setStatus('active');
    setIsDefault(false);
    setIsAdding(true);
    setEditingMethod(null);
  };

  const openEdit = (m: PaymentMethodRecord) => {
    setName(m.name);
    setCode(m.code);
    setAccountRef(m.accountRef);
    setInstructions(m.instructions || '');
    setStatus(m.status);
    setIsDefault(m.isDefault);
    setEditingMethod(m);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isAdding) {
      SettingsService.addPaymentMethod({
        name,
        code,
        icon: 'CreditCard',
        accountRef,
        instructions,
        status,
        isDefault
      });
      setNotification(isBn ? 'নতুন পেমেন্ট মাধ্যম যুক্ত হয়েছে!' : 'Payment method added successfully!');
    } else if (editingMethod) {
      SettingsService.updatePaymentMethod({
        ...editingMethod,
        name,
        code,
        accountRef,
        instructions,
        status,
        isDefault
      });
      setNotification(isBn ? 'পেমেন্ট মাধ্যম হালনাগাদ হয়েছে!' : 'Payment method updated!');
    }

    setMethods(SettingsService.getPaymentMethods());
    setIsAdding(false);
    setEditingMethod(null);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleToggleStatus = (m: PaymentMethodRecord) => {
    const updated = {
      ...m,
      status: (m.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive'
    };
    SettingsService.updatePaymentMethod(updated);
    setMethods(SettingsService.getPaymentMethods());
  };

  const handleSetDefault = (m: PaymentMethodRecord) => {
    const list = SettingsService.getPaymentMethods();
    list.forEach(item => {
      item.isDefault = item.id === m.id;
      SettingsService.updatePaymentMethod(item);
    });
    setMethods(SettingsService.getPaymentMethods());
    setNotification(isBn ? 'ডিফল্ট পেমেন্ট মাধ্যম নির্ধারণ করা হয়েছে' : 'Default payment method set');
    setTimeout(() => setNotification(''), 2500);
  };

  const handleDelete = (id: string, methodName: string) => {
    if (confirm(isBn ? `আপনি কি "${methodName}" মুছে ফেলতে চান?` : `Delete "${methodName}"?`)) {
      SettingsService.deletePaymentMethod(id);
      setMethods(SettingsService.getPaymentMethods());
      setNotification(isBn ? 'পেমেন্ট মাধ্যম মুছে ফেলা হয়েছে' : 'Payment method removed');
      setTimeout(() => setNotification(''), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'পেমেন্ট গেটওয়ে ও মাধ্যমসমূহ' : 'Payment Methods & Gateways'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'ক্যাশ, বিকাশ, নগদ, রকেট, কার্ড পিওএস ও ব্যাংক অ্যাকাউন্ট কনফিগারেশন'
              : 'Manage supported checkout tender types, merchant accounts, and instruction notes'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন মাধ্যম যোগ করুন' : 'Add Payment Method'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map(m => (
          <div
            key={m.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              m.isDefault
                ? 'bg-gradient-to-b from-[#172036] to-[#111827] border-indigo-500/40 shadow-lg'
                : 'bg-[#111827] border-[#1e293b]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#131b2e] border border-[#1e2a47]">
                    {getIcon(m.code)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{m.name}</h4>
                    {m.isDefault && (
                      <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{isBn ? 'ডিফল্ট চেকআউট' : 'Default Checkout'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(m)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                    m.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {m.status === 'active' ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Inactive')}
                </button>
              </div>

              <div className="space-y-1 text-xs pt-1">
                {m.accountRef && (
                  <p className="text-slate-300 font-mono text-[11px] bg-[#0b101d] px-2.5 py-1 rounded-lg border border-[#1e2a47]">
                    {m.accountRef}
                  </p>
                )}
                {m.instructions && (
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {m.instructions}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1e2a47]/60 text-xs">
              <div>
                {!m.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(m)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Star className="w-3 h-3" />
                    <span>{isBn ? 'ডিফল্ট করুন' : 'Set Default'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{isBn ? 'প্রধান মাধ্যম' : 'Default Tender'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="p-1.5 rounded-lg bg-[#131b2e] hover:bg-[#1a253e] text-indigo-300"
                  title={isBn ? 'এডিট' : 'Edit'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {m.code !== 'cash' && (
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id, m.name)}
                    className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-300"
                    title={isBn ? 'মুছুন' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(isAdding || editingMethod) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>{isAdding ? (isBn ? 'নতুন পেমেন্ট মাধ্যম' : 'Add Payment Method') : (isBn ? 'পেমেন্ট মাধ্যম এডিট' : 'Edit Payment Method')}</span>
              </h4>
              <button
                onClick={() => { setIsAdding(false); setEditingMethod(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'মাধ্যমের নাম *' : 'Method Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="যেমন: বিকাশ মার্চেন্ট"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'ক্যাটাগরি টাইপ' : 'Category / Type'}
                </label>
                <select
                  value={code}
                  onChange={e => setCode(e.target.value as any)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="cash">নগদ ক্যাশ (Cash)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="card">ভিসা / মাস্টারকার্ড (Card POS)</option>
                  <option value="bank">ব্যাংক স্থানান্তর (Bank)</option>
                  <option value="other">অন্যান্য (Other)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'অ্যাকাউন্ট / মার্চেন্ট নম্বর' : 'Account / Merchant Ref'}
                </label>
                <input
                  type="text"
                  value={accountRef}
                  onChange={e => setAccountRef(e.target.value)}
                  placeholder="01700-000000 বা Bank A/C"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'পেমেন্ট নির্দেশিকা (Instructions)' : 'Payment Instructions'}
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="গ্রাহকের জন্য পেমেন্ট সংক্রান্ত তথ্য..."
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1e2a47]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">{isBn ? 'ডিফল্ট পেমেন্ট মাধ্যম' : 'Set as default'}</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingMethod(null); }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    {isBn ? 'সংরক্ষণ' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
