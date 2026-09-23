import React, { useState } from 'react';
import {
  Users, UserPlus, Edit2, Trash2, Key, CheckCircle2,
  Shield, Building2, Phone, Mail, Clock, X, Lock, Check
} from 'lucide-react';
import { Language } from '../../../types';
import { AdminRole, ManagedUser } from '../../../types/settings';
import { SettingsService } from '../../../services/settingsService';

interface UserManagementSectionProps {
  lang: Language;
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [users, setUsers] = useState<ManagedUser[]>(SettingsService.getUsers());
  const [branches] = useState(SettingsService.getBranches());
  const [notification, setNotification] = useState('');

  // Modals
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [resettingUser, setResettingUser] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form State for Add / Edit
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('Cashier');
  const [branch, setBranch] = useState(branches[0]?.name || 'Main Branch');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'suspended'>('active');

  const openAdd = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setRole('Cashier');
    setBranch(branches[0]?.name || 'Main Branch');
    setPassword('user123');
    setStatus('active');
    setEditingUser(null);
    setIsAdding(true);
  };

  const openEdit = (u: ManagedUser) => {
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
    setBranch(u.branch);
    setStatus(u.status);
    setEditingUser(u);
    setIsAdding(false);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    if (isAdding) {
      const newUser = SettingsService.addUser({
        name,
        username,
        email,
        phone,
        role,
        branch,
        status,
        password: password || 'user123'
      });
      const admin = SettingsService.getAdminProfile();
      SettingsService.logAudit(admin.name, 'User Added', 'User Management', `নতুন ব্যবহারকারী "${name}" (${role}) তৈরি করা হয়েছে`, 'success');
      setNotification(isBn ? 'নতুন ব্যবহারকারী সফলভাবে যুক্ত হয়েছে!' : 'New user created successfully!');
    } else if (editingUser) {
      SettingsService.updateUser({
        ...editingUser,
        name,
        username,
        email,
        phone,
        role,
        branch,
        status
      });
      const admin = SettingsService.getAdminProfile();
      SettingsService.logAudit(admin.name, 'User Updated', 'User Management', `ব্যবহারকারী "${name}" এর প্রোফাইল আপডেট করা হয়েছে`, 'success');
      setNotification(isBn ? 'ব্যবহারকারী তথ্য হালনাগাদ হয়েছে!' : 'User updated successfully!');
    }

    setUsers(SettingsService.getUsers());
    setIsAdding(false);
    setEditingUser(null);
    setTimeout(() => setNotification(''), 2500);
  };

  const handleToggleStatus = (u: ManagedUser) => {
    if (u.role === 'Owner') {
      alert(isBn ? 'মালিক অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।' : 'Owner account cannot be deactivated.');
      return;
    }
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    SettingsService.updateUser({ ...u, status: nextStatus });
    setUsers(SettingsService.getUsers());
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPassword) return;

    SettingsService.updateUser({
      ...resettingUser,
      password: newPassword
    });

    const admin = SettingsService.getAdminProfile();
    SettingsService.logAudit(admin.name, 'Password Reset', 'User Management', `ব্যবহারকারী "${resettingUser.name}" এর পাসওয়ার্ড রিসেট করা হয়েছে`, 'warning');

    setNotification(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password reset successfully!');
    setResettingUser(null);
    setNewPassword('');
    setTimeout(() => setNotification(''), 2500);
  };

  const handleDeleteUser = (u: ManagedUser) => {
    if (u.role === 'Owner') {
      alert(isBn ? 'মালিক অ্যাকাউন্ট মুছে ফেলা যাবে না।' : 'Owner account cannot be deleted.');
      return;
    }
    if (confirm(isBn ? `আপনি কি ব্যবহারকারী "${u.name}" মুছে ফেলতে চান?` : `Permanently delete user "${u.name}"?`)) {
      SettingsService.deleteUser(u.id);
      setUsers(SettingsService.getUsers());
      const admin = SettingsService.getAdminProfile();
      SettingsService.logAudit(admin.name, 'User Deleted', 'User Management', `ব্যবহারকারী "${u.name}" কে সিস্টেম থেকে অপসরণ করা হয়েছে`, 'warning');
      setNotification(isBn ? 'ব্যবহারকারী মুছে ফেলা হয়েছে' : 'User deleted');
      setTimeout(() => setNotification(''), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'ব্যবহারকারী ব্যবস্থাপনা (User Management)' : 'Staff & User Accounts Management'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'দোকানের ক্যাশিয়ার, ম্যানেজার, হিসাবরক্ষক ও কর্মীদের অ্যাকাউন্ট তৈরি ও এক্সেস নিয়ন্ত্রণ'
              : 'Add cashiers, managers, assign branches, reset employee passwords, and manage permissions'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isBn ? 'নতুন ইউজার যোগ করুন' : 'Add New User'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <div className="overflow-x-auto rounded-xl border border-[#1e2a47]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101d] text-slate-400 border-b border-[#1e2a47]">
              <tr>
                <th className="p-3 font-semibold">{isBn ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="p-3 font-semibold">{isBn ? 'ভূমিকা (Role)' : 'Role'}</th>
                <th className="p-3 font-semibold">{isBn ? 'শাখা (Branch)' : 'Branch'}</th>
                <th className="p-3 font-semibold">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                <th className="p-3 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-3 font-semibold">{isBn ? 'সর্বশেষ প্রবেশ' : 'Last Login'}</th>
                <th className="p-3 text-right font-semibold">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]/60 text-slate-300">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#131b2e]/60 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
                      <Shield className="w-3 h-3 text-indigo-400" />
                      <span>{u.role}</span>
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="text-slate-300 flex items-center gap-1.5 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.branch}</span>
                    </span>
                  </td>

                  <td className="p-3 text-[11px] space-y-0.5">
                    <div className="text-slate-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{u.phone}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{u.email}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                        u.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                      }`}
                    >
                      {u.status === 'active' ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                    </button>
                  </td>

                  <td className="p-3 text-[11px] text-slate-400 font-mono">
                    {u.lastLogin || 'N/A'}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg bg-[#131b2e] hover:bg-[#1a253e] text-indigo-300 transition-colors"
                        title={isBn ? 'সম্পাদনা' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setResettingUser(u); setNewPassword(''); }}
                        className="p-1.5 rounded-lg bg-[#131b2e] hover:bg-[#1a253e] text-amber-300 transition-colors"
                        title={isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Reset Password'}
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      {u.role !== 'Owner' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 transition-colors"
                          title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAdding || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{isAdding ? (isBn ? 'নতুন ব্যবহারকারী তৈরি' : 'Create User Account') : (isBn ? 'ব্যবহারকারী তথ্য সম্পাদনা' : 'Edit User Account')}</span>
              </h4>
              <button
                onClick={() => { setIsAdding(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="সাদমান শাফি"
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'ইউজারনেম *' : 'Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().trim())}
                    placeholder="shafi_cashier"
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@amardokan.com"
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01712-345678"
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'ভূমিকা (Role) *' : 'System Role *'}
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as AdminRole)}
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Admin">Admin (প্রশাসক)</option>
                    <option value="Manager">Manager (ম্যানেজার)</option>
                    <option value="Cashier">Cashier (ক্যাশিয়ার)</option>
                    <option value="Accountant">Accountant (হিসাবরক্ষক)</option>
                    <option value="Salesman">Salesman (বিক্রয়কর্মী)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'শাখা বরাদ্দ (Branch)' : 'Assigned Branch'}
                  </label>
                  <select
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isAdding && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {isBn ? 'লগইন পাসওয়ার্ড *' : 'Temporary Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="নূন্যতম ৬ অক্ষর"
                    className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#1e2a47]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status === 'active'}
                    onChange={e => setStatus(e.target.checked ? 'active' : 'inactive')}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">{isBn ? 'অ্যাকাউন্ট সক্রিয় রাখুন' : 'Active status'}</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingUser(null); }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950"
                  >
                    {isBn ? 'সংরক্ষণ' : 'Save User'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset User Password'}</span>
              </h4>
              <button onClick={() => setResettingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {isBn ? `ব্যবহারকারী "${resettingUser.name}" এর জন্য নতুন পাসওয়ার্ড সেট করুন:` : `Set new password for "${resettingUser.name}":`}
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড"
                  className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#131b2e] text-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  {isBn ? 'পাসওয়ার্ড সেট করুন' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
