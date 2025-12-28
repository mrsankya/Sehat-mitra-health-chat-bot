import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, PlayCircle, ArrowRight } from 'lucide-react';

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
    login('Guest User', 'guest@demo.sehatmitra.ai');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sehat Mitra</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Your Compassionate AI Health Partner</p>
        </div>

        {/* Highlighted Demo Button */}
        <div className="relative">
          <button
            onClick={handleDemo}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-brand-500/20 transform transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className="bg-white/20 p-1 rounded-full">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-medium opacity-80 uppercase tracking-wider">Quick Start</span>
              <span className="block font-bold text-lg">Explore as Guest</span>
            </div>
            <ArrowRight className="ml-auto w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Pulse effect to highlight demo */}
          <div className="absolute inset-0 rounded-xl bg-brand-500 animate-ping opacity-20 pointer-events-none"></div>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-widest">Or Register</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
          >
            Get Started
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
          Secure & Private • AI-Powered Healthcare Insights
        </p>
      </div>
    </div>
  );
}