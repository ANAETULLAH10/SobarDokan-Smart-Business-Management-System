import React, { useState, useRef } from 'react';
import {
  Upload, Image as ImageIcon, Trash2, CheckCircle2,
  FileText, Hash, ShieldCheck, Eye, Layout, Printer,
  Sparkles, AlertCircle, Info, RefreshCw
} from 'lucide-react';
import { BusinessSettings, Language } from '../../types';

interface InvoiceHeaderSettingsProps {
  formData: BusinessSettings;
  onChange: (field: keyof BusinessSettings, value: any) => void;
  lang: Language;
}

export const InvoiceHeaderSettings: React.FC<InvoiceHeaderSettingsProps> = ({
  formData,
  onChange,
  lang
}) => {
  const [previewPaper, setPreviewPaper] = useState<'80mm' | 'a4'>('80mm');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError(lang === 'bn' ? 'অনুগ্রহ করে একটি বৈধ ইমেজ ফাইল (PNG, JPG, WebP) নির্বাচন করুন।' : 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError(lang === 'bn' ? 'লোগোর সাইজ ২ মেগাবাইট (2MB)-এর চেয়ে কম হতে হবে।' : 'Logo image must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange('logoUrl', dataUrl);
        onChange('showLogoOnInvoice', true);
      }
    };
    reader.onerror = () => {
      setUploadError(lang === 'bn' ? 'ফাইল পড়তে সমস্যা হয়েছে।' : 'Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Preset Sample Logo for fast testing
  const setSampleLogo = (type: 'retail' | 'tech' | 'mart') => {
    // Generate an elegant SVG data URL
    let svgIcon = '';
    if (type === 'retail') {
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <rect width="120" height="120" rx="24" fill="#4f46e5"/>
        <path d="M36 44h48l-6 40H42L36 44z" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M48 44V34a12 12 0 0 1 24 0v10" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <circle cx="60" cy="62" r="5" fill="#facc15"/>
      </svg>`;
    } else if (type === 'tech') {
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <rect width="120" height="120" rx="24" fill="#0f172a"/>
        <rect x="28" y="32" width="64" height="44" rx="6" fill="none" stroke="#38bdf8" stroke-width="6"/>
        <path d="M46 88h28M60 76v12" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
        <circle cx="60" cy="54" r="8" fill="#818cf8"/>
      </svg>`;
    } else {
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
        <rect width="120" height="120" rx="24" fill="#059669"/>
        <path d="M32 40h12l8 36h38l8-28H48" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="56" cy="86" r="6" fill="#fef08a"/>
        <circle cx="86" cy="86" r="6" fill="#fef08a"/>
      </svg>`;
    }

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgIcon)}`;
    onChange('logoUrl', dataUrl);
    onChange('showLogoOnInvoice', true);
    setUploadError(null);
  };

  const removeLogo = () => {
    onChange('logoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Compile active tax registration string list
  const activeTaxBadges: { label: string; value: string }[] = [];
  if (formData.binTin) {
    activeTaxBadges.push({ label: 'BIN', value: formData.binTin });
  }
  if (formData.vatRegNo && formData.vatRegNo !== formData.binTin) {
    activeTaxBadges.push({ label: 'VAT Reg', value: formData.vatRegNo });
  }
  if (formData.tinNo) {
    activeTaxBadges.push({ label: 'TIN', value: formData.tinNo });
  }
  if (formData.tradeLicenseNo) {
    activeTaxBadges.push({ label: 'Trade Lic', value: formData.tradeLicenseNo });
  }

  return (
    <div id="invoice-header-settings" className="space-y-6">
      
      {/* Section Container Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-6">
        
        {/* Title & Description */}
        <div className="border-b border-[#1e293b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-400" />
              <span>
                {lang === 'bn' ? 'মুদ্রিত ইনভয়েস হেডার ও ট্যাক্স কাস্টমাইজেশন' : 'Printed Invoice Header & Tax Customization'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'দোকানের লোগো আপলোড করুন, হেডার লেআউট নির্ধারণ করুন এবং সরকারি BIN, TIN ও ট্রেড লাইসেন্স নম্বর সংযুক্ত করুন।'
                : 'Upload your store logo, customize print header layout, and configure official BIN, TIN & Trade License tax numbers.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'bn' ? 'প্রিন্ট ও PDF প্রস্তুত' : 'Print & PDF Ready'}</span>
            </span>
          </div>
        </div>

        {/* 1. Logo Upload & Logo Display Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>{lang === 'bn' ? '১. ব্যবসার লোগো আপলোড (Business Logo)' : '1. Business Logo Upload'}</span>
            </h4>

            {/* Toggle: Show Logo on Invoice */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.showLogoOnInvoice !== false}
                onChange={(e) => onChange('showLogoOnInvoice', e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-300">
                {lang === 'bn' ? 'ইনভয়েসে লোগো প্রিন্ট করুন' : 'Print logo on invoices'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Logo Preview & File Drop Zone */}
            <div className="lg:col-span-2 p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Logo Display Box */}
                <div className="w-28 h-28 shrink-0 rounded-2xl bg-[#141d33] border-2 border-dashed border-[#2b3c66] flex items-center justify-center p-2 relative group overflow-hidden shadow-inner">
                  {formData.logoUrl ? (
                    <>
                      <img
                        src={formData.logoUrl}
                        alt="Business Logo Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-[10px]"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span>{lang === 'bn' ? 'মুছুন' : 'Remove'}</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2 text-slate-500">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] block leading-tight">{lang === 'bn' ? 'লোগো নেই' : 'No Logo'}</span>
                    </div>
                  )}
                </div>

                {/* Upload Action Details */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <p className="text-xs font-bold text-white">
                      {formData.logoUrl
                        ? (lang === 'bn' ? 'লোগো সফলভাবে লোড হয়েছে' : 'Logo is active')
                        : (lang === 'bn' ? 'আপনার ব্র্যান্ড বা দোকানের লোগো সংযুক্ত করুন' : 'Upload your company / store emblem')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === 'bn'
                        ? 'সুপারিশ: স্বচ্ছ ব্যাকগ্রাউন্ড সহ PNG, JPG বা WebP (সর্বোচ্চ ২ মেগাবাইট)। এটি থার্মাল ও A4 পেপারে হাই-রেজ্যুলেশনে প্রিন্ট হবে।'
                        : 'Transparent PNG, JPG, or WebP recommended (max 2MB). High clarity for thermal paper & A4.'}
                    </p>
                  </div>

                  {uploadError && (
                    <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logo-file-input"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-file-input"
                      className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.logoUrl ? (lang === 'bn' ? 'লোগো পরিবর্তন করুন' : 'Change Logo') : (lang === 'bn' ? 'লোগো আপলোড করুন' : 'Upload Logo')}</span>
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'লোগো বাতিল' : 'Remove'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Presets / Templates */}
            <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'স্যাম্পল লোগো দিয়ে টেস্ট করুন' : 'Quick Test Icons'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {lang === 'bn'
                  ? 'আপনার কাছে লোগো ফাইল না থাকলে নিচে থেকে যে কোনো একটি দিয়ে পরীক্ষা করতে পারেন:'
                  : 'If you don’t have a logo ready, select one of these sample vectors to preview:'}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSampleLogo('retail')}
                  className="p-2 rounded-lg bg-[#141d33] hover:bg-indigo-950/60 border border-[#233153] text-[10px] font-semibold text-indigo-300 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-base">🛍️</span>
                  <span>Retail Shop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSampleLogo('mart')}
                  className="p-2 rounded-lg bg-[#141d33] hover:bg-emerald-950/60 border border-[#233153] text-[10px] font-semibold text-emerald-300 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-base">🛒</span>
                  <span>SuperMart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSampleLogo('tech')}
                  className="p-2 rounded-lg bg-[#141d33] hover:bg-sky-950/60 border border-[#233153] text-[10px] font-semibold text-sky-300 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-base">💻</span>
                  <span>Tech Store</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Header Layout & Document Heading */}
        <div className="space-y-4 pt-2 border-t border-[#1e293b]">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'bn' ? '২. ইনভয়েস হেডার বিন্যাস ও শিরোনাম (Layout & Heading)' : '2. Header Layout & Document Title'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Center Layout */}
            <div
              onClick={() => onChange('invoiceHeaderLayout', 'center')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                (formData.invoiceHeaderLayout || 'center') === 'center'
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md text-white'
                  : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{lang === 'bn' ? 'সেন্টার অ্যালাইন (Classic Centered)' : 'Centered Layout'}</span>
                {(formData.invoiceHeaderLayout || 'center') === 'center' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'bn' ? 'লোগো উপরে মাঝখানে, নিচে প্রতিষ্ঠানের নাম ও ট্যাক্স বিবরণ (৮০ মিমি POS-এর জন্য সেরা)।' : 'Centered logo on top, store details underneath (Best for thermal POS slips).'}
              </p>
            </div>

            {/* Split Layout */}
            <div
              onClick={() => onChange('invoiceHeaderLayout', 'split')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                formData.invoiceHeaderLayout === 'split'
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md text-white'
                  : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{lang === 'bn' ? 'স্প্লিট / বামে লোগো (Modern Split)' : 'Modern Split Layout'}</span>
                {formData.invoiceHeaderLayout === 'split' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'bn' ? 'বামে লোগো এবং ডানে প্রতিষ্ঠানের নাম, কর ও ট্যাক্স নম্বর (A4 ইনভয়েসের জন্য আদর্শ)।' : 'Logo on left, store & tax numbers on right (Ideal for A4 Invoices).'}
              </p>
            </div>

            {/* Compact Layout */}
            <div
              onClick={() => onChange('invoiceHeaderLayout', 'compact')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                formData.invoiceHeaderLayout === 'compact'
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md text-white'
                  : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{lang === 'bn' ? 'কমপ্যাক্ট টেক্সট (Compact & Clean)' : 'Compact Layout'}</span>
                {formData.invoiceHeaderLayout === 'compact' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'bn' ? 'ছোট আকারের লোগো ও ঘন টেক্সট স্পেসিং। ছোট পেপারে দ্রুত প্রিন্ট হবে।' : 'Small logo with tight vertical spacing for ultra-fast thermal printing.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'bn' ? 'ইনভয়েস প্রধান শিরোনাম (Invoice Title)' : 'Invoice Document Title'}
              </label>
              <input
                type="text"
                value={formData.invoiceHeaderTitle || ''}
                placeholder={lang === 'bn' ? 'উদাঃ ক্যাশ মেমো ও কর চালানপত্র / TAX INVOICE' : 'e.g. TAX INVOICE / CASH MEMO'}
                onChange={(e) => onChange('invoiceHeaderTitle', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'bn' ? 'হেডার সাব-টাইটেল / বৈধানিক নোট (Statutory Header Note)' : 'Statutory Header Note / Tagline'}
              </label>
              <input
                type="text"
                value={formData.invoiceHeaderNote || ''}
                placeholder={lang === 'bn' ? 'উদাঃ সরকার অনুমোদিত নিবন্ধিত ব্যবসা / NBR Registered' : 'e.g. Authorized Tax-Compliant Store'}
                onChange={(e) => onChange('invoiceHeaderNote', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Tax Registration Numbers Customization */}
        <div className="space-y-4 pt-2 border-t border-[#1e293b]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? '৩. ট্যাক্স ও সরকারি নিবন্ধন নম্বরসমূহ (Tax Registration Numbers)' : '3. Tax & Government Registration Numbers'}</span>
            </h4>
            <span className="text-[11px] text-emerald-400 font-medium">
              {lang === 'bn' ? 'প্রিন্ট স্লিপে প্রদর্শিত হবে' : 'Printed on slip'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* BIN / Business Identification Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{lang === 'bn' ? '১. BIN / মূসক নিবন্ধন নং *' : '1. BIN / VAT Reg Number *'}</span>
                <span className="text-[10px] text-indigo-400 font-normal">NBR 9/13 Digit</span>
              </label>
              <input
                type="text"
                value={formData.binTin || ''}
                placeholder="001234567-0101"
                onChange={(e) => {
                  onChange('binTin', e.target.value);
                  if (!formData.vatRegNo) {
                    onChange('vatRegNo', e.target.value);
                  }
                }}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'বিজনেস আইডেন্টিফিকেশন নম্বর (ভ্যাট চালানের জন্য আবশ্যক)' : 'Business Identification Number for VAT'}
              </p>
            </div>

            {/* TIN / Taxpayer Identification Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{lang === 'bn' ? '২. ই-টিআইএন (e-TIN Number)' : '2. e-TIN Number'}</span>
                <span className="text-[10px] text-slate-400 font-normal">12 Digit</span>
              </label>
              <input
                type="text"
                value={formData.tinNo || ''}
                placeholder="876543219012"
                onChange={(e) => onChange('tinNo', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'আয়কর সনাক্তকরণ নম্বর (TIN)' : 'Taxpayer Identification Number'}
              </p>
            </div>

            {/* Trade License No */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{lang === 'bn' ? '৩. ট্রেড লাইসেন্স নম্বর (Trade Lic)' : '3. Trade License Number'}</span>
                <span className="text-[10px] text-slate-400 font-normal">City/Municipality</span>
              </label>
              <input
                type="text"
                value={formData.tradeLicenseNo || ''}
                placeholder="TRAD/DSCC/019283/2024"
                onChange={(e) => onChange('tradeLicenseNo', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'সিটি কর্পোরেশন বা পৌরসভা প্রদত্ত লাইসেন্স' : 'Municipal commercial trade license'}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Optional Tax Law / Statutory Classification */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'bn' ? 'ট্যাক্স ফর্ম্যাট লেবেল (Tax Form Category)' : 'Tax Form Category / Regime'}
              </label>
              <input
                type="text"
                value={formData.taxRegistrationLabel || ''}
                placeholder={lang === 'bn' ? 'উদাঃ মূসক-৬.৩ কর চালানপত্র / VAT Registered' : 'e.g. Mushak-6.3 / Standard Tax Invoice'}
                onChange={(e) => onChange('taxRegistrationLabel', e.target.value)}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>

            {/* VAT Rate Display */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'bn' ? 'চালানে নির্ধারিত স্ট্যান্ডার্ড ভ্যাট হার (%)' : 'Default Standard VAT Rate (%)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.vatPercent ?? 5}
                  onChange={(e) => onChange('vatPercent', Number(e.target.value))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-bold"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. REAL-TIME LIVE INVOICE HEADER PREVIEW */}
        <div className="space-y-3 pt-2 border-t border-[#1e293b]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'bn' ? '৪. লাইভ প্রিন্ট প্রিভিউ (Live Header Preview)' : '4. Live Invoice Header Preview'}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-900/50 border border-purple-500/40 text-purple-300 font-semibold">
                {lang === 'bn' ? 'রিয়েল-টাইম আপডেট' : 'Real-time'}
              </span>
            </div>

            {/* Switch preview paper width */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#0b101d] border border-[#1e2a47] text-xs">
              <button
                type="button"
                onClick={() => setPreviewPaper('80mm')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  previewPaper === '80mm'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? '৮০ মিমি থার্মাল (80mm)' : '80mm Thermal Slip'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewPaper('a4')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  previewPaper === 'a4'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'A4 পেপার ভিউ' : 'A4 Full Page'}
              </button>
            </div>
          </div>

          {/* Paper Sheet Preview */}
          <div className="bg-[#0b101d] border border-[#1e2a47] rounded-2xl p-4 sm:p-6 flex justify-center items-center">
            
            <div
              id="live-invoice-header-preview-sheet"
              style={{ maxWidth: previewPaper === '80mm' ? '380px' : '580px' }}
              className="w-full bg-white text-neutral-900 rounded-xl p-5 shadow-2xl border border-neutral-300 transition-all font-sans relative overflow-hidden"
            >
              
              {/* Optional Top Tax Form Badge */}
              {formData.taxRegistrationLabel && (
                <div className="text-center pb-2 mb-2 border-b border-dashed border-neutral-300">
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-neutral-100 text-neutral-700 border border-neutral-300 rounded">
                    {formData.taxRegistrationLabel}
                  </span>
                </div>
              )}

              {/* Header Content based on Layout */}
              {formData.invoiceHeaderLayout === 'split' ? (
                /* Split Layout (Logo Left, Store details Right) */
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-neutral-300">
                  {formData.showLogoOnInvoice !== false && formData.logoUrl ? (
                    <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="max-h-16 max-w-16 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 shrink-0 rounded bg-neutral-100 border border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400 font-bold">
                      LOGO
                    </div>
                  )}

                  <div className="text-right flex-1">
                    <h2 className="text-base font-black tracking-tight uppercase text-neutral-900 leading-tight">
                      {formData.businessName || 'AmarDokan'}
                    </h2>
                    {formData.businessSubtitle && (
                      <p className="text-[10px] text-neutral-600 font-semibold tracking-wide">
                        {formData.businessSubtitle}
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-600 mt-0.5">
                      {formData.address || 'Dhaka, Bangladesh'}
                    </p>
                    <p className="text-[10px] text-neutral-600 font-mono">
                      ফোন: {formData.phone || '01700-000000'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Center or Compact Layout */
                <div className="text-center pb-3 border-b border-neutral-300">
                  {formData.showLogoOnInvoice !== false && formData.logoUrl && (
                    <div className="flex justify-center mb-2">
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className={`${
                          formData.invoiceHeaderLayout === 'compact' ? 'max-h-10 max-w-10' : 'max-h-14 max-w-14'
                        } object-contain`}
                      />
                    </div>
                  )}

                  <h2 className="text-base font-black tracking-tight uppercase text-neutral-900 leading-tight">
                    {formData.businessName || 'AmarDokan'}
                  </h2>

                  {formData.businessSubtitle && (
                    <p className="text-[10px] text-neutral-600 font-medium tracking-wide">
                      {formData.businessSubtitle}
                    </p>
                  )}

                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    {formData.address || 'Dhaka, Bangladesh'}
                  </p>
                  <p className="text-[10px] text-neutral-600 font-mono">
                    ফোন: {formData.phone || '01700-000000'}
                  </p>
                </div>
              )}

              {/* Tax Registration Numbers Ribbon */}
              {activeTaxBadges.length > 0 && (
                <div className="my-2 py-1.5 px-2 bg-neutral-50 rounded border border-neutral-200 text-center text-[10px] font-mono text-neutral-800 space-y-0.5">
                  <div className="flex items-center justify-center gap-2 flex-wrap font-semibold">
                    {activeTaxBadges.map((tax, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <strong className="text-neutral-900 font-bold">{tax.label}:</strong>
                        <span>{tax.value}</span>
                        {i < activeTaxBadges.length - 1 && <span className="text-neutral-400">|</span>}
                      </span>
                    ))}
                  </div>

                  {formData.invoiceHeaderNote && (
                    <p className="text-[9px] text-neutral-500 font-sans italic">
                      {formData.invoiceHeaderNote}
                    </p>
                  )}
                </div>
              )}

              {/* Invoice Meta Sample */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-600 border-b border-neutral-200 pb-2">
                <div>
                  <p><strong className="text-neutral-900">ইনভয়েস:</strong> {formData.invoicePrefix || 'INV-'}1001</p>
                  <p><strong className="text-neutral-900">ক্রেতা:</strong> মো: হাবিবুর রহমান</p>
                </div>
                <div className="text-right">
                  <p><strong className="text-neutral-900">তারিখ:</strong> {new Date().toLocaleDateString('bn-BD')}</p>
                  <p><strong className="text-neutral-900">{formData.invoiceHeaderTitle || 'ক্যাশ মেমো'}</strong></p>
                </div>
              </div>

              {/* Sample item mockup */}
              <div className="pt-2 text-[10px] text-neutral-500 space-y-1">
                <div className="flex justify-between font-semibold text-neutral-800 border-b border-neutral-200 pb-1">
                  <span>পণ্য বিবরণী (Sample)</span>
                  <span>মোট</span>
                </div>
                <div className="flex justify-between">
                  <span>মিনিকেট চাউল (২৫ কেজি) x ১</span>
                  <span className="font-mono text-neutral-800">{formData.currencySymbol || '৳'}১,৭৫০</span>
                </div>
                <div className="flex justify-between">
                  <span>সয়াবিন তেল (৫ লিটার) x ১</span>
                  <span className="font-mono text-neutral-800">{formData.currencySymbol || '৳'}৮৮০</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-300 font-bold text-neutral-900">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="font-mono">{formData.currencySymbol || '৳'}২,৬৩০</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
