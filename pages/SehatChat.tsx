import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, User, Stethoscope } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { Message } from '../types';

export default function SehatChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Namaste! I am Sehat Mitra, your personal health assistant. How are you feeling today? You can ask me about symptoms, diet, hygiene, or general wellness.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        chatSession.current = createChatSession();
    } catch (e) {
        console.error("Failed to init chat", e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (!chatSession.current) {
        chatSession.current = createChatSession();
      }
      
      const result = await chatSession.current.sendMessage({ message: userMsg.text });
      const responseText = result.text; // Access text directly from property

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I apologize, but I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${msg.role === 'user' ? 'bg-brand-100 text-brand-600' : 'bg-teal-100 text-teal-600'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Stethoscope size={16} />}
            </div>
            <div className={`
              max-w-[80%] rounded-2xl p-4 
              ${msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-none' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'}
              ${msg.isError ? 'bg-red-50 text-red-600 border border-red-200' : ''}
            `}>
              <div className="prose dark:prose-invert max-w-none text-sm">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <span className={`text-[10px] mt-1 block opacity-70 ${msg.role === 'user' ? 'text-brand-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
              <Stethoscope size={16} />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your health question here..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          Sehat Mitra may display inaccurate info, including about medical conditions. Always verify with a doctor.
        </p>
      </div>
    </div>
  );
}