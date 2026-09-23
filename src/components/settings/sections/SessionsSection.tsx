import React, { useState } from 'react';
import {
  Laptop, Smartphone, Tablet, Globe, Clock, ShieldCheck, LogOut,
  MapPin, CheckCircle2, AlertTriangle, Monitor
} from 'lucide-react';
import { Language, UserSessionRecord } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface SessionsSectionProps {
  lang: Language;
  onLogoutCurrentSession?: () => void;
}

export const SessionsSection: React.FC<SessionsSectionProps> = ({ lang, onLogoutCurrentSession }) => {
  const isBn = lang === 'bn';
  const [sessions, setSessions] = useState<UserSessionRecord[]>(SettingsService.getSessions());
  const [actionSuccess, setActionSuccess] = useState('');

  const handleTerminateSession = (sessionId: string) => {
    SettingsService.terminateSession(sessionId);
    setSessions(SettingsService.getSessions());
    setActionSuccess(isBn ? 'সেশনটি সফলভাবে বন্ধ করা হয়েছে' : 'Session terminated successfully');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleTerminateOtherSessions = () => {
    if (confirm(isBn ? 'আপনি কি অন্যান্য সমস্ত ডিভাইস ও সেশন লগ আউট করতে চান?' : 'Sign out of all other active devices?')) {
      SettingsService.terminateOtherSessions();
      setSessions(SettingsService.getSessions());
      setActionSuccess(isBn ? 'অন্যান্য সমস্ত সেশন সফলভাবে লগ আউট করা হয়েছে' : 'All other sessions terminated');
      setTimeout(() => setActionSuccess(''), 3000);
    }
  };

  const getDeviceIcon = (device: string) => {
    const lower = device.toLowerCase();
    if (lower.includes('mobile') || lower.includes('galaxy') || lower.includes('phone')) {
      return <Smartphone className="w-5 h-5 text-purple-400" />;
    }
    if (lower.includes('tablet') || lower.includes('pos')) {
      return <Tablet className="w-5 h-5 text-teal-400" />;
    }
    return <Laptop className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'সক্রিয় ডিভাইস ও সেশন (Active Sessions)' : 'Active Devices & Sessions'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? 'বর্তমানে যেসকল কম্পিউটার বা মোবাইলে আপনার অ্যাকাউন্ট সক্রিয় রয়েছে' : 'View all devices currently authenticated to your business account'}
          </p>
        </div>

        {sessions.filter(s => !s.isCurrent).length > 0 && (
          <button
            type="button"
            onClick={handleTerminateOtherSessions}
            className="px-3.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isBn ? 'অন্যান্য সমস্ত সেশন বন্ধ করুন' : 'Sign out other sessions'}</span>
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Session Cards List */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111827] border border-[#1e293b] text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-medium">{isBn ? 'কোন সক্রিয় সেশন পাওয়া যায়নি।' : 'No active sessions found.'}</p>
          </div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                sess.isCurrent
                  ? 'bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#111827] border-indigo-500/40 shadow-lg'
                  : 'bg-[#111827] border-[#1e293b]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border ${sess.isCurrent ? 'bg-indigo-600/20 border-indigo-500/40' : 'bg-[#131b2e] border-[#1e2a47]'}`}>
                  {getDeviceIcon(sess.device)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="text-xs font-bold text-white">{sess.device}</h5>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {isBn ? 'বর্তমান সেশন (Current)' : 'Current Device'}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {sess.browser} • {sess.os}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {sess.ip}
                    </span>
                    {sess.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {sess.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sess.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {sess.isCurrent ? (
                  <button
                    type="button"
                    onClick={onLogoutCurrentSession}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3 h-3 text-slate-400" />
                    <span>{isBn ? 'এই ডিভাইস থেকে লগআউট' : 'Log out this session'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTerminateSession(sess.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>{isBn ? 'লগআউট করুন' : 'Revoke Session'}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
