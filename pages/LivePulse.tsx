import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity, Volume2, StopCircle } from 'lucide-react';
import { LiveServerMessage, Modality } from '@google/genai';
import { getRawAI } from '../services/geminiService';

export default function LivePulse() {
  const [connected, setConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false); // User speaking
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    const ai = getRawAI();
    try {
      // 1. Setup Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const outputNode = outputContextRef.current.createGain();
      outputNode.connect(outputContextRef.current.destination);

      // 2. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setConnected(true);

            // Stream Audio Input
            const source = inputContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Simple VAD visualization
              const vol = inputData.reduce((s, v) => s + Math.abs(v), 0) / inputData.length;
              setSpeaking(vol > 0.01);

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
               setBotSpeaking(true);
               if (!outputContextRef.current) return;
               
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 outputContextRef.current,
                 24000,
                 1
               );

               const source = outputContextRef.current.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
                 if (sourcesRef.current.size === 0) setBotSpeaking(false);
               });
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setBotSpeaking(false);
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setConnected(false);
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection error.");
            setConnected(false);
          }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: "You are Sehat Mitra, a helpful health assistant. Speak clearly and simply.",
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
        console.error(e);
        setError("Failed to start session. Check permissions.");
    }
  };

  const stopSession = async () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (inputContextRef.current) {
        await inputContextRef.current.close();
        inputContextRef.current = null;
    }
    if (outputContextRef.current) {
        await outputContextRef.current.close();
        outputContextRef.current = null;
    }
    
    setConnected(false);
    setSpeaking(false);
    setBotSpeaking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        stopSession();
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-full bg-red-50 dark:bg-red-900/20 mb-4 text-red-500">
            <Activity size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sehat Mitra Live</h2>
        <p className="text-gray-500 mt-2">Have a natural voice conversation with your health assistant.</p>
      </div>

      <div className="relative">
        <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${connected ? (botSpeaking ? 'border-brand-400 bg-brand-50 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-gray-200 bg-white') : 'border-gray-100 bg-gray-50'}`}>
            {connected ? (
                <div className="space-y-2 flex flex-col items-center">
                    {botSpeaking ? (
                         <Volume2 size={48} className="text-brand-500 animate-pulse" />
                    ) : (
                        <Mic size={48} className={speaking ? "text-blue-500 animate-bounce" : "text-gray-400"} />
                    )}
                    <span className="text-sm font-medium text-gray-400">
                        {botSpeaking ? "Speaking..." : (speaking ? "Listening..." : "Waiting...")}
                    </span>
                </div>
            ) : (
                <MicOff size={48} className="text-gray-300" />
            )}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <button
        onClick={connected ? stopSession : startSession}
        className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${connected ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
      >
        {connected ? <><StopCircle /> End Call</> : <><Mic /> Start Live Call</>}
      </button>
      
      <p className="text-xs text-gray-400 max-w-xs text-center">
        Uses Gemini Live API for real-time low-latency audio interaction. Requires microphone access.
      </p>
    </div>
  );
}