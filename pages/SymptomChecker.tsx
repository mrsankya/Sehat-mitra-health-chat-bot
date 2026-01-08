
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, Send, Loader2, Volume2, BrainCircuit, Trophy } from 'lucide-react';
import { checkSymptoms, speakText } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

export default function SymptomChecker() {
  const { addPoints } = useAuth();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showPointToast, setShowPointToast] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const result = await checkSymptoms(input);
      setResponse(result || 'No response generated.');
      
      // Award points for symptom checking
      addPoints(20);
      setShowPointToast(true);
      setTimeout(() => setShowPointToast(false), 3000);

    } catch (error) {
      setResponse("I'm sorry, but I encountered an error while processing your request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!response || speaking) return;
    setSpeaking(true);
    try {
      const base64Audio = await speakText(response.replace(/[*#]/g, '').substring(0, 500) + "..."); 
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const buffer = await audioContext.decodeAudioData(bytes.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => setSpeaking(false);
      }
    } catch (e) {
      console.error(e);
      setSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {/* Points Toast */}
      {showPointToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
           <div className="bg-amber-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest border-2 border-white">
              <Trophy size={18} /> +20 Sehat Points Earned!
           </div>
        </div>
      )}

      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Important Medical Disclaimer</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                Sehat Mitra is an AI assistant, not a doctor. Always seek the advice of your physician. 
                <strong> This tool is for educational purposes only.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Describe Your Symptoms</h2>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                <BrainCircuit size={14} />
                Deep Thinking Enabled
            </div>
        </div>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-gray-900 resize-none"
            placeholder="e.g., I have had a high fever for 2 days, accompanied by a severe headache..."
          />
          <button
            onClick={handleCheck}
            disabled={loading || !input.trim()}
            className="absolute bottom-4 right-4 bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {response && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
            <button 
                onClick={handleSpeak} 
                disabled={speaking}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${speaking ? 'text-brand-500' : 'text-gray-500'}`}
                title="Read aloud"
            >
                {speaking ? <Loader2 className="w-5 h-5 animate-spin"/> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
