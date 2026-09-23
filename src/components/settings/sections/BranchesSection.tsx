import React, { useState } from 'react';
import {
  GitBranch, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Phone,
  MapPin, User, Star, Check, X
} from 'lucide-react';
import { BranchRecord, Language } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface BranchesSectionProps {
  lang: Language;
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [branches, setBranches] = useState<BranchRecord[]>(SettingsService.getBranches());
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formIsDefault, setFormIsDefault] = useState(false);

  const openAddModal = () => {
    setFormName('');
    setFormCode(`BR-${Math.floor(100 + Math.random() * 900)}`);
    setFormAddress('');
    setFormPhone('');
    setFormManager('');
    setFormStatus('active');
    setFormIsDefault(false);
    setIsAdding(true);
    setEditingBranch(null);
    setErrorMsg('');
  };

  const openEditModal = (b: BranchRecord) => {
    setFormName(b.name);
    setFormCode(b.code);
    setFormAddress(b.address);
    setFormPhone(b.phone);
    setFormManager(b.manager);
    setFormStatus(b.status);
    setFormIsDefault(b.isDefault);
    setEditingBranch(b);
    setIsAdding(false);
    setErrorMsg('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg(isBn ? 'শাখার নাম আবশ্যক' : 'Branch name is required');
      return;
    }

    if (isAdding) {
      SettingsService.addBranch({
        name: formName,
        code: formCode || `BR-${Date.now().toString().slice(-4)}`,
        address: formAddress,
        phone: formPhone,
        manager: formManager,
        status: formStatus,
        isDefault: formIsDefault
      });
      setNotification(isBn ? 'নতুন শাখা সফলভাবে যোগ করা হয়েছে!' : 'Branch added successfully!');
    } else if (editingBranch) {
      SettingsService.updateBranch({
        ...editingBranch,
        name: formName,
        code: formCode,
        address: formAddress,
        phone: formPhone,
        manager: formManager,
        status: formStatus,
        isDefault: formIsDefault
      });
      setNotification(isBn ? 'শাখা সফলভাবে আপডেট করা হয়েছে!' : 'Branch updated successfully!');
    }

    setBranches(SettingsService.getBranches());
    setIsAdding(false);
    setEditingBranch(null);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(isBn ? `আপনি কি "${name}" শাখাটি মুছে ফেলতে চান?` : `Delete branch "${name}"?`)) {
      const success = SettingsService.deleteBranch(id);
      if (!success) {
        alert(isBn ? 'ডিফল্ট শাখাটি মুছে ফেলা যাবে না' : 'Default branch cannot be deleted');
      } else {
        setBranches(SettingsService.getBranches());
        setNotification(isBn ? 'শাখা সফলভাবে মুছে ফেলা হয়েছে' : 'Branch deleted successfully');
        setTimeout(() => setNotification(''), 3000);
      }
    }
  };

  const handleSetDefault = (id: string) => {
    SettingsService.setDefaultBranch(id);
    setBranches(SettingsService.getBranches());
    setNotification(isBn ? 'ডিফল্ট প্রধান শাখা নির্ধারণ করা হয়েছে' : 'Default branch updated');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'শাখা ও আউটলেট ব্যবস্থাপনা (Branch Management)' : 'Multi-Branch & Outlets Management'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? 'আপনার ব্যবসা প্রতিষ্ঠানের একাধিক শাখা, শোরুম বা গোডাউন কনফিগার করুন' : 'Configure branches, multi-store inventory locations, and assign outlet managers'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন শাখা যোগ করুন' : 'Add New Branch'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div
            key={branch.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              branch.isDefault
                ? 'bg-gradient-to-b from-[#172036] to-[#111827] border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                : 'bg-[#111827] border-[#1e293b]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{branch.name}</h4>
                    {branch.isDefault && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{isBn ? 'প্রধান শাখা' : 'Main'}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/30 inline-block">
                    {branch.code}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  branch.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-700/30 text-slate-400 border-slate-700'
                }`}>
                  {branch.status === 'active' ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                {branch.address && (
                  <p className="flex items-start gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{branch.address}</span>
                  </p>
                )}
                {branch.phone && (
                  <p className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </p>
                )}
                {branch.manager && (
                  <p className="flex items-center gap-1.5 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.manager}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1e2a47]/60 text-xs">
              <div>
                {!branch.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(branch.id)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Star className="w-3 h-3" />
                    <span>{isBn ? 'ডিফল্ট করুন' : 'Make Default'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{isBn ? 'বর্তমান ডিফল্ট' : 'Current Default'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(branch)}
                  className="p-1.5 rounded-lg bg-[#131b2e] hover:bg-[#1a253e] text-indigo-300 hover:text-white transition-colors"
                  title={isBn ? 'এডিট' : 'Edit'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {!branch.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleDelete(branch.id, branch.name)}
                    className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 transition-colors"
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

      {/* Add / Edit Branch Modal */}
      {(isAdding || editingBranch) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <span>{isAdding ? (isBn ? 'নতুন শাখা যুক্ত করুন' : 'Add New Branch') : (isBn ? 'শাখা তথ্য সম্পাদনা' : 'Edit Branch')}</span>
              </h4>
              <button
                onClick={() => { setIsAdding(false); setEditingBranch(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'শাখার নাম *' : 'Branch Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="যেমন: উত্তরা শাখা (আউটলেট ২)"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'শাখা কোড' : 'Branch Code'}
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="01700-000000"
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'ইনচার্জ / ম্যানেজার' : 'Manager In-Charge'}
                </label>
                <input
                  type="text"
                  value={formManager}
                  onChange={e => setFormManager(e.target.value)}
                  placeholder="মোঃ তানভীর আহমেদ"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'শাখার পূর্ণাঙ্গ ঠিকানা' : 'Street Address'}
                </label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="রোড, সেক্টর, এলাকা, থানা, জেলা"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'স্ট্যাটাস' : 'Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="inactive">{isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={e => setFormIsDefault(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      {isBn ? 'ডিফল্ট প্রধান শাখা' : 'Set as Default'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2a47]">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingBranch(null); }}
                  className="px-3.5 py-2 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold hover:bg-[#1a253e]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
