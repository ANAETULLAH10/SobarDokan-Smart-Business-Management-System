import React, { useState } from 'react';
import {
  Bell, AlertTriangle, Package, DollarSign, Clock, ShieldAlert,
  CheckCircle2, Sliders
} from 'lucide-react';
import { Language, NotificationPreferences } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface NotificationSettingsSectionProps {
  lang: Language;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [prefs, setPrefs] = useState<NotificationPreferences>(SettingsService.getNotificationPreferences());
  const [notification, setNotification] = useState('');

  const handleToggle = (field: keyof NotificationPreferences, value: any) => {
    const updated = { ...prefs, [field]: value };
    setPrefs(updated);
    SettingsService.saveNotificationPreferences(updated);
    setNotification(isBn ? 'নোটিফিকেশন প্রেফারেন্স সংরক্ষিত হয়েছে!' : 'Notification preferences updated!');
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1e2a47] pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-400" />
          <span>{isBn ? 'নোটিফিকেশন ও স্টক অ্যালার্ট প্রেফারেন্স' : 'Alerts, Thresholds & Notification Policies'}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {isBn
            ? 'স্বল্প স্টক সতর্কতা, বকেয়া রিমাইন্ডার এবং সিস্টেম নোটিফিকেশন নিয়ন্ত্রণ করুন'
            : 'Configure automated inventory warnings, overdue debt reminders, and activity badge thresholds'}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Low Stock & Inventory Alerts */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Package className="w-4 h-4 text-amber-400" />
          <span>{isBn ? '১. মজুদ ও স্টক সতর্কবার্তা (Inventory Alerts)' : '1. Inventory Low-Stock Controls'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'ডিফল্ট ন্যূনতম স্টক সীমা (Default Min Stock)' : 'Default Minimum Stock Threshold'}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={prefs.defaultMinStock}
              onChange={e => handleToggle('defaultMinStock', Number(e.target.value))}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isBn ? 'স্টক এই সংখ্যার নিচে নামলে অ্যালার্ট দেখাবে' : 'Items below this count trigger critical low stock flags'}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'সতর্কতার পুনরাবৃত্তি (Alert Frequency)' : 'Alert Delivery Frequency'}
            </label>
            <select
              value={prefs.alertFrequency}
              onChange={e => handleToggle('alertFrequency', e.target.value as any)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="realtime">{isBn ? 'রিয়েলটাইম তৎক্ষণাৎ (Instant)' : 'Instant Realtime'}</option>
              <option value="daily">{isBn ? 'দৈনিক সারাংশ (Daily Summary)' : 'Daily Summary'}</option>
              <option value="weekly">{isBn ? 'সাপ্তাহিক রিপোর্ট (Weekly)' : 'Weekly Digest'}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#0b101d] border border-[#1e2a47] cursor-pointer">
            <div>
              <span className="text-xs text-white font-semibold block">{isBn ? 'কম স্টক অ্যালার্ট' : 'Low Stock Warning'}</span>
              <span className="text-[11px] text-slate-400">{isBn ? 'মজুদ কমে এলে নোটিফিকেশন দিন' : 'Notify when quantity hits threshold'}</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.lowStock}
              onChange={e => handleToggle('lowStock', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#0b101d] border border-[#1e2a47] cursor-pointer">
            <div>
              <span className="text-xs text-white font-semibold block">{isBn ? 'স্টক শেষ অ্যালার্ট (Out of Stock)' : 'Out of Stock Alert'}</span>
              <span className="text-[11px] text-slate-400">{isBn ? 'পণ্য শূন্য হলে নোটিফিকেশন দিন' : 'Urgent alert when inventory hits 0'}</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.outOfStock}
              onChange={e => handleToggle('outOfStock', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 2. Debt, Expiry & System Notification Toggles */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? '২. বকেয়া, মেয়াদ ও ব্যবসায়িক রিমাইন্ডার' : '2. Overdue Due & Operational Alerts'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'customerDue', labelBn: 'কাস্টমার বকেয়া অ্যালার্ট', labelEn: 'Customer Overdue Reminder', desc: 'গ্রাহকের পরিশোধের সময়সীমা পার হলে' },
            { key: 'supplierDue', labelBn: 'সাপ্লায়ার দেনা অ্যালার্ট', labelEn: 'Supplier Debt Alert', desc: 'সরবরাহকারীর বকেয়া বিলের তাগাদা' },
            { key: 'warrantyExpiry', labelBn: 'ওয়ারেন্টি মেয়াদ শেষ', labelEn: 'Warranty Expiry Alert', desc: 'গ্রাহকের পণ্যের ওয়ারেন্টি শেষ হলে' },
            { key: 'newSale', labelBn: 'নতুন বিক্রয় নোটিফিকেশন', labelEn: 'New Sale Audio & Popup', desc: 'কাউন্টার থেকে পণ্য বিক্রি সম্পন্ন হলে' },
            { key: 'backupReminder', labelBn: 'ডাটা ব্যাকআপ রিমাইন্ডার', labelEn: 'Periodic Backup Prompt', desc: 'নিয়মিত ব্যাকআপ নেওয়ার তাগিদ' },
            { key: 'loginNotification', labelBn: 'নতুন ডিভাইস লগইন', labelEn: 'New Login Alert', desc: 'অ্যাডমিন অ্যাকাউন্টে প্রবেশের খবর' }
          ].map(item => (
            <label
              key={item.key}
              className="flex items-start justify-between p-3 rounded-xl bg-[#0b101d] border border-[#1e2a47] cursor-pointer hover:border-slate-600 transition-colors"
            >
              <div className="space-y-0.5 pr-2">
                <span className="text-xs text-white font-semibold block">{isBn ? item.labelBn : item.labelEn}</span>
                <span className="text-[10px] text-slate-400">{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={!!(prefs as any)[item.key]}
                onChange={e => handleToggle(item.key as any, e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer mt-0.5 shrink-0"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
