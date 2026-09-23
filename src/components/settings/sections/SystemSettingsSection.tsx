import React, { useState } from 'react';
import {
  Globe, Calendar, Clock, Palette, CheckCircle2, Layout, Sliders, Check
} from 'lucide-react';
import { AppearanceConfig, DateTimeConfig, Language } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface SystemSettingsSectionProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SystemSettingsSection: React.FC<SystemSettingsSectionProps> = ({
  lang,
  onLanguageChange
}) => {
  const isBn = lang === 'bn';

  const [dateTime, setDateTime] = useState<DateTimeConfig>(SettingsService.getDateTimeConfig());
  const [appearance, setAppearance] = useState<AppearanceConfig>(SettingsService.getAppearanceConfig());
  const [notification, setNotification] = useState('');

  const handleDateTimeChange = (field: keyof DateTimeConfig, value: any) => {
    const updated = { ...dateTime, [field]: value };
    setDateTime(updated);
    SettingsService.saveDateTimeConfig(updated);
    setNotification(isBn ? 'তারিখ ও সময় সেটিংস সংরক্ষিত হয়েছে!' : 'Date & time settings updated!');
    setTimeout(() => setNotification(''), 2500);
  };

  const handleAppearanceChange = (field: keyof AppearanceConfig, value: any) => {
    const updated = { ...appearance, [field]: value };
    setAppearance(updated);
    SettingsService.saveAppearanceConfig(updated);
    setNotification(isBn ? 'ডিসপ্লে ও থিম সেটিংস সংরক্ষিত হয়েছে!' : 'Appearance settings updated!');
    setTimeout(() => setNotification(''), 2500);
  };

  const accentColors: Array<{ id: AppearanceConfig['accentColor']; name: string; bg: string }> = [
    { id: 'indigo', name: 'Royal Indigo', bg: 'bg-indigo-600' },
    { id: 'purple', name: 'Vibrant Purple', bg: 'bg-purple-600' },
    { id: 'blue', name: 'Electric Blue', bg: 'bg-blue-600' },
    { id: 'cyan', name: 'Cyan Teal', bg: 'bg-cyan-500' },
    { id: 'green', name: 'Emerald Green', bg: 'bg-emerald-600' },
    { id: 'orange', name: 'Warm Amber', bg: 'bg-amber-600' },
    { id: 'red', name: 'Crimson Red', bg: 'bg-rose-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1e2a47] pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <span>{isBn ? 'সিস্টেম, ভাষা ও থিম সেটিংস' : 'System, Localization & Appearance'}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {isBn
            ? 'অ্যাপ্লিকেশনের ভাষা পরিবর্তন, তারিখ-সময় ও ইন্টারফেস ডিসপ্লে কাস্টমাইজেশন'
            : 'Configure primary language, datetime formatting, theme palette, and layout responsiveness'}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Language Switcher Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? '১. অ্যাপ্লিকেশনের ভাষা (Language Preference)' : '1. Language Preference'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onLanguageChange('bn')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              lang === 'bn'
                ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500 shadow-md shadow-indigo-950/40'
                : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-white'
            }`}
          >
            <div className="space-y-1">
              <span className="text-sm font-bold text-white block">বাংলা (Bengali)</span>
              <span className="text-xs text-slate-400">বাংলাদেশী ব্যবসার জন্য পূর্ণাঙ্গ বাংলা ইন্টারফেস</span>
            </div>
            {lang === 'bn' && <Check className="w-5 h-5 text-indigo-400" />}
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
              lang === 'en'
                ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500 shadow-md shadow-indigo-950/40'
                : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-white'
            }`}
          >
            <div className="space-y-1">
              <span className="text-sm font-bold text-white block">English (US)</span>
              <span className="text-xs text-slate-400">Complete English user interface and labels</span>
            </div>
            {lang === 'en' && <Check className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* 2. Date and Time Settings */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? '২. তারিখ ও সময় ফরম্যাটিং' : '2. Date & Time Preferences'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'তারিখের ফরম্যাট' : 'Date Format'}
            </label>
            <select
              value={dateTime.dateFormat}
              onChange={e => handleDateTimeChange('dateFormat', e.target.value as any)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (13/09/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-13)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (09/13/2026)</option>
              <option value="DD MMM YYYY">DD MMM YYYY (13 Sep 2026)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'সময়ের ফরম্যাট' : 'Time Format'}
            </label>
            <select
              value={dateTime.timeFormat}
              onChange={e => handleDateTimeChange('timeFormat', e.target.value as any)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="12h">১২ ঘণ্টা (12-Hour AM/PM)</option>
              <option value="24h">২৪ ঘণ্টা (24-Hour Military)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'সপ্তাহের শুরুর দিন' : 'First Day of Week'}
            </label>
            <select
              value={dateTime.firstDayOfWeek}
              onChange={e => handleDateTimeChange('firstDayOfWeek', e.target.value as any)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="saturday">{isBn ? 'শনিবার (Saturday - BD)' : 'Saturday'}</option>
              <option value="sunday">{isBn ? 'রবিবার (Sunday)' : 'Sunday'}</option>
              <option value="monday">{isBn ? 'সোমবার (Monday)' : 'Monday'}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'টাইমজোন (Timezone)' : 'Timezone'}
            </label>
            <select
              value={dateTime.timezone}
              onChange={e => handleDateTimeChange('timezone', e.target.value)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Asia/Dhaka">Asia/Dhaka (UTC+06:00)</option>
              <option value="UTC">UTC (Universal Time)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (UTC+05:30)</option>
              <option value="Asia/Dubai">Asia/Dubai (UTC+04:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Appearance & Theme Palette */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? '৩. থিম ও কালার অ্যাকসেন্ট' : '3. Appearance & Theme Accent'}</span>
        </h4>

        {/* Accent Colors */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            {isBn ? 'অ্যাপের প্রধান অ্যাকসেন্ট কালার (Primary Brand Accent)' : 'Primary Accent Palette'}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {accentColors.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleAppearanceChange('accentColor', c.id)}
                className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                  appearance.accentColor === c.id
                    ? 'bg-[#1a253e] border-indigo-400 text-white ring-1 ring-indigo-400'
                    : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${c.bg}`} />
                <span>{c.name}</span>
                {appearance.accentColor === c.id && <Check className="w-3.5 h-3.5 text-indigo-400 ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* UI Density & Sidebar Behavior */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-2">
            <span className="text-xs font-bold text-white block">{isBn ? 'ইন্টারফেস ঘনত্ব' : 'UI Density'}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAppearanceChange('uiMode', 'comfortable')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  appearance.uiMode === 'comfortable'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-[#131b2e] text-slate-400 border-[#1e2a47]'
                }`}
              >
                {isBn ? 'স্বাভাবিক' : 'Comfortable'}
              </button>
              <button
                type="button"
                onClick={() => handleAppearanceChange('uiMode', 'compact')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  appearance.uiMode === 'compact'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-[#131b2e] text-slate-400 border-[#1e2a47]'
                }`}
              >
                {isBn ? 'কমপ্যাক্ট' : 'Compact'}
              </button>
            </div>
          </div>

          <label className="p-3.5 rounded-xl bg-[#0b101d] border border-[#1e2a47] flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">{isBn ? 'সাইডবার স্মৃতি' : 'Remember Sidebar'}</span>
              <span className="text-[11px] text-slate-400">{isBn ? 'সাইডবার ভাঁজ মনে রাখা' : 'Persist sidebar state'}</span>
            </div>
            <input
              type="checkbox"
              checked={appearance.rememberSidebarState}
              onChange={e => handleAppearanceChange('rememberSidebarState', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl bg-[#0b101d] border border-[#1e2a47] flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">{isBn ? 'অ্যানিমেশন' : 'UI Animations'}</span>
              <span className="text-[11px] text-slate-400">{isBn ? 'মসৃণ ইন্টারফেস ট্রানজিশন' : 'Smooth route transitions'}</span>
            </div>
            <input
              type="checkbox"
              checked={appearance.showAnimations}
              onChange={e => handleAppearanceChange('showAnimations', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
