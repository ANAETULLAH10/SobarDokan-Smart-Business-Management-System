import React from 'react';
import { X, Sparkles, Radio } from 'lucide-react';
import { Language, BusinessSettings, Product, Sale, Customer } from '../../types';
import { VoiceConversationView } from './VoiceConversationView';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  settings?: BusinessSettings;
  products?: Product[];
  sales?: Sale[];
  customers?: Customer[];
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  products,
  sales,
  customers,
}) => {
  if (!isOpen) return null;

  const isBn = lang === 'bn';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      <div className="bg-[#070b14] border border-[#1e2a47] rounded-3xl w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Top Modal Bar */}
        <div className="px-5 py-3.5 bg-[#0b101d] border-b border-[#192238] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4 text-cyan-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  {isBn ? 'লাইভ ভয়েস সহকারী' : 'Live Voice Assistant'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  gemini-3.8-live
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isBn ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Content */}
        <div className="flex-1 overflow-hidden">
          <VoiceConversationView
            lang={lang}
            settings={settings}
            products={products}
            sales={sales}
            customers={customers}
          />
        </div>
      </div>
    </div>
  );
};
