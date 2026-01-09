
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity, Volume2, StopCircle, AlertCircle } from 'lucide-react';
import { LiveServerMessage, Modality } from '@google/genai';
import { getRawAI } from '../services/geminiService';

export default function LivePulse() {
  const [connected, setConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [error, setError] = useState('');
  
  // Audio Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  // Helper: Base64 to ArrayBuffer
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Helper: Encode ArrayBuffer to Base64
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Helper: Decode Audio Data
  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  // Create PCM Blob
  function createPcmBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  const startSession = async () => {
    setError('');
    
    if (!process.env.API_KEY) {
      setError("API Key missing. Please check your configuration.");
      return;
    }

    try {
      const ai = getRawAI();
      nextStartTimeRef.current = 0;

      // Setup Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      
      await inputContextRef.current.resume();
      await outputContextRef.current.resume();

      const outputNode = outputContextRef.current.createGain();
      outputNode.connect(outputContextRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setConnected(true);
            if (!inputContextRef.current || !streamRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const vol = inputData.reduce((s, v) => s + Math.abs(v), 0) / inputData.length;
              setSpeaking(vol > 0.01);

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current) {
               setBotSpeaking(true);
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
               const audioBuffer = await decodeAudioData(decode(base64Audio), outputContextRef.current, 24000, 1);
               const source = outputContextRef.current.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.onended = () => {
                 sourcesRef.current.delete(source);
                 if (sourcesRef.current.size === 0) setBotSpeaking(false);
               };
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setBotSpeaking(false);
            }
          },
          onclose: () => {
            setConnected(false);
            stopSession();
          },
          onerror: (e) => {
            console.error("Live pulse session error:", e);
            setError("Connection encountered a problem. Please try again.");
            stopSession();
          }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: "You are Sehat Mitra, an empathetic health partner. Mirror the user's language automatically. Speak naturally and helpfuly.",
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
        console.error("Start session failed:", e);
        setError("Could not establish connection. Check permissions.");
        setConnected(false);
    }
  };

  const stopSession = async () => {
    if (sessionRef.current) {
        sessionRef.current.then((s: any) => { if (s) s.close(); }).catch(() => {});
        sessionRef.current = null;
    }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    if (inputContextRef.current) { await inputContextRef.current.close().catch(() => {}); inputContextRef.current = null; }
    if (outputContextRef.current) { await outputContextRef.current.close().catch(() => {}); outputContextRef.current = null; }
    setConnected(false); setSpeaking(false); setBotSpeaking(false);
  };

  useEffect(() => { return () => { stopSession(); }; }, []);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-4">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-full bg-red-50 dark:bg-red-900/20 mb-4 text-red-500">
            <Activity size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sehat Mitra Live</h2>
        <p className="text-gray-500 mt-2">Natural voice conversation with your health assistant.</p>
      </div>

      <div className="relative">
        <div className={`w-48 h-48 rounded-[2.5rem] border-4 flex items-center justify-center transition-all duration-500 ${connected ? (botSpeaking ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-blue-200 bg-white dark:bg-gray-800') : 'border-gray-100 bg-gray-50 dark:bg-gray-900 dark:border-gray-800'}`}>
            {connected ? (
                <div className="space-y-2 flex flex-col items-center">
                    {botSpeaking ? (
                         <Volume2 size={48} className="text-brand-500 animate-pulse" />
                    ) : (
                        <Mic size={48} className={speaking ? "text-blue-500 animate-bounce" : "text-gray-400"} />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {botSpeaking ? "Mitra Speaking" : (speaking ? "Listening..." : "Waiting...")}
                    </span>
                </div>
            ) : (
                <MicOff size={48} className="text-gray-300 dark:text-gray-700" />
            )}
        </div>
        {connected && !botSpeaking && !speaking && (
           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[9px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/40 px-3 py-1 rounded-full uppercase tracking-tighter">Ready for your query</span>
           </div>
        )}
      </div>

      {error && (
        <div className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-4 py-3 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
           <AlertCircle size={18} />
           {error}
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={connected ? stopSession : startSession}
          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${connected ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-brand-600 text-white shadow-brand-500/20'}`}
        >
          {connected ? <><StopCircle /> End Live Call</> : <><Mic /> Start Live Call</>}
        </button>
      </div>
      
      <p className="text-xs text-gray-400 max-w-xs text-center font-medium leading-relaxed">
        Speak naturally as you would to a health partner. Mitra automatically detects your language.
      </p>
    </div>
  );
}
