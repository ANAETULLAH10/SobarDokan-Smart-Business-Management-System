import React, { useState, useRef } from 'react';
import {
  User, Camera, Trash2, RefreshCw, Save, X, Shield, Mail, Phone,
  MapPin, Calendar, Clock, Globe, Award, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AdminProfile, Language } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface AdminProfileSectionProps {
  lang: Language;
  onProfileUpdated?: (profile: AdminProfile) => void;
}

export const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({ lang, onProfileUpdated }) => {
  const isBn = lang === 'bn';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdminProfile>(SettingsService.getAdminProfile());
  const [formData, setFormData] = useState<AdminProfile>({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle image upload and resize via HTML5 Canvas
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, photoURL: dataUrl }));
          if (!isEditing) {
            // Auto save photo if not in form edit mode
            const updated = { ...profile, photoURL: dataUrl };
            setProfile(updated);
            SettingsService.saveAdminProfile(updated);
            onProfileUpdated?.(updated);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photoURL: '' }));
    if (!isEditing) {
      const updated = { ...profile, photoURL: '' };
      setProfile(updated);
      SettingsService.saveAdminProfile(updated);
      onProfileUpdated?.(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage(isBn ? 'নাম আবশ্যক' : 'Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage(isBn ? 'ইমেইল আবশ্যক' : 'Email is required');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage('');

    setTimeout(() => {
      try {
        SettingsService.saveAdminProfile(formData);
        setProfile(formData);
        setIsEditing(false);
        setSaveStatus('saved');
        onProfileUpdated?.(formData);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(isBn ? 'সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to save profile');
      }
    }, 400);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleReset = () => {
    if (confirm(isBn ? 'আপনি কি প্রোফাইল তথ্য প্রারম্ভিক অবস্থায় রিসেট করতে চান?' : 'Reset profile to default values?')) {
      const reset = SettingsService.resetAdminProfile();
      setProfile(reset);
      setFormData(reset);
      setIsEditing(false);
      onProfileUpdated?.(reset);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'অ্যাডমিন প্রোফাইল (Admin Profile)' : 'Admin Profile Information'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? 'আপনার ব্যক্তিগত ও ব্যবসায়িক অ্যাকাউন্ট বিবরণী পরিচালনা করুন' : 'Manage your personal account details, contact info, and profile credentials'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              id="btn-edit-admin-profile"
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/40 flex items-center gap-1.5 transition-all"
            >
              <span>{isBn ? 'প্রোফাইল পরিবর্তন (Edit Profile)' : 'Edit Profile'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] border border-[#233153] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title={isBn ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isBn ? 'রিসেট' : 'Reset'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {saveStatus === 'saved' && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile changes saved successfully!'}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-6">
        {/* Photo Upload & Preview Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#1e2a47]/60">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-xl flex items-center justify-center overflow-hidden border-2 border-indigo-400/40">
              {formData.photoURL ? (
                <img
                  src={formData.photoURL}
                  alt={formData.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              ) : (
                <div className="w-full h-full bg-[#131b2e] rounded-[14px] flex flex-col items-center justify-center text-indigo-300">
                  <User className="w-10 h-10 stroke-[1.5]" />
                  <span className="text-[10px] font-bold mt-1 text-slate-400">NO PHOTO</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border border-indigo-400/50 transition-transform active:scale-95"
              title={isBn ? 'ছবি পরিবর্তন করুন' : 'Change Photo'}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h4 className="text-lg font-bold text-white tracking-tight">{profile.name}</h4>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold self-center sm:self-auto">
                <Shield className="w-3 h-3 text-indigo-400" />
                {profile.role.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold self-center sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isBn ? 'সক্রিয় অ্যাকাউন্ট' : 'Active Account'}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              {isBn ? 'ইউজারনেম:' : 'Username:'} @{profile.username} • {isBn ? 'আইডি:' : 'ID:'} {profile.employeeId}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#1c2742] border border-[#233153] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{formData.photoURL ? (isBn ? 'ছবি পরিবর্তন' : 'Replace Photo') : (isBn ? 'ছবি আপলোড' : 'Upload Photo')}</span>
              </button>

              {formData.photoURL && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ছবি মুছুন' : 'Remove Photo'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'পুরো নাম (Full Name) *' : 'Full Name *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ইউজারনেম (Username) *' : 'Username *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.username}
                  onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-mono"
                />
                <span className="text-slate-400 text-xs absolute left-3 top-2 font-mono">@</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'দায়িত্ব / পদবী (Role)' : 'Role'}
              </label>
              <div className="relative">
                <select
                  disabled={!isEditing}
                  value={formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                >
                  <option value="Owner">Owner (মালিক / সর্বেসর্বা)</option>
                  <option value="Admin">Admin (প্রশাসক)</option>
                  <option value="Manager">Manager (ব্যবস্থাপক)</option>
                  <option value="Cashier">Cashier (ক্যাশিয়ার)</option>
                  <option value="Accountant">Accountant (হিসাবরক্ষক)</option>
                </select>
                <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'কর্মী / আইডি নম্বর' : 'Employee ID'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.employeeId}
                  onChange={e => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-mono"
                />
                <Award className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Date Joined */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'যোগদানের তারিখ' : 'Date Joined'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  disabled={!isEditing}
                  value={formData.dateJoined}
                  onChange={e => setFormData(prev => ({ ...prev, dateJoined: e.target.value }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'সময় অঞ্চল (Timezone)' : 'Timezone'}
              </label>
              <div className="relative">
                <select
                  disabled={!isEditing}
                  value={formData.timezone}
                  onChange={e => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (UTC+06:00, Bangladesh Standard Time)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (UTC+05:30, IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (UTC+04:00, GST)</option>
                </select>
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'পছন্দের ভাষা' : 'Preferred Language'}
              </label>
              <div className="relative">
                <select
                  disabled={!isEditing}
                  value={formData.language}
                  onChange={e => setFormData(prev => ({ ...prev, language: e.target.value as any }))}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English (US)</option>
                </select>
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'বর্তমান ঠিকানা (Address)' : 'Residential Address'}
            </label>
            <div className="relative">
              <input
                type="text"
                disabled={!isEditing}
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Form Actions (Only in edit mode) */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2a47]/60">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] border border-[#233153] text-slate-300 text-xs font-semibold transition-colors"
              >
                {isBn ? 'বাতিল করুন' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saveStatus === 'saving' ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
