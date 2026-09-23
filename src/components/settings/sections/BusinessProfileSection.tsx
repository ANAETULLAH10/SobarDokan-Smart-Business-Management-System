import React, { useState, useRef, useEffect } from 'react';
import {
  Store, Camera, Trash2, Save, X, RefreshCw, CheckCircle2, AlertCircle,
  Building2, Phone, Mail, Globe, MapPin, FileText, Eye, Check
} from 'lucide-react';
import { BusinessSettings, Language } from '../../../types';
import { StorageService } from '../../../services/storage';
import { SettingsService } from '../../../services/settingsService';

interface BusinessProfileSectionProps {
  lang: Language;
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
}

export const BusinessProfileSection: React.FC<BusinessProfileSectionProps> = ({
  lang,
  settings,
  onSaveSettings
}) => {
  const isBn = lang === 'bn';
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BusinessSettings>({
    ...settings,
    banglaBusinessName: settings.banglaBusinessName || settings.businessName || 'আমার দোকান',
    englishBusinessName: settings.englishBusinessName || 'AmarDokan Smart Business',
    altPhone: settings.altPhone || '',
    city: settings.city || 'ঢাকা (Dhaka)',
    district: settings.district || 'ঢাকা',
    country: settings.country || 'বাংলাদেশ (Bangladesh)',
    postalCode: settings.postalCode || '১২১৬',
    businessRegNo: settings.businessRegNo || 'TRAD/DSCC/019283/2024'
  });

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Sync formData when external settings change without triggering immediate re-saves
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...settings,
      banglaBusinessName: settings.banglaBusinessName || settings.businessName || prev.banglaBusinessName || 'আমার দোকান',
      englishBusinessName: settings.englishBusinessName || prev.englishBusinessName || 'AmarDokan Smart Business',
      altPhone: settings.altPhone ?? prev.altPhone ?? '',
      city: settings.city || prev.city || 'ঢাকা (Dhaka)',
      district: settings.district || prev.district || 'ঢাকা',
      country: settings.country || prev.country || 'বাংলাদেশ (Bangladesh)',
      postalCode: settings.postalCode || prev.postalCode || '১২১৬',
      businessRegNo: settings.businessRegNo || prev.businessRegNo || 'TRAD/DSCC/019283/2024'
    }));
  }, [settings]);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<'invoice' | 'report'>('invoice');
  const [isDragging, setIsDragging] = useState(false);
  const [logoSuccessMessage, setLogoSuccessMessage] = useState('');

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper to process, compress and store logo file
  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে একটি বৈধ ইমেজ ফাইল (PNG, JPG, WebP) নির্বাচন করুন' : 'Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round(height * (MAX_DIM / width));
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round(width * (MAX_DIM / height));
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.92);
          const updated: BusinessSettings = {
            ...formDataRef.current,
            logoUrl: dataUrl
          };
          setFormData(updated);
          // Auto persist to settings outside of state updater
          try {
            onSaveSettings(updated);
          } catch (err) {
            console.error('Failed to auto-save logo', err);
          }
          setLogoSuccessMessage(isBn ? 'লোগো সফলভাবে যুক্ত হয়েছে এবং সকল ইনভয়েস ও রিপোর্টে প্রদর্শিত হবে!' : 'Logo uploaded successfully and enabled for all invoices & PDF reports!');
          setTimeout(() => setLogoSuccessMessage(''), 4500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo Upload via file picker
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processLogoFile(file);
    if (e.target) e.target.value = '';
  };

  // Handle Drag and Drop for Logo
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleRemoveLogo = () => {
    const updated: BusinessSettings = {
      ...formDataRef.current,
      logoUrl: ''
    };
    setFormData(updated);
    try {
      onSaveSettings(updated);
    } catch (err) {
      console.error('Failed to update settings after logo removal', err);
    }
    setLogoSuccessMessage(isBn ? 'লোগো অপসারিত হয়েছে' : 'Logo removed');
    setTimeout(() => setLogoSuccessMessage(''), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setErrorMessage(isBn ? 'দোকানের নাম আবশ্যক' : 'Business name is required');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage('');

    setTimeout(() => {
      try {
        onSaveSettings(formData);
        SettingsService.logAudit(
          formData.ownerName || 'Admin',
          'Business Profile Updated',
          'Business Settings',
          `প্রতিষ্ঠানের তথ্য "${formData.businessName}" সফলভাবে সংরক্ষিত হয়েছে`,
          'success'
        );
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(isBn ? 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save business settings');
      }
    }, 400);
  };

  const handleReset = () => {
    if (confirm(isBn ? 'আপনি কি ব্যবসায়িক তথ্য ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?' : 'Reset business profile to default?')) {
      const defaultData = StorageService.getSettings();
      setFormData({ ...defaultData });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'দোকান ও ব্যবসা পরিচিতি (Business Profile)' : 'Business Profile & Legal Credentials'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'এখানে সংরক্ষিত তথ্য স্বয়ংক্রিয়ভাবে সকল ক্যাশ মেমো, ইনভয়েস ও প্রতিবেদনে প্রদর্শিত হবে'
              : 'Official business credentials automatically reflected across POS receipts, invoices, and reports'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] border border-[#233153] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isBn ? 'ইনভয়েস হেডারে প্রিভিউ' : 'Preview on Invoice'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title={isBn ? 'ডিফল্ট রিসেট' : 'Reset'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {saveStatus === 'saved' && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? 'দোকানের পরিচিতি সফলভাবে সংরক্ষিত হয়েছে!' : 'Business profile saved successfully!'}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo and Brand Identity Card */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? '১. লোগো ও ব্র্যান্ড পরিচয় (Logo & Brand Identity)' : '1. Store Logo & Identity'}</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/60"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isBn ? 'হেডার প্রিভিউ দেখুন' : 'Preview Headers'}</span>
            </button>
          </div>

          {logoSuccessMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{logoSuccessMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className={`relative group cursor-pointer transition-all duration-200 rounded-2xl ${
                isDragging ? 'ring-2 ring-indigo-500 scale-105' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => logoInputRef.current?.click()}
              title={isBn ? 'লোগো আপলোড বা ড্রপ করুন' : 'Click or drop logo here'}
            >
              <div className={`w-28 h-28 rounded-2xl bg-[#0b101d] border-2 border-dashed ${
                isDragging ? 'border-indigo-400 bg-indigo-950/30' : 'border-[#1e2a47] group-hover:border-indigo-500/60'
              } flex items-center justify-center overflow-hidden p-2 transition-colors`}>
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt={formData.businessName}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-500 group-hover:text-slate-400 transition-colors">
                    <Store className="w-8 h-8 mx-auto mb-1 stroke-[1.5]" />
                    <span className="text-[10px] font-bold block">{isBn ? 'ড্রপ / আপলোড' : 'DROP / UPLOAD'}</span>
                  </div>
                )}
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            <div className="space-y-2.5 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{formData.logoUrl ? (isBn ? 'লোগো পরিবর্তন করুন' : 'Replace Logo') : (isBn ? 'লোগো আপলোড করুন' : 'Upload Logo')}</span>
                </button>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লোগো মুছুন' : 'Remove Logo'}</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isBn
                  ? 'স্বচ্ছ ব্যাকগ্রাউন্ডসহ PNG, JPG বা WebP লোগো ড্র্যাগ অ্যান্ড ড্রপ বা ক্লিক করে নির্বাচন করুন। এটি স্বয়ংক্রিয়ভাবে সকল ইনভয়েস, ক্যাশ মেমো এবং পিডিএফ রিপোর্টে শীর্ষ হেডারে যুক্ত হবে।'
                  : 'Drag & drop or click to upload transparent PNG, JPG, or WebP. It will automatically be included in the header of all generated PDF invoices and reports.'}
              </p>

              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={formData.showLogoOnInvoice !== false}
                  onChange={e => {
                    const checked = e.target.checked;
                    const updated = { ...formDataRef.current, showLogoOnInvoice: checked };
                    setFormData(updated);
                    try {
                      onSaveSettings(updated);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">
                  {isBn ? 'ইনভয়েস এবং সকল পিডিএফ রিপোর্টে লোগো প্রদর্শন করুন' : 'Display logo on invoices and all generated PDF reports'}
                </span>
              </label>

              {formData.logoUrl && formData.showLogoOnInvoice !== false && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isBn ? 'লোগো সক্রিয়: সকল ইনভয়েস ও রিপোর্টে যুক্ত হবে' : 'Logo Active: Automatically included in all PDF reports & invoices'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Names & Ownership */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1e293b] pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-400" />
            <span>{isBn ? '২. দোকানের নাম ও মালিকানা বিবরণী' : '2. Store Names & Ownership'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'দোকানের নাম (Business Name) *' : 'Business Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={e => handleChange('businessName', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'বাংলায় নাম (Bangla Name)' : 'Bangla Name'}
              </label>
              <input
                type="text"
                value={formData.banglaBusinessName || ''}
                onChange={e => handleChange('banglaBusinessName', e.target.value)}
                placeholder="যেমন: আমার দোকান স্মার্ট বিজনেস"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ইংরেজিতে নাম (English Name)' : 'English Name'}
              </label>
              <input
                type="text"
                value={formData.englishBusinessName || ''}
                onChange={e => handleChange('englishBusinessName', e.target.value)}
                placeholder="AmarDokan POS"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'স্লোগান / সাব-টাইটেল (Subtitle)' : 'Tagline / Subtitle'}
              </label>
              <input
                type="text"
                value={formData.businessSubtitle || ''}
                onChange={e => handleChange('businessSubtitle', e.target.value)}
                placeholder="SMART BUSINESS MANAGEMENT"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'মালিকের নাম (Owner Name) *' : 'Owner Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.ownerName || ''}
                onChange={e => handleChange('ownerName', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contact & Physical Address */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1e293b] pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>{isBn ? '৩. যোগাযোগের নম্বর ও দোকানের পূর্ণাঙ্গ ঠিকানা' : '3. Contact & Address Details'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'মূল ফোন নম্বর *' : 'Primary Phone *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'বিকল্প ফোন নম্বর' : 'Alternative Phone'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.altPhone || ''}
                  onChange={e => handleChange('altPhone', e.target.value)}
                  placeholder="01800-000000"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'অফিসিয়াল ইমেইল' : 'Business Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ওয়েবসাইট (Website)' : 'Website URL'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => handleChange('website', e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500"
                />
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'পূর্ণাঙ্গ ঠিকানা (Street Address) *' : 'Street Address *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'শহর (City)' : 'City'}</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={e => handleChange('city', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'জেলা (District)' : 'District'}</label>
              <input
                type="text"
                value={formData.district || ''}
                onChange={e => handleChange('district', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'পোস্টাল কোড' : 'Postal Code'}</label>
              <input
                type="text"
                value={formData.postalCode || ''}
                onChange={e => handleChange('postalCode', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'দেশ (Country)' : 'Country'}</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={e => handleChange('country', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Legal & Regulatory Credentials (BIN, TIN, VAT, Trade License) */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1e293b] pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>{isBn ? '৪. সরকারি রেজিস্ট্রেশন, BIN ও ট্যাক্স তথ্য' : '4. Legal, Tax & Registration Numbers'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'বিন নম্বর (BIN Number)' : 'BIN (Business ID)'}
              </label>
              <input
                type="text"
                value={formData.binTin}
                onChange={e => handleChange('binTin', e.target.value)}
                placeholder="BIN-9876543210"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'টিআইএন নম্বর (TIN Number)' : 'TIN (Tax ID)'}
              </label>
              <input
                type="text"
                value={formData.tinNo || ''}
                onChange={e => handleChange('tinNo', e.target.value)}
                placeholder="TIN-4567890123"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ভ্যাট রেজিঃ নম্বর (VAT Reg No)' : 'VAT Registration'}
              </label>
              <input
                type="text"
                value={formData.vatRegNo || ''}
                onChange={e => handleChange('vatRegNo', e.target.value)}
                placeholder="VAT-12345678"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ট্রেড লাইসেন্স / রেজিঃ নম্বর' : 'Trade License No'}
              </label>
              <input
                type="text"
                value={formData.tradeLicenseNo || formData.businessRegNo || ''}
                onChange={e => {
                  handleChange('tradeLicenseNo', e.target.value);
                  handleChange('businessRegNo', e.target.value);
                }}
                placeholder="TRAD/DSCC/019283"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saveStatus === 'saving' ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'দোকানের তথ্য সংরক্ষণ করুন' : 'Save Business Profile')}</span>
          </button>
        </div>
      </form>

      {/* Header Preview Modal (Invoice & PDF Report) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-xl w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{isBn ? 'হেডার ও লোগো প্রদর্শন প্রিভিউ' : 'Header & Logo Preview'}</span>
              </h4>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center bg-[#0b101d] p-1 rounded-xl border border-[#1e2a47]">
              <button
                type="button"
                onClick={() => setPreviewTab('invoice')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  previewTab === 'invoice'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? 'ইনভয়েস / ক্যাশ মেমো' : 'Invoice / Cash Memo'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('report')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  previewTab === 'report'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isBn ? 'A4 পিডিএফ রিপোর্ট হেডার' : 'A4 PDF Report Header'}
              </button>
            </div>

            {/* Paper Replica */}
            {previewTab === 'invoice' ? (
              <div className="bg-white text-black p-5 rounded-xl font-sans space-y-3 shadow-xl">
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
                  {formData.logoUrl && formData.showLogoOnInvoice !== false && (
                    <img src={formData.logoUrl} alt="Logo" className="h-12 mx-auto object-contain mb-1" />
                  )}
                  <h2 className="text-base font-black tracking-tight">{formData.businessName}</h2>
                  {formData.businessSubtitle && (
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{formData.businessSubtitle}</p>
                  )}
                  <p className="text-[11px] text-gray-700">{formData.address}</p>
                  <p className="text-[11px] text-gray-800 font-mono">মোবাইল: {formData.phone} {formData.email ? `• ${formData.email}` : ''}</p>
                  {formData.binTin && (
                    <p className="text-[10px] text-gray-600 font-mono">BIN: {formData.binTin}</p>
                  )}
                </div>

                <div className="flex justify-between text-[11px] font-mono border-b border-gray-300 pb-2">
                  <span>INV: INV-1001</span>
                  <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
                </div>

                <div className="text-center pt-2 text-[11px] text-gray-500 italic">
                  {formData.invoiceFooterText || 'আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!'}
                </div>
              </div>
            ) : (
              <div className="bg-white text-black p-5 rounded-xl font-sans space-y-3 shadow-xl border border-gray-200">
                <div className="border-b-2 border-gray-300 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {formData.logoUrl && formData.showLogoOnInvoice !== false && (
                        <div className="w-12 h-12 rounded-lg border border-gray-300 p-1 flex items-center justify-center shrink-0">
                          <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-base font-black text-gray-900 leading-tight">{formData.businessName || 'AmarDokan'}</h2>
                        <p className="text-[11px] text-indigo-700 font-bold">{formData.businessSubtitle || 'স্মার্ট ব্যবসা ব্যবস্থাপনা'}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          {formData.address ? `${formData.address} • ` : ''}ফোন: {formData.phone || '01700-000000'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 inline-block text-right">
                        <div className="text-xs font-black text-indigo-950">দৈনিক বিক্রয় রিপোর্ট</div>
                        <div className="text-[10px] font-bold text-indigo-700 mt-0.5">তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
                      </div>
                      {formData.binTin && (
                        <div className="text-[9px] text-gray-500 mt-1">BIN: {formData.binTin}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="py-2 text-center text-xs text-gray-500 bg-gray-50 rounded border border-gray-200">
                  {isBn ? 'পিডিএফ টেবিল ও সামারি ডাটা এখানে রেন্ডার হবে...' : 'PDF report tables & summaries will render here...'}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
              >
                {isBn ? 'বন্ধ করুন' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
