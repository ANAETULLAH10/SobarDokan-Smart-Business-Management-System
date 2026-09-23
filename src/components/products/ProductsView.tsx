import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Copy, Barcode,
  AlertTriangle, CheckCircle, Package, Download, Filter
} from 'lucide-react';
import { Product, Category, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface ProductsViewProps {
  lang: Language;
  settings: BusinessSettings;
  products: Product[];
  categories: Category[];
  initialStockFilter?: 'all' | 'low' | 'out';
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDuplicateProduct: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  lang,
  settings,
  products,
  categories,
  initialStockFilter = 'all',
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>(initialStockFilter);

  useEffect(() => {
    if (initialStockFilter) {
      setStockFilter(initialStockFilter);
    }
  }, [initialStockFilter]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q);

      let matchStock = true;
      if (stockFilter === 'low') matchStock = p.currentStock > 0 && p.currentStock <= p.minStockAlert;
      if (stockFilter === 'out') matchStock = p.currentStock <= 0;

      return matchCat && matchSearch && matchStock;
    });
  }, [products, selectedCategory, search, stockFilter]);

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Bangla Name', 'Category', 'SKU', 'Barcode', 'Cost', 'Price', 'Stock', 'Unit'];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`,
      `"${p.banglaName || ''}"`,
      `"${p.category}"`,
      p.sku,
      p.barcode,
      p.purchasePrice,
      p.sellingPrice,
      p.currentStock,
      p.unit
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AmarDokan_Products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadStockPDF = () => {
    PDFGenerator.generateStockReportPDF(products, settings);
  };

  return (
    <div id="products-view" className="p-6 space-y-5 max-w-[1600px] mx-auto animate-in fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>{t.allProducts}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
              {products.length} {lang === 'bn' ? 'টি' : 'items'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'সকল পণ্যের তালিকা, স্টক পর্যবেক্ষণ ও মূল্য নিয়ন্ত্রণ' : 'Manage your catalog, stock levels, and selling prices'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleDownloadStockPDF}
            className="px-3 py-2 rounded-xl bg-[#111827] hover:bg-[#18233b] border border-[#1e2a47] text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Stock PDF</span>
          </button>
          <button
            id="btn-add-product-main"
            onClick={onAddProduct}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1e293b] flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category selector */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full md:w-48 bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">{t.allCategories}</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.banglaName || c.name}</option>
          ))}
        </select>

        {/* Stock Filter */}
        <div className="flex items-center gap-1 bg-[#0b101d] p-1 rounded-xl border border-[#1e2a47] w-full md:w-auto">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              stockFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'সব' : 'All'}
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              stockFilter === 'low' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.lowStock}
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              stockFilter === 'out' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.outOfStock}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#111827] border border-[#1e293b] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0b101d] border-b border-[#1e293b] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t.productName}</th>
                <th className="py-3 px-4">{t.category}</th>
                <th className="py-3 px-4">{t.barcode} / SKU</th>
                <th className="py-3 px-4 text-right">{t.purchasePrice}</th>
                <th className="py-3 px-4 text-right">{t.sellingPrice}</th>
                <th className="py-3 px-4 text-center">{t.stock}</th>
                <th className="py-3 px-4 text-center">{t.status}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#192238]">
              {filtered.length > 0 ? (
                filtered.map(product => {
                  const isOut = product.currentStock <= 0;
                  const isLow = product.currentStock > 0 && product.currentStock <= product.minStockAlert;
                  return (
                    <tr key={product.id} className="hover:bg-[#141d30] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          {product.banglaName || product.name}
                        </div>
                        {product.banglaName && (
                          <div className="text-[11px] text-slate-400">{product.name}</div>
                        )}
                        {product.brand && (
                          <span className="text-[10px] text-indigo-400 font-semibold">{product.brand}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#18233b] text-indigo-300 text-[11px] font-medium border border-[#1e2a47]">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        <div>{product.barcode}</div>
                        <div className="text-[10px] text-slate-500">{product.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-400">
                        {settings.currencySymbol}{product.purchasePrice}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-300">
                        {settings.currencySymbol}{product.sellingPrice}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isOut
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isOut ? (
                            <span>{t.outOfStock}</span>
                          ) : (
                            <span>{product.currentStock} {product.unit}</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onDuplicateProduct(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-[#1a253e]"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-[#1a253e]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t.confirmDelete)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#2b161f]"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold">{lang === 'bn' ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}</p>
                    <button
                      onClick={onAddProduct}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                    >
                      {t.addProduct}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
