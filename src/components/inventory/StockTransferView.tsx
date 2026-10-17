import React, { useState, useEffect } from 'react';
import {
  Layers, ArrowLeftRight, Plus, Search, Building2, Store,
  CheckCircle2, Clock, Trash2, X, RefreshCw
} from 'lucide-react';
import { StockTransfer, Product, Language, BusinessSettings } from '../../types';
import { StorageService } from '../../services/storage';

interface StockTransferViewProps {
  lang: Language;
  settings: BusinessSettings;
  products: Product[];
  onRefreshAllState?: () => void;
}

export const StockTransferView: React.FC<StockTransferViewProps> = ({
  lang,
  settings,
  products,
  onRefreshAllState
}) => {
  const isBn = lang === 'bn';

  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fromLocation, setFromLocation] = useState<'godown' | 'store'>('godown');
  const [toLocation, setToLocation] = useState<'godown' | 'store'>('store');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferNotes, setTransferNotes] = useState<string>('');

  const loadData = () => {
    setTransfers(StorageService.getStockTransfers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSwapDirection = () => {
    setFromLocation(prev => (prev === 'godown' ? 'store' : 'godown'));
    setToLocation(prev => (prev === 'godown' ? 'store' : 'godown'));
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || transferQty <= 0) return;

    const available = fromLocation === 'godown' ? (selectedProduct.godownStock || 0) : selectedProduct.currentStock;
    if (transferQty > available) {
      alert(isBn ? `পর্যাপ্ত স্টক নেই! সর্বোচ্চ মজুদ আছে: ${available}` : `Insufficient stock! Max available: ${available}`);
      return;
    }

    const transfer: StockTransfer = {
      id: 'trans-' + Date.now(),
      transferNo: `TRF-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      fromLocation,
      toLocation,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.banglaName || selectedProduct.name,
          quantity: transferQty,
          sku: selectedProduct.sku
        }
      ],
      notes: transferNotes,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    StorageService.saveStockTransfer(transfer);
    setIsModalOpen(false);
    setTransferQty(1);
    setTransferNotes('');
    loadData();
    onRefreshAllState?.();
  };

  return (
    <div id="stock-transfer-view" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'দোকান ও গুদাম স্টক ট্রান্সফার' : 'Godown & Store Stock Transfer'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'মূল দোকান এবং গুদাম/ওয়্যারহাউসের মধ্যে স্টক স্থানান্তর ও রেকর্ড'
              : 'Transfer inventory between main storefront and warehouse godown'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/50 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{isBn ? 'নতুন স্টক ট্রান্সফার' : 'New Stock Transfer'}</span>
        </button>
      </div>

      {/* Godown Stock Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e1424] border border-[#1e2a47] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">{isBn ? 'দোকানের মোট বিক্রয় স্টক' : 'Storefront Total Stock'}</span>
            <span className="text-xl font-black text-white">
              {products.reduce((acc, p) => acc + p.currentStock, 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">{isBn ? 'পিস' : 'pcs'}</span>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1424] border border-[#1e2a47] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">{isBn ? 'গুদামে সংরক্ষিত মজুদ' : 'Godown / Warehouse Stock'}</span>
            <span className="text-xl font-black text-purple-300">
              {products.reduce((acc, p) => acc + (p.godownStock || 0), 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">{isBn ? 'পিস' : 'pcs'}</span>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1424] border border-[#1e2a47] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">{isBn ? 'মোট চালান রেকর্ড' : 'Completed Transfers'}</span>
            <span className="text-xl font-black text-emerald-300">
              {transfers.length} <span className="text-xs font-normal text-slate-400">{isBn ? 'টি চালান' : 'records'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? 'স্টক ট্রান্সফার চালান লগ' : 'Transfer History'}</span>
        </h3>

        <div className="rounded-2xl bg-[#0e1424] border border-[#1e2a47] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12192c] text-slate-400 border-b border-[#1e2a47] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">{isBn ? 'চালান নম্বর ও তারিখ' : 'Challan No & Date'}</th>
                  <th className="p-3.5">{isBn ? 'উৎস (From)' : 'From'}</th>
                  <th className="p-3.5 text-center">{isBn ? 'দিক' : 'Direction'}</th>
                  <th className="p-3.5">{isBn ? 'গন্তব্য (To)' : 'To'}</th>
                  <th className="p-3.5">{isBn ? 'পণ্য ও পরিমাণ' : 'Products & Qty'}</th>
                  <th className="p-3.5">{isBn ? 'মন্তব্য' : 'Notes'}</th>
                  <th className="p-3.5 text-center">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a47]">
                {transfers.map(tr => (
                  <tr key={tr.id} className="hover:bg-[#12192c]/50 transition-colors">
                    <td className="p-3.5 text-slate-200">
                      <span className="font-bold text-indigo-300 block">{tr.transferNo}</span>
                      <span className="text-[10px] text-slate-400">{tr.date}</span>
                    </td>

                    <td className="p-3.5 font-medium">
                      {tr.fromLocation === 'godown' ? (
                        <span className="text-purple-300 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{isBn ? 'গুদাম (Godown)' : 'Godown'}</span>
                        </span>
                      ) : (
                        <span className="text-indigo-300 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          <span>{isBn ? 'দোকান (Store)' : 'Storefront'}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center text-slate-500">➔</td>

                    <td className="p-3.5 font-medium">
                      {tr.toLocation === 'store' ? (
                        <span className="text-emerald-300 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          <span>{isBn ? 'দোকান (Store)' : 'Storefront'}</span>
                        </span>
                      ) : (
                        <span className="text-purple-300 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{isBn ? 'গুদাম (Godown)' : 'Godown'}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {tr.items.map((it, i) => (
                        <span key={i} className="inline-block bg-[#121a2d] px-2 py-0.5 rounded text-white font-medium mr-1 mb-1">
                          {it.productName} × <b>{it.quantity}</b>
                        </span>
                      ))}
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px] italic">
                      {tr.notes || '—'}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {isBn ? 'সম্পন্ন' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}

                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      {isBn ? 'এখনো কোনো স্টক ট্রান্সফার রেকর্ড নেই' : 'No stock transfers recorded yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2a47] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                <span>{isBn ? 'নতুন স্টক স্থানান্তর চালান' : 'Create Stock Transfer'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              {/* Direction Switcher */}
              <div className="p-3 rounded-xl bg-[#12192c] border border-[#1e2a47] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">{isBn ? 'কোথা থেকে (From):' : 'Source:'}</span>
                  <span className="text-xs font-bold text-white">
                    {fromLocation === 'godown' ? (isBn ? 'গুদাম / ওয়্যারহাউস' : 'Godown') : (isBn ? 'মূল দোকান' : 'Storefront')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSwapDirection}
                  className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                  title="Swap direction"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{isBn ? 'কোথায় (To):' : 'Destination:'}</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {toLocation === 'store' ? (isBn ? 'মূল দোকান' : 'Storefront') : (isBn ? 'গুদাম / ওয়্যারহাউস' : 'Godown')}
                  </span>
                </div>
              </div>

              {/* Product Select */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'পণ্য নির্বাচন করুন *' : 'Select Product *'}
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.banglaName || p.name} (দোকানে: {p.currentStock}, গুদামে: {p.godownStock || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'স্থানান্তরের পরিমাণ (Quantity) *' : 'Transfer Quantity *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={e => setTransferQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-sm text-white font-bold"
                />
                {selectedProduct && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isBn ? 'উৎসস্থলে মজুদ আছে:' : 'Available in source:'}{' '}
                    <b className="text-indigo-400">
                      {fromLocation === 'godown' ? (selectedProduct.godownStock || 0) : selectedProduct.currentStock} {selectedProduct.unit}
                    </b>
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {isBn ? 'চালানের মন্তব্য' : 'Challan Notes'}
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  placeholder={isBn ? 'যেমন: নতুন কার্টন গুদাম থেকে আনা হলো' : 'Notes...'}
                  className="w-full bg-[#0b0f19] border border-[#233152] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141b2d] text-slate-300 text-xs font-semibold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold"
                >
                  {isBn ? 'ট্রান্সফার নিশ্চিত করুন' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
