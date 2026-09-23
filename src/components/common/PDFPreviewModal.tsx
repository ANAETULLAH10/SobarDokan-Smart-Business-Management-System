import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Loader2,
  FileCheck
} from 'lucide-react';
import { PDFPreviewService, PDFPreviewData } from '../../services/pdf/pdfPreviewService';
import { Language } from '../../types';

interface PDFPreviewModalProps {
  lang?: Language;
  onToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  lang = 'bn',
  onToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('');
  const [previewData, setPreviewData] = useState<PDFPreviewData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85); // Default comfortable view for A4
  const [isDownloaded, setIsDownloaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isBn = lang === 'bn';

  useEffect(() => {
    const unsubscribe = PDFPreviewService.subscribe((state) => {
      setIsOpen(state.isOpen);
      setIsLoading(state.isLoading);
      setLoadingTitle(state.loadingTitle);
      setPreviewData(state.data);
      if (state.isOpen) {
        setCurrentPage(1);
        setIsDownloaded(false);
      }
    });

    return unsubscribe;
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        PDFPreviewService.closePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPages = previewData?.pageImages?.length || previewData?.totalPages || 1;
  const currentImage = previewData?.pageImages?.[currentPage - 1];

  const handleDownload = () => {
    if (!previewData?.doc) return;
    try {
      previewData.doc.save(previewData.fileName || 'Report.pdf');
      setIsDownloaded(true);
      if (onToast) {
        onToast(
          isBn ? 'পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : 'PDF downloaded successfully!',
          'success'
        );
      }
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handlePrint = () => {
    if (!previewData?.pageImages || previewData.pageImages.length === 0) return;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        // Fallback to iframe printing if popups are blocked
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
          const imagesHtml = previewData.pageImages
            .map(
              (img) => `
              <div class="page">
                <img src="${img}" style="width: 100%; height: auto; display: block;" />
              </div>
            `
            )
            .join('');

          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${previewData.title || 'Print PDF'}</title>
                <style>
                  @page { size: A4 portrait; margin: 0; }
                  body { margin: 0; padding: 0; background: #fff; }
                  .page { page-break-after: always; width: 100%; }
                  .page:last-child { page-break-after: avoid; }
                </style>
              </head>
              <body>
                ${imagesHtml}
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(function() { window.frameElement.remove(); }, 1000);
                  };
                </script>
              </body>
            </html>
          `);
          doc.close();
        }
        return;
      }

      const imagesHtml = previewData.pageImages
        .map(
          (img) => `
          <div style="page-break-after: always; width: 100%; margin: 0; padding: 0;">
            <img src="${img}" style="width: 100%; height: auto; display: block;" />
          </div>
        `
        )
        .join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${previewData.title || 'Print Document'}</title>
            <style>
              @page { size: A4 portrait; margin: 0; }
              body { margin: 0; padding: 0; background: #fff; }
              img { width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${imagesHtml}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Print execution error:', err);
      // Direct doc save fallback
      previewData?.doc?.save(previewData.fileName || 'Report.pdf');
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.4, Math.min(1.6, Math.round((prev + delta) * 10) / 10)));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.85);
  };

  return (
    <div
      id="pdf-preview-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      <div
        id="pdf-preview-modal-window"
        className="relative w-full max-w-5xl h-[94vh] bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#111827] border-b border-[#1e293b] shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {previewData?.title || (isBn ? 'A4 ডকুমেন্ট প্রিভিউ' : 'A4 Document Preview')}
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  A4 Paper (210 × 297mm)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {previewData?.fileName || 'Document.pdf'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-pdf-print"
              onClick={handlePrint}
              disabled={isLoading || !previewData?.pageImages?.length}
              className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title={isBn ? 'ডকুমেন্ট প্রিন্ট করুন' : 'Print Document'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBn ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            <button
              id="btn-pdf-download"
              onClick={handleDownload}
              disabled={isLoading || !previewData?.doc}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 ${
                isDownloaded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title={isBn ? 'পিডিএফ ফাইল ডাউনলোড করুন' : 'Download PDF file'}
            >
              {isDownloaded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>{isBn ? 'সংরক্ষিত!' : 'Saved!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ডাউনলোড PDF' : 'Download PDF'}</span>
                </>
              )}
            </button>

            <button
              id="btn-pdf-close"
              onClick={() => PDFPreviewService.closePreview()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title={isBn ? 'বন্ধ করুন (Esc)' : 'Close (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Page Navigation & Zoom Controls */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#0d1322] border-b border-[#1e293b] text-xs text-slate-300 gap-2 shrink-0">
          {/* Page navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title={isBn ? 'পূর্ববর্তী পৃষ্ঠা' : 'Previous page'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-300 px-1">
              {isBn ? 'পৃষ্ঠা' : 'Page'} <strong className="text-white">{currentPage}</strong> / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title={isBn ? 'পরবর্তী পৃষ্ঠা' : 'Next page'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Page Jump Chips (if multi-page) */}
          {totalPages > 1 && (
            <div className="hidden md:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-6 h-6 rounded text-[11px] font-semibold transition-colors ${
                    currentPage === num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(-0.15)}
              disabled={zoomLevel <= 0.4 || isLoading}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title={isBn ? 'ছোট করুন' : 'Zoom Out'}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.15)}
              disabled={zoomLevel >= 1.6 || isLoading}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title={isBn ? 'বড় করুন' : 'Zoom In'}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isBn ? 'স্বাভাবিক আকার (Reset)' : 'Fit to page'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Document Preview Viewport */}
        <div
          ref={containerRef}
          className="flex-1 bg-[#0b0f19] overflow-auto p-4 sm:p-8 flex items-start justify-center relative"
          style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center my-auto p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h4 className="text-base font-bold text-white">
                {loadingTitle || (isBn ? 'A4 ডকুমেন্ট প্রিভিউ প্রস্তুত হচ্ছে...' : 'Generating A4 PDF Preview...')}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {isBn
                  ? 'উন্নত বাংলা ফন্ট (Noto Sans Bengali) সহ A4 শিট রেন্ডার করা হচ্ছে...'
                  : 'Formatting layout and Bengali typography for A4 printing...'}
              </p>
            </div>
          ) : currentImage ? (
            <div
              className="transition-transform duration-150 ease-out origin-top shadow-[0_20px_60px_rgba(0,0,0,0.65)] ring-1 ring-slate-700/40 rounded-sm bg-white overflow-hidden"
              style={{
                width: `${800 * zoomLevel}px`,
                minHeight: `${1130 * zoomLevel}px`
              }}
            >
              <img
                src={currentImage}
                alt={`Page ${currentPage}`}
                className="w-full h-auto block select-none pointer-events-none"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto p-8 text-center text-slate-400">
              <FileCheck className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm">
                {isBn ? 'কোন প্রিভিউ পাওয়া যায়নি' : 'No document pages available'}
              </p>
            </div>
          )}
        </div>

        {/* Footer info & status */}
        <div className="px-4 py-2.5 bg-[#0e1626] border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {isBn
                ? 'ডকুমেন্টটি প্রিভিউ থেকে সরাসরি প্রিন্ট অথবা সেভ করতে পারবেন'
                : 'Ready for print or direct download'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>A4 Portrait (210 × 297 mm)</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">300 DPI High-Res Output</span>
          </div>
        </div>
      </div>
    </div>
  );
};
