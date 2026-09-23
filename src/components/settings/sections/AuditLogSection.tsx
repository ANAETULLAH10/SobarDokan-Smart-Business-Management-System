import React, { useState } from 'react';
import {
  FileText, Search, Download, Trash2, Filter, Clock, ShieldCheck,
  CheckCircle2, AlertTriangle, XCircle, Globe
} from 'lucide-react';
import { AuditRecord, Language } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface AuditLogSectionProps {
  lang: Language;
}

export const AuditLogSection: React.FC<AuditLogSectionProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [logs, setLogs] = useState<AuditRecord[]>(SettingsService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const modules = Array.from(new Set(logs.map(l => l.module)));

  // Filter logs
  const filteredLogs = logs.filter(l => {
    if (selectedModule !== 'all' && l.module !== selectedModule) return false;
    if (selectedStatus !== 'all' && l.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Module', 'Action', 'Description', 'Status', 'IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.user}"`,
      `"${l.userRole || ''}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      l.status,
      l.ip || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AmarDokan_AuditLog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearLogs = () => {
    if (confirm(isBn ? 'আপনি কি সমস্ত অডিট লগ মুছে ফেলতে চান?' : 'Clear all system audit logs?')) {
      SettingsService.clearAuditLogs();
      setLogs([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'সিস্টেম অডিট ও অ্যাক্টিভিটি ট্রেইল' : 'System Audit Trails & Activity Logs'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'ব্যবহারকারীদের লগইন, পণ্য যুক্ত, বিক্রয় সম্পন্ন ও সেটিংস পরিবর্তনের টাইমস্ট্যাম্প ট্র্যাকিং'
              : 'Complete security audit trails tracking logins, inventory edits, sales, and settings modifications'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
          </button>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="px-3.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'লগ মুছুন' : 'Clear Logs'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'ইউজার, অ্যাকশন বা বিবরণ দিয়ে খুঁজুন...' : 'Search by user, action, or keyword...'}
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Module Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value)}
            className="bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">{isBn ? 'সকল মডিউল' : 'All Modules'}</option>
            {modules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="success">{isBn ? 'সফল (Success)' : 'Success'}</option>
            <option value="warning">{isBn ? 'সতর্কতা (Warning)' : 'Warning'}</option>
            <option value="failed">{isBn ? 'ব্যর্থ (Failed)' : 'Failed'}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-3">
        <div className="overflow-x-auto rounded-xl border border-[#1e2a47]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101d] text-slate-400 border-b border-[#1e2a47]">
              <tr>
                <th className="p-3 font-semibold">{isBn ? 'সময়' : 'Timestamp'}</th>
                <th className="p-3 font-semibold">{isBn ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="p-3 font-semibold">{isBn ? 'মডিউল' : 'Module'}</th>
                <th className="p-3 font-semibold">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                <th className="p-3 font-semibold">{isBn ? 'বিবরণ' : 'Description'}</th>
                <th className="p-3 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a47]/60 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    {isBn ? 'কোন লগ রেকর্ড পাওয়া যায়নি' : 'No audit records match the selected filter criteria'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#131b2e]/60 transition-colors">
                    <td className="p-3 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                      <span className="text-[10px] text-slate-500 block">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{log.user}</div>
                      {log.userRole && (
                        <span className="text-[10px] text-indigo-400 font-mono">{log.userRole}</span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-[#0b101d] border border-[#1e2a47] text-[11px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate" title={log.description}>
                      {log.description}
                      {log.ip && (
                        <span className="text-[10px] text-slate-500 font-mono block">IP: {log.ip}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        log.status === 'success'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : log.status === 'warning'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}>
                        {log.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {log.status === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                        {log.status === 'failed' && <XCircle className="w-3 h-3 text-rose-400" />}
                        <span className="capitalize">{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
