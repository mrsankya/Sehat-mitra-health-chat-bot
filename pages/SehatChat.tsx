
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, Loader2, User, Volume2, RotateCcw, 
  Bot, Phone, PhoneOff, Activity, Trash2, Mic, X
} from 'lucide-react';
import { createChatSession, speakText, decodePcmAudio, getRawAI } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types';
import { LiveServerMessage, Modality } from '@google/genai';

const SUPPORTED_LANGUAGES = [
  { name: 'English', code: 'en-IN', native: 'English' },
  { name: 'Hindi', code: 'hi-IN', native: 'हिन्दी' },
  { name: 'Bengali', code: 'bn-IN', native: 'বাংলা' },
  { name: 'Marathi', code: 'mr-IN', native: 'मराठी' },
  { name: 'Telugu', code: 'te-IN', native: 'తెలుగు' },
  { name: 'Tamil', code: 'ta-IN', native: 'தமிழ்' },
  { name: 'Gujarati', code: 'gu-IN', native: 'ગુજરાતી' },
  { name: 'Kannada', code: 'kn-IN', native: 'कन्नड' },
  { name: 'Malayalam', code: 'ml-IN', native: 'മലയാളം' },
  { name: 'Punjabi', code: 'pa-IN', native: 'ਪੰਜਾਬी' },
];

const STORAGE_KEY = 'sehat_chat_history_v3';
const LANG_STORAGE_KEY = 'sehat_chat_lang_v3';

export default function SehatChat() {
  const { addPoints } = useAuth();
  
  // -- State Hooks --
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) { return []; }
    }
    return [];
  });

  const [selectedLang, setSelectedLang] = useState(() => {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang) {
      const found = SUPPORTED_LANGUAGES.find(l => l.code === savedLang);
      if (found) return found;
    }
    return SUPPORTED_LANGUAGES[0];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // -- Live Voice States --
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  
  const inputTranscriptionRef = useRef('');
  const outputTranscriptionRef = useRef('');
  const [displayTranscription, setDisplayTranscription] = useState({ input: '', output: '' });

  // -- Refs --
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // -- Live Pulse Refs --
  const liveSessionRef = useRef<any>(null);
  const liveAudioInputContextRef = useRef<AudioContext | null>(null);
  const liveAudioOutputContextRef = useRef<AudioContext | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const liveSourcesSetRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const liveNextStartTimeRef = useRef<number>(0);

  // -- Persist History --
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, selectedLang.code);
  }, [selectedLang]);

  const initWelcomeMessage = (langName: string) => {
    const welcomeMessages: Record<string, string> = {
      'English': "Namaste! I am Mitra, your personal health partner. How can I assist you today?",
      'Hindi': "नमस्ते! मैं मित्रा हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
      'Marathi': "नमस्कार! मी मित्रा आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
      'Bengali': "নমস্কার! আমি মিত্র। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
    };
    return {
      id: 'welcome-msg',
      role: 'model' as const,
      text: welcomeMessages[langName] || `Namaste! I am Mitra. I am ready to help you in ${langName}.`,
      timestamp: new Date()
    };
  };

  const startNewSession = (langName: string, history: any[] = []) => {
    const instruction = `STRICT LANGUAGE PROTOCOL: You MUST communicate ONLY in ${langName}. 
    1. All responses, explanations, and advice must be written in ${langName}.
    2. Even if the user types in another language, you MUST respond in ${langName}.
    3. Do NOT use any other language or provide translations.
    4. Maintain a compassionate, professional tone.`;
    
    chatSession.current = createChatSession(instruction, history);
  };

  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === 'welcome-msg')) {
       setMessages([initWelcomeMessage(selectedLang.name)]);
    }
    
    const aiHistory = messages
      .filter(m => m.id !== 'welcome-msg' && !m.isError)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    startNewSession(selectedLang.name, aiHistory);
  }, [selectedLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayTranscription, loading]);

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your chat history? This cannot be undone.")) {
      const resetMsg = [initWelcomeMessage(selectedLang.name)];
      setMessages(resetMsg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetMsg));
      startNewSession(selectedLang.name, []); // Force re-init AI session with zero history
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => {
        const filtered = prev.filter(m => m.id !== id);
        if (filtered.length === 0) return [initWelcomeMessage(selectedLang.name)];
        return filtered;
    });
  };

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  }

  const startLivePulse = async () => {
    if (isLiveActive) return;
    setIsLiveActive(true);
    liveNextStartTimeRef.current = 0; 
    inputTranscriptionRef.current = '';
    outputTranscriptionRef.current = '';
    setDisplayTranscription({ input: '', output: '' });

    try {
      const ai = getRawAI();
      liveAudioInputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      liveAudioOutputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (liveAudioInputContextRef.current.state === 'suspended') await liveAudioInputContextRef.current.resume();
      if (liveAudioOutputContextRef.current.state === 'suspended') await liveAudioOutputContextRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            if (!liveAudioInputContextRef.current) return;
            const source = liveAudioInputContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = liveAudioInputContextRef.current.createScriptProcessor(4096, 1, 1);
            liveProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const vol = inputData.reduce((s, v) => s + Math.abs(v), 0) / inputData.length;
              setIsUserSpeaking(vol > 0.015);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => { 
                if (session) session.sendRealtimeInput({ media: pcmBlob }); 
              }).catch(() => {});
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(liveAudioInputContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              outputTranscriptionRef.current += message.serverContent.outputTranscription.text;
              setDisplayTranscription(prev => ({ ...prev, output: outputTranscriptionRef.current }));
            } else if (message.serverContent?.inputTranscription) {
              inputTranscriptionRef.current += message.serverContent.inputTranscription.text;
              setDisplayTranscription(prev => ({ ...prev, input: inputTranscriptionRef.current }));
            }
            if (message.serverContent?.turnComplete) {
              const finalInput = inputTranscriptionRef.current;
              const finalOutput = outputTranscriptionRef.current;
              if (finalInput || finalOutput) {
                setMessages(prev => [
                  ...prev,
                  { id: `live-u-${Date.now()}`, role: 'user', text: finalInput || "(Voice Input)", timestamp: new Date() },
                  { id: `live-m-${Date.now()}`, role: 'model', text: finalOutput || "(Voice Response)", timestamp: new Date() }
                ]);
                addPoints(10);
              }
              inputTranscriptionRef.current = '';
              outputTranscriptionRef.current = '';
              setDisplayTranscription({ input: '', output: '' });
            }
            const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64 && liveAudioOutputContextRef.current) {
              setIsBotSpeaking(true);
              liveNextStartTimeRef.current = Math.max(liveNextStartTimeRef.current, liveAudioOutputContextRef.current.currentTime);
              const audioBuffer = await decodePcmAudio(decode(base64), liveAudioOutputContextRef.current, 24000, 1);
              const source = liveAudioOutputContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(liveAudioOutputContextRef.current.destination);
              source.onended = () => {
                liveSourcesSetRef.current.delete(source);
                if (liveSourcesSetRef.current.size === 0) setIsBotSpeaking(false);
              };
              source.start(liveNextStartTimeRef.current);
              liveNextStartTimeRef.current += audioBuffer.duration;
              liveSourcesSetRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              liveSourcesSetRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              liveSourcesSetRef.current.clear();
              liveNextStartTimeRef.current = 0;
              setIsBotSpeaking(false);
            }
          },
          onclose: () => stopLivePulse(),
          onerror: (err) => { 
            console.error("Live session error:", err); 
            setIsLiveActive(false);
            stopLivePulse(); 
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `STRICT LANGUAGE PROTOCOL: You are Sehat Mitra. You MUST respond ONLY in ${selectedLang.name}.
          1. All voice output and transcriptions must be in ${selectedLang.name}.
          2. Do NOT use English unless the selected language is English.
          3. If the user speaks in another language, you must still respond solely in ${selectedLang.name}.`,
        }
      });
      liveSessionRef.current = sessionPromise;
    } catch (e) { 
      console.error("Failed to start live pulse:", e); 
      setIsLiveActive(false); 
    }
  };

  const stopLivePulse = async () => {
    if (liveSessionRef.current) {
        liveSessionRef.current.then((session: any) => { if (session) session.close(); }).catch(() => {});
        liveSessionRef.current = null;
    }
    if (liveStreamRef.current) { liveStreamRef.current.getTracks().forEach(t => t.stop()); liveStreamRef.current = null; }
    if (liveProcessorRef.current) { liveProcessorRef.current.disconnect(); liveProcessorRef.current = null; }
    liveSourcesSetRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    liveSourcesSetRef.current.clear();
    liveNextStartTimeRef.current = 0;
    if (liveAudioInputContextRef.current) { await liveAudioInputContextRef.current.close().catch(() => {}); liveAudioInputContextRef.current = null; }
    if (liveAudioOutputContextRef.current) { await liveAudioOutputContextRef.current.close().catch(() => {}); liveAudioOutputContextRef.current = null; }
    setIsLiveActive(false); setIsUserSpeaking(false); setIsBotSpeaking(false);
    inputTranscriptionRef.current = ''; outputTranscriptionRef.current = ''; setDisplayTranscription({ input: '', output: '' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    try {
      const result = await chatSession.current.sendMessage({ message: currentInput });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.text, timestamp: new Date() }]);
      addPoints(5);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm so sorry, but I'm experiencing connectivity issues. Your message was saved locally.", timestamp: new Date(), isError: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
      {isLiveActive && (
        <div className="absolute top-16 left-0 right-0 z-40 bg-brand-600/95 backdrop-blur-md text-white py-2 px-6 flex items-center justify-between shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isBotSpeaking ? 'bg-amber-400 animate-ping' : isUserSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-white/50'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isBotSpeaking ? "Mitra Speaking..." : isUserSpeaking ? "Listening..." : "Live Active"}
            </span>
          </div>
          <button onClick={stopLivePulse} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-[9px] font-bold flex items-center gap-2 transition-all">
            <PhoneOff size={12} /> END CALL
          </button>
        </div>
      )}
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-sm relative">
              <Bot size={22} />
              {isLiveActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>}
           </div>
           <div>
              <h3 className="font-bold text-gray-900 dark:text-white leading-none">Mitra AI Chat</h3>
              <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span> 
                {isLiveActive ? "Voice Mode" : "History On"}
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={isLiveActive ? stopLivePulse : startLivePulse} className={`p-2.5 rounded-xl transition-all shadow-md relative group ${isLiveActive ? 'bg-red-500 text-white' : 'bg-brand-50 text-brand-600 animate-pulse-glow'}`}>
             {isLiveActive ? <PhoneOff size={20} /> : <Phone size={20} />}
           </button>
           <select value={selectedLang.code} onChange={(e) => setSelectedLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)} className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 font-bold outline-none cursor-pointer text-gray-900 dark:text-white">
             {SUPPORTED_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.native}</option>)}
           </select>
           <button onClick={clearChat} title="Clear Chat History" className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-brand-600 text-white'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`flex flex-col max-w-[85%] relative ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-5 py-4 shadow-sm relative group-hover:shadow-md transition-shadow ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'} ${msg.isError ? 'border-red-500 opacity-70' : ''}`}>
                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                {msg.id !== 'welcome-msg' && (
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                    title="Delete message"
                  >
                    <X size={10} strokeWidth={4} />
                  </button>
                )}
              </div>
              <span className="text-[10px] mt-2 font-bold text-gray-400 uppercase tracking-tighter">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {isLiveActive && (displayTranscription.input || displayTranscription.output) && (
          <div className="space-y-4">
            {displayTranscription.input && (
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><User size={14} /></div>
                <div className="bg-brand-600/50 text-white rounded-2xl px-4 py-2 text-sm italic opacity-80">{displayTranscription.input}</div>
              </div>
            )}
            {displayTranscription.output && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center"><Bot size={14} /></div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm border border-brand-100 dark:border-brand-900 text-gray-700 dark:text-gray-200">{displayTranscription.output}</div>
              </div>
            )}
          </div>
        )}
        {loading && (
          <div className="flex items-start gap-3">
             <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-sm"><Bot size={20} /></div>
             <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-5 py-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <Loader2 className="animate-spin text-brand-400" size={20} />
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex gap-3">
          <button onClick={isLiveActive ? stopLivePulse : startLivePulse} className={`p-4 rounded-2xl transition-all shadow-sm ${isLiveActive ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            {isLiveActive ? <Activity className="animate-pulse" /> : <Mic />}
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={isLiveActive} placeholder={isLiveActive ? "Voice mode..." : `Ask anything in ${selectedLang.name}...`} className="flex-1 px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" />
          <button onClick={handleSend} disabled={!input.trim() || loading || isLiveActive} className="bg-brand-600 text-white p-4 rounded-2xl hover:bg-brand-700 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-brand-500/20">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
