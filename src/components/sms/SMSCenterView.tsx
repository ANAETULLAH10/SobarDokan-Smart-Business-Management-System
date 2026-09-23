import React, { useState, useMemo } from 'react';
import {
  MessageSquare, Send, Users, FileText, Settings, History,
  CheckCircle2, AlertCircle, Phone, Search, Plus, Trash2,
  Copy, RefreshCw, Smartphone, ExternalLink, Zap, ShieldCheck,
  Check, Filter, ArrowRight, Download, CreditCard, Sparkles
} from 'lucide-react';
import { Customer, BusinessSettings, Language, SMSMessage, SMSTemplate, SMSSettings } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';

interface SMSCenterViewProps {
  lang: Language;
  settings: BusinessSettings;
  customers: Customer[];
  initialCustomerId?: string;
  onNavigateTab?: (tab: any) => void;
}

// Live Char & Segment Calculation (GSM 7-bit vs Unicode Bangla)
function getSMSMetrics(text: string) {
  const charCount = text.length;
  if (charCount === 0) return { charCount: 0, smsParts: 0, isBangla: false, remaining: 70 };
  const isBangla = /[^\u0000-\u007F]/.test(text);
  const limitPerSMS = isBangla ? 70 : 160;
  const multiLimit = isBangla ? 67 : 153;
  let smsParts = 1;
  let remaining = limitPerSMS - charCount;

  if (charCount > limitPerSMS) {
    smsParts = Math.ceil(charCount / multiLimit);
    remaining = (smsParts * multiLimit) - charCount;
  }

  return { charCount, smsParts, isBangla, remaining };
}

export const SMSCenterView: React.FC<SMSCenterViewProps> = ({
  lang,
  settings,
  customers,
  initialCustomerId,
  onNavigateTab
}) => {
  const t = translations[lang];

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'bulk' | 'templates' | 'history' | 'gateway'>('single');

  // Stored state
  const [messages, setMessages] = useState<SMSMessage[]>(() => StorageService.getSMSMessages());
  const [templates, setTemplates] = useState<SMSTemplate[]>(() => StorageService.getSMSTemplates());
  const [smsSettings, setSmsSettings] = useState<SMSSettings>(() => StorageService.getSMSSettings());

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Single SMS State ---
  const initialCustomer = customers.find(c => c.id === initialCustomerId);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomer ? initialCustomer.id : '');
  const [customPhone, setCustomPhone] = useState<string>(initialCustomer ? initialCustomer.phone : '');
  const [customName, setCustomName] = useState<string>(initialCustomer ? initialCustomer.name : '');
  const [singleMessage, setSingleMessage] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<SMSMessage['category']>('due_reminder');
  const [isSendingSingle, setIsSendingSingle] = useState<boolean>(false);

  // When customer selection changes in Single SMS
  const handleCustomerSelect = (custId: string) => {
    setSelectedCustomerId(custId);
    if (!custId) {
      setCustomName('');
      setCustomPhone('');
      return;
    }
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setCustomName(cust.name);
      setCustomPhone(cust.phone);
    }
  };

  // Helper to replace dynamic tags in template
  const replaceTags = (text: string, cust?: { name: string; phone: string; dueAmount?: number }, invoiceNo?: string) => {
    const custName = cust?.name || customName || (lang === 'bn' ? 'সম্মানিত ক্রেতা' : 'Valued Customer');
    const custPhone = cust?.phone || customPhone || '';
    const due = cust?.dueAmount !== undefined ? cust.dueAmount : 0;
    const dueStr = settings.currencySymbol + due.toLocaleString();
    
    return text
      .replace(/\{customer_name\}/g, custName)
      .replace(/\{due_amount\}/g, dueStr)
      .replace(/\{business_name\}/g, settings.businessName || 'AmarDokan')
      .replace(/\{phone\}/g, settings.phone || '')
      .replace(/\{invoice_no\}/g, invoiceNo || 'INV-' + Math.floor(1000 + Math.random() * 9000))
      .replace(/\{paid_amount\}/g, settings.currencySymbol + '0');
  };

  const currentMetrics = getSMSMetrics(singleMessage);

  // Send Single SMS
  const handleSendSingleSMS = () => {
    if (!customPhone.trim()) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে গ্রাহকের ফোন নম্বর দিন।' : 'Please enter customer phone number.');
      return;
    }
    if (!singleMessage.trim()) {
      showToast(lang === 'bn' ? 'এসএমএস বার্তা খালি রাখা যাবে না।' : 'Message body cannot be empty.');
      return;
    }
    if (smsSettings.balance < currentMetrics.smsParts) {
      showToast(lang === 'bn' ? 'পর্যাপ্ত এসএমএস ক্রেডিট নেই! রিচার্জ করুন।' : 'Insufficient SMS balance. Please recharge.');
      return;
    }

    setIsSendingSingle(true);
    setTimeout(() => {
      const newMsg: SMSMessage = {
        id: 'sms-' + Date.now(),
        recipientName: customName || 'Customer',
        recipientPhone: customPhone,
        customerId: selectedCustomerId || undefined,
        message: singleMessage,
        category: selectedCategory,
        status: 'delivered',
        sentAt: new Date().toISOString(),
        characterCount: currentMetrics.charCount,
        smsParts: currentMetrics.smsParts,
        provider: smsSettings.senderId || 'AmarDokan Gateway'
      };

      StorageService.saveSMSMessage(newMsg);
      StorageService.deductSMSCredits(currentMetrics.smsParts);

      setMessages(StorageService.getSMSMessages());
      setSmsSettings(StorageService.getSMSSettings());
      setIsSendingSingle(false);
      setSingleMessage('');
      showToast(lang === 'bn' ? 'এসএমএস সফলভাবে পাঠানো হয়েছে!' : 'SMS sent successfully!');
    }, 600);
  };

  // --- Bulk Campaign State ---
  const [bulkAudience, setBulkAudience] = useState<'debtors' | 'all' | 'custom'>('debtors');
  const [bulkSearch, setBulkSearch] = useState<string>('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(() => {
    // Default to debtors
    return customers.filter(c => c.dueAmount > 0).map(c => c.id);
  });
  const [bulkTemplateId, setBulkTemplateId] = useState<string>('tpl-1');
  const [bulkCustomMessage, setBulkCustomMessage] = useState<string>(() => {
    const tpl = templates.find(t => t.id === 'tpl-1') || templates[0];
    return tpl ? tpl.content : '';
  });
  const [isSendingBulk, setIsSendingBulk] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<number>(0);

  // Switch audience helper
  const handleAudienceChange = (aud: 'debtors' | 'all' | 'custom') => {
    setBulkAudience(aud);
    if (aud === 'debtors') {
      setSelectedCustomerIds(customers.filter(c => c.dueAmount > 0).map(c => c.id));
      const dueTpl = templates.find(t => t.category === 'due_reminder');
      if (dueTpl) {
        setBulkTemplateId(dueTpl.id);
        setBulkCustomMessage(dueTpl.content);
      }
    } else if (aud === 'all') {
      setSelectedCustomerIds(customers.map(c => c.id));
    }
  };

  const filteredBulkCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(bulkSearch.toLowerCase()) || c.phone.includes(bulkSearch);
      if (bulkAudience === 'debtors') return matchSearch && c.dueAmount > 0;
      return matchSearch;
    });
  }, [customers, bulkSearch, bulkAudience]);

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredBulkCustomers.map(c => c.id);
    const allSelected = ids.every(id => selectedCustomerIds.includes(id));
    if (allSelected) {
      setSelectedCustomerIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedCustomerIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const bulkMetrics = getSMSMetrics(bulkCustomMessage);
  const totalBulkCreditsNeeded = selectedCustomerIds.length * bulkMetrics.smsParts;

  const handleSendBulkCampaign = () => {
    if (selectedCustomerIds.length === 0) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে অন্তত একজন প্রাপক নির্বাচন করুন।' : 'Please select at least one recipient.');
      return;
    }
    if (!bulkCustomMessage.trim()) {
      showToast(lang === 'bn' ? 'মেসেজের বিবরণ লিখুন।' : 'Please enter message content.');
      return;
    }
    if (smsSettings.balance < totalBulkCreditsNeeded) {
      showToast(lang === 'bn' ? `পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজন ${totalBulkCreditsNeeded} ক্রেডিট।` : `Insufficient balance! Needed ${totalBulkCreditsNeeded} credits.`);
      return;
    }

    setIsSendingBulk(true);
    setBulkProgress(15);

    setTimeout(() => {
      setBulkProgress(60);
      const selectedCusts = customers.filter(c => selectedCustomerIds.includes(c.id));
      const now = new Date().toISOString();

      selectedCusts.forEach(c => {
        const personalizedMsg = replaceTags(bulkCustomMessage, { name: c.name, phone: c.phone, dueAmount: c.dueAmount });
        const metric = getSMSMetrics(personalizedMsg);
        const newMsg: SMSMessage = {
          id: 'sms-bulk-' + Math.random().toString(36).substring(2, 9),
          recipientName: c.name,
          recipientPhone: c.phone,
          customerId: c.id,
          message: personalizedMsg,
          category: bulkAudience === 'debtors' ? 'due_reminder' : 'promo',
          status: 'delivered',
          sentAt: now,
          characterCount: metric.charCount,
          smsParts: metric.smsParts,
          provider: smsSettings.senderId || 'AmarDokan Bulk Gateway'
        };
        StorageService.saveSMSMessage(newMsg);
      });

      StorageService.deductSMSCredits(totalBulkCreditsNeeded);
      setBulkProgress(100);

      setTimeout(() => {
        setIsSendingBulk(false);
        setBulkProgress(0);
        setMessages(StorageService.getSMSMessages());
        setSmsSettings(StorageService.getSMSSettings());
        showToast(lang === 'bn' ? `${selectedCustomerIds.length} জন গ্রাহককে বাল্ক এসএমএস সফলভাবে পাঠানো হয়েছে!` : `Bulk SMS successfully sent to ${selectedCustomerIds.length} recipients!`);
      }, 400);
    }, 800);
  };

  // --- Templates Management ---
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState<boolean>(false);
  const [templateFormTitle, setTemplateFormTitle] = useState<string>('');
  const [templateFormCategory, setTemplateFormCategory] = useState<SMSTemplate['category']>('due_reminder');
  const [templateFormContent, setTemplateFormContent] = useState<string>('');

  const handleSaveNewTemplate = () => {
    if (!templateFormTitle.trim() || !templateFormContent.trim()) {
      showToast(lang === 'bn' ? 'শিরোনাম ও মেসেজ উভয়ই পূরণ করুন।' : 'Please provide title and content.');
      return;
    }
    const newTpl: SMSTemplate = {
      id: 'tpl-' + Date.now(),
      title: templateFormTitle,
      category: templateFormCategory,
      content: templateFormContent
    };
    StorageService.saveSMSTemplate(newTpl);
    setTemplates(StorageService.getSMSTemplates());
    setIsAddTemplateModalOpen(false);
    setTemplateFormTitle('');
    setTemplateFormContent('');
    showToast(lang === 'bn' ? 'নতুন টেমপ্লেট সংরক্ষিত হয়েছে!' : 'Template saved successfully!');
  };

  const handleDeleteTemplate = (id: string) => {
    StorageService.deleteSMSTemplate(id);
    setTemplates(StorageService.getSMSTemplates());
    showToast(lang === 'bn' ? 'টেমপ্লেট মুছে ফেলা হয়েছে।' : 'Template deleted.');
  };

  // Use template in single SMS
  const handleUseTemplate = (tpl: SMSTemplate) => {
    setSelectedCategory(tpl.category);
    const resolved = replaceTags(tpl.content, customName ? { name: customName, phone: customPhone } : undefined);
    setSingleMessage(resolved);
    setActiveSubTab('single');
    showToast(lang === 'bn' ? 'টেমপ্লেট লোড করা হয়েছে।' : 'Template loaded into message editor.');
  };

  // --- History & Logs State ---
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');
  const [selectedMessageModal, setSelectedMessageModal] = useState<SMSMessage | null>(null);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchSearch =
        m.recipientName.toLowerCase().includes(historySearch.toLowerCase()) ||
        m.recipientPhone.includes(historySearch) ||
        m.message.toLowerCase().includes(historySearch.toLowerCase());
      const matchCategory = historyCategoryFilter === 'all' || m.category === historyCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [messages, historySearch, historyCategoryFilter]);

  const handleResendMessage = (m: SMSMessage) => {
    if (smsSettings.balance < m.smsParts) {
      showToast(lang === 'bn' ? 'পর্যাপ্ত ক্রেডিট নেই!' : 'Insufficient balance!');
      return;
    }
    const resent: SMSMessage = {
      ...m,
      id: 'sms-' + Date.now(),
      sentAt: new Date().toISOString(),
      status: 'delivered'
    };
    StorageService.saveSMSMessage(resent);
    StorageService.deductSMSCredits(m.smsParts);
    setMessages(StorageService.getSMSMessages());
    setSmsSettings(StorageService.getSMSSettings());
    showToast(lang === 'bn' ? 'এসএমএস পুনরায় পাঠানো হয়েছে!' : 'SMS resent successfully!');
  };

  const handleDeleteMessage = (id: string) => {
    StorageService.deleteSMSMessage(id);
    setMessages(StorageService.getSMSMessages());
    showToast(lang === 'bn' ? 'লগ মুছে ফেলা হয়েছে।' : 'Log deleted.');
  };

  const handleClearHistory = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত সব এসএমএস হিস্ট্রি মুছে ফেলতে চান?' : 'Clear all SMS history?')) {
      StorageService.clearSMSHistory();
      setMessages([]);
      showToast(lang === 'bn' ? 'এসএমএস হিস্ট্রি পরিষ্কার করা হয়েছে।' : 'History cleared.');
    }
  };

  const exportHistoryCSV = () => {
    const headers = ['Recipient Name', 'Phone', 'Message', 'Category', 'Status', 'Date', 'SMS Parts'];
    const rows = filteredMessages.map(m => [
      `"${m.recipientName}"`,
      `"${m.recipientPhone}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      m.category,
      m.status,
      m.sentAt,
      m.smsParts
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SMS_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Gateway Settings State ---
  const [gatewayForm, setGatewayForm] = useState<SMSSettings>(smsSettings);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [rechargePack, setRechargePack] = useState<number>(500);

  const handleSaveGatewaySettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSMSSettings(gatewayForm);
    setSmsSettings(gatewayForm);
    showToast(lang === 'bn' ? 'গেটওয়ে সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Gateway settings saved!');
  };

  const handleAddCredits = (amount: number) => {
    const updated = StorageService.addSMSCredits(amount);
    setSmsSettings(StorageService.getSMSSettings());
    setIsRechargeModalOpen(false);
    showToast(lang === 'bn' ? `${amount} SMS ক্রেডিট যোগ করা হয়েছে! বর্তমান ব্যালেন্স: ${updated}` : `${amount} SMS credits added! New balance: ${updated}`);
  };

  // Quick Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySentCount = messages.filter(m => m.sentAt.startsWith(todayStr)).length;
  const totalDeliveredCount = messages.filter(m => m.status === 'delivered').length;
  const debtorsCount = customers.filter(c => c.dueAmount > 0).length;

  return (
    <div id="sms-center-view" className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl shadow-emerald-950/50 border border-emerald-400/30 text-sm font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121c38] via-[#101932] to-[#151f3b] border border-[#1e2a47] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {lang === 'bn' ? 'SMS কেন্দ্র (SMS Center)' : 'SMS Center & Marketing Hub'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {smsSettings.provider === 'mock_simulator' ? 'Simulator Active' : smsSettings.provider.toUpperCase()}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {lang === 'bn'
                  ? 'বকেয়া তাগাদা, বিক্রয় নিশ্চিতকরণ, ঈদ ও উৎসব অফার এবং বাল্ক ক্যাম্পেইন পরিচালনা করুন'
                  : 'Manage due payment reminders, cash memo alerts, holiday greetings & bulk campaigns'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Balance Pill */}
            <div className="px-4 py-2.5 rounded-xl bg-[#0a0f1d]/80 border border-[#1e2a47] flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'bn' ? 'SMS ব্যালেন্স' : 'SMS Balance'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">
                    {smsSettings.balance.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-400">{lang === 'bn' ? 'টি' : 'credits'}</span>
                </div>
              </div>
              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="ml-2 px-2.5 py-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
              >
                + {lang === 'bn' ? 'রিচার্জ' : 'Top-up'}
              </button>
            </div>

            {/* Today's Sent */}
            <div className="px-4 py-2.5 rounded-xl bg-[#0a0f1d]/80 border border-[#1e2a47] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'bn' ? 'আজকের প্রেরিত' : 'Sent Today'}
                </p>
                <span className="text-lg font-black text-white">{todaySentCount}</span>
              </div>
            </div>

            {/* Debtors count shortcut */}
            <div
              onClick={() => {
                handleAudienceChange('debtors');
                setActiveSubTab('bulk');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0a0f1d]/80 border border-amber-500/30 hover:border-amber-400/60 cursor-pointer transition-all flex items-center gap-3 group"
              title="Click to start Due Reminder campaign"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-400/90">
                  {lang === 'bn' ? 'বকেয়া গ্রাহক' : 'Due Customers'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-white">{debtorsCount}</span>
                  <span className="text-[10px] text-amber-300 font-semibold underline">{lang === 'bn' ? 'তাগাদা দিন' : 'Remind'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#1e2a47] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeSubTab === 'single'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'bg-[#0a0f1d]/60 text-slate-400 hover:text-white hover:bg-[#141d33] border border-transparent'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'একক মেসেজ পাঠান' : 'Single SMS'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeSubTab === 'bulk'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'bg-[#0a0f1d]/60 text-slate-400 hover:text-white hover:bg-[#141d33] border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'bn' ? 'বাল্ক ক্যাম্পেইন ও তাগাদা' : 'Bulk & Due Reminder'}</span>
            {debtorsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-500 text-slate-950 rounded-full">
                {debtorsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeSubTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'bg-[#0a0f1d]/60 text-slate-400 hover:text-white hover:bg-[#141d33] border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'bn' ? 'টেমপ্লেট সংগ্রহ' : 'Templates'}</span>
            <span className="text-[10px] font-semibold text-slate-400">({templates.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeSubTab === 'history'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'bg-[#0a0f1d]/60 text-slate-400 hover:text-white hover:bg-[#141d33] border border-transparent'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রেরিত মেসেজ হিস্ট্রি' : 'Delivery Logs'}</span>
            <span className="text-[10px] font-semibold text-slate-400">({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gateway')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeSubTab === 'gateway'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'bg-[#0a0f1d]/60 text-slate-400 hover:text-white hover:bg-[#141d33] border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'bn' ? 'গেটওয়ে ও কনফিগারেশন' : 'Gateway Settings'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SINGLE SMS (একক মেসেজ) */}
      {/* ========================================================================= */}
      {activeSubTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Form: Composer */}
          <div className="lg:col-span-7 bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2a47]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-400" />
                  {lang === 'bn' ? 'একক মেসেজ কম্পোজার' : 'Compose Single SMS'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'নির্দিষ্ট গ্রাহককে তাত্ক্ষণিক এসএমএস বার্তা পাঠান' : 'Send direct SMS to customer or custom number'}
                </p>
              </div>

              {/* Masking badge */}
              <div className="px-3 py-1 bg-[#141d33] border border-[#1e2a47] rounded-lg text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-bold">
                  {lang === 'bn' ? 'প্রেরক আইডি' : 'Sender ID'}
                </span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {smsSettings.maskingName || smsSettings.senderId || 'AmarDokan'}
                </span>
              </div>
            </div>

            {/* Recipient Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'কাস্টমার নির্বাচন করুন' : 'Select Customer (Optional)'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="">-- {lang === 'bn' ? 'সরাসরি নম্বর লিখুন / নতুন' : 'Custom Phone Number'} --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) {c.dueAmount > 0 ? `[বকেয়া: ৳${c.dueAmount.toLocaleString()}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'প্রাপকের মোবাইল নম্বর' : 'Recipient Phone Number'} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    placeholder="017XXXXXXXX বা 8801XXXXXXXXX"
                    className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Customer Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}
                  className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'বার্তার ধরন (Category)' : 'Message Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="due_reminder">{lang === 'bn' ? 'বকেয়া তাগাদা (Due Reminder)' : 'Due Reminder'}</option>
                  <option value="transaction">{lang === 'bn' ? 'লেনদেন / মেমো (Transactional)' : 'Transactional'}</option>
                  <option value="promo">{lang === 'bn' ? 'প্রচার ও অফার (Promotional)' : 'Promotional'}</option>
                  <option value="greeting">{lang === 'bn' ? 'শুভেচ্ছা বার্তা (Greeting)' : 'Festival / Greeting'}</option>
                  <option value="custom">{lang === 'bn' ? 'সাধারণ বার্তা (General)' : 'General'}</option>
                </select>
              </div>
            </div>

            {/* Quick Template Inserter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {lang === 'bn' ? 'তৈরি টেমপ্লেট থেকে দ্রুত লোড করুন' : 'Load from Pre-built Template'}
                </label>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('templates')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  + {lang === 'bn' ? 'নতুন টেমপ্লেট তৈরি' : 'Create Template'}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {templates.slice(0, 4).map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      const cust = customers.find(c => c.id === selectedCustomerId);
                      const resolved = replaceTags(tpl.content, cust ? { name: cust.name, phone: cust.phone, dueAmount: cust.dueAmount } : undefined);
                      setSingleMessage(resolved);
                      setSelectedCategory(tpl.category);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141d33] hover:bg-[#1a2542] border border-[#1e2a47] hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition-all text-left truncate max-w-[200px]"
                    title={tpl.title}
                  >
                    {tpl.title.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'bn' ? 'এসএমএস বার্তা' : 'Message Content'} *
                </label>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>{currentMetrics.isBangla ? 'বাংলা/ইউনিকোড' : 'ইংরেজি/GSM'}</span>
                  <span>•</span>
                  <span className="font-bold text-indigo-400">{currentMetrics.charCount} {lang === 'bn' ? 'অক্ষর' : 'chars'}</span>
                  <span>•</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${currentMetrics.smsParts > 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {currentMetrics.smsParts} {lang === 'bn' ? 'টি SMS' : 'SMS'}
                  </span>
                </div>
              </div>

              <textarea
                rows={4}
                value={singleMessage}
                onChange={(e) => setSingleMessage(e.target.value)}
                placeholder={lang === 'bn' ? 'এখানে আপনার বার্তা লিখুন...' : 'Type your message text here...'}
                className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
              />

              {/* Variable Quick Inserters */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                <span className="text-slate-500 font-semibold">{lang === 'bn' ? 'ট্যাগ যোগ করুন:' : 'Add Tags:'}</span>
                {[
                  { tag: '{customer_name}', label: lang === 'bn' ? '+ কাস্টমার নাম' : '+ Name' },
                  { tag: '{due_amount}', label: lang === 'bn' ? '+ বকেয়া টাকা' : '+ Due' },
                  { tag: '{business_name}', label: lang === 'bn' ? '+ দোকানের নাম' : '+ Shop' },
                  { tag: '{phone}', label: lang === 'bn' ? '+ দোকান ফোন' : '+ Phone' },
                  { tag: '{invoice_no}', label: lang === 'bn' ? '+ মেমো নং' : '+ Invoice' }
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setSingleMessage(prev => prev + item.tag)}
                    className="px-2 py-0.5 rounded bg-[#162039] hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-[#1e2a47] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#1e2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'bn' ? 'খরচ হবে:' : 'Cost:'} <strong className="text-white">{currentMetrics.smsParts}</strong> {lang === 'bn' ? 'ক্রেডিট' : 'credits'}
                </span>
                <span>(অবশিষ্ট: {smsSettings.balance})</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Fallback to Native Mobile SMS App */}
                {customPhone && singleMessage && (
                  <a
                    href={`sms:${customPhone}?body=${encodeURIComponent(singleMessage)}`}
                    className="px-3.5 py-2.5 rounded-xl bg-[#141d33] hover:bg-[#1a2542] border border-[#1e2a47] text-slate-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    title="Send via mobile SMS app directly"
                  >
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'bn' ? 'ফোনের মেসেজ অ্যাপ' : 'Mobile App'}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleSendSingleSMS}
                  disabled={isSendingSingle || !customPhone.trim() || !singleMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-all"
                >
                  {isSendingSingle ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'গেটওয়ে দিয়ে পাঠান' : 'Send SMS via Gateway'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Phone Screen Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm bg-[#0e1424] border border-[#1e2a47] rounded-3xl p-4 shadow-2xl relative">
              <div className="text-center pb-3 border-b border-[#1e2a47] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'bn' ? 'মোবাইল স্ক্রিন লাইভ প্রিভিউ' : 'Live Phone Preview'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Smartphone Frame Simulation */}
              <div className="mt-4 mx-auto w-full rounded-2xl bg-neutral-900 border-2 border-neutral-700 overflow-hidden shadow-2xl flex flex-col h-[460px]">
                {/* Phone Speaker Notch */}
                <div className="bg-neutral-950 px-4 py-2 flex items-center justify-between text-[11px] text-neutral-400 select-none">
                  <span className="font-semibold text-neutral-300">12:30 PM</span>
                  <div className="w-16 h-3 bg-neutral-800 rounded-full mx-auto" />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">4G</span>
                    <span className="text-[10px]">100%</span>
                  </div>
                </div>

                {/* Messages App Header */}
                <div className="bg-neutral-800/90 border-b border-neutral-700/60 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow">
                    {(smsSettings.senderId || 'A')[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {smsSettings.maskingName || smsSettings.senderId || 'AmarDokan'}
                    </h4>
                    <p className="text-[10px] text-neutral-400">
                      {customPhone || '+880 1700-000000'}
                    </p>
                  </div>
                </div>

                {/* Chat Bubble Area */}
                <div className="flex-1 p-4 bg-neutral-900 overflow-y-auto space-y-3 flex flex-col justify-end">
                  <div className="text-center">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 bg-neutral-800/60 px-2 py-0.5 rounded">
                      {lang === 'bn' ? 'আজ' : 'Today'}
                    </span>
                  </div>

                  {/* SMS Message Bubble */}
                  <div className="max-w-[85%] bg-[#1e293b] border border-neutral-700 text-slate-100 rounded-2xl rounded-bl-xs p-3.5 shadow text-xs leading-relaxed break-words font-sans animate-in fade-in">
                    {singleMessage ? (
                      <p className="whitespace-pre-wrap">{singleMessage}</p>
                    ) : (
                      <p className="italic text-neutral-400 text-xs">
                        {lang === 'bn'
                          ? 'এসএমএস বার্তা লিখলে এখানে গ্রাহকের ফোনে কেমন দেখাবে তা দেখা যাবে...'
                          : 'Type your message above to see how it will render on the recipient device...'}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-2 text-[9px] text-neutral-400">
                      <span>Just now</span>
                      <Check className="w-3 h-3 text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Fake Input footer */}
                <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2 text-neutral-500 text-xs">
                  <div className="flex-1 bg-neutral-900 rounded-full px-3 py-1.5 text-[11px] text-neutral-400 border border-neutral-800">
                    Text message
                  </div>
                  <div className="w-7 h-7 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center">
                    <Send className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Character Metrics Footer */}
              <div className="mt-4 pt-3 border-t border-[#1e2a47] text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>{currentMetrics.isBangla ? 'Unicode (বাংলা)' : 'GSM (English)'}</span>
                <span>{currentMetrics.remaining} chars left in SMS #{currentMetrics.smsParts}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BULK CAMPAIGN & DUE REMINDERS (বাল্ক ক্যাম্পেইন ও বকেয়া তাগাদা) */}
      {/* ========================================================================= */}
      {activeSubTab === 'bulk' && (
        <div className="space-y-6">
          
          {/* Top Audience Selector Bar */}
          <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  {lang === 'bn' ? 'বাল্ক ক্যাম্পেইন ও বকেয়া রিমাইন্ডার হাব' : 'Bulk SMS & Due Reminders Hub'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'একসাথে একাধিক কাস্টমারকে তাদের ব্যক্তিগত নাম ও বকেয়া হিসাব সহ এসএমএস পাঠান'
                    : 'Broadcast personalized messages to multiple customers with individual names & due amounts'}
                </p>
              </div>

              {/* Audience Pill Options */}
              <div className="flex items-center gap-2 bg-[#090d1a] p-1.5 rounded-xl border border-[#1e2a47]">
                <button
                  onClick={() => handleAudienceChange('debtors')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bulkAudience === 'debtors'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'সকল বকেয়াদার গ্রাহক' : 'Due Debtors Only'} ({debtorsCount})
                </button>
                <button
                  onClick={() => handleAudienceChange('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bulkAudience === 'all'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'bn' ? 'সকল রেজিস্টার্ড কাস্টমার' : 'All Customers'} ({customers.length})
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Customer Selection Table (5 cols) */}
            <div className="lg:col-span-5 bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2a47]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all-bulk"
                    checked={filteredBulkCustomers.length > 0 && filteredBulkCustomers.every(c => selectedCustomerIds.includes(c.id))}
                    onChange={handleSelectAllFiltered}
                    className="w-4 h-4 rounded text-indigo-600 bg-[#121b30] border-[#1e2a47] focus:ring-indigo-500"
                  />
                  <label htmlFor="select-all-bulk" className="text-xs font-bold text-slate-200 cursor-pointer">
                    {lang === 'bn' ? 'সবাইকে নির্বাচন করুন' : 'Select All'} ({selectedCustomerIds.length}/{filteredBulkCustomers.length})
                  </label>
                </div>

                <span className="text-[11px] font-semibold text-indigo-400">
                  {selectedCustomerIds.length} {lang === 'bn' ? 'জন নির্বাচিত' : 'Selected'}
                </span>
              </div>

              {/* Search bar inside list */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
                  className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Customers Scrollable Checklist */}
              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {filteredBulkCustomers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    {lang === 'bn' ? 'কোনো কাস্টমার পাওয়া যায়নি' : 'No customers found'}
                  </div>
                ) : (
                  filteredBulkCustomers.map(c => {
                    const isChecked = selectedCustomerIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleSelectCustomer(c.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                            : 'bg-[#121b30]/60 border-[#1e2a47] hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by row click
                            className="w-4 h-4 rounded text-indigo-600 bg-[#090d1a] border-[#1e2a47] focus:ring-indigo-500 shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold truncate leading-tight">{c.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{c.phone}</p>
                          </div>
                        </div>

                        {c.dueAmount > 0 && (
                          <div className="text-right shrink-0">
                            <span className="text-[10px] uppercase font-bold text-amber-400 block">
                              {lang === 'bn' ? 'বকেয়া' : 'Due'}
                            </span>
                            <span className="text-xs font-extrabold text-amber-300 font-mono">
                              {settings.currencySymbol}{c.dueAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Message Composer & Campaign Launch (7 cols) */}
            <div className="lg:col-span-7 bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2a47]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  {lang === 'bn' ? 'বাল্ক মেসেজ টেমপ্লেট ও টেক্সট' : 'Bulk Campaign Content'}
                </h3>

                {/* Template Selector */}
                <select
                  value={bulkTemplateId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setBulkTemplateId(id);
                    const tpl = templates.find(t => t.id === id);
                    if (tpl) setBulkCustomMessage(tpl.content);
                  }}
                  className="bg-[#121b30] border border-[#1e2a47] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="">-- {lang === 'bn' ? 'টেমপ্লেট বাছাই করুন' : 'Select Template'} --</option>
                  {templates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Body */}
              <div>
                <textarea
                  rows={5}
                  value={bulkCustomMessage}
                  onChange={(e) => setBulkCustomMessage(e.target.value)}
                  placeholder="Type your bulk campaign message..."
                  className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />

                {/* Variable inserters */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                  <span className="text-slate-500 font-semibold">{lang === 'bn' ? 'ব্যক্তিগত ট্যাগ:' : 'Personalization:'}</span>
                  {[
                    { tag: '{customer_name}', label: lang === 'bn' ? '+ কাস্টমার নাম' : '+ Name' },
                    { tag: '{due_amount}', label: lang === 'bn' ? '+ বকেয়া টাকা' : '+ Due Amount' },
                    { tag: '{business_name}', label: lang === 'bn' ? '+ দোকানের নাম' : '+ Shop' },
                    { tag: '{phone}', label: lang === 'bn' ? '+ দোকান ফোন' : '+ Phone' }
                  ].map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => setBulkCustomMessage(prev => prev + item.tag)}
                      className="px-2 py-0.5 rounded bg-[#162039] hover:bg-indigo-600/30 text-indigo-300 border border-[#1e2a47] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Cost Summary Box */}
              <div className="p-4 rounded-xl bg-[#090d1a] border border-[#1e2a47] space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-[#121b30] border border-[#1e2a47]/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{lang === 'bn' ? 'মোট প্রাপক' : 'Recipients'}</p>
                    <p className="text-base font-extrabold text-white mt-0.5">{selectedCustomerIds.length}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#121b30] border border-[#1e2a47]/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{lang === 'bn' ? 'প্রতি এসএমএস' : 'SMS / Recipient'}</p>
                    <p className="text-base font-extrabold text-indigo-300 mt-0.5">{bulkMetrics.smsParts} part</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#121b30] border border-[#1e2a47]/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{lang === 'bn' ? 'প্রয়োজন ক্রেডিট' : 'Total Credits'}</p>
                    <p className="text-base font-extrabold text-amber-300 mt-0.5">{totalBulkCreditsNeeded}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#121b30] border border-[#1e2a47]/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{lang === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</p>
                    <p className={`text-base font-extrabold mt-0.5 ${smsSettings.balance >= totalBulkCreditsNeeded ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {smsSettings.balance}
                    </p>
                  </div>
                </div>

                {/* Progress bar if sending */}
                {isSendingBulk && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
                      <span>{lang === 'bn' ? 'ক্যাম্পেইন বার্তা প্রেরিত হচ্ছে...' : 'Dispatching Campaign SMS...'}</span>
                      <span>{bulkProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${bulkProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Personalized Preview */}
              {selectedCustomerIds.length > 0 && (
                <div className="p-3 bg-[#121b30] rounded-xl border border-[#1e2a47] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold">{lang === 'bn' ? 'প্রথম গ্রাহকের বার্তা প্রিভিউ:' : 'Sample Personalized Message:'}</span>
                    <span className="font-mono text-indigo-300">
                      {customers.find(c => c.id === selectedCustomerIds[0])?.name}
                    </span>
                  </div>
                  <p className="text-slate-200 italic font-sans whitespace-pre-wrap bg-[#0b101e] p-2.5 rounded-lg border border-[#192338]">
                    {replaceTags(bulkCustomMessage, customers.find(c => c.id === selectedCustomerIds[0]))}
                  </p>
                </div>
              )}

              {/* Launch Campaign Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSendBulkCampaign}
                  disabled={isSendingBulk || selectedCustomerIds.length === 0 || !bulkCustomMessage.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 inline-flex items-center justify-center gap-2 transition-all"
                >
                  {isSendingBulk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Dispatching...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {lang === 'bn'
                          ? `এক ক্লিকে ${selectedCustomerIds.length} জন গ্রাহককে পাঠান`
                          : `Launch Campaign to ${selectedCustomerIds.length} Recipients`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SMS TEMPLATES (এসএমএস টেমপ্লেট সংগ্রহ) */}
      {/* ========================================================================= */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-5 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                {lang === 'bn' ? 'এসএমএস টেমপ্লেট লাইব্রেরি' : 'SMS Template Library'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'বকেয়া তাগাদা, শুভেচ্ছা ও লেনদেনের দ্রুত ব্যবহারের জন্য প্রস্তুত টেমপ্লেট'
                  : 'Pre-formatted templates for due reminders, sale alerts & festival greetings'}
              </p>
            </div>

            <button
              onClick={() => setIsAddTemplateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন টেমপ্লেট যোগ করুন' : 'Add New Template'}</span>
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map(tpl => {
              const metric = getSMSMetrics(tpl.content);
              return (
                <div
                  key={tpl.id}
                  className="bg-[#0e1424] border border-[#1e2a47] hover:border-indigo-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tpl.category === 'due_reminder'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : tpl.category === 'transaction'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : tpl.category === 'greeting'
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {tpl.category === 'due_reminder' ? 'Due Reminder' : tpl.category === 'transaction' ? 'Transaction' : tpl.category === 'greeting' ? 'Greeting' : 'Promo'}
                      </span>

                      {!tpl.isDefault && (
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {tpl.title}
                    </h3>

                    <div className="p-3 bg-[#121b30] rounded-xl border border-[#1e2a47] text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {tpl.content}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{metric.isBangla ? 'বাংলা (Unicode)' : 'English (GSM)'}</span>
                      <span>{metric.charCount} chars • {metric.smsParts} part</span>
                    </div>
                  </div>

                  {/* Template Action buttons */}
                  <div className="pt-4 mt-4 border-t border-[#1e2a47] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tpl.content);
                        showToast(lang === 'bn' ? 'টেমপ্লেট কপি করা হয়েছে!' : 'Copied to clipboard!');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141d33] hover:bg-[#1a2542] text-slate-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>{lang === 'bn' ? 'কপি' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleUseTemplate(tpl)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>{lang === 'bn' ? 'এসএমএস পাঠান' : 'Use Template'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DELIVERY LOGS & REPORTS (প্রেরিত মেসেজ হিস্ট্রি) */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2a47]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                {lang === 'bn' ? 'প্রেরিত এসএমএস রিপোর্ট ও ডেলিভারি লগ' : 'SMS Delivery Logs & History'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn' ? 'সকল সফল ও প্রক্রিয়াধীন মেসেজের বিস্তারিত স্ট্যাটাস' : 'Track sent messages, timestamps, costs and delivery statuses'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={exportHistoryCSV}
                className="px-3.5 py-2 rounded-xl bg-[#141d33] hover:bg-[#1a2542] border border-[#1e2a47] text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
              </button>

              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'হিস্ট্রি মুছুন' : 'Clear All'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={lang === 'bn' ? 'গ্রাহকের নাম, নম্বর বা মেসেজের অংশ দিয়ে খুঁজুন...' : 'Search logs by name, phone or message text...'}
                className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={historyCategoryFilter}
                onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">-- {lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'} --</option>
                <option value="due_reminder">{lang === 'bn' ? 'বকেয়া তাগাদা (Due Reminders)' : 'Due Reminders'}</option>
                <option value="transaction">{lang === 'bn' ? 'লেনদেন (Transactional)' : 'Transactional'}</option>
                <option value="promo">{lang === 'bn' ? 'প্রচার (Promotional)' : 'Promotional'}</option>
                <option value="greeting">{lang === 'bn' ? 'শুভেচ্ছা (Greetings)' : 'Greetings'}</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1e2a47]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#121b30] text-slate-400 uppercase text-[10px] font-bold border-b border-[#1e2a47]">
                <tr>
                  <th className="p-3.5">{lang === 'bn' ? 'প্রাপক ও নম্বর' : 'Recipient'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'মেসেজ প্রিভিউ' : 'Message'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'ধরন' : 'Category'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                  <th className="p-3.5">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-3.5 text-right">{lang === 'bn' ? 'একশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a47]/60 bg-[#0e1424]">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                      {lang === 'bn' ? 'কোনো এসএমএস হিস্ট্রি পাওয়া যায়নি' : 'No SMS history found'}
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map(msg => (
                    <tr key={msg.id} className="hover:bg-[#141d33]/50 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <p className="font-bold text-white text-xs">{msg.recipientName}</p>
                        <p className="font-mono text-[11px] text-slate-400 mt-0.5">{msg.recipientPhone}</p>
                      </td>

                      <td className="p-3.5 max-w-xs sm:max-w-sm">
                        <p
                          onClick={() => setSelectedMessageModal(msg)}
                          className="truncate cursor-pointer hover:text-indigo-300 transition-colors text-slate-200"
                          title="Click to view full message"
                        >
                          {msg.message}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msg.characterCount} chars • {msg.smsParts} part
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          msg.category === 'due_reminder'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : msg.category === 'transaction'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {msg.category === 'due_reminder' ? 'Due Reminder' : msg.category === 'transaction' ? 'Invoice' : 'Promo'}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(msg.sentAt).toLocaleString()}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{msg.status === 'delivered' ? 'Delivered' : 'Sent'}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleResendMessage(msg)}
                          className="p-1.5 rounded-lg bg-[#162039] hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                          title="Resend SMS"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 rounded-lg bg-[#162039] hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                          title="Delete from log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GATEWAY & SETTINGS (গেটওয়ে কনফিগারেশন) */}
      {/* ========================================================================= */}
      {activeSubTab === 'gateway' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSaveGatewaySettings} className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="pb-4 border-b border-[#1e2a47] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  {lang === 'bn' ? 'এসএমএস গেটওয়ে ও প্রেরক সেটিংস' : 'SMS Gateway & Sender Configuration'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'বাংলাদেশের জনপ্রিয় বাল্ক এসএমএস গেটওয়ে ও মাস্কিং সেন্ডার আইডি কনফিগার করুন'
                    : 'Configure local Bangladeshi SMS gateways (Greenweb, BulkSMS BD, MimSMS) or Twilio'}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Ready & Active</span>
              </span>
            </div>

            {/* Gateway Provider Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'এসএমএস প্রোভাইডার নির্বাচন করুন' : 'Select SMS Provider / Gateway'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'mock_simulator', name: 'Simulator Mode', desc: 'লোকাল টেস্ট ও সিমুলেশন' },
                  { id: 'greenweb', name: 'Greenweb BD', desc: 'greenweb.com.bd API' },
                  { id: 'bulksms_bd', name: 'BulkSMS BD', desc: 'bulksmsbd.com API' },
                  { id: 'alphasms', name: 'Alpha SMS', desc: 'alpha.net.bd Gateway' },
                  { id: 'mimsms', name: 'MimSMS', desc: 'mimsms.com Gateway' },
                  { id: 'custom_api', name: 'Custom HTTP Webhook', desc: 'কাস্টম রেস্ট এপিআই' }
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setGatewayForm(prev => ({ ...prev, provider: p.id as any }))}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      gatewayForm.provider === p.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                        : 'bg-[#121b30] border-[#1e2a47] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{p.name}</span>
                      {gatewayForm.provider === p.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sender ID & API Key */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'সেন্ডার আইডি / মাস্কিং নাম (Sender ID)' : 'Sender ID / Masking Brand'} *
                </label>
                <input
                  type="text"
                  value={gatewayForm.senderId}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, senderId: e.target.value, maskingName: e.target.value }))}
                  placeholder="যেমন: AmarDokan বা 88096..."
                  className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {lang === 'bn' ? 'আপনার অনুমোদিত আলফানিউমেরিক মাস্কিং নাম বা নন-মাস্কিং নম্বর' : 'Registered alphanumeric masking brand or non-masking number'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === 'bn' ? 'গেটওয়ে এপিআই কি / টোকেন (API Key)' : 'Gateway API Key / Token'}
                </label>
                <input
                  type="password"
                  value={gatewayForm.apiKey}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Secret API Key or Auth Token"
                  className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {lang === 'bn' ? 'গেটওয়ে ড্যাশবোর্ড থেকে প্রাপ্ত সিক্রেট কি' : 'Provided securely by your SMS gateway dashboard'}
                </p>
              </div>
            </div>

            {/* Automated Triggers */}
            <div className="pt-2 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'স্বয়ংক্রিয় এসএমএস ট্রিগার (Automations)' : 'Automated Trigger Settings'}
              </label>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#121b30] border border-[#1e2a47] cursor-pointer hover:bg-[#152039] transition-colors">
                  <input
                    type="checkbox"
                    checked={gatewayForm.autoSendOnPayment}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, autoSendOnPayment: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 bg-[#090d1a] border-[#1e2a47] focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {lang === 'bn' ? 'বকেয়া টাকা জমা হলে গ্রাহককে স্বয়ংক্রিয় প্রাপ্তি স্বীকার এসএমএস' : 'Auto-send SMS receipt when customer pays due amount'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'bn' ? 'বাকির খাতায় টাকা জমার সাথে সাথেই গ্রাহকের মোবাইলে রসিদ পৌঁছে যাবে' : 'Customer instantly receives an SMS confirming paid amount and current due'}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#121b30] border border-[#1e2a47] cursor-pointer hover:bg-[#152039] transition-colors">
                  <input
                    type="checkbox"
                    checked={gatewayForm.autoSendOnSale}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, autoSendOnSale: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 bg-[#090d1a] border-[#1e2a47] focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {lang === 'bn' ? 'প্রতিটি বিক্রির সাথে সাথে কাস্টমারকে ডিজিটাল মেমো এসএমএস' : 'Auto-send digital invoice SMS after completing a POS sale'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {lang === 'bn' ? 'বিক্রয় শেষে ইনভয়েস নং ও টাকার বিবরণ এসএমএস করা হবে' : 'Sends invoice number, paid amount & thank you note to customer'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[#1e2a47] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsRechargeModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#141d33] hover:bg-[#1a2542] border border-[#1e2a47] text-slate-200 text-xs font-bold inline-flex items-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'এসএমএস ক্রেডিট রিচার্জ' : 'Recharge SMS Credits'}</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Gateway Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW TEMPLATE */}
      {/* ========================================================================= */}
      {isAddTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2a47]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                {lang === 'bn' ? 'নতুন এসএমএস টেমপ্লেট তৈরি' : 'Create New SMS Template'}
              </h3>
              <button
                onClick={() => setIsAddTemplateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'bn' ? 'টেমপ্লেটের নাম / শিরোনাম' : 'Template Title'} *
              </label>
              <input
                type="text"
                value={templateFormTitle}
                onChange={(e) => setTemplateFormTitle(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ঈদ সালামি ও বিশেষ ছাড়' : 'e.g. Festival Special Offer'}
                className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={templateFormCategory}
                onChange={(e) => setTemplateFormCategory(e.target.value as any)}
                className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="due_reminder">{lang === 'bn' ? 'বকেয়া তাগাদা (Due Reminder)' : 'Due Reminder'}</option>
                <option value="transaction">{lang === 'bn' ? 'লেনদেন / রসিদ (Transactional)' : 'Transactional'}</option>
                <option value="promo">{lang === 'bn' ? 'প্রচার ও অফার (Promotional)' : 'Promotional'}</option>
                <option value="greeting">{lang === 'bn' ? 'শুভেচ্ছা (Greeting)' : 'Greeting'}</option>
                <option value="custom">{lang === 'bn' ? 'সাধারণ (Custom)' : 'Custom'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'bn' ? 'মেসেজ টেক্সট' : 'Message Body'} *
              </label>
              <textarea
                rows={4}
                value={templateFormContent}
                onChange={(e) => setTemplateFormContent(e.target.value)}
                placeholder="Type template message content with {customer_name}, {due_amount}, {business_name}..."
                className="w-full bg-[#121b30] border border-[#1e2a47] rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                <span className="text-slate-500">{lang === 'bn' ? 'ট্যাগ যোগ:' : 'Tags:'}</span>
                {['{customer_name}', '{due_amount}', '{business_name}', '{phone}', '{invoice_no}'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTemplateFormContent(prev => prev + tag)}
                    className="px-2 py-0.5 rounded bg-[#162039] text-indigo-300 text-[10px] hover:bg-indigo-600/30"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1e2a47] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddTemplateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#141d33] text-slate-300 text-xs font-semibold"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveNewTemplate}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECHARGE SMS CREDITS */}
      {/* ========================================================================= */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2a47]">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'এসএমএস ক্রেডিট রিচার্জ' : 'Recharge SMS Credits'}
                </h3>
              </div>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'আপনার চাহিদামতো এসএমএস প্যাকেজ নির্বাচন করে তাত্ক্ষণিক ব্যালেন্স যোগ করুন'
                : 'Select an SMS bundle to instantly top-up credits to your store balance'}
            </p>

            <div className="space-y-2.5">
              {[
                { count: 200, price: 90, popular: false },
                { count: 500, price: 210, popular: true },
                { count: 1000, price: 390, popular: false },
                { count: 2500, price: 920, popular: false }
              ].map(pack => (
                <div
                  key={pack.count}
                  onClick={() => setRechargePack(pack.count)}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    rechargePack === pack.count
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-[#121b30] border-[#1e2a47] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={rechargePack === pack.count}
                      onChange={() => setRechargePack(pack.count)}
                      className="text-emerald-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {pack.count.toLocaleString()} SMS
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {settings.currencySymbol}{(pack.price / pack.count).toFixed(2)} / SMS
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      {settings.currencySymbol}{pack.price}
                    </span>
                    {pack.popular && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                        POPULAR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRechargeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#141d33] text-slate-300 text-xs font-semibold"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleAddCredits(rechargePack)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                {lang === 'bn' ? `+ ${rechargePack} ক্রেডিট যোগ করুন` : `Add ${rechargePack} Credits`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW FULL MESSAGE */}
      {/* ========================================================================= */}
      {selectedMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2a47]">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedMessageModal.recipientName}</h4>
                <p className="text-[11px] font-mono text-slate-400">{selectedMessageModal.recipientPhone}</p>
              </div>
              <button
                onClick={() => setSelectedMessageModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#121b30] rounded-xl border border-[#1e2a47] text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {selectedMessageModal.message}
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <p>Sent: {new Date(selectedMessageModal.sentAt).toLocaleString()}</p>
              <p>Category: {selectedMessageModal.category}</p>
              <p>Size: {selectedMessageModal.characterCount} chars ({selectedMessageModal.smsParts} part)</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMessageModal(null)}
                className="px-4 py-2 rounded-xl bg-[#141d33] text-slate-300 text-xs font-semibold"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
