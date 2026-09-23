import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  Bell,
  LogOut,
  ChevronDown,
  Globe,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Language, User } from '../../types';
import { SettingsService } from '../../services/settingsService';
import { SettingsTabId } from '../settings/SettingsView';

export interface UserAvatarDropdownProps {
  user: User | null;
  lang: Language;
  onNavigateSettings?: (tab?: SettingsTabId) => void;
  onLogout: () => void;
  onLogin?: () => void;
}

export const UserAvatarDropdown: React.FC<UserAvatarDropdownProps> = ({
  user,
  lang,
  onNavigateSettings,
  onLogout,
  onLogin
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isBn = lang === 'bn';

  // Retrieve current admin profile from SettingsService
  const adminProfile = SettingsService.getAdminProfile();

  const userName = user?.name || adminProfile.name || (isBn ? 'এডমিন' : 'Admin');
  const userEmail = user?.email || adminProfile.email || 'admin@amardokan.com';
  const userRole = adminProfile.role || 'Owner';
  const userAvatar = user?.photoURL || adminProfile.photoURL || adminProfile.avatar;

  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  // Role translation & badge color
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return {
          text: isBn ? 'মালিক (Owner)' : 'Owner',
          badgeClass: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
          dotClass: 'bg-amber-400'
        };
      case 'admin':
        return {
          text: isBn ? 'এডমিন (Admin)' : 'Admin',
          badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          dotClass: 'bg-indigo-400'
        };
      case 'manager':
        return {
          text: isBn ? 'ম্যানেজার' : 'Manager',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          dotClass: 'bg-blue-400'
        };
      default:
        return {
          text: role,
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          dotClass: 'bg-purple-400'
        };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} id="user-avatar-dropdown-container">
      {/* Trigger Button */}
      <button
        id="user-avatar-dropdown-button"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center gap-2.5 pl-2 pr-2.5 py-1 rounded-xl transition-all duration-200 cursor-pointer border select-none ${
          isOpen
            ? 'bg-[#141d33] border-indigo-500/40 shadow-lg shadow-indigo-500/5'
            : 'hover:bg-[#12192c] border-transparent hover:border-[#1e2a47]'
        }`}
      >
        {/* Avatar with Online Status Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-900/30 overflow-hidden ring-1 ring-white/10">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="tracking-wide text-xs">{userInitials}</span>
            )}
          </div>
          {/* Online Indicator Badge on Avatar */}
          <span
            id="avatar-online-status-dot"
            title={isBn ? 'সক্রিয় (Online)' : 'Active (Online)'}
            className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-[#0b101d]" />
          </span>
        </div>

        {/* User Info (Desktop) */}
        <div className="text-left hidden md:block max-w-[130px] lg:max-w-[150px]">
          <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-indigo-200 transition-colors">
            {userName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {roleInfo.text}
            </span>
          </div>
        </div>

        {/* Dropdown Chevron */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-400' : 'group-hover:text-slate-200'
          }`}
        />
      </button>

      {/* Smooth Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="user-avatar-dropdown-menu"
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{
              duration: 0.18,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="absolute right-0 mt-2 w-72 bg-[#101728] border border-[#1e2a47] rounded-2xl shadow-2xl shadow-black/60 p-2.5 z-50 overflow-hidden backdrop-blur-md"
          >
            {/* Admin Profile Overview Card */}
            <div
              id="dropdown-admin-profile-card"
              className="p-3 bg-gradient-to-br from-[#162138] to-[#121a2d] border border-[#233152] rounded-xl mb-2"
            >
              <div className="flex items-start gap-3">
                {/* Profile Photo */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md overflow-hidden ring-1 ring-white/15">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                  {/* Status Dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-[#162138]" />
                  </span>
                </div>

                {/* Profile Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-white truncate">{userName}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {userEmail}
                  </p>

                  {/* Badges: Role & Online Status */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {/* Role Badge */}
                    <span
                      id="dropdown-role-badge"
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleInfo.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dotClass}`} />
                      {roleInfo.text}
                    </span>

                    {/* Online Status Badge */}
                    <span
                      id="dropdown-online-status-badge"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isBn ? 'সক্রিয় (Online)' : 'Online'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu Items */}
            <div className="space-y-1" role="none">
              {/* 1. My Profile */}
              <button
                id="user-menu-item-profile"
                role="menuitem"
                type="button"
                onClick={() => handleItemClick(() => onNavigateSettings?.('profile'))}
                className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-3 text-slate-300 hover:text-white hover:bg-[#18233e] transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {isBn ? 'আমার প্রোফাইল' : 'My Profile'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isBn ? 'ব্যক্তিগত তথ্য ও ছবি পরিচালনা' : 'Personal details & avatar'}
                  </p>
                </div>
              </button>

              {/* 2. Security */}
              <button
                id="user-menu-item-security"
                role="menuitem"
                type="button"
                onClick={() => handleItemClick(() => onNavigateSettings?.('security'))}
                className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-3 text-slate-300 hover:text-white hover:bg-[#18233e] transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {isBn ? 'নিরাপত্তা' : 'Security'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isBn ? '2FA ও অ্যাক্টিভ সেশন' : '2FA & active sessions'}
                  </p>
                </div>
              </button>

              {/* 3. Change Password */}
              <button
                id="user-menu-item-password"
                role="menuitem"
                type="button"
                onClick={() => handleItemClick(() => onNavigateSettings?.('security'))}
                className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-3 text-slate-300 hover:text-white hover:bg-[#18233e] transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isBn ? 'অ্যাকাউন্টের নিরাপত্তা পাসওয়ার্ড' : 'Update account password'}
                  </p>
                </div>
              </button>

              {/* 4. Notifications */}
              <button
                id="user-menu-item-notifications"
                role="menuitem"
                type="button"
                onClick={() => handleItemClick(() => onNavigateSettings?.('notifications'))}
                className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-3 text-slate-300 hover:text-white hover:bg-[#18233e] transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {isBn ? 'নোটিফিকেশন' : 'Notifications'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isBn ? 'সতর্কতা ও বার্তা পছন্দ' : 'Alerts & message preferences'}
                  </p>
                </div>
              </button>
            </div>

            {/* Optional Google Sign In if not logged into Google */}
            {!user && onLogin && (
              <div className="pt-2 mt-2 border-t border-[#1e2a47]">
                <button
                  id="user-menu-item-google-login"
                  role="menuitem"
                  type="button"
                  onClick={() => handleItemClick(onLogin)}
                  className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-3 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-950/40 transition-all group cursor-pointer border border-emerald-500/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-emerald-200 group-hover:text-white transition-colors">
                      {isBn ? 'গুগল দিয়ে সাইন ইন' : 'Sign in with Google'}
                    </p>
                    <p className="text-[10px] text-emerald-400/80 truncate">
                      {isBn ? 'ক্লাউড সিঙ্ক ও ব্যাকআপ চালু করতে' : 'Enable cloud sync & backup'}
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Divider & Logout */}
            <div className="pt-2 mt-2 border-t border-[#1e2a47]">
              <button
                id="user-menu-item-logout"
                role="menuitem"
                type="button"
                onClick={() => handleItemClick(onLogout)}
                className="w-full px-3 py-2 text-left rounded-xl flex items-center gap-3 text-rose-300 hover:text-rose-100 hover:bg-rose-950/35 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-rose-300 group-hover:text-rose-100 transition-colors">
                    {isBn ? 'লগ আউট' : 'Logout'}
                  </p>
                  <p className="text-[10px] text-rose-400/70 truncate">
                    {isBn ? 'সেশন শেষ করে প্রস্থান' : 'Sign out of account'}
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
