
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Mic, Sparkles, Info, Heart, Zap, ShieldAlert, Bot, Loader2 } from 'lucide-react';
import { speakText, decodePcmAudio, getRawAI } from '../services/geminiService';

const TIP_SEEN_KEY = 'sehat_mitra_tip_seen_v3';

const PAGE_TIPS: Record<string, { title: string; tip: string; icon: any }> = {
  '/': { title: 'Welcome Home', tip: 'Try the Live Pulse for a real-time voice check-up!', icon: Heart },
  '/symptoms': { title: 'Symptom Tip', tip: 'Be specific about pain intensity (1-10).', icon: Info },
  '/scan': { title: 'Scanning Help', tip: 'Use bright light for the clearest reports.', icon: Zap },
  '/vaccination': { title: 'Records', tip: 'Keep your digital record handy during doctor visits.', icon: ShieldAlert },
  '/chat': { title: 'Languages', tip: 'You can talk to me in Hindi, Bengali, and more!', icon: Sparkles },
};

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [assistantText, setAssistantText] = useState("");
  const location = useLocation();
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentTip = PAGE_TIPS[location.pathname] || PAGE_TIPS['/'];

  useEffect(() => {
    const hasSeenTip = localStorage.getItem(TIP_SEEN_KEY);
    if (!hasSeenTip) {
      setShowTip(true);
      const timer = setTimeout(() => setShowTip(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const dismissTip = () => {
    setShowTip(false);
    localStorage.setItem(TIP_SEEN_KEY, 'true');
  };

  useEffect(() => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.onresult = async (event: any) => handleQuickAsk(event.results[0][0].transcript);
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const handleQuickAsk = async (query: string) => {
    setIsOpen(true);
    setIsThinking(true);
    setAssistantText("");
    localStorage.setItem(TIP_SEEN_KEY, 'true');
    setShowTip(false);

    try {
      const ai = getRawAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User asks: "${query}". 
        1. HELPFUL CONTEXT: Give a helpful medical sentence first.
        2. SMART PROMOTION: ONLY suggest a Sehat Mitra tool IF relevant.
        - If baby/vaccines: "Check the 'Vaccination Schedule' feature in our Sehat Mitra app for the recommended timings."
        - If symptoms/pain: "Check the 'Symptom Checker' feature in our Sehat Mitra app for a more accurate analysis."
        - If skin/reports: "Check the 'Smart Scan' feature in our Sehat Mitra app for analysis from images."
        - If locations: "Check the 'Find Resources' feature in our Sehat Mitra app for nearby clinics."
        Keep the whole response under 40 words.`,
      });
      
      const text = response.text || "I'm here to help!";
      setIsThinking(false);
      setAssistantText(text);
      
      setIsProcessingVoice(true);
      const base64 = await speakText(text);
      if (base64) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        const buffer = await decodePcmAudio(new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0))), audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
        source.onended = () => setIsProcessingVoice(false);
      } else {
        setIsProcessingVoice(false);
      }
    } catch (e) { 
      setIsThinking(false);
      setIsProcessingVoice(false);
      setAssistantText("Sorry, I'm having trouble connecting right now."); 
    }
  };

  const toggleVoice = () => {
    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        if (audioContextRef.current?.state === 'suspended') { audioContextRef.current.resume(); }
        recognitionRef.current?.start();
    }
  };

  if (location.pathname === '/chat') { return null; }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      {showTip && !isOpen && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-brand-100 dark:border-brand-900/30 max-w-xs animate-in slide-in-from-bottom-4 pointer-events-auto">
          <div className="flex items-start gap-3">
            <div className="bg-brand-50 p-2 rounded-lg text-brand-600"><currentTip.icon size={18} /></div>
            <div>
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{currentTip.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{currentTip.tip}</p>
            </div>
            <button onClick={dismissTip} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl w-80 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 pointer-events-auto">
          <div className="bg-gradient-to-r from-brand-600 to-teal-600 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <span className="font-black text-[10px] uppercase tracking-widest">Mitra Mini AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"><X size={16} /></button>
          </div>
          <div className="p-8 space-y-6 text-center">
            <div className="relative mx-auto w-24 h-24">
               {(isThinking || isListening || isProcessingVoice) && (
                 <div className="absolute inset-0 rounded-3xl bg-brand-400/20 animate-ping"></div>
               )}
               <div className={`
                 relative w-24 h-24 bg-brand-50 dark:bg-brand-900/30 rounded-3xl flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto shadow-sm transition-all duration-500
                 ${isThinking ? 'scale-110 rotate-12 shadow-brand-500/20 shadow-xl' : 'animate-float-slow'}
               `}>
                 <Bot size={48} className={isThinking ? 'animate-pulse' : ''} />
               </div>
            </div>
            <div className="min-h-[60px] flex flex-col items-center justify-center">
               {isThinking ? (
                 <div className="flex flex-col items-center gap-2">
                   <div className="flex gap-1">
                     <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
                   </div>
                   <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest animate-pulse">Checking Sehat Mitra Tools...</p>
                 </div>
               ) : (
                 <div className="space-y-1">
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                      {assistantText || "How can I help you quickly?"}
                    </p>
                 </div>
               )}
            </div>
            <button 
              onClick={toggleVoice} 
              disabled={isThinking}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-600 text-white shadow-xl shadow-brand-500/20'}`}
            >
              {isListening ? "Listening..." : <><Mic size={18} /> Quick Query</>}
            </button>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Try: "I have a cold" or "Where is a pharmacy?"</p>
          </div>
        </div>
      )}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) { localStorage.setItem(TIP_SEEN_KEY, 'true'); setShowTip(false); } }}
        className={`w-16 h-16 rounded-[1.5rem] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all transform hover:scale-110 pointer-events-auto overflow-hidden ${isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-brand-600 text-white group'}`}
      >
        {isOpen ? <X size={28} /> : <Bot size={32} className="group-hover:scale-110 transition-transform" />}
      </button>
    </div>
  );
}
