export interface PDFColumn {
  header: string;
  key: string;
  widthPercent?: number;
  align?: 'left' | 'center' | 'right';
  render?: (val: any, row: any) => string;
}

export interface SummaryCardItem {
  label: string;
  value: string;
  subtext?: string;
  color?: 'primary' | 'emerald' | 'indigo' | 'rose' | 'amber' | 'slate' | 'teal' | 'blue';
}

export const PDF_THEME = {
  fontFamily: "'Noto Sans Bengali', system-ui, -apple-system, sans-serif",
  colors: {
    primary: '#0f172a',
    primaryDark: '#020617',
    brand: '#4f46e5',
    brandDark: '#3730a3',
    brandLight: '#eef2ff',
    emerald: '#059669',
    emeraldLight: '#ecfdf5',
    rose: '#dc2626',
    roseLight: '#fef2f2',
    amber: '#d97706',
    amberLight: '#fffbeb',
    teal: '#0d9488',
    tealLight: '#f0fdfa',
    blue: '#2563eb',
    blueLight: '#eff6ff',
    slateDark: '#1e293b',
    slateText: '#334155',
    slateMuted: '#64748b',
    slateBorder: '#e2e8f0',
    slateBg: '#f8fafc',
    white: '#ffffff'
  },
  typography: {
    titleSizePx: 21,
    subtitleSizePx: 12,
    badgeTitleSizePx: 13.5,
    badgeDateSizePx: 11,
    cardLabelSizePx: 11,
    cardValueSizePx: 17,
    cardSubtextSizePx: 9.5,
    tableHeadSizePx: 10,
    tableBodySizePx: 9.5,
    footerSizePx: 9.5,
    lineHeightNormal: 1.5,
    lineHeightTight: 1.25,
    lineHeightRelaxed: 1.6
  },
  dimensions: {
    a4WidthMm: 210,
    a4HeightMm: 297,
    a4WidthPx: 800,
    a4HeightPx: 1130,
    pagePaddingXPx: 42,
    pagePaddingYPx: 38
  }
};

/**
 * Standard column width presets ensuring responsive and mathematically balanced columns on A4 paper
 */
export const PDF_COLUMN_PRESETS = {
  stock: [
    { key: 'name', widthPercent: 30, align: 'left' as const },
    { key: 'sku', widthPercent: 15, align: 'left' as const },
    { key: 'category', widthPercent: 15, align: 'left' as const },
    { key: 'purchasePrice', widthPercent: 13, align: 'right' as const },
    { key: 'sellingPrice', widthPercent: 13, align: 'right' as const },
    { key: 'currentStock', widthPercent: 14, align: 'right' as const }
  ],
  sales: [
    { key: 'invoiceNo', widthPercent: 16, align: 'left' as const },
    { key: 'date', widthPercent: 14, align: 'left' as const },
    { key: 'customerName', widthPercent: 24, align: 'left' as const },
    { key: 'paymentMethod', widthPercent: 16, align: 'left' as const },
    { key: 'paidAmount', widthPercent: 15, align: 'right' as const },
    { key: 'grandTotal', widthPercent: 15, align: 'right' as const }
  ],
  purchases: [
    { key: 'invoiceNo', widthPercent: 18, align: 'left' as const },
    { key: 'date', widthPercent: 14, align: 'left' as const },
    { key: 'supplierName', widthPercent: 26, align: 'left' as const },
    { key: 'paidAmount', widthPercent: 20, align: 'right' as const },
    { key: 'grandTotal', widthPercent: 22, align: 'right' as const }
  ],
  expenses: [
    { key: 'date', widthPercent: 16, align: 'left' as const },
    { key: 'category', widthPercent: 24, align: 'left' as const },
    { key: 'description', widthPercent: 36, align: 'left' as const },
    { key: 'amount', widthPercent: 24, align: 'right' as const }
  ],
  due: [
    { key: 'name', widthPercent: 28, align: 'left' as const },
    { key: 'phone', widthPercent: 20, align: 'left' as const },
    { key: 'address', widthPercent: 26, align: 'left' as const },
    { key: 'dueAmount', widthPercent: 26, align: 'right' as const }
  ]
};

/**
 * Normalizes column widths so they sum up to exactly 100%
 */
export function normalizeColumnWidths(columns: PDFColumn[]): PDFColumn[] {
  if (!columns || columns.length === 0) return [];
  const specifiedTotal = columns.reduce((sum, col) => sum + (col.widthPercent || 0), 0);
  if (specifiedTotal > 0 && Math.abs(specifiedTotal - 100) < 0.1) {
    return columns;
  }
  const defaultWidth = 100 / columns.length;
  return columns.map((col) => ({
    ...col,
    widthPercent: col.widthPercent ? (col.widthPercent / specifiedTotal) * 100 : defaultWidth
  }));
}

/**
 * Format currency with ৳ Bangladeshi Taka symbol cleanly
 */
export function formatTaka(amount: number): string {
  const formatted = Math.round(amount || 0).toLocaleString('en-US');
  return `৳ ${formatted}`;
}

/**
 * Format date in standard YYYY-MM-DD format
 */
export function formatReportDate(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0];
  }
  return dateStr;
}

/**
 * Format human readable date & time for PDF footer
 */
export function formatFooterDateTime(): string {
  const now = new Date();
  return now.toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Helper to get exact border, background and value color for summary cards
 * guaranteeing adequate contrast and crisp rendering
 */
export function getSummaryCardStyles(color?: SummaryCardItem['color']): {
  bg: string;
  borderColor: string;
  valColor: string;
} {
  switch (color) {
    case 'emerald':
      return { bg: '#f0fdf4', borderColor: '#a7f3d0', valColor: '#047857' };
    case 'rose':
      return { bg: '#fff1f2', borderColor: '#fecdd3', valColor: '#be123c' };
    case 'indigo':
      return { bg: '#eef2ff', borderColor: '#c7d2fe', valColor: '#4338ca' };
    case 'amber':
      return { bg: '#fffbeb', borderColor: '#fde68a', valColor: '#b45309' };
    case 'teal':
      return { bg: '#f0fdfa', borderColor: '#99f6e4', valColor: '#0f766e' };
    case 'blue':
      return { bg: '#eff6ff', borderColor: '#bfdbfe', valColor: '#1d4ed8' };
    case 'primary':
      return { bg: '#f8fafc', borderColor: '#cbd5e1', valColor: '#0f172a' };
    case 'slate':
    default:
      return { bg: '#f8fafc', borderColor: '#e2e8f0', valColor: '#1e293b' };
  }
}
