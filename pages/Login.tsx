
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight, Bot, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      login(name, email);
      navigate('/');
    }
  };

  const handleDemo = () => {
    // Provide full level access (9999 points) and Admin role to the demo user
    login('Demo Admin', 'admin@demo.sehatmitra.ai', 'admin', 9999);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-gray-900 flex items-center justify-center p-4 selection:bg-brand-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-8 md:p-10 space-y-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-100 dark:bg-brand-900/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl opacity-60"></div>
        
        <div className="text-center relative">
          <div className="mx-auto mb-4 relative flex justify-center items-center h-40">
             <div className="relative group">
               {/* Animated Icon Avatar */}
               <div className="absolute inset-0 bg-brand-500 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <div className="relative h-32 w-32 bg-brand-600 dark:bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-xl transform group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 animate-float-slow">
                 <Bot size={64} strokeWidth={1.5} />
               </div>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/10 rounded-full blur-md"></div>
             </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Sehat Mitra</h2>
          <p className="mt-2 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-[10px]">Your AI Health Partner</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleDemo}
            className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white rounded-2xl shadow-xl shadow-brand-500/25 transform transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className="bg-white/20 p-1.5 rounded-lg">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-black opacity-80 uppercase tracking-widest">Master Access</span>
              <span className="block font-bold text-lg">Full Demo Mode</span>
            </div>
            <ArrowRight className="ml-auto w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Or Register</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
              placeholder="rahul@example.com"
            />
          </div>
          <button type="submit" className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95">
            Access Dashboard
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
           <ShieldCheck size={14} className="text-brand-500" />
           Private & Secure Health AI
        </div>
      </div>
      
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
