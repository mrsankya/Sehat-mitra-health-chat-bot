import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, MessageCircle, Syringe, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const cards = [
    {
      title: "Symptom Checker",
      desc: "Describe your symptoms and get instant AI-powered insights.",
      icon: Stethoscope,
      path: "/symptoms",
      color: "bg-blue-500"
    },
    {
      title: "Chat with Sehat Mitra",
      desc: "Have a friendly conversation about your health concerns.",
      icon: MessageCircle,
      path: "/chat",
      color: "bg-green-500"
    },
    {
      title: "Vaccination Schedule",
      desc: "Generate a personalized immunization timeline for your child.",
      icon: Syringe,
      path: "/vaccination",
      color: "bg-purple-500"
    },
    {
      title: "Find Health Resources",
      desc: "Locate nearby clinics, hospitals, and pharmacies.",
      icon: MapPin,
      path: "/resources",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-brand-600 to-teal-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Namaste, {user?.name}!</h1>
        <p className="text-brand-100 max-w-2xl">
          Welcome to Sehat Mitra. I'm here to help you live a healthier life. 
          What would you like to do today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link 
            key={card.path} 
            to={card.path}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
          >
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-sm`}>
              <card.icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{card.desc}</p>
            <div className="flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Start Now <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h3 className="text-amber-800 dark:text-amber-200 font-semibold text-lg mb-2">Daily Health Tip</h3>
        <p className="text-amber-700 dark:text-amber-300">
          "Staying hydrated is key to maintaining energy levels. Aim for at least 8 glasses of water a day, especially during hot weather!"
        </p>
      </div>
    </div>
  );
}