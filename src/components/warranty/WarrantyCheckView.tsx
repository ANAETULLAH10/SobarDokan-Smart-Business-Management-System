import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Search, Plus, Clock, CheckCircle2,
  AlertTriangle, Wrench, Package, Calendar, Phone, User,
  ArrowRight, Filter, FileText, Check, X, RefreshCw, Sparkles, Download
} from 'lucide-react';
import { Language, BusinessSettings, WarrantyItem, WarrantyClaim } from '../../types';
import { StorageService } from '../../services/storage';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface WarrantyCheckViewProps {
  lang: Language;
  settings: BusinessSettings;
}

export const WarrantyCheckView: React.FC<WarrantyCheckViewProps> = ({ lang, settings }) => {
  const isBn = lang === 'bn';
  const todayStr = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'items' | 'claims'>('search');
  const [warrantyItems, setWarrantyItems] = useState<WarrantyItem[]>([]);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([]);
  const [searchedItem, setSearchedItem] = useState<WarrantyItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Claim Modal
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState<WarrantyItem | null>(null);
  const [claimIssue, setClaimIssue] = useState('');
  const [claimEstDate, setClaimEstDate] = useState(new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]);

  // Add Item Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<WarrantyItem>>({
    invoiceId: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    productName: '',
    serialNumber: '',
    customerName: '',
    customerPhone: '',
    purchaseDate: todayStr,
    warrantyPeriodMonths: 12
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = StorageService.getWarrantyItems();
    setWarrantyItems(items);
    const claims = StorageService.getWarrantyClaims();
    setWarrantyClaims(claims);

    if (items.length > 0 && !searchedItem && !hasSearched) {
      setSearchedItem(items[0]);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSearched(true);
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchedItem(warrantyItems[0] || null);
      return;
    }

    const found = warrantyItems.find(w =>
      w.serialNumber.toLowerCase().includes(q) ||
      (w.barcode && w.barcode.toLowerCase().includes(q)) ||
      w.invoiceId.toLowerCase().includes(q) ||
      w.customerPhone.includes(q) ||
      w.productName.toLowerCase().includes(q)
    );

    setSearchedItem(found || null);
  };

  const getDaysRemaining = (expiryDate: string) => {
    const exp = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleOpenClaimModal = (item: WarrantyItem) => {
    setClaimTargetItem(item);
    setClaimIssue('');
    setIsClaimModalOpen(true);
  };

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimTargetItem || !claimIssue) return;

    const newClaim: WarrantyClaim = {
      id: `claim-${Date.now()}`,
      warrantyItemId: claimTargetItem.id,
      customerName: claimTargetItem.customerName,
      customerPhone: claimTargetItem.customerPhone,
      productName: claimTargetItem.productName,
      serialNumber: claimTargetItem.serialNumber,
      issueDescription: claimIssue,
      claimDate: todayStr,
      estimatedReturnDate: claimEstDate,
      status: 'pending',
      technicianNotes: isBn ? 'সার্ভিস সেন্টারে প্রাথমিক পরীক্ষণ অপেক্ষমাণ' : 'Initial inspection pending'
    };

    StorageService.saveWarrantyClaim(newClaim);
    loadData();
    setIsClaimModalOpen(false);
    setActiveTab('claims');
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.productName || !newItem.serialNumber || !newItem.customerName) return;

    const purchaseD = new Date(newItem.purchaseDate || todayStr);
    const months = Number(newItem.warrantyPeriodMonths) || 12;
    const expiryD = new Date(purchaseD);
    expiryD.setMonth(expiryD.getMonth() + months);
    const expiryDateStr = expiryD.toISOString().split('T')[0];

    const item: WarrantyItem = {
      id: `war-${Date.now()}`,
      invoiceId: newItem.invoiceId || 'INV-1000',
      productId: `prod-${Date.now()}`,
      productName: newItem.productName,
      serialNumber: newItem.serialNumber,
      barcode: `8941${Date.now().toString().slice(-8)}`,
      customerName: newItem.customerName,
      customerPhone: newItem.customerPhone || '01700-000000',
      purchaseDate: newItem.purchaseDate || todayStr,
      warrantyPeriodMonths: months,
      warrantyExpiryDate: expiryDateStr,
      status: 'active'
    };

    StorageService.saveWarrantyItem(item);
    loadData();
    setIsAddItemModalOpen(false);
    setSearchedItem(item);
    setActiveTab('search');
  };

  const updateClaimStatus = (claimId: string, status: WarrantyClaim['status']) => {
    const claim = warrantyClaims.find(c => c.id === claimId);
    if (!claim) return;
    claim.status = status;
    StorageService.saveWarrantyClaim(claim);
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e1424] via-[#131b2e] to-[#0e1424] p-5 rounded-2xl border border-[#1e2a47] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 flex-shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {isBn ? 'পণ্য ওয়ারেন্টি যাচাই ও সার্ভিস ক্লেইম' : 'Warranty Check & Claim Portal'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBn
                ? 'সিরিয়াল নম্বর, বারকোড বা ইনভয়েস দিয়ে ওয়ারেন্টির মেয়াদ যাচাই এবং সার্ভিস রিকোয়েস্ট ট্র্যাকিং'
                : 'Lookup warranty duration, expiry dates and track customer service claims by serial or invoice'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন ওয়ারেন্টি ইস্যু' : 'Issue Warranty'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1e2a47] pb-2">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          {isBn ? 'ওয়ারেন্টি অনুসন্ধান' : 'Instant Search'}
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'items'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          {isBn ? 'সকল ওয়ারেন্টিভুক্ত পণ্য' : 'All Warranty Products'} ({warrantyItems.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'claims'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          {isBn ? 'সার্ভিস ও ক্লেইম খাতা' : 'Service Claims'} ({warrantyClaims.length})
        </button>
      </div>

      {/* Tab 1: Instant Search View */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-[#0e1424] border border-[#1e2a47] p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-400" />
              {isBn ? 'সিরিয়াল নম্বর বা ইনভয়েস সার্চ করুন' : 'Search by Serial Number, Barcode or Invoice'}
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? 'যেমন: SN-SAM24-884920 অথবা INV-1001...' : 'e.g. SN-SAM24-884920 or INV-1001...'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:border-sky-500 focus:outline-none placeholder-slate-500"
                />
              </div>
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {isBn ? 'যাচাই করুন' : 'Verify'}
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>{isBn ? 'দ্রুত টেস্ট করুন:' : 'Try sample:'}</span>
              {warrantyItems.slice(0, 3).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSearchQuery(item.serialNumber);
                    setSearchedItem(item);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#192238] hover:bg-[#202d4a] text-sky-400 border border-[#2b3a5d] font-mono transition-colors"
                >
                  {item.serialNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Searched Item Result Card */}
          {searchedItem ? (
            <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in">
              {/* Card Header with Status */}
              {(() => {
                const daysLeft = getDaysRemaining(searchedItem.warrantyExpiryDate);
                const isExpired = daysLeft < 0;
                const isExpiringSoon = daysLeft >= 0 && daysLeft <= 30;
                const isActive = daysLeft > 30;

                return (
                  <div className={`p-5 border-b border-[#1e2a47] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive ? 'bg-emerald-500/5' : isExpiringSoon ? 'bg-amber-500/5' : 'bg-rose-500/5'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                        isActive ? 'bg-emerald-500' : isExpiringSoon ? 'bg-amber-500' : 'bg-rose-500'
                      }`}>
                        {isActive ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white">{searchedItem.productName}</h2>
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {isBn ? 'ওয়ারেন্টি সক্রিয়' : 'Active Warranty'}
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {isBn ? 'শীঘ্রই মেয়াদ শেষ' : 'Expiring Soon'}
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {isBn ? 'ওয়ারেন্টির মেয়াদ শেষ' : 'Expired'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          {isBn ? 'সিরিয়াল নম্বর:' : 'Serial:'} <span className="text-sky-400 font-bold">{searchedItem.serialNumber}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => PDFGenerator.generateWarrantyCertificatePDF(searchedItem, settings)}
                        className="bg-[#18223a] hover:bg-[#202d4e] text-sky-300 hover:text-white border border-[#2b3d63] font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                        title="Download Warranty Certificate PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ওয়ারেন্টি PDF' : 'Warranty PDF'}</span>
                      </button>
                      <button
                        onClick={() => handleOpenClaimModal(searchedItem)}
                        className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
                      >
                        <Wrench className="w-4 h-4" />
                        {isBn ? 'সার্ভিস ক্লেইম করুন' : 'Claim Service'}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Card Details Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#090d18] border border-[#1e2a47] p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {isBn ? 'ক্রয়ের তারিখ' : 'Purchase Date'}
                  </span>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    {searchedItem.purchaseDate}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'ইনভয়েস নম্বর:' : 'Invoice:'} {searchedItem.invoiceId}
                  </p>
                </div>

                <div className="bg-[#090d18] border border-[#1e2a47] p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {isBn ? 'মেয়াদ উত্তীর্ণের তারিখ' : 'Expiry Date'}
                  </span>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    {searchedItem.warrantyExpiryDate}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {searchedItem.warrantyPeriodMonths} {isBn ? 'মাসের ওয়ারেন্টি' : 'Months Coverage'}
                  </p>
                </div>

                <div className="bg-[#090d18] border border-[#1e2a47] p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {isBn ? 'মেয়াদ বাকি' : 'Days Remaining'}
                  </span>
                  {(() => {
                    const days = getDaysRemaining(searchedItem.warrantyExpiryDate);
                    return (
                      <>
                        <p className={`text-base font-bold ${days > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {days > 0 ? `${days} ${isBn ? 'দিন বাকি' : 'days remaining'}` : isBn ? 'মেয়াদ শেষ হয়েছে' : 'Expired'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {days > 0 ? (isBn ? 'বিনামূল্যে সার্ভিস প্রযোজ্য' : 'Eligible for free repair') : (isBn ? 'পেইড সার্ভিসিং প্রযোজ্য' : 'Paid repair only')}
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div className="bg-[#090d18] border border-[#1e2a47] p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {isBn ? 'ক্রেতার তথ্য' : 'Customer Info'}
                  </span>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    {searchedItem.customerName}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {searchedItem.customerPhone}
                  </p>
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="bg-[#0e1424] border border-[#1e2a47] p-8 rounded-2xl text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
              <h3 className="text-base font-bold text-white">
                {isBn ? 'কোনো ওয়ারেন্টি রেকর্ড পাওয়া যায়নি' : 'No Warranty Record Found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isBn
                  ? 'আপনার দেওয়া সিরিয়াল নম্বর বা ইনভয়েস দিয়ে কোনো রেকর্ড নেই। বানান চেক করুন অথবা নতুন ওয়ারেন্টি কার্ড ইস্যু করুন।'
                  : 'No active warranty found matching that serial number or invoice. Please check the spelling or issue a new warranty card.'}
              </p>
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                {isBn ? 'ওয়ারেন্টি ইস্যু করুন' : 'Issue Warranty Card'}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: All Items List */}
      {activeTab === 'items' && (
        <div className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2a47] bg-[#090d18]/80 text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">{isBn ? 'পণ্য' : 'Product'}</th>
                  <th className="py-3.5 px-4 font-semibold">{isBn ? 'সিরিয়াল / বারকোড' : 'Serial / Barcode'}</th>
                  <th className="py-3.5 px-4 font-semibold">{isBn ? 'কাস্টমার' : 'Customer'}</th>
                  <th className="py-3.5 px-4 font-semibold">{isBn ? 'ক্রয়ের তারিখ' : 'Purchased'}</th>
                  <th className="py-3.5 px-4 font-semibold">{isBn ? 'মেয়াদ শেষ' : 'Expires'}</th>
                  <th className="py-3.5 px-4 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4 font-semibold text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a47]">
                {warrantyItems.map((item) => {
                  const days = getDaysRemaining(item.warrantyExpiryDate);
                  const isExp = days < 0;
                  return (
                    <tr key={item.id} className="hover:bg-[#131b2e]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {item.productName}
                        <span className="block text-[10px] font-mono text-slate-400">{item.invoiceId}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-sky-400">
                        {item.serialNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-200">{item.customerName}</p>
                        <p className="text-[10px] text-slate-400">{item.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{item.purchaseDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{item.warrantyExpiryDate}</td>
                      <td className="py-3 px-4">
                        {isExp ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {isBn ? 'মেয়াদোত্তীর্ণ' : 'Expired'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {days} {isBn ? 'দিন বাকি' : 'days left'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSearchedItem(item);
                            setActiveTab('search');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/20 transition-colors mr-2"
                        >
                          {isBn ? 'বিস্তারিত' : 'View'}
                        </button>
                        <button
                          onClick={() => handleOpenClaimModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/20 transition-colors"
                        >
                          {isBn ? 'ক্লেইম' : 'Claim'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Service Claims Tracker */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warrantyClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-[#0e1424] border border-[#1e2a47] rounded-2xl p-5 space-y-4 shadow-lg hover:border-sky-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-base">{claim.productName}</h4>
                    <p className="text-xs font-mono text-sky-400">{claim.serialNumber}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    claim.status === 'repaired'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : claim.status === 'under_repair'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {claim.status === 'repaired'
                      ? (isBn ? 'মেরামত সম্পন্ন' : 'Repaired')
                      : claim.status === 'under_repair'
                      ? (isBn ? 'মেরামত চলছে' : 'In Service')
                      : (isBn ? 'অপেক্ষমাণ' : 'Pending')}
                  </span>
                </div>

                <div className="bg-[#090d18] p-3 rounded-xl border border-[#1e2a47] space-y-1.5 text-xs">
                  <div className="text-slate-300">
                    <span className="text-slate-400 font-semibold">{isBn ? 'সমস্যা:' : 'Issue:'} </span>
                    {claim.issueDescription}
                  </div>
                  {claim.technicianNotes && (
                    <div className="text-slate-400 text-[11px] pt-1 border-t border-[#1e2a47]">
                      <span className="text-sky-400 font-semibold">{isBn ? 'টেকনিশিয়ান মন্তব্য:' : 'Tech note:'} </span>
                      {claim.technicianNotes}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                  <div>
                    <span className="block font-semibold text-slate-300">{claim.customerName}</span>
                    <span className="font-mono text-[11px]">{claim.customerPhone}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold text-slate-300">
                      {isBn ? 'প্রত্যাশিত ফেরত:' : 'Est. Delivery:'}
                    </span>
                    <span className="font-mono text-[11px] text-amber-400">{claim.estimatedReturnDate || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e2a47] flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{isBn ? 'স্ট্যাটাস বদলান:' : 'Change:'}</span>
                  <button
                    onClick={() => updateClaimStatus(claim.id, 'under_repair')}
                    className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold border border-amber-500/20"
                  >
                    {isBn ? 'মেরামত চলছে' : 'In Service'}
                  </button>
                  <button
                    onClick={() => updateClaimStatus(claim.id, 'repaired')}
                    className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20"
                  >
                    {isBn ? 'মেরামত সম্পন্ন' : 'Repaired'}
                  </button>
                  <button
                    onClick={() => updateClaimStatus(claim.id, 'delivered')}
                    className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[11px] font-semibold border border-sky-500/20"
                  >
                    {isBn ? 'হস্তান্তর' : 'Delivered'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Service Claim Request */}
      {isClaimModalOpen && claimTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">
                  {isBn ? 'ওয়ারেন্টি সার্ভিস ক্লেইম ফর্ম' : 'Warranty Service Claim'}
                </h3>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClaim} className="p-5 space-y-3.5">
              <div className="bg-[#090d18] p-3 rounded-xl border border-[#1e2a47] text-xs space-y-1">
                <p className="font-bold text-white">{claimTargetItem.productName}</p>
                <p className="font-mono text-sky-400">{claimTargetItem.serialNumber}</p>
                <p className="text-slate-400">{claimTargetItem.customerName} ({claimTargetItem.customerPhone})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'সমস্যা বা ফল্টের বিবরণ' : 'Problem Description'} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  placeholder={isBn ? 'কাস্টমারের অভিযোগ লিখুন (যেমন: ডিসপ্লেতে লাইন বা অন হচ্ছে না)...' : 'Describe product issue...'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'আনুমানিক ডেলিভারি তারিখ' : 'Estimated Delivery Date'}
                </label>
                <input
                  type="date"
                  value={claimEstDate}
                  onChange={(e) => setClaimEstDate(e.target.value)}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2a47] text-xs font-bold text-slate-300 hover:bg-[#131b2e]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  {isBn ? 'ক্লেইম সাবমিট করুন' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Warranty Card */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1e2a47] flex items-center justify-between bg-[#0a0f1d]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">
                  {isBn ? 'নতুন ওয়ারেন্টি কার্ড ইস্যু' : 'Issue Warranty Card'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isBn ? 'পণ্যের নাম' : 'Product Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.productName}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  placeholder={isBn ? 'যেমন: Samsung 24" IPS Monitor' : 'e.g. Samsung 24" IPS Monitor'}
                  className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'সিরিয়াল নম্বর / IMEI' : 'Serial / IMEI'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.serialNumber}
                    onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
                    placeholder="SN-SAM24-XXXX"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'মেয়াদ (মাস)' : 'Warranty (Months)'}
                  </label>
                  <select
                    value={newItem.warrantyPeriodMonths}
                    onChange={(e) => setNewItem({ ...newItem, warrantyPeriodMonths: Number(e.target.value) })}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value={6}>৬ মাস (6 Months)</option>
                    <option value={12}>১ বছর (12 Months)</option>
                    <option value={24}>২ বছর (24 Months)</option>
                    <option value={36}>৩ বছর (36 Months)</option>
                    <option value={60}>৫ বছর (60 Months)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'ক্রেতার নাম' : 'Customer Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.customerName}
                    onChange={(e) => setNewItem({ ...newItem, customerName: e.target.value })}
                    placeholder={isBn ? 'মো: রফিকুল ইসলাম' : 'Rafiqul Islam'}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newItem.customerPhone}
                    onChange={(e) => setNewItem({ ...newItem, customerPhone: e.target.value })}
                    placeholder="01700-000000"
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'ইনভয়েস নম্বর' : 'Invoice No'}
                  </label>
                  <input
                    type="text"
                    value={newItem.invoiceId}
                    onChange={(e) => setNewItem({ ...newItem, invoiceId: e.target.value })}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isBn ? 'ক্রয়ের তারিখ' : 'Purchase Date'}
                  </label>
                  <input
                    type="date"
                    value={newItem.purchaseDate}
                    onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                    className="w-full bg-[#090d18] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2a47] text-xs font-bold text-slate-300 hover:bg-[#131b2e]"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  {isBn ? 'ওয়ারেন্টি ইস্যু করুন' : 'Issue Warranty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
