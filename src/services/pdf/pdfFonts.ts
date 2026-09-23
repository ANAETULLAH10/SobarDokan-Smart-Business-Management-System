import jsPDF from 'jspdf';
import {
  NOTO_SANS_BENGALI_REGULAR_BASE64,
  NOTO_SANS_BENGALI_BOLD_BASE64
} from './bengaliFontData';

export const BENGALI_FONT_NAME = 'NotoSansBengali';
export const BENGALI_FONT_FILE_REGULAR = 'NotoSansBengali-Regular.ttf';
export const BENGALI_FONT_FILE_BOLD = 'NotoSansBengali-Bold.ttf';

let isFontFaceInjected = false;

/**
 * Ensures the Bengali font is injected into the DOM stylesheet as @font-face
 * so that both the browser layout engine and HTML2Canvas render Bengali
 * characters with 100% native HarfBuzz OpenType layout shaping.
 */
export async function ensureBengaliFontLoaded(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return true;
  }

  if (!isFontFaceInjected) {
    const styleId = 'pdf-bengali-font-embedded';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @font-face {
          font-family: 'Noto Sans Bengali';
          src: url(data:font/truetype;charset=utf-8;base64,${NOTO_SANS_BENGALI_REGULAR_BASE64}) format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }
        @font-face {
          font-family: 'Noto Sans Bengali';
          src: url(data:font/truetype;charset=utf-8;base64,${NOTO_SANS_BENGALI_BOLD_BASE64}) format('truetype');
          font-weight: 700;
          font-style: normal;
          font-display: block;
        }
      `;
      document.head.appendChild(style);
    }
    isFontFaceInjected = true;
  }

  // Wait for document fonts to be ready
  try {
    if (document.fonts) {
      await Promise.all([
        document.fonts.load('14px "Noto Sans Bengali"'),
        document.fonts.load('bold 14px "Noto Sans Bengali"')
      ]);
      await document.fonts.ready;
    }
  } catch (err) {
    console.warn('Font loading check completed with warning:', err);
  }

  return true;
}

/**
 * Registers the Noto Sans Bengali TTF font into jsPDF's Virtual File System (VFS)
 * and sets it as the active font so that any jsPDF text element uses the embedded
 * Bengali font rather than Helvetica or other non-Unicode fonts.
 */
export function registerBengaliFont(doc: jsPDF): void {
  try {
    // Register Regular font
    doc.addFileToVFS(BENGALI_FONT_FILE_REGULAR, NOTO_SANS_BENGALI_REGULAR_BASE64);
    doc.addFont(BENGALI_FONT_FILE_REGULAR, BENGALI_FONT_NAME, 'normal');

    // Register Bold font
    doc.addFileToVFS(BENGALI_FONT_FILE_BOLD, NOTO_SANS_BENGALI_BOLD_BASE64);
    doc.addFont(BENGALI_FONT_FILE_BOLD, BENGALI_FONT_NAME, 'bold');

    // Set as active font
    doc.setFont(BENGALI_FONT_NAME, 'normal');
  } catch (err) {
    console.warn('PDF Bengali font registration warning:', err);
  }
}
