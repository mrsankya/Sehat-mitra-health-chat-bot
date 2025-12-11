import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { checkSymptoms } from '../services/geminiService';

export default function SymptomChecker() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const result = await checkSymptoms(input);
      setResponse(result || 'No response generated.');
    } catch (error) {
      setResponse("I'm sorry, but I encountered an error while processing your request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Important Medical Disclaimer</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                Sehat Mitra is an AI assistant, not a doctor. The information provided here is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. 
                <strong> Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</strong>
                If you think you may have a medical emergency, call your doctor or emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Describe Your Symptoms</h2>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-gray-900 resize-none"
            placeholder="e.g., I have had a high fever for 2 days, accompanied by a severe headache and nausea..."
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 prose dark:prose-invert max-w-none">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}