import React, { useState } from 'react';
import {
  ShieldCheck, CheckCircle2, RefreshCw, Save, Check, UserCheck
} from 'lucide-react';
import { AdminRole, Language, RolePermissionMatrix, SystemModule } from '../../../types';
import { SettingsService, defaultRolePermissions } from '../../../services/settingsService';

interface RolesPermissionsSectionProps {
  lang: Language;
}

export const RolesPermissionsSection: React.FC<RolesPermissionsSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [matrix, setMatrix] = useState<RolePermissionMatrix>(SettingsService.getRolePermissions());
  const [selectedRole, setSelectedRole] = useState<AdminRole>('Admin');
  const [notification, setNotification] = useState('');

  const roles: Array<{ id: AdminRole; labelBn: string; labelEn: string; desc: string }> = [
    { id: 'Owner', labelBn: 'মালিক (Owner)', labelEn: 'Owner (Full Access)', desc: 'সর্বময় ক্ষমতা ও আনলিমিটেড নিয়ন্ত্রণ' },
    { id: 'Admin', labelBn: 'প্রশাসক (Admin)', labelEn: 'Admin (System)', desc: 'সিস্টেম অ্যাডমিনিস্ট্রেশন ও কনফিগারেশন' },
    { id: 'Manager', labelBn: 'ম্যানেজার (Manager)', labelEn: 'Branch Manager', desc: 'দৈনন্দিন বিক্রয়, ক্রয় ও স্টক ব্যবস্থাপনা' },
    { id: 'Cashier', labelBn: 'ক্যাশিয়ার (Cashier)', labelEn: 'POS Cashier', desc: 'কাউন্টার বিক্রয় ও নগদ কালেকশন' },
    { id: 'Accountant', labelBn: 'হিসাবরক্ষক (Accountant)', labelEn: 'Accountant', desc: 'আর্থিক হিসাব, খরচ, আয় ও প্রতিবেদন' },
    { id: 'Salesman', labelBn: 'বিক্রয়কর্মী (Salesman)', labelEn: 'Sales Executive', desc: 'পণ্য প্রদর্শন ও প্রাথমিক অর্ডার তৈরি' }
  ];

  const modulesList: Array<{ id: SystemModule; nameBn: string; nameEn: string }> = [
    { id: 'dashboard', nameBn: 'ড্যাশবোর্ড', nameEn: 'Dashboard Overview' },
    { id: 'pos', nameBn: 'পিওএস বিক্রয় (POS)', nameEn: 'POS Terminal' },
    { id: 'quickSale', nameBn: 'দ্রুত বিক্রয়', nameEn: 'Quick Sale' },
    { id: 'products', nameBn: 'পণ্য ক্যাটালগ', nameEn: 'Products Catalog' },
    { id: 'categories', nameBn: 'ক্যাটাগরি ও ব্র্যান্ড', nameEn: 'Categories & Brands' },
    { id: 'inventory', nameBn: 'মজুদ স্টক ও গোডাউন', nameEn: 'Inventory & Stock' },
    { id: 'sales', nameBn: 'বিক্রয় হিসাব ও ইনভয়েস', nameEn: 'Sales & Invoices' },
    { id: 'saleReturns', nameBn: 'বিক্রয় ফেরত', nameEn: 'Sale Returns' },
    { id: 'purchases', nameBn: 'ক্রয় চালান ও রসিদ', nameEn: 'Purchases' },
    { id: 'purchaseReturns', nameBn: 'ক্রয় ফেরত', nameEn: 'Purchase Returns' },
    { id: 'customers', nameBn: 'গ্রাহক ও বকেয়া খাতা', nameEn: 'Customers & Debts' },
    { id: 'suppliers', nameBn: 'সরবরাহকারী লেজার', nameEn: 'Suppliers' },
    { id: 'payments', nameBn: 'পেমেন্ট ও কালেকশন', nameEn: 'Payments' },
    { id: 'expenses', nameBn: 'দোকানের খরচপাতি', nameEn: 'Expenses' },
    { id: 'income', nameBn: 'অন্যান্য আয়', nameEn: 'Income' },
    { id: 'reports', nameBn: 'ব্যবসায়িক রিপোর্ট ও লাভ-ক্ষতি', nameEn: 'Financial Reports' },
    { id: 'employees', nameBn: 'কর্মচারী ও বেতন', nameEn: 'Employees & Payroll' },
    { id: 'attendance', nameBn: 'হাজিরা খাতা', nameEn: 'Attendance' },
    { id: 'warranty', nameBn: 'ওয়ারেন্টি ব্যবস্থাপনা', nameEn: 'Warranty Claims' },
    { id: 'settings', nameBn: 'সিস্টেম সেটিংস', nameEn: 'System Settings' },
    { id: 'users', nameBn: 'ইউজার ম্যানেজমেন্ট', nameEn: 'User Management' },
    { id: 'backup', nameBn: 'ডাটা ব্যাকআপ ও রিস্টোর', nameEn: 'Data Backup' },
    { id: 'auditLog', nameBn: 'অডিট ও অ্যাক্টিভিটি লগ', nameEn: 'Audit Trails' }
  ];

  const handleTogglePermission = (
    module: SystemModule,
    action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'print'
  ) => {
    if (selectedRole === 'Owner') {
      alert(isBn ? 'মালিকের (Owner) সকল পারমিশন বাধ্যতামূলকভাবে সক্রিয় থাকে।' : 'Owner maintains irrevocable full access.');
      return;
    }

    const updated = { ...matrix };
    const rolePerms = { ...updated[selectedRole] };
    const modPerms = { ...rolePerms[module] };

    modPerms[action] = !modPerms[action];
    rolePerms[module] = modPerms;
    updated[selectedRole] = rolePerms;

    setMatrix(updated);
    SettingsService.saveRolePermissions(updated);
    setNotification(isBn ? 'পারমিশন হালনাগাদ হয়েছে!' : 'Permission updated!');
    setTimeout(() => setNotification(''), 2000);
  };

  const handleResetDefaults = () => {
    if (confirm(isBn ? 'আপনি কি ডিফল্ট রোল পারমিশন মেট্রিক্স ফিরিয়ে আনতে চান?' : 'Restore default role permission matrix?')) {
      setMatrix(defaultRolePermissions);
      SettingsService.saveRolePermissions(defaultRolePermissions);
      setNotification(isBn ? 'ডিফল্ট পারমিশন মেট্রিক্স সফলভাবে প্রতিস্থাপিত হয়েছে' : 'Default matrix restored');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'রোল ও পারমিশন কন্ট্রোল মেট্রিক্স (RBAC)' : 'Roles & Permission Matrix'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'মালিক, অ্যাডমিন, ম্যানেজার ও ক্যাশিয়ারের জন্য মডিউলভিত্তিক অনুমতি নির্ধারণ করুন'
              : 'Configure granular View, Create, Edit, Delete, Export, and Print rights per system module'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isBn ? 'ডিফল্ট মেট্রিক্স রিসেট' : 'Reset Defaults'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Role Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {roles.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRole(r.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedRole === r.id
                ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-400'
                : 'bg-[#111827] border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            <span className="text-xs block font-bold truncate">{isBn ? r.labelBn : r.labelEn}</span>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">{r.desc}</span>
          </button>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>
              {isBn ? `ভূমিকা: ${selectedRole} এর অনুমোদিত ক্ষমতা` : `Permissions Matrix for: ${selectedRole}`}
            </span>
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            {selectedRole === 'Owner'
              ? (isBn ? 'মালিকের সকল পারমিশন সক্রিয়' : 'Owner has immutable full access')
              : (isBn ? 'চেক করে অনুমোদন বা নিষ্ক্রিয় করুন' : 'Click checkmark to toggle')}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1e2a47]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101d] text-slate-400 border-b border-[#1e2a47]">
              <tr>
                <th className="p-3 font-semibold">{isBn ? 'সিস্টেম মডিউল' : 'System Module'}</th>
                <th className="p-3 text-center font-semibold">{isBn ? 'দেখা (View)' : 'View'}</th>
                <th className="p-3 text-center font-semibold">{isBn ? 'যোগ (Create)' : 'Create'}</th>
                <th className="p-3 text-center font-semibold">{isBn ? 'সম্পাদনা (Edit)' : 'Edit'}</th>
                <th className="p-3 text-center font-semibold">{isBn ? 'মুছে ফেলা (Delete)' : 'Delete'}</th>
                <th className="p-3 text-center font-semibold">{isBn ? 'এক্সপোর্ট (Export)' : 'Export'}</th>
                <th className="p-3 text-center font-semibold">{isBn ? 'প্রিন্ট (Print)' : 'Print'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]/60 text-slate-300">
              {modulesList.map(mod => {
                const perms = matrix[selectedRole]?.[mod.id] || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                  export: false,
                  print: false
                };

                return (
                  <tr key={mod.id} className="hover:bg-[#131b2e]/60 transition-colors">
                    <td className="p-3 font-medium text-white">
                      <span>{isBn ? mod.nameBn : mod.nameEn}</span>
                    </td>

                    {(['view', 'create', 'edit', 'delete', 'export', 'print'] as const).map(action => (
                      <td key={action} className="p-3 text-center">
                        <button
                          type="button"
                          disabled={selectedRole === 'Owner'}
                          onClick={() => handleTogglePermission(mod.id, action)}
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-all ${
                            perms[action]
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#0b101d] text-slate-600 border border-slate-800 hover:border-slate-600'
                          } ${selectedRole === 'Owner' ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                        >
                          {perms[action] ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[10px]">✕</span>}
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
