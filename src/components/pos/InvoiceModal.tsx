import React from 'react';
import { X, Printer, Download, CheckCircle, Share2 } from 'lucide-react';
import { Sale, BusinessSettings, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface InvoiceModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  lang: Language;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  sale,
  isOpen,
  onClose,
  settings,
  lang
}) => {
  if (!isOpen || !sale) return null;
  const t = translations[lang];

  const [isDownloading, setIsDownloading] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      await PDFGenerator.generateInvoicePDF(sale, settings);
    } catch (err) {
      console.error('Invoice PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Compile active tax registration badges
  const taxRegistrationBadges: { label: string; value: string }[] = [];
  if (settings.binTin) {
    taxRegistrationBadges.push({ label: 'BIN', value: settings.binTin });
  }
  if (settings.vatRegNo && settings.vatRegNo !== settings.binTin) {
    taxRegistrationBadges.push({ label: 'VAT Reg', value: settings.vatRegNo });
  }
  if (settings.tinNo) {
    taxRegistrationBadges.push({ label: 'TIN', value: settings.tinNo });
  }
  if (settings.tradeLicenseNo) {
    taxRegistrationBadges.push({ label: 'Trade Lic', value: settings.tradeLicenseNo });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in print:p-0 print:static print:bg-white">
      <div className="w-full max-w-lg bg-[#0e1424] border border-[#1e2a47] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Header Bar */}
        <div className="no-print p-4 bg-[#11182c] border-b border-[#1e2a47] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                {lang === 'bn' ? 'ইনভয়েস প্রস্তুত' : 'Invoice Generated'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {sale.invoiceNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 rounded-xl bg-[#18223a] hover:bg-[#202c4b] border border-[#233153] text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{t.print}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#18223a]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div id="printable-invoice" className="p-6 bg-white text-neutral-900 text-xs overflow-y-auto max-h-[75vh] print:max-h-none print:p-2 print:overflow-visible font-sans">
          
          {/* Statutory Tax Label if present */}
          {settings.taxRegistrationLabel && (
            <div className="text-center pb-2 mb-2 border-b border-dashed border-neutral-300">
              <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                {settings.taxRegistrationLabel}
              </span>
            </div>
          )}

          {/* Shop Header */}
          {settings.invoiceHeaderLayout === 'split' ? (
            /* Split layout (Logo left, details right) */
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-300">
              {settings.showLogoOnInvoice !== false && settings.logoUrl && (
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  <img
                    src={settings.logoUrl}
                    alt={settings.businessName}
                    className="max-h-16 max-w-16 object-contain"
                  />
                </div>
              )}
              <div className="text-right flex-1">
                <h2 className="text-base font-black tracking-tight uppercase text-neutral-900 leading-tight">
                  {settings.businessName}
                </h2>
                {settings.businessSubtitle && (
                  <p className="text-[10px] text-neutral-600 font-semibold">{settings.businessSubtitle}</p>
                )}
                <p className="text-[10px] text-neutral-600 mt-0.5">{settings.address}</p>
                <p className="text-[10px] text-neutral-600 font-mono">ফোন: {settings.phone}</p>
              </div>
            </div>
          ) : (
            /* Center / Compact Layout */
            <div className="text-center pb-3 border-b border-neutral-300">
              {settings.showLogoOnInvoice !== false && settings.logoUrl && (
                <div className="flex justify-center mb-2">
                  <img
                    src={settings.logoUrl}
                    alt={settings.businessName}
                    className={`${settings.invoiceHeaderLayout === 'compact' ? 'max-h-10 max-w-10' : 'max-h-14 max-w-14'} object-contain`}
                  />
                </div>
              )}
              <h2 className="text-lg font-black tracking-tight uppercase text-neutral-900">
                {settings.businessName}
              </h2>
              {settings.businessSubtitle && (
                <p className="text-[11px] text-neutral-600 font-medium">{settings.businessSubtitle}</p>
              )}
              <p className="text-[11px] text-neutral-600">{settings.address}</p>
              <p className="text-[11px] text-neutral-600 font-mono">ফোন: {settings.phone}</p>
            </div>
          )}

          {/* Tax Registration Numbers Ribbon */}
          {taxRegistrationBadges.length > 0 && (
            <div className="my-2 py-1.5 px-2 bg-neutral-50 rounded border border-neutral-200 text-center text-[10px] font-mono text-neutral-800 space-y-0.5">
              <div className="flex items-center justify-center gap-2 flex-wrap font-semibold">
                {taxRegistrationBadges.map((tax, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <strong className="text-neutral-900 font-bold">{tax.label}:</strong>
                    <span>{tax.value}</span>
                    {i < taxRegistrationBadges.length - 1 && <span className="text-neutral-400">|</span>}
                  </span>
                ))}
              </div>
              {settings.invoiceHeaderNote && (
                <p className="text-[9px] text-neutral-500 font-sans italic">
                  {settings.invoiceHeaderNote}
                </p>
              )}
            </div>
          )}

          {/* Invoice Meta */}
          <div className="py-2.5 border-b border-neutral-200 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p><span className="font-bold">ইনভয়েস:</span> {sale.invoiceNo}</p>
              <p><span className="font-bold">ক্রেতা:</span> {sale.customerName}</p>
              {sale.customerPhone && <p><span className="font-bold">ফোন:</span> {sale.customerPhone}</p>}
            </div>
            <div className="text-right">
              <p><span className="font-bold">{settings.invoiceHeaderTitle || 'তারিখ'}:</span> {sale.date}</p>
              <p><span className="font-bold">ক্যাশিয়ার:</span> {sale.cashierName || 'Admin'}</p>
              <p><span className="font-bold">মাধ্যম:</span> {sale.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          {/* Item Table */}
          <table className="w-full my-3 text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-800 text-[11px]">
                <th className="py-1">পণ্য</th>
                <th className="py-1 text-center">পরিমাণ</th>
                <th className="py-1 text-right">দর</th>
                <th className="py-1 text-right">মোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 font-medium">{item.productName}</td>
                  <td className="py-1.5 text-center">{item.quantity}</td>
                  <td className="py-1.5 text-right">{settings.currencySymbol}{item.unitPrice}</td>
                  <td className="py-1.5 text-right font-semibold">{settings.currencySymbol}{item.lineTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="pt-2 border-t-2 border-neutral-800 space-y-1 text-right">
            <div className="flex justify-between">
              <span className="text-neutral-600">উপ-মোট (Subtotal):</span>
              <span className="font-semibold">{settings.currencySymbol}{sale.subtotal}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>ছাড় (Discount):</span>
                <span>- {settings.currencySymbol}{sale.discount}</span>
              </div>
            )}
            {sale.vat > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>ভ্যাট (VAT {settings.vatPercent}%):</span>
                <span>+ {settings.currencySymbol}{sale.vat}</span>
              </div>
            )}
            {sale.deliveryCharge > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>ডেলিভারি চার্জ:</span>
                <span>+ {settings.currencySymbol}{sale.deliveryCharge}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-neutral-300 pt-1">
              <span>সর্বমোট (Grand Total):</span>
              <span>{settings.currencySymbol}{sale.grandTotal}</span>
            </div>
            <div className="flex justify-between text-neutral-800">
              <span>পরিশোধিত (Paid):</span>
              <span className="font-semibold">{settings.currencySymbol}{sale.paidAmount}</span>
            </div>
            {sale.dueAmount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>বকেয়া (Due):</span>
                <span>{settings.currencySymbol}{sale.dueAmount}</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-3 border-t border-neutral-300 text-center text-[10px] text-neutral-500">
            <p>{settings.invoiceFooterText}</p>
            <p className="mt-1 font-mono">AmarDokan Smart POS System</p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="no-print p-4 bg-[#11182c] border-t border-[#1e2a47] flex items-center justify-between">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(
                `Invoice: ${sale.invoiceNo}\nCustomer: ${sale.customerName}\nTotal: ${settings.currencySymbol}${sale.grandTotal}\nPaid: ${settings.currencySymbol}${sale.paidAmount}\nDue: ${settings.currencySymbol}${sale.dueAmount}`
              );
              alert(lang === 'bn' ? 'ইনভয়েস কপি করা হয়েছে!' : 'Invoice copied to clipboard!');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'তথ্য কপি করুন' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#19223a] hover:bg-[#202c4b] text-slate-300 hover:text-white text-xs font-semibold"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
