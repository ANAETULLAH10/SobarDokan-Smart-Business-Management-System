/**
 * Barcode & Label Sticker Printing & PDF Generator Utility
 * Provides:
 * 1. Client-side PDF generation (Thermal roll & A4 grid) using jsPDF & Canvas
 * 2. Isolated iframe thermal printing with auto-fallback to PDF download
 */

import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
import { Product, BusinessSettings } from '../types';

export interface PrintStickerConfig {
  labelSize: '50x30' | '38x25' | '40x20' | 'a4_grid';
  title?: string;
}

export interface BarcodePDFOptions {
  product: Product;
  copies: number;
  labelSize: '50x30' | '38x25' | '40x20' | 'a4_grid';
  showShopName?: boolean;
  shopName?: string;
  showProductName?: boolean;
  showPrice?: boolean;
  showSku?: boolean;
  currencySymbol?: string;
  customTagline?: string;
  pdfFormat?: 'thermal' | 'a4';
}

// Label dimensions in millimeters
export const LABEL_DIMENSIONS: Record<string, { w: number; h: number; nameBn: string; nameEn: string }> = {
  '50x30': { w: 50, h: 30, nameBn: '৫০×৩০ মিমি (থার্মাল)', nameEn: '50x30 mm (Thermal)' },
  '38x25': { w: 38, h: 25, nameBn: '৩৮×২৫ মিমি (ছোট লেবেল)', nameEn: '38x25 mm (Small)' },
  '40x20': { w: 40, h: 20, nameBn: '৪০×২০ মিমি (মিনি লেবেল)', nameEn: '40x20 mm (Mini)' },
  'a4_grid': { w: 60, h: 30, nameBn: 'A4 শিট গ্রিড', nameEn: 'A4 Sheet Grid' }
};

/**
 * High-resolution canvas renderer for a single barcode sticker.
 * Produces a crisp 300 DPI PNG data URL with pure black-on-white contrast.
 */
export function renderStickerToDataUrl(options: {
  barcodeValue: string;
  widthMm: number;
  heightMm: number;
  showShopName?: boolean;
  shopName?: string;
  showProductName?: boolean;
  productName?: string;
  showPrice?: boolean;
  price?: number;
  currencySymbol?: string;
  showSku?: boolean;
  sku?: string;
  customTagline?: string;
}): string {
  // 300 DPI equivalent: ~11.8 pixels per mm
  const scale = 3.5;
  const pxWidth = Math.round(options.widthMm * 3.78 * scale);
  const pxHeight = Math.round(options.heightMm * 3.78 * scale);

  const canvas = document.createElement('canvas');
  canvas.width = pxWidth;
  canvas.height = pxHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Pure white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pxWidth, pxHeight);

  // Subtle cut guide border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(1, 1, pxWidth - 2, pxHeight - 2);

  let currentY = 4 * scale;

  // 1. Shop name (strictly disabled by default per user instruction)
  if (options.showShopName && options.shopName) {
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${8 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(options.shopName.toUpperCase(), pxWidth / 2, currentY + 8 * scale);
    currentY += 11 * scale;
  }

  // 2. Product Name (optional)
  if (options.showProductName && options.productName) {
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${9.5 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    const rawName = options.productName;
    const displayName = rawName.length > 28 ? rawName.substring(0, 28) + '...' : rawName;
    ctx.fillText(displayName, pxWidth / 2, currentY + 9 * scale);
    currentY += 12 * scale;
  }

  // 3. Barcode (Always rendered! Dominant focus)
  const barcodeCanvas = document.createElement('canvas');
  const hasBottomRow = Boolean(options.showPrice || options.showSku);
  const bottomReserve = hasBottomRow ? 15 * scale : 4 * scale;
  const availableBarcodeH = Math.max(18 * scale, pxHeight - currentY - bottomReserve);

  try {
    const rawVal = options.barcodeValue || '100001';
    JsBarcode(barcodeCanvas, rawVal, {
      format: 'CODE128',
      lineColor: '#000000',
      width: Math.max(1.3, Math.min(2.4, (pxWidth - 16 * scale) / (rawVal.length * 11))),
      height: availableBarcodeH,
      displayValue: true,
      fontSize: 9 * scale,
      font: 'monospace',
      textMargin: 2 * scale,
      margin: 2 * scale
    });

    const bWidth = Math.min(barcodeCanvas.width, pxWidth - 6 * scale);
    const bHeight = barcodeCanvas.height;
    const bX = (pxWidth - bWidth) / 2;
    ctx.drawImage(barcodeCanvas, bX, currentY, bWidth, bHeight);
    currentY += bHeight + 2 * scale;
  } catch (e) {
    console.warn('JsBarcode canvas error:', e);
  }

  // 4. SKU & Price Footer Row (Optional)
  if (options.showSku || options.showPrice) {
    const footerY = pxHeight - 4 * scale;

    if (options.showSku && options.sku) {
      ctx.fillStyle = '#334155';
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`SKU: ${options.sku}`, 6 * scale, footerY);
    }

    if (options.showPrice && options.price !== undefined) {
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${10.5 * scale}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`${options.currencySymbol || '৳'}${options.price}`, pxWidth - 6 * scale, footerY);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates and downloads a print-ready PDF containing the barcode stickers.
 * Supports:
 * - 'thermal': exact thermal label dimensions (50x30mm, 38x25mm, 40x20mm) - 1 sticker per page
 * - 'a4': multi-sticker grid on standard A4 paper (210x297mm) with automatic page breaks
 */
export async function downloadBarcodePDF(options: BarcodePDFOptions): Promise<boolean> {
  try {
    const dim = LABEL_DIMENSIONS[options.labelSize] || LABEL_DIMENSIONS['50x30'];
    const totalCopies = Math.max(1, Math.min(100, options.copies || 6));
    const barcodeVal = options.product.barcode || options.product.sku || '100001';

    // Generate high-resolution sticker image
    const stickerDataUrl = renderStickerToDataUrl({
      barcodeValue: barcodeVal,
      widthMm: dim.w,
      heightMm: dim.h,
      showShopName: options.showShopName,
      shopName: options.shopName,
      showProductName: options.showProductName,
      productName: options.product.banglaName || options.product.name,
      showPrice: options.showPrice,
      price: options.product.sellingPrice,
      currencySymbol: options.currencySymbol || '৳',
      showSku: options.showSku,
      sku: options.product.sku,
      customTagline: options.customTagline
    });

    if (!stickerDataUrl) {
      throw new Error('Failed to render barcode canvas image');
    }

    const isA4 = options.pdfFormat === 'a4' || options.labelSize === 'a4_grid';

    if (isA4) {
      // Standard A4: 210 x 297 mm
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 12;
      const marginY = 15;
      const gapX = 4;
      const gapY = 4;

      // Fit 3 stickers per row
      const stickerW = (pageWidth - (marginX * 2) - (gapX * 2)) / 3; // ~59mm
      const stickerH = dim.h; // usually 30mm

      let currentX = marginX;
      let currentY = marginY;
      let col = 0;

      for (let i = 0; i < totalCopies; i++) {
        // If row overflows page height, add a new A4 page
        if (currentY + stickerH > pageHeight - marginY) {
          doc.addPage('a4', 'portrait');
          currentX = marginX;
          currentY = marginY;
          col = 0;
        }

        doc.addImage(stickerDataUrl, 'PNG', currentX, currentY, stickerW, stickerH);

        col++;
        if (col >= 3) {
          col = 0;
          currentX = marginX;
          currentY += stickerH + gapY;
        } else {
          currentX += stickerW + gapX;
        }
      }

      const safeName = (options.product.banglaName || options.product.name || 'product')
        .replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_');
      doc.save(`${safeName}_barcode_A4_sheet.pdf`);
      return true;
    } else {
      // Thermal continuous roll: each sticker is an exact thermal page
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [dim.w, dim.h]
      });

      for (let i = 0; i < totalCopies; i++) {
        if (i > 0) {
          doc.addPage([dim.w, dim.h], 'landscape');
        }
        doc.addImage(stickerDataUrl, 'PNG', 0, 0, dim.w, dim.h);
      }

      const safeName = (options.product.banglaName || options.product.name || 'product')
        .replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_');
      doc.save(`${safeName}_barcode_${dim.w}x${dim.h}mm.pdf`);
      return true;
    }
  } catch (err) {
    console.error('downloadBarcodePDF error:', err);
    return false;
  }
}

/**
 * Thermal-compatible printing using an isolated hidden iframe
 */
export function printBarcodeContainer(
  containerEl: HTMLElement,
  config: PrintStickerConfig = { labelSize: '50x30' }
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      let iframe = document.getElementById('barcode-printer-iframe') as HTMLIFrameElement | null;
      if (iframe) {
        iframe.remove();
      }

      iframe = document.createElement('iframe');
      iframe.id = 'barcode-printer-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        window.print();
        resolve(true);
        return;
      }

      const stickersHtml = containerEl.innerHTML;

      const sizeMap: Record<string, { w: string; h: string; pad: string }> = {
        '50x30': { w: '50mm', h: '30mm', pad: '1.5mm' },
        '38x25': { w: '38mm', h: '25mm', pad: '1mm' },
        '40x20': { w: '40mm', h: '20mm', pad: '1mm' },
        'a4_grid': { w: '63.5mm', h: '33.9mm', pad: '2mm' }
      };

      const curSize = sizeMap[config.labelSize] || sizeMap['50x30'];

      const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${config.title || 'Barcode Stickers'}</title>
  <style>
    @page {
      size: auto;
      margin: 1.5mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif;
    }
    .print-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 2mm;
      justify-content: flex-start;
      align-items: flex-start;
      padding: 1mm;
    }
    .barcode-sticker-item {
      width: ${curSize.w} !important;
      height: ${curSize.h} !important;
      padding: ${curSize.pad} !important;
      background: #ffffff !important;
      color: #000000 !important;
      border: 1px dashed #cbd5e1 !important;
      border-radius: 2px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: hidden !important;
      box-shadow: none !important;
    }
    .barcode-svg-element {
      display: block !important;
      max-width: 98% !important;
      height: auto !important;
      margin: 0 auto !important;
    }
    svg text {
      font-family: monospace !important;
      font-weight: bold !important;
      fill: #000000 !important;
    }
  </style>
</head>
<body>
  <div class="print-grid">
    ${stickersHtml}
  </div>
</body>
</html>
      `;

      iframeDoc.open();
      iframeDoc.write(printHtml);
      iframeDoc.close();

      setTimeout(() => {
        try {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
          resolve(true);
        } catch (e) {
          console.warn('Iframe print error:', e);
          resolve(false);
        } finally {
          setTimeout(() => {
            iframe?.remove();
          }, 3000);
        }
      }, 250);
    } catch (err) {
      console.error('Print container failure:', err);
      resolve(false);
    }
  });
}
