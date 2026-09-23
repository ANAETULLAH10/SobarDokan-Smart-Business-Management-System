import React, { useState } from 'react';
import {
  KeyRound, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  QrCode, Copy, RefreshCw, ShieldAlert, Check, Smartphone, Key
} from 'lucide-react';
import { Language, SecurityPolicySettings, TwoFactorAuthSettings } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface SecurityPasswordSectionProps {
  lang: Language;
}

export const SecurityPasswordSection: React.FC<SecurityPasswordSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  // 2FA State
  const [twoFactor, setTwoFactor] = useState<TwoFactorAuthSettings>(SettingsService.getTwoFactorSettings());
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempSecret, setTempSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Security Policies State
  const [policies, setPolicies] = useState<SecurityPolicySettings>(SettingsService.getSecurityPolicies());
  const [policySaved, setPolicySaved] = useState(false);

  // Password Strength Calculation
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: isBn ? 'খালি' : 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: isBn ? 'দুর্বল (Weak)' : 'Weak', color: 'bg-rose-500' };
    if (score === 3 || score === 4) return { score: 2, label: isBn ? 'মাঝারি (Medium)' : 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: isBn ? 'শক্তিশালী (Strong)' : 'Strong', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(newPassword);

  // Handle Password Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!SettingsService.verifyCurrentPassword(currentPassword)) {
      setPasswordError(isBn ? 'বর্তমান পাসওয়ার্ডটি সঠিক নয়' : 'Current password is incorrect');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(isBn ? 'নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে' : 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(isBn ? 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ মিলছে না' : 'New password and confirm password do not match');
      return;
    }

    setPasswordStatus('saving');
    setTimeout(() => {
      SettingsService.changePassword(newPassword);
      setPasswordStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus('idle'), 4000);
    }, 500);
  };

  // 2FA Handlers
  const handleStart2FASetup = () => {
    const newSecret = SettingsService.generateTwoFactorSecret();
    setTempSecret(newSecret);
    setVerifyCode('');
    setVerifyError('');
    setShow2FAModal(true);
  };

  const handleConfirm2FA = () => {
    if (!verifyCode || verifyCode.trim().length < 4) {
      setVerifyError(isBn ? 'অনুগ্রহ করে সঠিক ভেরিফিকেশন কোড দিন' : 'Please enter a valid verification code');
      return;
    }

    const updated: TwoFactorAuthSettings = {
      enabled: true,
      secret: tempSecret,
      recoveryCodes: SettingsService.generateRecoveryCodes(),
      lastVerifiedAt: new Date().toISOString()
    };
    setTwoFactor(updated);
    SettingsService.saveTwoFactorSettings(updated);
    setShow2FAModal(false);
  };

  const handleDisable2FA = () => {
    if (confirm(isBn ? 'আপনি কি টু-ফ্যাক্টর অথেনটিকেশন নিষ্ক্রিয় করতে চান?' : 'Are you sure you want to disable 2FA?')) {
      const updated: TwoFactorAuthSettings = {
        ...twoFactor,
        enabled: false
      };
      setTwoFactor(updated);
      SettingsService.saveTwoFactorSettings(updated);
    }
  };

  // Policy Handlers
  const handlePolicyToggle = (field: keyof SecurityPolicySettings, value: any) => {
    const updated = { ...policies, [field]: value };
    setPolicies(updated);
    SettingsService.saveSecurityPolicies(updated);
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1e2a47] pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>{isBn ? 'পাসওয়ার্ড ও নিরাপত্তা (Password & Security)' : 'Password & Authentication Security'}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {isBn ? 'অ্যাকাউন্টের নিরাপত্তা স্তর, ২-ফ্যাক্টর প্রমাণীকরণ ও লগইন নীতিমালা কনফিগার করুন' : 'Manage account protection credentials, 2-Factor authentication, and session security policies'}
        </p>
      </div>

      {policySaved && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? 'নিরাপত্তা নীতিমালা সংরক্ষিত হয়েছে!' : 'Security policy updated successfully!'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Change Password Box */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন (Change Password)' : 'Change Password'}</span>
          </h4>

          {passwordStatus === 'success' && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password changed successfully!'}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'বর্তমান পাসওয়ার্ড (Current Password) *' : 'Current Password *'}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:border-indigo-500 font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {isBn ? 'ডিফল্ট মাস্টার পাসওয়ার্ড: admin123' : 'Default master password: admin123'}
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'নতুন পাসওয়ার্ড (New Password) *' : 'New Password *'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:border-indigo-500 font-mono"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{isBn ? 'পাসওয়ার্ডের শক্তিমত্তা:' : 'Strength:'}</span>
                    <span className="font-semibold text-white">{strength.label}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন (Confirm Password) *' : 'Confirm New Password *'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:border-indigo-500 font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="p-3 rounded-xl bg-[#0b101d] border border-[#1e2a47] space-y-1 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">{isBn ? 'পাসওয়ার্ডের শর্তাবলী:' : 'Requirements:'}</p>
              <div className="flex items-center gap-1.5">
                <Check className={`w-3 h-3 ${newPassword.length >= 6 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>{isBn ? 'ন্যূনতম ৬টি অক্ষর' : 'At least 6 characters'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className={`w-3 h-3 ${/[0-9]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>{isBn ? 'অন্তত ১টি সংখ্যা (0-9)' : 'At least 1 number (0-9)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className={`w-3 h-3 ${newPassword && newPassword === confirmPassword ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>{isBn ? 'উভয় পাসওয়ার্ড হুবহু মিলতে হবে' : 'Passwords must match'}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordStatus === 'saving'}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>{passwordStatus === 'saving' ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'নতুন পাসওয়ার্ড সংরক্ষণ করুন' : 'Update Password')}</span>
            </button>
          </form>
        </div>

        {/* 2. Two-Factor Authentication (2FA) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e293b] pb-3">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>{isBn ? 'টু-ফ্যাক্টর অথেনটিকেশন (2FA)' : 'Two-Factor Authentication (2FA)'}</span>
            </h4>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
              <div>
                <p className="text-xs font-bold text-white">
                  {twoFactor.enabled
                    ? 'Two-factor authentication is enabled'
                    : 'Two-factor authentication is disabled'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {twoFactor.enabled
                    ? (isBn ? 'আপনার অ্যাকাউন্টে অতিরিক্ত ওয়ান-টাইম পাসকোড নিরাপত্তা সক্রিয় আছে' : 'Your account is protected with TOTP authenticator code')
                    : (isBn ? 'গুগল অথেনটিকেটর দিয়ে ওয়ান-টাইম কোড চালু করুন' : 'Enhance protection using Google Authenticator or SMS TOTP')}
                </p>
              </div>

              {twoFactor.enabled ? (
                <button
                  type="button"
                  onClick={handleDisable2FA}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                >
                  {isBn ? 'বন্ধ করুন' : 'Disable 2FA'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStart2FASetup}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950 transition-all"
                >
                  {isBn ? 'চালু করুন (Enable)' : 'Enable 2FA'}
                </button>
              )}
            </div>

            {/* Recovery Codes Display if 2FA is active */}
            {twoFactor.enabled && (
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isBn ? 'ব্যাকআপ রিকভারি কোডসমূহ' : 'Backup Recovery Codes'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(twoFactor.recoveryCodes.join('\n'));
                      setCopiedCodes(true);
                      setTimeout(() => setCopiedCodes(false), 2000);
                    }}
                    className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCodes ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'সব কপি করুন' : 'Copy All')}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-purple-300">
                  {twoFactor.recoveryCodes.map((code, idx) => (
                    <div key={idx} className="bg-[#0b101d] px-2.5 py-1 rounded-lg border border-purple-900/40">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Security Policy Toggles */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1e293b] pb-3">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'লগইন ও সেশন নীতিমালা' : 'Session & Login Protection'}</span>
            </h4>

            <div className="space-y-3">
              {/* Remember Me */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
                <div>
                  <p className="text-xs font-semibold text-white">{isBn ? 'স্মরণ রাখুন (Remember Me)' : 'Remember Me'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'ব্রাউজার রিস্টার্টের পরও লগইন বহাল রাখুন' : 'Keep session active across browser restarts'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.rememberMe}
                  onChange={e => handlePolicyToggle('rememberMe', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Auto Logout */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
                <div>
                  <p className="text-xs font-semibold text-white">{isBn ? 'অটো লগআউট (Auto Logout on Idle)' : 'Auto Logout on Inactivity'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'নির্দিষ্ট সময় নিষ্ক্রিয় থাকলে স্বয়ংক্রিয়ভাবে লগআউট' : 'Automatically sign out when inactive'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.autoLogout}
                  onChange={e => handlePolicyToggle('autoLogout', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Session Timeout */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
                <div>
                  <p className="text-xs font-semibold text-white">{isBn ? 'সেশন মেয়াদ (Session Timeout)' : 'Session Timeout Limit'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'নিষ্ক্রিয় সময়সীমা নির্ধারণ করুন' : 'Minutes of inactivity before session expires'}</p>
                </div>
                <select
                  value={policies.sessionTimeoutMinutes}
                  onChange={e => handlePolicyToggle('sessionTimeoutMinutes', Number(e.target.value))}
                  className="bg-[#12192c] border border-[#1e2a47] rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value={15}>১৫ মিনিট (15m)</option>
                  <option value={30}>৩০ মিনিট (30m)</option>
                  <option value={60}>১ ঘণ্টা (60m)</option>
                  <option value={120}>২ ঘণ্টা (120m)</option>
                  <option value={0}>বন্ধ (Never)</option>
                </select>
              </div>

              {/* Failed Login Protection */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
                <div>
                  <p className="text-xs font-semibold text-white">{isBn ? 'ব্যর্থ লগইন সুরক্ষা (Brute-Force Guard)' : 'Failed Login Protection'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'সর্বোচ্চ ৫ বার ভুল হলে সাময়িক লক' : 'Lock account after max failed attempts'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.failedLoginProtection}
                  onChange={e => handlePolicyToggle('failedLoginProtection', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Login Notification */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b101d] border border-[#1e2a47]">
                <div>
                  <p className="text-xs font-semibold text-white">{isBn ? 'লগইন নোটিফিকেশন' : 'Login Activity Alerts'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'নতুন ডিভাইস থেকে লগইন হলে অ্যালার্ট দিন' : 'Send notification on new device login'}</p>
                </div>
                <input
                  type="checkbox"
                  checked={policies.loginNotification}
                  onChange={e => handlePolicyToggle('loginNotification', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>{isBn ? '২-ফ্যাক্টর অথেনটিকেশন সেটআপ' : 'Two-Factor Authentication Setup'}</span>
              </h4>
              <button onClick={() => setShow2FAModal(false)} className="text-slate-400 hover:text-white">
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {isBn
                ? 'Google Authenticator অথবা Microsoft Authenticator অ্যাপে নিচের সিক্রেট কি প্রবেশ করান:'
                : 'Enter the following secret key into your Google or Microsoft Authenticator app:'}
            </p>

            <div className="p-4 rounded-xl bg-[#0b101d] border border-[#1e2a47] flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-300 tracking-wider">
                {tempSecret}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(tempSecret);
                  setCopiedSecret(true);
                  setTimeout(() => setCopiedSecret(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSecret ? (isBn ? 'কপি!' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
              </button>
            </div>

            {verifyError && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{verifyError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ভেরিফিকেশন কোড (Verification Code)' : 'Authenticator 6-digit Code'}
              </label>
              <input
                type="text"
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-center text-sm font-mono text-white tracking-widest focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e2a47]">
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="px-3.5 py-2 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold hover:bg-[#1a253e]"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirm2FA}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950"
              >
                {isBn ? 'যাচাই ও চালু করুন' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
