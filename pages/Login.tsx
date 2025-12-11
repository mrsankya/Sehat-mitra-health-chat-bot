import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome to Sehat Mitra</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Your Personal AI Health Assistant</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 bg-white text-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 bg-white text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tip: Use an email containing 'admin' to access the Admin Dashboard.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}