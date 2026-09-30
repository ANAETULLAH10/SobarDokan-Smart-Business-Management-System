import React, { useState } from 'react';
import {
  Crown, ToggleLeft, ToggleRight, Settings, Plus, Sparkles,
  CheckCircle2, X, ChevronDown, ChevronUp, Layers, Sliders,
  ExternalLink, Edit2, Trash2, Save
} from 'lucide-react';
import { Language, TabType, AppFeatureModule, User } from '../../types';
import { StorageService } from '../../services/storage';

interface OwnerFeatureToolbarProps {
  currentUser: User | null;
  lang: Language;
  onNavigateTab: (tab: TabType) => void;
  onRefreshAllState: () => void;
}

export const OwnerFeatureToolbar: React.FC<OwnerFeatureToolbarProps> = ({
  currentUser,
  lang,
  onNavigateTab,
  onRefreshAllState,
}) => {
  const isBn = lang === 'bn';
  const isOwner =
    currentUser?.email === 'mdanaetullah2021@gmail.com' ||
    currentUser?.isOwner ||
    currentUser?.role === 'superadmin';

  if (!isOwner) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [features, setFeatures] = useState<AppFeatureModule[]>(StorageService.getFeatureModules());
  const [notification, setNotification] = useState<string | null>(null);

  // New Feature Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNameBn, setNewNameBn] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newTabId, setNewTabId] = useState<TabType>('pos');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'core' | 'inventory' | 'finance' | 'admin' | 'ai'>('core');

  // Edit Feature Modal
  const [editingFeature, setEditingFeature] = useState<AppFeatureModule | null>(null);
  const [editNameBn, setEditNameBn] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<'core' | 'inventory' | 'finance' | 'admin' | 'ai'>('core');

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = (tabId: TabType, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    StorageService.toggleFeatureModule(tabId, !currentStatus);
    const updated = StorageService.getFeatureModules();
    setFeatures(updated);
    onRefreshAllState();
    showNotify(
      isBn
        ? `ফিচার ${!currentStatus ? 'সক্রিয় (সংযোজন)' : 'নিষ্ক্রিয় (বিয়োজন)'} করা হয়েছে!`
        : `Feature ${!currentStatus ? 'Enabled' : 'Disabled'} successfully!`
    );
  };

  const handleOpenEdit = (feat: AppFeatureModule, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFeature(feat);
    setEditNameBn(feat.nameBn);
    setEditNameEn(feat.nameEn);
    setEditDesc(feat.description);
    setEditCategory(feat.category);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;

    StorageService.updateFeatureModule(editingFeature.id, {
      nameBn: editNameBn.trim() || editingFeature.nameBn,
      nameEn: editNameEn.trim() || editingFeature.nameEn,
      description: editDesc.trim(),
      category: editCategory,
    });

    setFeatures(StorageService.getFeatureModules());
    setEditingFeature(null);
    onRefreshAllState();
    showNotify(isBn ? 'ফিচারের নাম ও তথ্য সফলভাবে পরিবর্তন করা হয়েছে!' : 'Feature updated successfully!');
  };

  const handleDeleteFeature = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(isBn ? 'আপনি কি নিশ্চিতভাবে এই ফিচারটি মুছে ফেলতে চান?' : 'Are you sure you want to remove this feature?')) {
      StorageService.deleteFeatureModule(id);
      setFeatures(StorageService.getFeatureModules());
      if (editingFeature?.id === id) setEditingFeature(null);
      onRefreshAllState();
      showNotify(isBn ? 'ফিচারটি সফলভাবে মুছে ফেলা হয়েছে (বিয়োজন সম্পন্ন)!' : 'Feature removed successfully!');
    }
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameBn.trim()) return;

    const newModule: AppFeatureModule = {
      id: 'custom-' + Date.now(),
      tabId: newTabId,
      nameBn: newNameBn.trim(),
      nameEn: newNameEn.trim() || newNameBn.trim(),
      category: newCategory,
      icon: 'Layers',
      enabled: true,
      description: newDesc.trim() || 'Custom store module added by owner',
      badge: 'Custom',
      isCustom: true,
    };

    StorageService.addCustomFeatureModule(newModule);
    setFeatures(StorageService.getFeatureModules());
    setIsAddModalOpen(false);
    setNewNameBn('');
    setNewNameEn('');
    setNewDesc('');
    onRefreshAllState();
    showNotify(isBn ? 'নতুন ফিচার সফলভাবে সংযোজন করা হয়েছে!' : 'New feature module added!');
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl border border-indigo-500/30 p-3 sm:p-4 text-white shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">
                {isBn ? 'মালিক কন্ট্রোল: ফিচার সংযোজন, বিয়োজন ও পরিবর্তন' : 'Owner Feature & Option Controller'}
              </h3>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                {features.filter((f) => f.enabled).length}/{features.length} {isBn ? 'সক্রিয়' : 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isBn
                ? 'ড্যাশবোর্ড থেকেই যেকোনো অপশন বা ফিচার চালু/বন্ধ, নতুন সংযোজন, এবং নাম পরিবর্তন করুন।'
                : 'Instantly toggle, add, edit, or remove features and options across SobarDokan.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isBn ? 'নতুন ফিচার যোগ' : 'Add Option'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('owner_master')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/15 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-300" />
            <span>{isBn ? 'মাস্টার প্যানেল' : 'Master Panel'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 transition cursor-pointer"
            title={isExpanded ? 'সংকুচিত করুন' : 'বিস্তারিত খুলুন'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="mt-2 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Expandable Feature Toggles & Edit Grid */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {features.map((feat) => (
              <div
                key={feat.id}
                className={`p-2.5 rounded-xl border transition-all select-none flex items-center justify-between gap-2 group ${
                  feat.enabled
                    ? 'bg-indigo-900/40 border-indigo-500/50 text-white shadow-sm'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={(e) => handleToggle(feat.tabId, feat.enabled, e)}
                  title={isBn ? 'ক্লিক করে চালু/বন্ধ করুন' : 'Click to toggle'}
                >
                  <p className="text-xs font-bold truncate">
                    {isBn ? feat.nameBn : feat.nameEn}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{feat.category}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(feat, e)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/20 text-slate-300 hover:text-white transition"
                    title={isBn ? 'নাম ও তথ্য পরিবর্তন করুন' : 'Edit feature'}
                  >
                    <Edit2 className="w-3 h-3 text-indigo-300" />
                  </button>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggle(feat.tabId, feat.enabled, e)}
                    className="cursor-pointer"
                  >
                    {feat.enabled ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ON
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                        OFF
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 text-[11px] text-slate-400 gap-2">
            <span>💡 যেকোনো ফিচারের উপর ক্লিক করে চালু/বন্ধ করুন অথবা পেন্সিল আইকনে চেপে নাম ও তথ্য সম্পাদনা করুন।</span>
            <button
              onClick={() => onNavigateTab('owner_master')}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline"
            >
              <span>{isBn ? 'পূর্ণাঙ্গ ওনার ড্যাশবোর্ডে যান' : 'Go to Full Master Panel'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Feature */}
      {editingFeature && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  {isBn ? 'ফিচার পরিবর্তন ও সম্পাদনা' : 'Edit Feature & Option'}
                </h3>
              </div>
              <button
                onClick={() => setEditingFeature(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'ফিচারের নাম (বাংলা) *' : 'Feature Name (Bangla) *'}
                </label>
                <input
                  type="text"
                  value={editNameBn}
                  onChange={(e) => setEditNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'ফিচারের নাম (ইংরেজি)' : 'Feature Name (English)'}
                </label>
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'ক্যাটাগরি' : 'Category'}
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="core">Core / মূল কার্যক্রম</option>
                  <option value="inventory">Inventory / ইনভেন্টরি ও স্টক</option>
                  <option value="finance">Finance / হিসাব ও লেজার</option>
                  <option value="admin">Admin / অ্যাডমিন ও সিকিউরিটি</option>
                  <option value="ai">AI Smart / কৃত্রিম বুদ্ধিমত্তা</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                {editingFeature.isCustom ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteFeature(editingFeature.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFeature(null)}
                    className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সংরক্ষণ করুন' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Custom Option */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  {isBn ? 'নতুন ফিচার / অপশন সংযোজন' : 'Add New Option / Module'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomFeature} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'ফিচারের নাম (বাংলা) *' : 'Feature Name (Bangla) *'}
                </label>
                <input
                  type="text"
                  value={newNameBn}
                  onChange={(e) => setNewNameBn(e.target.value)}
                  placeholder="যেমন: পাইকারি রেট মেমো"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'ফিচারের নাম (ইংরেজি)' : 'Feature Name (English)'}
                </label>
                <input
                  type="text"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="e.g. Wholesale Memo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="core">Core / মূল</option>
                    <option value="inventory">Inventory / ইনভেন্টরি</option>
                    <option value="finance">Finance / হিসাব</option>
                    <option value="admin">Admin / অ্যাডমিন</option>
                    <option value="ai">AI Smart</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'লিংকড মডিউল' : 'Linked Tab'}
                  </label>
                  <select
                    value={newTabId}
                    onChange={(e) => setNewTabId(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="pos">POS বিক্রয়</option>
                    <option value="products">পণ্য স্টক</option>
                    <option value="purchases">ক্রয় ও সরবরাহ</option>
                    <option value="customers">কাস্টমার</option>
                    <option value="due_khata">বকেয়া খাতা</option>
                    <option value="sms_center">SMS সেন্টার</option>
                    <option value="reports">রিপোর্ট</option>
                    <option value="warranty_check">ওয়ারেন্টি</option>
                    <option value="voice_assistant">AI ভয়েস</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="এই অপশনের মাধ্যমে কী কাজ হবে..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  {isBn ? 'ফিচার যোগ করুন' : 'Add Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
