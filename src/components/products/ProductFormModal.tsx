import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Barcode as BarcodeIcon, Sparkles, Plus, Check, Search, Tag, ArrowRight } from 'lucide-react';
import { Product, Category, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  DEFAULT_PRESET_CATEGORIES,
  POPULAR_PRODUCT_CATALOG,
  detectCategoryFromProductName,
  getProductSuggestions,
  ProductSuggestion
} from '../../data/productSuggestions';

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
  const isBn = lang === 'bn';

  // Ensure categories are NEVER empty - use prop categories or rich default catalog
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setLocalCategories(categories);
    } else {
      setLocalCategories(DEFAULT_PRESET_CATEGORIES);
    }
  }, [categories]);

  // Form Fields
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

  // Auto-Suggest & Category Auto-Detect States
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [focusedSuggestionIdx, setFocusedSuggestionIdx] = useState<number>(-1);
  const [autoCategoryDetected, setAutoCategoryDetected] = useState<string | null>(null);

  // New Category inline creation state
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBangla, setNewCatBangla] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
      setAutoCategoryDetected(null);
    } else {
      // Default new product values
      setName('');
      setBanglaName('');
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      setSku(`SKU-${randomCode}`);
      setBarcode(`8941${Date.now().toString().slice(-8)}`);
      
      const initialCat = (categories && categories.length > 0)
        ? categories[0].name
        : (DEFAULT_PRESET_CATEGORIES[0]?.name || 'Groceries');
      setCategory(initialCat);

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
      setAutoCategoryDetected(null);
    }
    setShowSuggestions(false);
  }, [productToEdit, categories, isOpen]);

  // Click outside to close suggestion popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing in English Name
  const handleNameChange = (val: string) => {
    setName(val);
    processAutoSuggestAndCategory(val);
  };

  // Handle typing in Bangla Name
  const handleBanglaNameChange = (val: string) => {
    setBanglaName(val);
    processAutoSuggestAndCategory(val);
  };

  // Process auto suggest and category detection
  const processAutoSuggestAndCategory = (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      const results = getProductSuggestions(trimmed, [], 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setFocusedSuggestionIdx(-1);

      // Auto-detect category
      const detected = detectCategoryFromProductName(trimmed, localCategories);
      if (detected) {
        setCategory(detected);
        const catObj = localCategories.find(c => c.name === detected);
        setAutoCategoryDetected(catObj ? (isBn ? catObj.banglaName : catObj.name) : detected);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setAutoCategoryDetected(null);
    }
  };

  // Apply suggestion selection
  const handleSelectSuggestion = (item: ProductSuggestion) => {
    setName(item.name);
    setBanglaName(item.banglaName);
    setBrand(item.brand);
    setUnit(item.unit);
    if (item.purchasePrice > 0) setPurchasePrice(item.purchasePrice);
    if (item.sellingPrice > 0) setSellingPrice(item.sellingPrice);

    // Find and select matching category
    const matchedCat = localCategories.find(c =>
      c.name.toLowerCase() === item.category.toLowerCase() ||
      (c.banglaName && c.banglaName.toLowerCase().includes(item.categoryBn.toLowerCase()))
    );

    if (matchedCat) {
      setCategory(matchedCat.name);
      setAutoCategoryDetected(isBn ? matchedCat.banglaName : matchedCat.name);
    } else {
      setCategory(item.category);
      setAutoCategoryDetected(item.categoryBn);
    }

    setShowSuggestions(false);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIdx(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIdx(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (focusedSuggestionIdx >= 0 && focusedSuggestionIdx < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[focusedSuggestionIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Inline add new category
  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: 'cat-custom-' + Date.now(),
      name: newCatName.trim(),
      banglaName: newCatBangla.trim() || newCatName.trim(),
      color: '#6366f1',
      productCount: 0
    };

    setLocalCategories(prev => [...prev, newCat]);
    setCategory(newCat.name);
    setIsAddingNewCat(false);
    setNewCatName('');
    setNewCatBangla('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const product: Product = {
      id: productToEdit ? productToEdit.id : 'prod-' + Date.now(),
      name: name.trim(),
      banglaName: banglaName.trim() || name.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: barcode.trim() || `8941${Date.now().toString().slice(-8)}`,
      category: category || localCategories[0]?.name || 'Groceries',
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
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" />
              <span>{productToEdit ? (isBn ? 'পণ্য সম্পাদনা করুন' : 'Edit Product') : (isBn ? 'নতুন পণ্য যোগ করুন' : 'Add New Product')}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBn ? 'নাম লিখলেই স্বয়ংক্রিয় ক্যাটাগরি ও পণ্য সাজেশন পাওয়া যাবে' : 'Smart category detection & instant auto-suggestions as you type'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#18223a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          
          {/* Quick Preset Suggestion Chips */}
          {!productToEdit && !name && (
            <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{isBn ? 'দ্রুত বাছাই করুন (জনপ্রিয় পণ্যসমূহ):' : 'Quick Picks (Popular Items):'}</span>
                </span>
                <span className="text-[10px] text-slate-400">{isBn ? '১-ক্লিকে পূরণ করুন' : '1-click autofill'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PRODUCT_CATALOG.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="px-2.5 py-1 rounded-lg bg-[#141d33] hover:bg-indigo-600/30 border border-[#233152] hover:border-indigo-500/40 text-[11px] text-slate-200 hover:text-white flex items-center gap-1 transition-all"
                  >
                    <span>{item.banglaName.split(' ')[0]} {item.banglaName.split(' ')[1] || ''}</span>
                    <span className="text-amber-400 font-bold text-[10px]">৳{item.sellingPrice}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English / Primary Name with Autocomplete */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {t.productName} (English) *
                </label>
                <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {isBn ? 'অটো সাজেশন' : 'Auto suggest'}
                </span>
              </div>
              <input
                ref={nameInputRef}
                type="text"
                required
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                onFocus={() => {
                  if (name.trim()) processAutoSuggestAndCategory(name);
                }}
                onKeyDown={handleKeyDown}
                placeholder="যেমন: Pran Miniket Chal, Teer Oil, Lux..."
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              />

              {/* Floating Auto-suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0d1322] border border-indigo-500/40 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-[#1e2a47]"
                >
                  <div className="p-2 bg-[#121a30] text-[10px] text-indigo-300 font-bold flex items-center justify-between">
                    <span>{isBn ? '💡 পণ্য সাজেশন (ক্লিক করলে সব পূরণ হবে):' : '💡 Product Suggestions (Click to autofill):'}</span>
                    <span className="text-slate-400">{suggestions.length} {isBn ? 'টি পাওয়া গেছে' : 'found'}</span>
                  </div>
                  {suggestions.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item)}
                      className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                        focusedSuggestionIdx === idx
                          ? 'bg-indigo-600/30 text-white'
                          : 'hover:bg-[#15203a] text-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                            {item.brand}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{item.banglaName}</span>
                          <span className="text-emerald-400 text-[10px]">({item.categoryBn})</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end pl-2">
                        <span className="text-xs font-extrabold text-amber-400">৳{item.sellingPrice}</span>
                        <span className="text-[10px] text-slate-500">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bengali Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.banglaName} (বাংলা)
              </label>
              <input
                type="text"
                value={banglaName}
                onChange={e => handleBanglaNameChange(e.target.value)}
                placeholder="যেমন: প্রাণ চিনিগুঁড়া চাল ৫ কেজি"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category with Auto-Detection & Add Custom */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>{t.category} *</span>
                  {autoCategoryDetected && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse font-bold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {isBn ? 'অটো সিলেক্ট' : 'Auto'}
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isBn ? 'নতুন' : 'New'}</span>
                </button>
              </div>

              {/* Category Select (Guaranteed Never Empty) */}
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  setAutoCategoryDetected(null);
                }}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                {localCategories.map(c => (
                  <option key={c.id} value={c.name} className="py-1">
                    {c.banglaName ? `${c.banglaName} (${c.name})` : c.name}
                  </option>
                ))}
              </select>

              {/* Inline Quick Category Add Form */}
              {isAddingNewCat && (
                <div className="mt-2 p-2 bg-[#101728] border border-indigo-500/30 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>{isBn ? 'নতুন ক্যাটাগরি তৈরি করুন' : 'Add New Category'}</span>
                    <button type="button" onClick={() => setIsAddingNewCat(false)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder={isBn ? 'ক্যাটাগরি নাম (English)' : 'Category Name (English)'}
                    className="w-full bg-[#0a0f1d] border border-[#233152] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={newCatBangla}
                    onChange={e => setNewCatBangla(e.target.value)}
                    placeholder={isBn ? 'বাংলা নাম (ঐচ্ছিক)' : 'Bangla Name (Optional)'}
                    className="w-full bg-[#0a0f1d] border border-[#233152] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="w-full py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    {isBn ? 'যুক্ত ও নির্বাচন করুন' : 'Add & Select'}
                  </button>
                </div>
              )}
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
                placeholder="যেমন: Pran, Teer, ACI, Walton..."
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
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
                placeholder="পিস, কেজি, প্যাকেট, বোতল..."
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
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
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {isBn ? 'অটো জেনারেট' : 'Auto Generate'}
                </button>
              </div>
              <div className="relative">
                <BarcodeIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  placeholder="894100..."
                  className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
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
                placeholder="SKU-8722"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Purchase Price */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.purchasePrice} ({settings.currencySymbol || '৳'}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={purchasePrice === 0 ? '' : purchasePrice}
                onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t.sellingPrice} ({settings.currencySymbol || '৳'}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={sellingPrice === 0 ? '' : sellingPrice}
                onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Opening Stock */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {productToEdit ? (isBn ? 'বর্তমান স্টক' : 'Current Stock') : t.openingStock}
              </label>
              <input
                type="number"
                min="0"
                value={productToEdit ? currentStock : openingStock}
                onChange={e => {
                  const val = parseInt(e.target.value) || 0;
                  if (productToEdit) {
                    setCurrentStock(val);
                  } else {
                    setOpeningStock(val);
                    setCurrentStock(val);
                  }
                }}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Min Stock Alert */}
            <div>
              <label className="text-xs font-semibold text-amber-400 block mb-1">
                {t.minStockAlert}
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={e => setMinStockAlert(parseInt(e.target.value) || 0)}
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Warranty Months */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ওয়ারেন্টি (মাসের সংখ্যা)' : 'Warranty (Months)'}
              </label>
              <input
                type="number"
                min="0"
                value={warrantyMonths === 0 ? '' : warrantyMonths}
                onChange={e => setWarrantyMonths(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isBn ? 'ছাড় / Discount (৳)' : 'Discount (৳)'}
              </label>
              <input
                type="number"
                min="0"
                value={discount === 0 ? '' : discount}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'পণ্যের বিবরণ (ঐচ্ছিক)' : 'Product Description (Optional)'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isBn ? 'পণ্য সম্পর্কিত কোনো বিশেষ নোট বা স্পেসিফিকেশন...' : 'Product notes or details...'}
              className="w-full bg-[#131b2e] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#1e2a47] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#152038] text-xs font-semibold transition"
            >
              {t.cancel}
            </button>
            <button
              id="btn-save-product-modal"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 flex items-center gap-2 active:scale-95 transition"
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
