import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Shield, KeyRound, Lock, CheckCircle2,
  AlertCircle, Edit2, Trash2, Check, X, Smartphone, Mail,
  Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import { Language, BusinessSettings, AppUser } from '../../types';
import { StorageService } from '../../services/storage';

interface UserManagementViewProps {
  lang: Language;
  settings: BusinessSettings;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ lang, settings }) => {
  const isBn = lang === 'bn';

  const [users, setUsers] = useState<AppUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showPin, setShowPin] = useState<Record<string, boolean>>({});

  // Form State
  const [formData, setFormData] = useState<Partial<AppUser>>({
    name: '',
    phone: '',
    email: '',
    role: 'cashier',
    pin: '1234',
    status: 'active',
    permissions: {
      canPos: true,
      canDiscount: false,
      canEditProducts: false,
      canViewReports: false,
      canDeleteRecords: false,
      canAccessSettings: false
    }
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const list = StorageService.getAppUsers();
    setUsers(list);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      role: 'cashier',
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'active',
      permissions: {
        canPos: true,
        canDiscount: false,
        canEditProducts: false,
        canViewReports: false,
        canDeleteRecords: false,
        canAccessSettings: false
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const handleRoleChange = (role: AppUser['role']) => {
    let permissions = {
      canPos: true,
      canDiscount: false,
      canEditProducts: false,
      canViewReports: false,
      canDeleteRecords: false,
      canAccessSettings: false
    };

    if (role === 'admin') {
      permissions = {
        canPos: true,
        canDiscount: true,
        canEditProducts: true,
        canViewReports: true,
        canDeleteRecords: true,
        canAccessSettings: true
      };
    } else if (role === 'manager') {
      permissions = {
        canPos: true,
        canDiscount: true,
        canEditProducts: true,
        canViewReports: true,
        canDeleteRecords: false,
        canAccessSettings: false
      };
    } else if (role === 'salesperson') {
      permissions = {
        canPos: true,
        canDiscount: false,
        canEditProducts: true,
        canViewReports: false,
        canDeleteRecords: false,
        canAccessSettings: false
      };
    }

    setFormData({
      ...formData,
      role,
      permissions
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const userToSave: AppUser = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      role: formData.role || 'cashier',
      pin: formData.pin || '1234',
      status: formData.status || 'active',
      permissions: formData.permissions || {
        canPos: true,
        canDiscount: false,
        canEditProducts: false,
        canViewReports: false,
        canDeleteRecords: false,
        canAccessSettings: false
      },
      lastActive: editingUser?.lastActive || 'এখন সক্রিয়',
      createdAt: editingUser?.createdAt || new Date().toISOString().split('T')[0]
    };

    StorageService.saveAppUser(userToSave);
    loadUsers();
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(isBn ? `আপনি কি নিশ্চিত যে "${name}" ইউজারকে ডিলিট করতে চান?` : `Delete user "${name}"?`)) {
      StorageService.deleteAppUser(id);
      loadUsers();
    }
  };

  const togglePinVisibility = (id: string) => {
    setShowPin(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e1424] via-[#131b2e] to-[#0e1424] p-5 rounded-2xl border border-[#1e2a47] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isBn ? 'ইউজার ম্যানেজমেন্ট ও রোল এক্সেস' : 'User Management & Role Permissions'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Security
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBn
                ? 'দোকানের ক্যাশিয়ার, সেলসম্যান ও ম্যানেজারদের একাউন্ট এবং অনুমোদন নিয়ন্ত্রণ করুন'
                : 'Manage staff accounts, quick POS PINs, and granular role permissions'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          {isBn ? 'নতুন ইউজার যোগ করুন' : 'Add New User'}
        </button>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-sm">
            Ad
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">{isBn ? 'অ্যাডমিন' : 'Admin'}</p>
            <p className="text-lg font-bold text-white">
              {users.filter(u => u.role === 'admin').length} {isBn ? 'জন' : ''}
            </p>
          </div>
        </div>

        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
            Mg
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">{isBn ? 'ম্যানেজার' : 'Manager'}</p>
            <p className="text-lg font-bold text-white">
              {users.filter(u => u.role === 'manager').length} {isBn ? 'জন' : ''}
            </p>
          </div>
        </div>

        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
            Ca
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">{isBn ? 'ক্যাশিয়ার' : 'Cashier'}</p>
            <p className="text-lg font-bold text-white">
              {users.filter(u => u.role === 'cashier').length} {isBn ? 'জন' : ''}
            </p>
          </div>
        </div>

        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
            Sa
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">{isBn ? 'সেলসম্যান' : 'Salesperson'}</p>
            <p className="text-lg font-bold text-white">
              {users.filter(u => u.role === 'salesperson').length} {isBn ? 'জন' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e2a47] bg-[#090d18]/80 text-slate-400">
                <th className="py-3.5 px-4 font-semibold">{isBn ? 'ইউজার নাম' : 'User'}</th>
                <th className="py-3.5 px-4 font-semibold">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                <th className="py-3.5 px-4 font-semibold">{isBn ? 'রোল' : 'Role'}</th>
                <th className="py-3.5 px-4 font-semibold">{isBn ? 'POS দ্রুত পিন' : 'Quick PIN'}</th>
                <th className="py-3.5 px-4 font-semibold">{isBn ? 'অনুমোদিত ক্ষমতা' : 'Permissions'}</th>
                <th className="py-3.5 px-4 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3.5 px-4 font-semibold text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]">
              {users.map((user) => {
                const isUserPinShown = showPin[user.id];
                return (
                  <tr key={user.id} className="hover:bg-[#131b2e]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.lastActive || 'এখন সক্রিয়'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-mono text-slate-300">{user.phone}</p>
                      {user.email && <p className="text-[10px] text-slate-400">{user.email}</p>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                        user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : user.role === 'manager'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : user.role === 'cashier'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">
                          {isUserPinShown ? user.pin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(user.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isUserPinShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.permissions.canPos && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300">
                            POS
                          </span>
                        )}
                        {user.permissions.canDiscount && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-900/40 text-blue-300">
                            Discount
                          </span>
                        )}
                        {user.permissions.canEditProducts && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-900/40 text-emerald-300">
                            Inventory
                          </span>
                        )}
                        {user.permissions.canViewReports && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-900/40 text-purple-300">
                            Reports
                          </span>
                        )}
                        {user.permissions.canDeleteRecords && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-900/40 text-rose-300">
                            Delete
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/20 transition-colors"
                          title={isBn ? 'এডিট করুন' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/20 transition-colors"
                            title={isBn ? 'ডিলিট করুন' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">
                  {editingUser
                    ? (isBn ? 'ইউজার একাউন্ট এডিট করুন' : 'Edit User Account')
                    : (isBn ? 'নতুন ইউজার একাউন্ট তৈরি' : 'Create New User Account')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'ইউজারের পুরো নাম' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isBn ? 'যেমন: মো: কামাল হোসেন' : 'e.g. Kamal Hossain'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01700-000000"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'দ্রুত POS পিন (৪ ডিজিট)' : 'POS Quick PIN (4 digits)'} *
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="1234"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none font-mono tracking-widest text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@amardokan.com"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'অ্যাকাউন্ট রোল' : 'User Role'}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as any)}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="admin">{isBn ? 'অ্যাডমিন (Admin - Full Access)' : 'Admin (Full Access)'}</option>
                    <option value="manager">{isBn ? 'ম্যানেজার (Manager)' : 'Manager'}</option>
                    <option value="cashier">{isBn ? 'ক্যাশিয়ার (Cashier)' : 'Cashier'}</option>
                    <option value="salesperson">{isBn ? 'সেলসম্যান (Salesperson)' : 'Salesperson'}</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="pt-2 border-t border-[#1e2a47]">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {isBn ? 'নির্দিষ্ট পারমিশন ও ক্ষমতা' : 'Permissions & Capabilities'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-[#090d18] border border-[#1e2a47] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.canPos}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions!, canPos: e.target.checked }
                      })}
                      className="rounded border-[#1e2a47] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-200">{isBn ? 'ক্যাশ মেমো ও বিক্রয়' : 'POS Sales'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-[#090d18] border border-[#1e2a47] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.canDiscount}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions!, canDiscount: e.target.checked }
                      })}
                      className="rounded border-[#1e2a47] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-200">{isBn ? 'ডিসকাউন্ট দেওয়া' : 'Give Discounts'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-[#090d18] border border-[#1e2a47] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.canEditProducts}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions!, canEditProducts: e.target.checked }
                      })}
                      className="rounded border-[#1e2a47] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-200">{isBn ? 'পণ্য ও স্টক এডিট' : 'Edit Products'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-[#090d18] border border-[#1e2a47] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.canViewReports}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions!, canViewReports: e.target.checked }
                      })}
                      className="rounded border-[#1e2a47] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-200">{isBn ? 'লাভ ও রিপোর্ট দেখা' : 'View Reports'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-[#090d18] border border-[#1e2a47] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.canDeleteRecords}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions!, canDeleteRecords: e.target.checked }
                      })}
                      className="rounded border-[#1e2a47] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-200">{isBn ? 'রেকর্ড ডিলিট করা' : 'Delete Records'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-[#090d18] border border-[#1e2a47] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.canAccessSettings}
                      onChange={(e) => setFormData({
                        ...formData,
                        permissions: { ...formData.permissions!, canAccessSettings: e.target.checked }
                      })}
                      className="rounded border-[#1e2a47] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-200">{isBn ? 'সেটিংস কনফিগার' : 'Settings Access'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2a47] text-xs font-bold text-slate-300 hover:bg-[#131b2e]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20"
                >
                  {isBn ? 'ইউজার সংরক্ষণ করুন' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
