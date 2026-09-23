import React, { useState, useEffect } from 'react';
import {
  Headphones, MessageSquare, Phone, Mail, MapPin, Send,
  CheckCircle2, Clock, AlertCircle, HelpCircle, ChevronDown,
  ChevronUp, Plus, X, ExternalLink, ShieldCheck, Printer, Barcode
} from 'lucide-react';
import { Language, BusinessSettings, SupportTicket } from '../../types';
import { StorageService } from '../../services/storage';

interface CustomerSupportViewProps {
  lang: Language;
  settings: BusinessSettings;
}

export const CustomerSupportView: React.FC<CustomerSupportViewProps> = ({ lang, settings }) => {
  const isBn = lang === 'bn';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('pos');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    setTickets(StorageService.getSupportTickets());
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      subject,
      category,
      priority,
      description,
      status: 'open',
      createdAt: new Date().toLocaleDateString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };

    StorageService.saveSupportTicket(newTicket);
    loadTickets();
    setIsTicketModalOpen(false);
    setSubject('');
    setDescription('');
  };

  const faqs = [
    {
      q: isBn ? 'থার্মাল প্রিন্টারে বাংলা ফন্ট ক্লিয়ার প্রিন্ট হচ্ছে না, কী করব?' : 'Bangla fonts are unclear on my thermal printer. How to fix?',
      a: isBn
        ? 'আপনার থার্মাল প্রিন্টারের ড্রাইভার সেটিংসে গিয়ে ESC/POS Raster Mode চালু করুন। অথবা অমরদোকান সেটিংস থেকে "বাংলা প্রিন্টিং অপ্টিমাইজেশন" অপশনটি সিলেক্ট করে একবার টেস্ট প্রিন্ট দিন।'
        : 'Enable ESC/POS Raster graphics mode in your thermal printer driver settings or enable Bangla Font Optimization in App Settings.'
    },
    {
      q: isBn ? 'বারকোড স্ক্যানার দিয়ে স্ক্যান করলে কোড উঠছে কিন্তু এন্টার হচ্ছে না?' : 'Barcode scanner scans code but does not press Enter automatically?',
      a: isBn
        ? 'বারকোড স্ক্যানারের ইউজার ম্যানুয়াল থেকে "Add CR/LF Suffix" বারকোডটি একবার স্ক্যান করে নিন। এতে স্ক্যান করার সাথে সাথে স্বয়ংক্রিয়ভাবে সার্চ বা কার্টে যোগ হয়ে যাবে।'
        : 'Scan the "Add CR/LF Suffix" barcode from your scanner user manual to automatically trigger Enter upon scanning.'
    },
    {
      q: isBn ? 'বকেয়া কাস্টমারদের কিভাবে এক ক্লিকে SMS তাগাদা পাঠাব?' : 'How to send bulk due reminder SMS to customers?',
      a: isBn
        ? 'সাইডবার থেকে "SMS Center" এ যান। সেখানে "বকেয়া তাগাদা" ট্যাবে ক্লিক করে নির্দিষ্ট গ্রাহক নির্বাচন করে "Send Reminder" বাটনে প্রেস করলেই কাস্টমারের ফোনে বকেয়ার এসএমএস চলে যাবে।'
        : 'Go to SMS Center from the sidebar, open the Due Reminders tab, select customers, and click Send Reminder.'
    },
    {
      q: isBn ? 'ইন্টারনেট সংযোগ না থাকলে কি সফটওয়্যার ব্যবহার করা যাবে?' : 'Can I use the app without an internet connection?',
      a: isBn
        ? 'হ্যাঁ! অমরদোকান ফুল অফলাইন-ফার্স্ট প্রযুক্তিতে কাজ করে। ইন্টারনেট না থাকলেও আপনি সেলস, ক্যাশ মেমো ও হিসাব করতে পারবেন। ইন্টারনেট এলে স্বয়ংক্রিয়ভাবে ডাটা ক্লাউডে সিঙ্ক হবে।'
        : 'Yes! AmarDokan has full offline support. You can make sales and generate invoices offline, and it syncs when reconnected.'
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e1424] via-[#131b2e] to-[#0e1424] p-5 rounded-2xl border border-[#1e2a47] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Headphones className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isBn ? 'কাস্টমার সাপোর্ট ও হেল্পডেস্ক' : 'Customer Support & Helpdesk'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                24/7 Available
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBn
                ? 'সরাসরি হোয়াটসঅ্যাপ বা ফোন কলে সহায়তা নিন, অথবা দ্রুত সমাধানের জন্য টিকিট জমা দিন'
                : 'Direct WhatsApp and phone assistance, hardware setup guides, and ticket tracking'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsTicketModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isBn ? 'নতুন সাপোর্ট টিকিট তৈরি' : 'Open Support Ticket'}
        </button>
      </div>

      {/* Direct Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0e1424] border border-[#1e2a47] hover:border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all shadow-sm group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'হোয়াটসঅ্যাপ সাপোর্ট' : 'WhatsApp Support'}</p>
            <h4 className="text-sm font-bold text-white mt-0.5">01700-000000</h4>
            <span className="text-[10px] text-emerald-400 font-semibold">{isBn ? 'ক্লিক করে চ্যাট করুন' : 'Chat Now'}</span>
          </div>
        </a>

        <a
          href="tel:01700000000"
          className="bg-[#0e1424] border border-[#1e2a47] hover:border-sky-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all shadow-sm group"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'হটলাইন কল সেন্টার' : 'Direct Helpline'}</p>
            <h4 className="text-sm font-bold text-white mt-0.5">09612-445566</h4>
            <span className="text-[10px] text-sky-400 font-semibold">{isBn ? 'সকাল ৯টা - রাত ১০টা' : '9 AM - 10 PM'}</span>
          </div>
        </a>

        <a
          href="mailto:support@amardokan.com"
          className="bg-[#0e1424] border border-[#1e2a47] hover:border-purple-500/40 p-4 rounded-2xl flex items-center gap-3.5 transition-all shadow-sm group"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'অফিসিয়াল ইমেইল' : 'Email Support'}</p>
            <h4 className="text-sm font-bold text-white mt-0.5">support@amardokan.com</h4>
            <span className="text-[10px] text-purple-400 font-semibold">{isBn ? '২৪ ঘণ্টার মধ্যে রিপ্লাই' : 'Fast Response'}</span>
          </div>
        </a>

        <div className="bg-[#0e1424] border border-[#1e2a47] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">{isBn ? 'প্রধান কার্যালয়' : 'Head Office'}</p>
            <h4 className="text-sm font-bold text-white mt-0.5">{isBn ? 'মিরপুর ১০, ঢাকা' : 'Mirpur 10, Dhaka'}</h4>
            <span className="text-[10px] text-amber-400 font-semibold">{isBn ? 'বাংলাদেশ' : 'Bangladesh'}</span>
          </div>
        </div>
      </div>

      {/* Support Tickets Section */}
      <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {isBn ? 'আপনার সক্রিয় সাপোর্ট টিকিটসমূহ' : 'Your Support Tickets'} ({tickets.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-[#1e2a47]">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="p-5 hover:bg-[#131b2e]/40 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {tkt.ticketNumber}
                  </span>
                  <h4 className="font-bold text-white text-sm">{tkt.subject}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{tkt.createdAt}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    tkt.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : tkt.status === 'in_progress'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {tkt.status === 'resolved'
                      ? (isBn ? 'সমাধান হয়েছে' : 'Resolved')
                      : tkt.status === 'in_progress'
                      ? (isBn ? 'পর্যবেক্ষণ চলমান' : 'In Progress')
                      : (isBn ? 'ওপেন' : 'Open')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-1">
                {tkt.description}
              </p>

              {tkt.response && (
                <div className="bg-[#090d18] border border-emerald-500/30 p-3 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isBn ? 'সাপোর্ট এক্সপার্টের সমাধান:' : 'Expert Resolution:'}
                  </p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {tkt.response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-white text-base">
            {isBn ? 'সাধারণ জিজ্ঞাসা ও তাৎক্ষণিক সমাধান (FAQ)' : 'Frequently Asked Questions & Quick Solutions'}
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-[#090d18] border border-[#1e2a47] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-white hover:text-sky-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-[#1e2a47]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-2.5">
                <Headphones className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {isBn ? 'নতুন সাপোর্ট টিকিট সাবমিট করুন' : 'Submit Support Ticket'}
                </h3>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'সমস্যার বিষয় (Subject)' : 'Subject'} *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isBn ? 'যেমন: থার্মাল প্রিন্টারে পেপার কাটিং সমস্যা' : 'e.g. Thermal printer paper cut issue'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="pos">POS / Sales</option>
                    <option value="printer">Thermal Printer</option>
                    <option value="scanner">Barcode Scanner</option>
                    <option value="sms">SMS Gateway</option>
                    <option value="billing">Billing & License</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'জরুরিতা (Priority)' : 'Priority'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="low">{isBn ? 'সাধারণ (Low)' : 'Low'}</option>
                    <option value="medium">{isBn ? 'মাঝারি (Medium)' : 'Medium'}</option>
                    <option value="high">{isBn ? 'জরুরি (High)' : 'High'}</option>
                    <option value="urgent">{isBn ? 'অতি জরুরি (Urgent)' : 'Urgent'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'সমস্যার বিস্তারিত বিবরণ' : 'Description'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isBn ? 'কী সমস্যা হচ্ছে বিস্তারিত লিখুন যেন আমাদের টেক টিম দ্রুত সমাধান করতে পারে...' : 'Provide details of the problem...'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2a47] text-xs font-bold text-slate-300 hover:bg-[#131b2e]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isBn ? 'টিকিট পাঠান' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
