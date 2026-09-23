import React, { useState, useRef } from 'react';
import {
  Database, Download, Upload, Trash2, RefreshCw, AlertTriangle,
  CheckCircle2, Clock, ShieldAlert, FileText, Lock, X
} from 'lucide-react';
import { BackupHistoryItem, Language } from '../../../types';
import { StorageService } from '../../../services/storage';
import { SettingsService } from '../../../services/settingsService';

interface BackupDataSectionProps {
  lang: Language;
}

export const BackupDataSection: React.FC<BackupDataSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<BackupHistoryItem[]>(SettingsService.getBackupHistory());
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  const [restoreStats, setRestoreStats] = useState<{ products: number; sales: number; customers: number }>({ products: 0, sales: 0, customers: 0 });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // 1. Create Backup JSON
  const handleCreateBackup = () => {
    try {
      const jsonStr = StorageService.exportAllData();
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(jsonStr);
      } catch (e) {
        parsedData = {};
      }
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `AmarDokan_Backup_${timestamp}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record to history
      const sizeBytes = blob.size;
      const sizeFormatted = `${(sizeBytes / 1024).toFixed(1)} KB`;
      const newItem: BackupHistoryItem = {
        id: `bak-${Date.now()}`,
        date: new Date().toISOString(),
        filename,
        sizeBytes,
        sizeFormatted,
        status: 'completed',
        type: 'manual',
        recordsCount: (parsedData.products?.length || 0) + (parsedData.sales?.length || 0) + (parsedData.customers?.length || 0)
      };
      SettingsService.addBackupHistory(newItem);
      setHistory(SettingsService.getBackupHistory());

      const admin = SettingsService.getAdminProfile();
      SettingsService.logAudit(admin.name, 'Backup Created', 'Backup & Restore', `ব্যাকআপ ফাইল "${filename}" সফলভাবে ডাউনলোড করা হয়েছে`, 'success');

      setNotification(isBn ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'Full backup file generated and downloaded!');
      setTimeout(() => setNotification(''), 3500);
    } catch (err) {
      setErrorMsg(isBn ? 'ব্যাকআপ তৈরিতে সমস্যা হয়েছে' : 'Failed to generate backup');
    }
  };

  // 2. Select file to restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON structure');
        }

        setPendingRestoreData(parsed);
        setRestoreStats({
          products: parsed.products?.length || 0,
          sales: parsed.sales?.length || 0,
          customers: parsed.customers?.length || 0
        });
        setShowRestoreConfirm(true);
      } catch (err) {
        alert(isBn ? 'ব্যাকআপ ফাইলটি ত্রুটিপূর্ণ বা অবৈধ JSON ফাইল' : 'Invalid backup JSON file');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  // 3. Confirm Restore
  const handleConfirmRestore = () => {
    if (!pendingRestoreData) return;
    try {
      StorageService.importAllData(pendingRestoreData);
      setShowRestoreConfirm(false);
      const admin = SettingsService.getAdminProfile();
      SettingsService.logAudit(admin.name, 'Data Restored', 'Backup & Restore', 'ব্যাকআপ ফাইল থেকে সফলভাবে তথ্য পুনরুদ্ধার করা হয়েছে', 'warning');

      alert(isBn ? 'ডাটা সফলভাবে পুনরুদ্ধার হয়েছে! পেজ রিফ্রেশ হচ্ছে...' : 'Data restored successfully! Refreshing...');
      window.location.reload();
    } catch (err) {
      alert(isBn ? 'পুনরুদ্ধার করতে ব্যর্থ হয়েছে' : 'Restore failed');
    }
  };

  // 4. Reset to Demo State
  const handleResetDemoData = () => {
    if (confirm(isBn ? 'আপনি কি ডেমো ডাটা রিসেট করতে চান? বর্তমান লেনদেন ও পরিবর্তনসমূহ ডিফল্ট অবস্থায় ফিরে যাবে।' : 'Reset to clean initial demo data? Current test transactions will be reset.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // 5. Delete All Business Data
  const handleDeleteAllData = () => {
    setConfirmPassword('');
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const handleExecuteWipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!SettingsService.verifyCurrentPassword(confirmPassword)) {
      setDeleteError(isBn ? 'ভুল পাসওয়ার্ড! ডাটা ডিলিট বাতিল করা হয়েছে।' : 'Incorrect password! Wipe operation aborted.');
      return;
    }

    // Wipe transactions, inventory, customers, suppliers
    const dataKeys = [
      'amardokan_products',
      'amardokan_sales',
      'amardokan_purchases',
      'amardokan_customers',
      'amardokan_suppliers',
      'amardokan_expenses',
      'amardokan_incomes',
      'amardokan_customer_ledger',
      'amardokan_supplier_ledger',
      'amardokan_stock_adjustments',
      'amardokan_sale_returns',
      'amardokan_purchase_returns'
    ];
    dataKeys.forEach(k => localStorage.setItem(k, JSON.stringify([])));

    const admin = SettingsService.getAdminProfile();
    SettingsService.logAudit(admin.name, 'All Business Data Deleted', 'Data Management', 'সকল পণ্য, বিক্রয় ও গ্রাহক ডাটা স্থায়ীভাবে মুছে ফেলা হয়েছে', 'failed');

    alert(isBn ? 'সকল ব্যবসায়িক ডাটা সফলভাবে মুছে ফেলা হয়েছে।' : 'All business records wiped.');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1e2a47] pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <span>{isBn ? 'ডাটা ব্যাকআপ, রিস্টোর ও ডাটা ম্যানেজমেন্ট' : 'Backup, Restore & Data Lifecycle'}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {isBn
            ? 'আপনার দোকানের সকল পণ্য, বিক্রয়, ক্রয়ের নিরাপদ ব্যাকআপ ফাইল তৈরি ও পুনরুদ্ধার করুন'
            : 'Download encrypted snapshots of your entire store catalog, ledgers, and transactions'}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Backup */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 w-fit text-indigo-400">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">{isBn ? 'ফুল ডাটাবেস ব্যাকআপ তৈরি' : 'Create Full System Backup'}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn
                ? 'দোকানের সকল পণ্য, ক্যাশ মেমো, ক্রয় হিসাব, কাস্টমার, সাপ্লায়ার ও সেটিংস সমৃদ্ধ একটি একক .JSON ফাইল ডাউনলোড করুন।'
                : 'Generates an immediate timestamped JSON archive of all transactions, customers, stock, and settings.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateBackup}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'ব্যাকআপ ডাউনলোড করুন (.json)' : 'Download Backup File'}</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-purple-600/15 border border-purple-500/30 w-fit text-purple-400">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">{isBn ? 'ব্যাকআপ থেকে রিস্টোর' : 'Restore From Backup'}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn
                ? 'পূর্বে সংরক্ষিত যে কোনো .JSON ব্যাকআপ ফাইল আপলোড করে পূর্বাবস্থায় ডাটা ফিরিয়ে আনুন।'
                : 'Upload an existing JSON backup archive to reinstate complete business history and settings.'}
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-[#131b2e] hover:bg-[#1c2844] border border-[#233153] text-indigo-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>{isBn ? 'ব্যাকআপ ফাইল আপলোড করুন' : 'Select Backup File'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? 'ব্যাকআপের ইতিহাস (Backup History)' : 'Recent Backup Snapshots'}</span>
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[#1e2a47]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101d] text-slate-400 border-b border-[#1e2a47]">
              <tr>
                <th className="p-3 font-semibold">{isBn ? 'ফাইলের নাম' : 'Filename'}</th>
                <th className="p-3 font-semibold">{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                <th className="p-3 font-semibold">{isBn ? 'সাইজ' : 'Size'}</th>
                <th className="p-3 font-semibold">{isBn ? 'রেকর্ড সংখ্যা' : 'Records'}</th>
                <th className="p-3 font-semibold">{isBn ? 'ধরন' : 'Type'}</th>
                <th className="p-3 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]/60 text-slate-300">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-[#131b2e]/60 transition-colors">
                  <td className="p-3 font-mono font-medium text-white flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{item.filename}</span>
                  </td>
                  <td className="p-3 text-slate-400 font-mono">
                    {new Date(item.date).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-slate-300">{item.sizeFormatted}</td>
                  <td className="p-3 font-mono text-indigo-300">{item.recordsCount} items</td>
                  <td className="p-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                      {isBn ? 'সম্পন্ন' : 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Data Management */}
      <div className="p-6 rounded-2xl bg-[#1c1219] border border-rose-900/40 space-y-4">
        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 border-b border-rose-900/40 pb-3">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{isBn ? 'ডেঞ্জার জোন: ডাটা পরিষ্কার ও রিসেট (Danger Zone)' : 'Danger Zone: Data Purge & System Reset'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#110e14] border border-rose-900/30 flex flex-col justify-between space-y-3">
            <div>
              <h5 className="text-xs font-bold text-white">{isBn ? 'ডেমো ডাটা রিসেট করুন' : 'Reset to Clean Demo State'}</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                {isBn ? 'বর্তমান পরীক্ষামূলক লেনদেন রিসেট করে ফ্রেশ ডেমো ডাটাতে ফিরিয়ে নিয়ে যাবে।' : 'Replaces current trial transactions with fresh starting demo catalogs.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="py-2 px-3.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডেমো ডাটা রিসেট' : 'Reset Demo'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#110e14] border border-rose-900/30 flex flex-col justify-between space-y-3">
            <div>
              <h5 className="text-xs font-bold text-rose-300">{isBn ? 'সকল ব্যবসায়িক ডাটা মুছে ফেলুন' : 'Wipe All Business Records'}</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                {isBn ? 'সকল পণ্য, বিক্রয় ও কাস্টমার ডাটা স্থায়ীভাবে ডিলিট করবে। (পাসওয়ার্ড প্রয়োজন)' : 'Permanently clears all catalogs, invoices, and debt histories.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAllData}
              className="py-2 px-3.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'সকল ডাটা মুছুন (Wipe)' : 'Delete All Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-white">{isBn ? 'ডাটা রিস্টোর নিশ্চিতকরণ' : 'Confirm Data Restore'}</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn
                ? 'আপনি কি নিশ্চিত? এই ব্যাকআপ ফাইলটি রিস্টোর করলে আপনার বর্তমান সকল পণ্য ও বিক্রয় ডাটা প্রতিস্থাপিত হবে।'
                : 'Are you sure? Restoring this backup will replace your existing product records and invoices.'}
            </p>

            <div className="p-3.5 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>পণ্য সংখ্যা (Products):</span>
                <span className="font-bold text-indigo-400">{restoreStats.products}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>ইনভয়েস সংখ্যা (Sales):</span>
                <span className="font-bold text-emerald-400">{restoreStats.sales}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>কাস্টমার সংখ্যা (Customers):</span>
                <span className="font-bold text-purple-400">{restoreStats.customers}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                {isBn ? 'হ্যাঁ, রিস্টোর করুন' : 'Confirm & Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wipe Confirmation Password Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-rose-800/40 rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-3">
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>{isBn ? 'ডাটা ডিলিট সিকিউরিটি নিশ্চিতকরণ' : 'Security Password Verification'}</span>
              </h4>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-rose-200">
              {isBn
                ? 'এই কাজটি সম্পূর্ণরূপে অপরিবর্তনীয়! নিশ্চিত করার জন্য অনুগ্রহ করে আপনার অ্যাডমিন পাসওয়ার্ড লিখুন:'
                : 'This action is completely irreversible! Please enter your admin master password to proceed:'}
            </p>

            {deleteError && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleExecuteWipe} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-[#0b101d] border border-rose-800/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:border-rose-500"
                />
                <Lock className="w-3.5 h-3.5 text-rose-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950"
                >
                  {isBn ? 'স্থায়ীভাবে মুছে ফেলুন' : 'Wipe All Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
