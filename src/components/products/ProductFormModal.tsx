import React, { useState, useEffect } from 'react';
import { X, Save, Barcode as BarcodeIcon, Sparkles } from 'lucide-react';
import { Product, Category, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  categories: Category[];
  settings: BusinessSettings;
  lang: Language;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  settings,
  lang
}) => {
  const t = translations[lang];

  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('পিস');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [openingStock, setOpeningStock] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBanglaName(productToEdit.banglaName || '');
      setSku(productToEdit.sku);
      setBarcode(productToEdit.barcode);
      setCategory(productToEdit.category);
      setBrand(productToEdit.brand || '');
      setUnit(productToEdit.unit || 'পিস');
      setPurchasePrice(productToEdit.purchasePrice);
      setSellingPrice(productToEdit.sellingPrice);
      setOpeningStock(productToEdit.openingStock);
      setCurrentStock(productToEdit.currentStock);
      setMinStockAlert(productToEdit.minStockAlert);
      setTaxPercent(productToEdit.taxPercent || 0);
      setDiscount(productToEdit.discount || 0);
      setWarrantyMonths(productToEdit.warrantyMonths || 0);
      setDescription(productToEdit.description || '');
    } else {
      // Default new product values
      setName('');
      setBanglaName('');
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      setSku(`SKU-${randomCode}`);
      setBarcode(`8941${Date.now().toString().slice(-8)}`);
      setCategory(categories[0]?.name || 'Groceries');
      setBrand('');
      setUnit('পিস');
      setPurchasePrice(0);
      setSellingPrice(0);
      setOpeningStock(10);
      setCurrentStock(10);
      setMinStockAlert(5);
      setTaxPercent(0);
      setDiscount(0);
      setWarrantyMonths(0);
      setDescription('');
    }
  }, [productToEdit, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const product: Product = {
      id: productToEdit ? productToEdit.id : 'prod-' + Date.now(),
      name: name.trim(),
      banglaName: banglaName.trim() || name.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: barcode.trim() || `8941${Date.now().toString().slice(-8)}`,
      category: category || categories[0]?.name || 'Groceries',
      brand: brand.trim(),
      unit: unit.trim() || 'পিস',
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      openingStock: Number(openingStock) || 0,
      currentStock: productToEdit ? Number(currentStock) : Number(openingStock),
      minStockAlert: Number(minStockAlert) || 5,
      taxPercent: Number(taxPercent) || 0,
      discount: Number(discount) || 0,
      warrantyMonths: Number(warrantyMonths) || 0,
      description: description.trim(),
      status: 'active',
      createdAt: productToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(product);
    onClose();
  };

  const generateBarcode = () => {
    setBarcode(`8941${Date.now().toString().slice(-8)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>{productToEdit ? (lang === 'bn' ? 'পণ্য সম্পাদনা করুন' : 'Edit Product') : (lang === 'bn' ? 'নতুন পণ্য যোগ করুন' : 'Add New Product')}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#18223a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English / Primary Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.productName} (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Pran Miniket Rice 5kg"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Bengali Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.banglaName} (বাংলা)
              </label>
              <input
                type="text"
                value={banglaName}
                onChange={e => setBanglaName(e.target.value)}
                placeholder="যেমন: প্রাণ চিনিগুঁড়া চাল ৫ কেজি"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.category} *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.banglaName || c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'bn' ? 'ব্র্যান্ড / কোম্পানি' : 'Brand / Company'}
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Walton, Pran, ACI"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.unit} (পিস, কেজি, লিটার)
              </label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="পিস, কেজি, প্যাকেট..."
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Barcode */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {t.barcode}
                </label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'অটো জেনারেট' : 'Auto Generate'}</span>
                </button>
              </div>
              <div className="relative">
                <BarcodeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.sku}
              </label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#090d18] border border-[#192238]">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                {t.purchasePrice} ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={purchasePrice}
                onChange={e => setPurchasePrice(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-indigo-300 block mb-1">
                {t.sellingPrice} ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={sellingPrice}
                onChange={e => setSellingPrice(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-indigo-300 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                {productToEdit ? t.stock : (lang === 'bn' ? 'প্রারম্ভিক স্টক' : 'Opening Stock')}
              </label>
              <input
                type="number"
                min="0"
                value={productToEdit ? currentStock : openingStock}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (productToEdit) setCurrentStock(val);
                  else setOpeningStock(val);
                }}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-amber-400 block mb-1">
                {t.alertQty}
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={e => setMinStockAlert(Number(e.target.value))}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-amber-400 font-bold"
              />
            </div>
          </div>

          {/* Warranty & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'bn' ? 'ওয়ারেন্টি (মাসের সংখ্যা)' : 'Warranty (Months)'}
              </label>
              <input
                type="number"
                min="0"
                value={warrantyMonths}
                onChange={e => setWarrantyMonths(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'bn' ? 'ছাড় / Discount (৳)' : 'Discount (৳)'}
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#1e2a47] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
