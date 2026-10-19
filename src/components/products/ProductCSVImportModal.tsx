import React, { useState, useRef } from 'react';
import {
  X, Upload, FileSpreadsheet, Download, Check, AlertTriangle,
  RefreshCw, CheckCircle2, ArrowRight, Layers, HelpCircle,
  FileText, Plus, Database, Sparkles, Filter
} from 'lucide-react';
import { Product, Category, BusinessSettings, Language } from '../../types';
import { StorageService } from '../../services/storage';

interface ProductCSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProducts: Product[];
  categories: Category[];
  settings: BusinessSettings;
  lang: Language;
  onImportSuccess?: () => void;
}

interface ParsedRow {
  index: number;
  raw: Record<string, string>;
  product: Partial<Product>;
  isExisting: boolean;
  existingProduct?: Product;
  isValid: boolean;
  errors: string[];
}

export const ProductCSVImportModal: React.FC<ProductCSVImportModalProps> = ({
  isOpen,
  onClose,
  existingProducts,
  categories,
  settings,
  lang,
  onImportSuccess
}) => {
  if (!isOpen) return null;
  const isBn = lang === 'bn';

  // State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importMode, setImportMode] = useState<'update_or_add' | 'skip_existing' | 'all_new'>('update_or_add');
  const [filterTab, setFilterTab] = useState<'all' | 'new' | 'update' | 'error'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; total: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert Bengali digits (০-৯) to standard numbers (0-9)
  const parseNum = (val: any): number => {
    if (val === undefined || val === null) return 0;
    const str = String(val).trim();
    const bnMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    const normalized = str.replace(/[০-৯]/g, d => bnMap[d] || d)
      .replace(/[৳$,Tk\s]/gi, '')
      .replace(/,/g, '');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  // Robust CSV parser supporting quotes, commas, semicolon, tab, and linebreaks
  const parseCSVText = (text: string) => {
    // Remove UTF-8 BOM if present
    const cleanText = text.replace(/^\uFEFF/, '').trim();
    if (!cleanText) return;

    // Detect delimiter (comma vs semicolon vs tab)
    const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || '';
    let delimiter = ',';
    if (firstLine.includes(';') && (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0)) {
      delimiter = ';';
    } else if (firstLine.includes('\t') && !firstLine.includes(',')) {
      delimiter = '\t';
    }

    // Split text into tokens handling quoted fields with internal commas/linebreaks
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) {
      alert(isBn ? 'CSV ফাইলে কোনো ডেটা পাওয়া যায়নি বা শুধু হেডার আছে।' : 'No data rows found in CSV file.');
      return;
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());

    // Header alias mappings (English and Bangla)
    const findHeaderIndex = (aliases: string[]) => {
      return headers.findIndex(h => aliases.some(alias => h === alias || h.includes(alias)));
    };

    const nameIdx = findHeaderIndex(['name', 'product name', 'title', 'নাম', 'পণ্যের নাম']);
    const banglaNameIdx = findHeaderIndex(['bangla name', 'banglaname', 'bangla', 'বাংলা নাম', 'বাংলা']);
    const categoryIdx = findHeaderIndex(['category', 'cat', 'ক্যাটাগরি', 'বিভাগ']);
    const skuIdx = findHeaderIndex(['sku', 'code', 'item code', 'কোড', 'এসকেইউ']);
    const barcodeIdx = findHeaderIndex(['barcode', 'bar code', 'upc', 'ean', 'বারকোড']);
    const purchasePriceIdx = findHeaderIndex(['cost', 'purchase price', 'purchaseprice', 'buy price', 'ক্রয়মূল্য', 'কেনা দাম']);
    const sellingPriceIdx = findHeaderIndex(['price', 'selling price', 'sellingprice', 'mrp', 'sale price', 'বিক্রয়মূল্য', 'বিক্রি দাম']);
    const stockIdx = findHeaderIndex(['stock', 'current stock', 'currentstock', 'qty', 'quantity', 'স্টক', 'পরিমাণ']);
    const unitIdx = findHeaderIndex(['unit', 'uom', 'একক']);
    const minAlertIdx = findHeaderIndex(['alert', 'min stock', 'minstockalert', 'সর্বনিম্ন স্টক']);
    const godownStockIdx = findHeaderIndex(['godown', 'godown stock', 'godownstock', 'গুদাম স্টক']);

    const existingMap = new Map<string, Product>();
    existingProducts.forEach(p => {
      if (p.sku) existingMap.set(p.sku.toLowerCase().trim(), p);
      if (p.barcode) existingMap.set(p.barcode.trim(), p);
      if (p.name) existingMap.set(p.name.toLowerCase().trim(), p);
    });

    const parsed: ParsedRow[] = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const rawObj: Record<string, string> = {};
      row.forEach((val, c) => {
        if (headers[c]) rawObj[headers[c]] = val;
      });

      const name = nameIdx >= 0 ? row[nameIdx]?.trim() : (row[0]?.trim() || '');
      const banglaName = banglaNameIdx >= 0 ? row[banglaNameIdx]?.trim() : '';
      const category = categoryIdx >= 0 && row[categoryIdx] ? row[categoryIdx].trim() : 'General';
      const rawSku = skuIdx >= 0 ? row[skuIdx]?.trim() : '';
      const rawBarcode = barcodeIdx >= 0 ? row[barcodeIdx]?.trim() : '';
      const purchasePrice = purchasePriceIdx >= 0 ? parseNum(row[purchasePriceIdx]) : 0;
      const sellingPrice = sellingPriceIdx >= 0 ? parseNum(row[sellingPriceIdx]) : 0;
      const stock = stockIdx >= 0 ? parseNum(row[stockIdx]) : 0;
      const unit = unitIdx >= 0 && row[unitIdx] ? row[unitIdx].trim() : 'pcs';
      const minAlert = minAlertIdx >= 0 ? parseNum(row[minAlertIdx]) : 5;
      const godownStock = godownStockIdx >= 0 ? parseNum(row[godownStockIdx]) : 0;

      const errors: string[] = [];
      if (!name) {
        errors.push(isBn ? 'পণ্যের নাম অনুপস্থিত' : 'Product name missing');
      }
      if (sellingPrice <= 0 && purchasePrice <= 0) {
        errors.push(isBn ? 'মূল্য ০ বা অনুপস্থিত' : 'Price is 0 or missing');
      }

      // Check if existing product
      let existingMatch: Product | undefined;
      if (rawSku && existingMap.has(rawSku.toLowerCase())) {
        existingMatch = existingMap.get(rawSku.toLowerCase());
      } else if (rawBarcode && existingMap.has(rawBarcode)) {
        existingMatch = existingMap.get(rawBarcode);
      } else if (name && existingMap.has(name.toLowerCase())) {
        existingMatch = existingMap.get(name.toLowerCase());
      }

      const generatedSku = rawSku || (existingMatch ? existingMatch.sku : `SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      const generatedBarcode = rawBarcode || (existingMatch ? existingMatch.barcode : `8941${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`);

      const productObj: Partial<Product> = {
        id: existingMatch ? existingMatch.id : undefined,
        name,
        banglaName: banglaName || (existingMatch ? existingMatch.banglaName : ''),
        category,
        sku: generatedSku,
        barcode: generatedBarcode,
        purchasePrice,
        sellingPrice,
        currentStock: stock,
        unit,
        minStockAlert: minAlert,
        godownStock,
        status: 'active'
      };

      parsed.push({
        index: r,
        raw: rawObj,
        product: productObj,
        isExisting: !!existingMatch,
        existingProduct: existingMatch,
        isValid: errors.length === 0,
        errors
      });
    }

    setParsedRows(parsed);
  };

  // Handle file select
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        parseCSVText(text);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Download Sample Template CSV
  const handleDownloadSampleCSV = () => {
    const sampleHeaders = ['Name', 'Bangla Name', 'Category', 'SKU', 'Barcode', 'Cost', 'Price', 'Stock', 'Unit', 'Min Alert'];
    const sampleData = [
      ['Miniket Rice 25kg', 'মিনিকেট চাল ২৫ কেজি', 'মুদি ও চাল (Grocery)', 'SKU-1001', '894100010011', '1650', '1850', '40', 'বস্তা', '10'],
      ['Rupchanda Soybean Oil 5L', 'রূপচাঁদা সয়াবিন তেল ৫ লিটার', 'তেল ও ঘি (Oil)', 'SKU-1002', '894100010022', '820', '890', '25', 'বোতল', '5'],
      ['Dano Milk Powder 1kg', 'ডানো দুধ ১ কেজি', 'দুগ্ধজাত (Dairy)', 'SKU-1003', '894100010033', '740', '820', '15', 'প্যাকেট', '4'],
      ['Aci Pure Salt 1kg', 'এসিআই পিওর লবণ ১ কেজি', 'মুদি ও চাল (Grocery)', 'SKU-1004', '894100010044', '35', '42', '60', 'কেজি', '15']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
      sampleHeaders.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AmarDokan_Product_Import_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execute Batch Import
  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const productsToSave: Product[] = [];

        parsedRows.forEach(row => {
          if (!row.product.name) return; // skip rows without name

          if (row.isExisting && importMode === 'skip_existing') {
            return; // skip existing
          }

          const existing = row.existingProduct;
          const p = row.product;

          const finalProduct: Product = {
            id: (importMode !== 'all_new' && existing) ? existing.id : `prod-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            name: p.name || 'Product',
            banglaName: p.banglaName || '',
            category: p.category || (existing ? existing.category : 'General'),
            sku: p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            barcode: p.barcode || `8941${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`,
            unit: p.unit || 'pcs',
            purchasePrice: Number(p.purchasePrice) || 0,
            sellingPrice: Number(p.sellingPrice) || 0,
            openingStock: Number(p.currentStock) || 0,
            currentStock: Number(p.currentStock) || 0,
            minStockAlert: Number(p.minStockAlert) || 5,
            godownStock: Number(p.godownStock) || 0,
            taxPercent: 0,
            discount: 0,
            status: 'active',
            createdAt: (importMode !== 'all_new' && existing) ? existing.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          productsToSave.push(finalProduct);
        });

        // Batch save into storage & trigger firestore backup
        const result = StorageService.batchSaveProducts(productsToSave);
        setImportResult(result);
        setIsProcessing(false);

        if (onImportSuccess) {
          onImportSuccess();
        }
      } catch (err) {
        console.error('Import execution error:', err);
        alert(isBn ? 'ইমপোর্ট করার সময় একটি ত্রুটি ঘটেছে।' : 'An error occurred during import.');
        setIsProcessing(false);
      }
    }, 150);
  };

  // Filtered rows for preview
  const displayRows = parsedRows.filter(r => {
    if (filterTab === 'new') return !r.isExisting && r.isValid;
    if (filterTab === 'update') return r.isExisting && r.isValid;
    if (filterTab === 'error') return !r.isValid;
    return true;
  });

  const countNew = parsedRows.filter(r => !r.isExisting && r.isValid).length;
  const countUpdate = parsedRows.filter(r => r.isExisting && r.isValid).length;
  const countErrors = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 md:p-6 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-5xl bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 md:p-5 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isBn ? 'CSV ফাইল থেকে পণ্য ব্যাচ ইমপোর্ট' : 'Batch Import Products via CSV'}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                  {isBn ? 'এক্সেল / স্প্রেডশিট' : 'Excel / CSV Ready'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'একসাথে শত শত পণ্য, মূল্য ও স্টক ইনভেন্টরি মুহূর্তেই লোড করুন'
                  : 'Instantly bulk-load hundreds of products, stock levels and prices'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSampleCSV}
              className="px-3 py-1.5 rounded-xl bg-[#162138] hover:bg-[#1f2e4f] border border-[#27385e] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isBn ? 'নমুনা টেমপ্লেট CSV ফাইল ডাউনলোড' : 'Download sample template CSV'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'নমুনা টেমপ্লেট ডাউনলোড' : 'Download Sample CSV'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Success Banner if finished */}
          {importResult && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isBn ? 'ইমপোর্ট সফলভাবে সম্পন্ন হয়েছে!' : 'Import Completed Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-300">
                    {isBn
                      ? `মোট ${importResult.total}টি পণ্য প্রক্রিয়া করা হয়েছে (${importResult.added}টি নতুন যোগ এবং ${importResult.updated}টি আপডেট)।`
                      : `Successfully processed ${importResult.total} products (${importResult.added} new, ${importResult.updated} updated).`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md whitespace-nowrap cursor-pointer"
              >
                {isBn ? 'পণ্য তালিকা দেখুন' : 'View Products'}
              </button>
            </div>
          )}

          {/* Upload Dropzone */}
          {!importResult && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-950/30'
                  : 'border-[#243354] hover:border-indigo-500/70 bg-[#090e1c] hover:bg-[#0d1428]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv, .txt"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {fileName ? (
                    <span className="text-indigo-300 font-mono">{fileName}</span>
                  ) : (
                    isBn ? 'আপনার CSV ফাইলটি এখানে টেনে আনুন বা ক্লিক করে সিলেক্ট করুন' : 'Drag & drop your CSV file here, or click to browse'
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isBn
                    ? 'সমর্থিত ফরম্যাট: .csv ফাইল (কমা বা সেমিকোলন দ্বারা বিভক্ত UTF-8 ফাইল)'
                    : 'Supported format: .csv files (Comma or semicolon delimited with UTF-8 encoding)'}
                </p>
              </div>
            </div>
          )}

          {/* Quick Help & Column Spec */}
          {!parsedRows.length && !importResult && (
            <div className="p-4 bg-[#0a101f] border border-[#1b2640] rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>{isBn ? 'CSV কলামের নির্দেশিকা ও কলাম হেডারসমূহ:' : 'CSV Column Guidelines & Header Support:'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 font-mono">
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-indigo-400 font-bold block">Name / নাম *</span>
                  <span className="text-[10px] text-slate-400">পণ্যের মূল নাম (আবশ্যক)</span>
                </div>
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-indigo-400 font-bold block">Price / বিক্রয়মূল্য *</span>
                  <span className="text-[10px] text-slate-400">খুচরা বিক্রয়মূল্য (MRP)</span>
                </div>
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-indigo-400 font-bold block">Cost / ক্রয়মূল্য</span>
                  <span className="text-[10px] text-slate-400">কেনা দাম বা পাইকারি রেট</span>
                </div>
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-indigo-400 font-bold block">Stock / স্টক</span>
                  <span className="text-[10px] text-slate-400">বর্তমান মওজুদ পরিমাণ</span>
                </div>
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-slate-300 font-bold block">Bangla Name / বাংলা নাম</span>
                  <span className="text-[10px] text-slate-400">বাংলা বিবরণ (ঐচ্ছিক)</span>
                </div>
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-slate-300 font-bold block">Category / ক্যাটাগরি</span>
                  <span className="text-[10px] text-slate-400">স্বয়ংক্রিয় যোগ হবে</span>
                </div>
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-slate-300 font-bold block">SKU & Barcode</span>
                  <span className="text-[10px] text-slate-400">ফাঁকা থাকলে অটো তৈরি হবে</span>
                </div>
                <div className="p-2 rounded-lg bg-[#11182c] border border-[#1e2a47]">
                  <span className="text-slate-300 font-bold block">Unit / একক</span>
                  <span className="text-[10px] text-slate-400">ডিফল্ট: pcs / কেজি / লিটার</span>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedRows.length > 0 && !importResult && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Controls bar: Import Mode + Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-[#11182c] rounded-xl border border-[#1e2a47]">
                
                {/* Import Mode selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
                    {isBn ? 'ইমপোর্ট মোড:' : 'Import Mode:'}
                  </span>
                  <select
                    value={importMode}
                    onChange={e => setImportMode(e.target.value as any)}
                    className="bg-[#0b0f19] border border-[#243354] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="update_or_add">
                      {isBn ? 'বিদ্যমান আপডেট করুন ও নতুন যোগ করুন (প্রস্তাবিত)' : 'Update existing & Add new (Recommended)'}
                    </option>
                    <option value="skip_existing">
                      {isBn ? 'শুধুমাত্র নতুন পণ্য যোগ করুন (বিদ্যমান স্কিপ)' : 'Skip existing (Add only new)'}
                    </option>
                    <option value="all_new">
                      {isBn ? 'সবগুলোকে নতুন পণ্য হিসেবে যোগ করুন' : 'Add all as new products'}
                    </option>
                  </select>
                </div>

                {/* Filter counts */}
                <div className="flex items-center gap-1.5 bg-[#080d1a] p-1 rounded-xl border border-[#1e2a47]">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      filterTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isBn ? 'সব' : 'All'} ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('new')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      filterTab === 'new' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <span>{isBn ? 'নতুন' : 'New'}</span>
                    <span className="bg-emerald-950 px-1 rounded text-[10px]">{countNew}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('update')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      filterTab === 'update' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <span>{isBn ? 'আপডেট' : 'Update'}</span>
                    <span className="bg-amber-950 px-1 rounded text-[10px]">{countUpdate}</span>
                  </button>
                  {countErrors > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterTab('error')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        filterTab === 'error' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <span>{isBn ? 'ত্রুটি' : 'Errors'}</span>
                      <span className="bg-rose-950 px-1 rounded text-[10px]">{countErrors}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="border border-[#1e2a47] rounded-xl overflow-hidden bg-[#0a0f1d] max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#11182c] border-b border-[#1e2a47] text-slate-400 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-16">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="py-2.5 px-3">{isBn ? 'পণ্যের নাম' : 'Product Name'}</th>
                      <th className="py-2.5 px-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                      <th className="py-2.5 px-3 font-mono">SKU / Barcode</th>
                      <th className="py-2.5 px-3 text-right">{isBn ? 'কেনা দাম' : 'Cost'}</th>
                      <th className="py-2.5 px-3 text-right">{isBn ? 'বিক্রয়মূল্য' : 'Price'}</th>
                      <th className="py-2.5 px-3 text-right">{isBn ? 'স্টক' : 'Stock'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17223b]">
                    {displayRows.map((r, idx) => {
                      const p = r.product;
                      return (
                        <tr key={idx} className="hover:bg-[#121a30] transition-colors">
                          <td className="py-2 px-3">
                            {!r.isValid ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                {isBn ? 'ত্রুটি' : 'Error'}
                              </span>
                            ) : r.isExisting ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                {isBn ? 'আপডেট' : 'Update'}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                {isBn ? 'নতুন' : 'New'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 min-w-[160px]">
                            <div className="font-bold text-white leading-tight">{p.name || '—'}</div>
                            {p.banglaName && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{p.banglaName}</div>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span className="bg-[#18233d] text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-medium border border-indigo-700/40">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-300">
                            <div>{p.sku}</div>
                            {p.barcode && <div className="text-[10px] text-slate-500">{p.barcode}</div>}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-400">
                            {settings.currencySymbol || '৳'}{p.purchasePrice}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-400">
                            {settings.currencySymbol || '৳'}{p.sellingPrice}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400 font-mono">
                            {p.currentStock} {p.unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#11182c] border-t border-[#1e2a47] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {parsedRows.length > 0 && !importResult ? (
              <span>
                {isBn ? 'মোট' : 'Total'} <b className="text-white">{parsedRows.length}</b> {isBn ? 'টি পণ্য পাওয়া গেছে' : 'products found in CSV'}
              </span>
            ) : (
              <span>{isBn ? 'প্রস্তুত' : 'Ready'}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>

            {parsedRows.length > 0 && !importResult && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isProcessing || parsedRows.length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950 cursor-pointer disabled:opacity-50 transition"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'ইমপোর্ট করা হচ্ছে...' : 'Importing...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{isBn ? `${parsedRows.length}টি পণ্য ইমপোর্ট সম্পন্ন করুন` : `Import ${parsedRows.length} Products`}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
