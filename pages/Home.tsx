
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, MessageCircle, Syringe, MapPin, 
  ArrowRight, Zap, Globe, Sparkles, Bot, ShieldCheck, Trophy, TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import FeedbackTicker from '../components/FeedbackTicker';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const cards = [
    { title: t('symptoms'), desc: "AI health insights.", icon: Stethoscope, path: "/symptoms", color: "bg-blue-500" },
    { title: t('chat'), desc: "Chat with Mitra.", icon: MessageCircle, path: "/chat", color: "bg-green-500" },
    { title: t('vaccination'), desc: "Immune timeline.", icon: Syringe, path: "/vaccination", color: "bg-purple-500" },
    { title: t('resources'), desc: "Nearby clinics.", icon: MapPin, path: "/resources", color: "bg-orange-500" }
  ];

  const points = user?.points || 0;
  
  const getLevelLabel = () => {
    if (points < 500) return t('level_novice');
    if (points < 1500) return t('level_warrior');
    return t('level_master');
  };

  const levelLabel = getLevelLabel();
  const progress = (points % 500) / 5;

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      {/* Compact Animated Hero Section */}
      <div className="relative">
        <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-teal-500 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white shadow-lg relative overflow-hidden min-h-[140px] md:min-h-[180px] flex items-center">
          <div className="relative z-10 max-w-lg">
            <span className="inline-block px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3">
              {t('partner_desc')}
            </span>
            <h1 className="text-2xl md:text-4xl font-black mb-1.5 leading-tight">
              {t('welcome')}, {user?.name}!
            </h1>
            <p className="text-brand-50 text-xs md:text-sm opacity-90 max-w-xs md:max-w-md mb-4 leading-relaxed">
              I'm Mitra. How can I assist with your wellness today?
            </p>
            <div className="flex flex-row gap-2">
               <Link to="/chat" className="px-5 py-2 bg-white text-brand-600 text-center text-[11px] md:text-xs font-bold rounded-lg shadow-md hover:bg-brand-50 transition-all active:scale-95 z-20">
                  {t('chat_now')}
               </Link>
               <Link to="/symptoms" className="px-5 py-2 bg-brand-700/30 text-center backdrop-blur-md border border-white/20 text-white text-[11px] md:text-xs font-bold rounded-lg hover:bg-brand-700/50 transition-all z-20">
                  {t('check_symptoms')}
               </Link>
            </div>
          </div>
          
          {/* Decorative Animated Elements */}
          <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Styled Bot Icon instead of Image */}
          <div className="absolute right-4 bottom-4 md:right-10 md:bottom-8 z-10 opacity-20 md:opacity-40 pointer-events-none">
            <div className="relative">
               <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-20 animate-pulse"></div>
               <Bot size={120} className="text-white animate-float relative z-10" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Points & Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="md:col-span-1 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <Trophy className="absolute -right-4 -bottom-4 text-amber-500/10 w-24 h-24 rotate-12" />
            <div className="relative z-10">
               <h3 className="text-amber-800 dark:text-amber-200 font-black text-[10px] uppercase tracking-widest mb-1">{t('status')}</h3>
               <p className="text-xl font-black text-amber-600 dark:text-amber-400 mb-2">{levelLabel}</p>
               <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-500 mb-1 font-bold">
                  <span>Level Progress</span>
                  <span>{Math.round(progress)}%</span>
               </div>
               <div className="w-full h-2 bg-amber-200 dark:bg-amber-800/40 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
               <p className="text-[9px] text-amber-600/60 mt-2 font-medium">Earn more points for the next rank!</p>
            </div>
         </div>
         
         <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('wallet')}</h3>
               <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">{points}</span>
                  <span className="text-xs font-bold text-brand-600 pb-1">{t('available_points')}</span>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="text-center">
                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 mb-1 mx-auto">
                     <TrendingUp size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500">Activity Rank</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">#124</p>
               </div>
               <div className="text-center">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 mb-1 mx-auto">
                     <Zap size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500">Day Streak</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white">5 Days</p>
               </div>
            </div>
         </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => (
          <Link 
            key={card.path} 
            to={card.path}
            className="group relative bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300"
          >
            <div className={`w-9 h-9 md:w-11 md:h-11 ${card.color} rounded-lg flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
              <card.icon size={18} className="md:w-5 md:h-5" />
            </div>
            <h3 className="text-xs md:text-base font-bold text-gray-900 dark:text-white mb-0.5">{card.title}</h3>
            <p className="hidden md:block text-gray-500 dark:text-gray-400 text-[10px] leading-tight line-clamp-1">{card.desc}</p>
          </Link>
        ))}
      </div>

      <FeedbackTicker />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
