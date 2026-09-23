import React, { useState } from 'react';
import {
  Printer, CheckCircle2, Sliders, Play, Check
} from 'lucide-react';
import { Language, PrintCustomConfig, BusinessSettings } from '../../../types';
import { SettingsService } from '../../../services/settingsService';

interface PrintSectionProps {
  lang: Language;
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
}

export const PrintSection: React.FC<PrintSectionProps> = ({
  lang,
  settings,
  onSaveSettings
}) => {
  const isBn = lang === 'bn';

  const [printConfig, setPrintConfig] = useState<PrintCustomConfig>(SettingsService.getPrintConfig());
  const [notification, setNotification] = useState('');

  const handleChange = (field: keyof PrintCustomConfig, value: any) => {
    const updated = { ...printConfig, [field]: value };
    setPrintConfig(updated);
    SettingsService.savePrintConfig(updated);

    // Sync paperSize to BusinessSettings
    if (field === 'paperSize') {
      onSaveSettings({
        ...settings,
        paperSize: value === '80mm' ? '80mm' : value === '58mm' ? '58mm' : 'a4'
      });
    }

    setNotification(isBn ? 'প্রিন্ট কনফিগারেশন সংরক্ষিত হয়েছে!' : 'Print settings saved!');
    setTimeout(() => setNotification(''), 2500);
  };

  const handleTestPrint = () => {
    // Open a printable test iframe or window
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) {
      alert(isBn ? 'ব্রাউজার পপআপ ব্লক করা আছে। অনুগ্রহ করে অনুমতি দিন।' : 'Pop-up blocked. Please allow popups to test print.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Print - AmarDokan</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: ${printConfig.marginTopMm}mm ${printConfig.marginRightMm}mm ${printConfig.marginBottomMm}mm ${printConfig.marginLeftMm}mm;
              font-size: ${printConfig.paperSize.includes('mm') ? '12px' : '14px'};
              width: ${printConfig.paperSize === '80mm' ? '76mm' : printConfig.paperSize === '58mm' ? '54mm' : 'auto'};
            }
            .header { text-align: center; border-bottom: 1px dashed #444; padding-bottom: 8px; margin-bottom: 8px; }
            .title { font-size: 16px; font-weight: bold; }
            .item-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-weight: bold; border-top: 1px solid #444; padding-top: 4px; margin-top: 6px; }
            .footer { text-align: center; font-size: 10px; margin-top: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${settings.businessName || 'AmarDokan'}</div>
            <div>${settings.address || 'Dhaka, Bangladesh'}</div>
            <div>Cell: ${settings.phone || '01700-000000'}</div>
            <div style="margin-top:4px; font-size:11px;">*** TEST PRINT RECEIPT ***</div>
          </div>
          <div><strong>Paper Size:</strong> ${printConfig.paperSize.toUpperCase()}</div>
          <div><strong>Printer:</strong> ${printConfig.printerName}</div>
          <div><strong>Timestamp:</strong> ${new Date().toLocaleString()}</div>
          <hr style="border:none; border-top:1px dashed #888; margin:8px 0;" />
          <div class="item-row"><span>Sample Item A</span><span>${settings.currencySymbol || '৳'} 450.00</span></div>
          <div class="item-row"><span>Sample Item B (x2)</span><span>${settings.currencySymbol || '৳'} 800.00</span></div>
          <div class="item-row total"><span>TOTAL BILL</span><span>${settings.currencySymbol || '৳'} 1,250.00</span></div>
          <div class="footer">
            <div>Printer alignment verification successful!</div>
            <div>AmarDokan Smart Business POS</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2a47] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <span>{isBn ? 'প্রিন্টার ও প্রিন্ট কনফিগারেশন' : 'Printer & Paper Layout Settings'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'থার্মাল পিওএস রসিদ ও সাধারণ এ৪ প্রিন্টারের মার্জিন এবং অটো-প্রিন্ট নির্ধারণ করুন'
              : 'Configure POS thermal printers, paper dimensions, margins, and automatic print commands'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestPrint}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isBn ? 'টেস্ট প্রিন্ট দিন (Test Print)' : 'Execute Test Print'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Paper Size Selector */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? '১. কাগজের সাইজ ও মাপ (Paper Size)' : '1. Paper Dimensions'}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: '80mm', name: 'Thermal 80mm (৩ ইঞ্চি)', desc: 'স্ট্যান্ডার্ড POS রসিদ' },
            { id: '58mm', name: 'Thermal 58mm (২ ইঞ্চি)', desc: 'ছোট মোবাইল প্রিন্টার' },
            { id: 'a4', name: 'A4 Paper (ফুল পেপার)', desc: 'অফিসিয়াল বড় ইনভয়েস' },
            { id: 'a5', name: 'A5 Paper (হাফ পেপার)', desc: 'হাফ শিট ইনভয়েস' }
          ].map(paper => (
            <button
              key={paper.id}
              type="button"
              onClick={() => handleChange('paperSize', paper.id)}
              className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                printConfig.paperSize === paper.id
                  ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500 shadow-md shadow-indigo-950/30'
                  : 'bg-[#0b101d] border-[#1e2a47] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{paper.name}</span>
                {printConfig.paperSize === paper.id && (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400">{paper.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Printer Name & Hardware Options */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? '২. প্রিন্টার হার্ডওয়্যার ও অপশন' : '2. Printer Name & Behavior'}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'প্রিন্টারের নাম' : 'Printer Name'}
            </label>
            <input
              type="text"
              value={printConfig.printerName}
              onChange={e => handleChange('printerName', e.target.value)}
              placeholder="POS-80 Series Thermal Printer"
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'কপির সংখ্যা (Copies)' : 'Default Copies'}
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={printConfig.copiesCount}
              onChange={e => handleChange('copiesCount', Number(e.target.value))}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isBn ? 'প্রিন্টার টাইপ' : 'Default Printer Target'}
            </label>
            <select
              value={printConfig.defaultPrinter}
              onChange={e => handleChange('defaultPrinter', e.target.value)}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="System Default">{isBn ? 'সিস্টেম ডিফল্ট প্রিন্টার' : 'System Default'}</option>
              <option value="POS-80 Thermal">POS-80 Thermal USB</option>
              <option value="Bluetooth POS">Bluetooth 58mm POS</option>
              <option value="Network IP Printer">Ethernet LAN Printer (Raw 9100)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-[#0b101d] border border-[#1e2a47] cursor-pointer">
            <input
              type="checkbox"
              checked={printConfig.autoPrintAfterSale}
              onChange={e => handleChange('autoPrintAfterSale', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
            <div>
              <span className="text-xs text-white font-semibold block">
                {isBn ? 'বিক্রয় শেষে স্বয়ংক্রিয় প্রিন্ট (Auto Print)' : 'Auto Print on Sale Completion'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isBn ? 'পেমেন্ট সম্পন্ন হওয়ার সাথে সাথে রসিদ প্রিন্ট হবে' : 'Trigger receipt printing directly when completing POS checkout'}
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-[#0b101d] border border-[#1e2a47] cursor-pointer">
            <input
              type="checkbox"
              checked={printConfig.printDuplicateCopy}
              onChange={e => handleChange('printDuplicateCopy', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
            <div>
              <span className="text-xs text-white font-semibold block">
                {isBn ? 'দোকানের জন্য ডুপ্লিকেট কপি (Merchant Copy)' : 'Print Duplicate Merchant Copy'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isBn ? 'এক সাথে দুটি কপি প্রিন্ট হবে (একটি গ্রাহক, একটি দোকান)' : 'Print customer copy and internal shop copy simultaneously'}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Margins */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1e293b] space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? '৩. মার্জিন অ্যাডজাস্টমেন্ট (Margins in Millimeters)' : '3. Margin Adjustments (mm)'}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'শীর্ষ (Top mm)' : 'Top (mm)'}</label>
            <input
              type="number"
              min={0}
              max={30}
              value={printConfig.marginTopMm}
              onChange={e => handleChange('marginTopMm', Number(e.target.value))}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'নিচে (Bottom mm)' : 'Bottom (mm)'}</label>
            <input
              type="number"
              min={0}
              max={30}
              value={printConfig.marginBottomMm}
              onChange={e => handleChange('marginBottomMm', Number(e.target.value))}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'বামে (Left mm)' : 'Left (mm)'}</label>
            <input
              type="number"
              min={0}
              max={30}
              value={printConfig.marginLeftMm}
              onChange={e => handleChange('marginLeftMm', Number(e.target.value))}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{isBn ? 'ডানে (Right mm)' : 'Right (mm)'}</label>
            <input
              type="number"
              min={0}
              max={30}
              value={printConfig.marginRightMm}
              onChange={e => handleChange('marginRightMm', Number(e.target.value))}
              className="w-full bg-[#0b101d] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
