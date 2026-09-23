import { jsPDF } from 'jspdf';

export interface PDFPreviewData {
  title: string;
  fileName: string;
  pageImages: string[];
  doc: jsPDF | null;
  totalPages: number;
}

export type PDFPreviewListener = (state: {
  isOpen: boolean;
  isLoading: boolean;
  loadingTitle: string;
  data: PDFPreviewData | null;
}) => void;

class PDFPreviewManager {
  private listeners: Set<PDFPreviewListener> = new Set();
  private currentState: {
    isOpen: boolean;
    isLoading: boolean;
    loadingTitle: string;
    data: PDFPreviewData | null;
  } = {
    isOpen: false,
    isLoading: false,
    loadingTitle: '',
    data: null
  };

  public subscribe(listener: PDFPreviewListener): () => void {
    this.listeners.add(listener);
    // Emit current state immediately
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.currentState });
      } catch (err) {
        console.error('Error in PDFPreviewListener:', err);
      }
    });
  }

  public showLoading(title: string, fileName = 'Report.pdf') {
    this.currentState = {
      isOpen: true,
      isLoading: true,
      loadingTitle: title || 'A4 ডকুমেন্ট প্রস্তুত হচ্ছে...',
      data: {
        title: title || 'ডকুমেন্ট প্রিভিউ',
        fileName,
        pageImages: [],
        doc: null,
        totalPages: 1
      }
    };
    this.notify();
  }

  public showPreview(data: PDFPreviewData) {
    this.currentState = {
      isOpen: true,
      isLoading: false,
      loadingTitle: '',
      data
    };
    this.notify();
  }

  public closePreview() {
    this.currentState = {
      isOpen: false,
      isLoading: false,
      loadingTitle: '',
      data: null
    };
    this.notify();
  }

  public getCurrentData(): PDFPreviewData | null {
    return this.currentState.data;
  }
}

export const PDFPreviewService = new PDFPreviewManager();
