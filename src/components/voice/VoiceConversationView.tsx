import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, PhoneCall, PhoneOff, Sparkles, Volume2,
  VolumeX, RefreshCw, Send, AlertCircle, CheckCircle2,
  Radio, Bot, User as UserIcon, MessageSquare, Zap, Shield,
  ArrowRight, CornerDownLeft
} from 'lucide-react';
import { Language, BusinessSettings, Product, Sale, Customer } from '../../types';
import { useGeminiLive } from '../../hooks/useGeminiLive';

interface VoiceConversationViewProps {
  lang: Language;
  settings?: BusinessSettings;
  products?: Product[];
  sales?: Sale[];
  customers?: Customer[];
}

export const VoiceConversationView: React.FC<VoiceConversationViewProps> = ({
  lang,
  settings,
  products = [],
  sales = [],
  customers = [],
}) => {
  const isBn = lang === 'bn';
  const [inputText, setInputText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Business summary to ground the voice assistant
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.createdAt?.startsWith(todayStr));
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const totalDues = customers.reduce((acc, c) => acc + (c.dueAmount || 0), 0);
  const lowStockCount = products.filter((p) => p.currentStock <= (p.minStockAlert ?? 5)).length;

  const systemInstruction = `You are the real-time AI voice partner for '${settings?.businessName || 'AmarDokan'}', a retail store in Bangladesh.
Store status context:
- Store Name: ${settings?.businessName || 'AmarDokan'}
- Today's Sales Count: ${todaySales.length} orders
- Today's Sales Total: ৳${todaySalesTotal.toLocaleString()}
- Total Active Products: ${products.length} items (${lowStockCount} items low on stock)
- Total Customer Dues: ৳${totalDues.toLocaleString()}

You speak both Bengali (বাংলা) and English fluently.
Provide immediate, practical retail management tips, sales guidance, due recovery strategies, and friendly assistance.
Keep your spoken responses natural, conversational, and concise so it feels like a real phone or walkie-talkie conversation.`;

  const {
    connectionState,
    voice,
    setVoice,
    messages,
    streamingText,
    errorMessage,
    isMuted,
    userLevel,
    modelLevel,
    isModelSpeaking,
    isUserSpeaking,
    startConversation,
    stopConversation,
    toggleMute,
    sendTextMessage,
    clearMessages,
  } = useGeminiLive({
    defaultVoice: 'Zephyr',
    systemInstruction,
  });

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  // Auto-scroll chat log
  useEffect(() => {
    if (autoScroll && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, autoScroll]);

  const handleToggleCall = () => {
    if (isConnected || isConnecting) {
      stopConversation();
    } else {
      startConversation(voice);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendTextMessage(inputText.trim());
    setInputText('');
  };

  const starterChips = isBn
    ? [
        { label: 'আজকের বিক্রি ও সারসংক্ষেপ কেমন হলো?', prompt: 'আজকের বিক্রি ও দোকানের বর্তমান অবস্থা সংক্ষেপে বলো।' },
        { label: 'বাকি খাতার টাকা দ্রুত তোলার উপায় কী?', prompt: 'দোকানের কাস্টমারদের কাছ থেকে বাকি টাকা সহজে তোলার কিছু কার্যকরী কৌশল বলো।' },
        { label: 'কম স্টকের পণ্যগুলো কী কী?', prompt: 'দোকানে কোন কোন পণ্যের স্টক কমে গেছে এবং কী রি-অর্ডার করা উচিত?' },
        { label: 'দোকানের সেলস বাড়ানোর সহজ টিপস', prompt: 'আমার দোকানে কাস্টমার সংখ্যা ও মাসিক বিক্রি দ্বিগুণ করার ৩টি বাস্তবসম্মত আইডিয়া দাও।' },
      ]
    : [
        { label: "Today's sales summary & performance", prompt: 'Give me a quick verbal summary of today sales and store condition.' },
        { label: 'Tips for collecting outstanding dues', prompt: 'What are the best polite strategies to collect customer due payments faster?' },
        { label: 'Low stock products & reorder tips', prompt: 'Which products are running low in stock and need immediate reordering?' },
        { label: 'How to increase store revenue', prompt: 'Give me 3 practical tips to increase my retail store revenue this month.' },
      ];

  const voiceOptions = [
    { id: 'Zephyr', name: 'Zephyr', tone: isBn ? 'শান্ত ও স্পষ্ট (Calm & Clear)' : 'Calm & Clear' },
    { id: 'Puck', name: 'Puck', tone: isBn ? 'উদ্যমী ও বন্ধুবৎসল (Enthusiastic)' : 'Energetic & Friendly' },
    { id: 'Charon', name: 'Charon', tone: isBn ? 'ভারী ও পেশাদার (Deep & Authoritative)' : 'Deep & Authoritative' },
    { id: 'Kore', name: 'Kore', tone: isBn ? 'নরম ও মিষ্টি (Warm & Gentle)' : 'Warm & Gentle' },
    { id: 'Fenrir', name: 'Fenrir', tone: isBn ? 'দৃঢ় ও গম্ভীর (Strong & Confident)' : 'Strong & Confident' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#070b14] overflow-hidden p-4 md:p-6 gap-4">
      {/* Top Header Card */}
      <div className="bg-[#0b101d] border border-[#192238] rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/60 shrink-0">
            <Radio className={`w-6 h-6 ${isConnected ? 'animate-pulse text-cyan-200' : 'text-white'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                {isBn ? 'ভয়েস কথোপকথন (Voice Conversations)' : 'Voice Conversations'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>gemini-3.8-live</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn
                ? 'রিয়েল-টাইম লাইভ অডিওতে আপনার দোকানের ব্যবসায়িক সহকারী সাথে সরাসরি কথা বলুন।'
                : 'Real-time low-latency voice conversation with Gemini Live API for your retail store.'}
            </p>
          </div>
        </div>

        {/* Right Status & Voice Controls */}
        <div className="flex items-center gap-3">
          {/* Connection status badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e1628] border border-[#1e2a47]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isConnecting
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-200 capitalize">
              {isConnecting
                ? (isBn ? 'সংযোগ হচ্ছে...' : 'Connecting...')
                : isConnected
                ? (isBn ? 'লাইভ সংযুক্ত' : 'Live Connected')
                : (isBn ? 'সংযোগ বিচ্ছিন্ন' : 'Ready to Connect')}
            </span>
          </div>

          {/* Voice selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden sm:inline">{isBn ? 'ভয়েস:' : 'Voice:'}</span>
            <select
              value={voice}
              disabled={isConnected || isConnecting}
              onChange={(e) => setVoice(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#0e1628] border border-[#1e2a47] text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {voiceOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.tone})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => startConversation(voice)}
            className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 font-semibold text-[11px] transition-colors"
          >
            {isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Voice Orb & Live Transcript */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left / Center: Voice Calling Pod (5 cols on lg) */}
        <div className="lg:col-span-5 bg-[#0b101d] border border-[#192238] rounded-2xl p-6 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
          
          {/* Background Ambient Glow */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
              isConnected
                ? isModelSpeaking
                  ? 'opacity-30 bg-gradient-to-b from-indigo-600/20 via-cyan-600/10 to-transparent'
                  : isUserSpeaking
                  ? 'opacity-30 bg-gradient-to-b from-emerald-600/20 via-teal-600/10 to-transparent'
                  : 'opacity-15 bg-gradient-to-b from-indigo-900/20 to-transparent'
                : 'opacity-5 bg-slate-900'
            }`}
          />

          {/* Top Info inside Pod */}
          <div className="text-center z-10 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111a30] border border-[#1f2e52] text-[11px] font-medium text-slate-300 mb-2">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AmarDokan Smart Retail Voice AI</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isConnected
                ? isModelSpeaking
                  ? (isBn ? 'Gemini উত্তর দিচ্ছে...' : 'Gemini is speaking...')
                  : isUserSpeaking
                  ? (isBn ? 'আপনার কথা শোনা হচ্ছে...' : 'Listening to your voice...')
                  : (isBn ? 'কথা বলুন, আমি শুনছি' : 'Ready, speak whenever you like')
                : (isBn ? 'কথোপকথন শুরু করতে কল বাটনে চাপুন' : 'Click the button below to start voice call')}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {isConnected
                ? (isBn ? 'স্বাভাবিক কণ্ঠে প্রশ্ন করুন অথবা পরামর্শ চান' : 'Speak naturally in Bengali or English')
                : (isBn ? 'মাইক্রোফোন দিয়ে সরাসরি রিয়েল-টাইম কথা বলুন' : 'Hands-free continuous bidirectional voice')}
            </p>
          </div>

          {/* Middle: Interactive Visualizer & Sound Rings */}
          <div className="my-auto py-8 flex flex-col items-center justify-center relative z-10">
            {/* Outer pulsating wave ring */}
            <div
              className={`w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                isConnected
                  ? isModelSpeaking
                    ? 'ring-8 ring-indigo-500/30 scale-105'
                    : isUserSpeaking
                    ? 'ring-8 ring-emerald-500/30 scale-105'
                    : 'ring-2 ring-slate-800'
                  : 'ring-1 ring-slate-800'
              }`}
            >
              {/* Dynamic waveform simulation bars */}
              {isConnected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="w-full h-full rounded-full border border-cyan-500/20 animate-ping"
                    style={{
                      animationDuration: isModelSpeaking ? '1.5s' : '3s',
                      opacity: isModelSpeaking || isUserSpeaking ? 0.6 : 0.2,
                    }}
                  />
                </div>
              )}

              {/* Central Core Orb */}
              <div
                className={`w-36 h-36 md:w-44 md:h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 relative overflow-hidden ${
                  isConnected
                    ? isModelSpeaking
                      ? 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-pink-600 shadow-indigo-500/40 scale-105'
                      : isUserSpeaking
                      ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 shadow-emerald-500/40 scale-105'
                      : 'bg-gradient-to-tr from-[#131d36] to-[#1c2c54] border border-[#2b3f73]'
                    : 'bg-[#101728] border border-[#1e2a47]'
                }`}
              >
                {/* Visual Audio Bars inside core */}
                <div className="flex items-center gap-1.5 h-12">
                  {[40, 70, 100, 60, 85, 45, 95, 55, 75].map((baseHeight, i) => {
                    const activeLevel = isModelSpeaking ? modelLevel : isUserSpeaking ? userLevel : 0.05;
                    const dynamicScale = Math.min(1.8, Math.max(0.2, activeLevel * 4 + 0.2));
                    const barHeight = Math.min(48, Math.max(8, (baseHeight / 100) * 44 * dynamicScale));

                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-75 ${
                          isConnected
                            ? isModelSpeaking
                              ? 'bg-white shadow-[0_0_6px_#ffffff]'
                              : isUserSpeaking
                              ? 'bg-emerald-200 shadow-[0_0_6px_#a7f3d0]'
                              : 'bg-slate-600'
                            : 'bg-slate-700'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                    );
                  })}
                </div>

                <span className="text-[10px] font-bold text-white/80 mt-2 uppercase tracking-wider">
                  {isConnected
                    ? isModelSpeaking
                      ? 'AI Speaking'
                      : isUserSpeaking
                      ? 'User Speaking'
                      : 'Listening...'
                    : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="w-full flex items-center justify-center gap-4 z-10 pt-2 border-t border-[#172138]">
            {/* Mute / Unmute Button */}
            <button
              onClick={toggleMute}
              disabled={!isConnected}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                  : 'bg-[#131b2e] border-[#223052] text-slate-300 hover:text-white hover:bg-slate-800'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isMuted ? (isBn ? 'মাইক্রোফোন আনমিউট করুন' : 'Unmute Mic') : (isBn ? 'মাইক্রোফোন মিউট করুন' : 'Mute Mic')}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Main Call Start / End Button */}
            <button
              id="btn-toggle-live-call"
              onClick={handleToggleCall}
              disabled={isConnecting}
              className={`px-7 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-xl transition-all active:scale-95 cursor-pointer ${
                isConnected
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  : isConnecting
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-indigo-950/60'
              }`}
            >
              {isConnected ? (
                <>
                  <PhoneOff className="w-5 h-5" />
                  <span>{isBn ? 'কল শেষ করুন (End Call)' : 'End Conversation'}</span>
                </>
              ) : isConnecting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isBn ? 'সংযোগ হচ্ছে...' : 'Connecting...'}</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-5 h-5 text-cyan-200" />
                  <span>{isBn ? 'ভয়েস কথোপকথন শুরু করুন' : 'Start Voice Conversation'}</span>
                </>
              )}
            </button>

            {/* Clear History Button */}
            <button
              onClick={clearMessages}
              disabled={messages.length === 0 && !streamingText}
              className="p-3.5 rounded-2xl bg-[#131b2e] border border-[#223052] text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={isBn ? 'কথোপকথন পরিষ্কার করুন' : 'Clear transcript'}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Live Transcript & Text Interaction (7 cols on lg) */}
        <div className="lg:col-span-7 bg-[#0b101d] border border-[#192238] rounded-2xl flex flex-col shadow-xl overflow-hidden">
          
          {/* Transcript Header */}
          <div className="px-5 py-3.5 border-b border-[#192238] flex items-center justify-between bg-[#0e1628]/60 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {isBn ? 'রিয়েল-টাইম কথোপকথন ট্রান্সক্রিপ্ট (Live Transcript)' : 'Real-time Conversation Transcript'}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
                />
                <span>Auto-scroll</span>
              </label>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="px-5 py-2.5 bg-[#0b101d] border-b border-[#141d33] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {isBn ? 'প্রশ্ন বা পরামর্শ:' : 'Quick Prompts:'}
            </span>
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sendTextMessage(chip.prompt);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#11192e] hover:bg-[#1a2542] border border-[#1f2e52] hover:border-indigo-500/50 text-slate-300 hover:text-white text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{chip.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            {messages.length === 0 && !streamingText ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/40 border border-indigo-800/30 flex items-center justify-center text-indigo-400 mb-3">
                  <Bot className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-semibold text-slate-300">
                  {isBn ? 'কথোপকথন এখনো শুরু হয়নি' : 'No conversation yet'}
                </h5>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  {isBn
                    ? 'কল শুরু করে মুখে কথা বলুন অথবা নিচের বক্সে লিখে প্রশ্ন করুন। Gemini Live তাৎক্ষণিকভাবে উত্তর দেবে।'
                    : 'Start the call and speak into your microphone, or type your question below. Gemini Live responds in real-time.'}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'model' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-[#121a2d] border border-[#1e2a47] text-slate-200 rounded-tl-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1 opacity-70">
                        <span className="font-bold">{msg.sender === 'user' ? (isBn ? 'আপনি' : 'You') : 'Gemini Live'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Currently Streaming AI response */}
                {streamingText && (
                  <div className="flex items-start gap-3 justify-start animate-in fade-in">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-[#121a2d] border border-cyan-500/40 text-slate-200 text-xs md:text-sm leading-relaxed shadow-sm">
                      <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span>Gemini Live Speaking...</span>
                      </div>
                      <p className="whitespace-pre-wrap">{streamingText}</p>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </>
            )}
          </div>

          {/* Bottom Text Fallback Input Bar */}
          <form
            onSubmit={handleSendText}
            className="p-3.5 bg-[#0e1628] border-t border-[#192238] flex items-center gap-2.5 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isBn
                  ? 'কথা বলার পাশাপাশি এখানে লিখেও প্রশ্ন পাঠাতে পারেন...'
                  : 'Type a question or business topic to Gemini Live...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#070b14] border border-[#1e2a47] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md"
            >
              <span>{isBn ? 'পাঠান' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
