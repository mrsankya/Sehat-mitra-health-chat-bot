
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Stethoscope, MessageCircle, 
  Syringe, MapPin, BookOpen, LogOut, ShieldCheck, Newspaper,
  Activity, ScanLine, Star, Trophy, Languages, Globe, Bot
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../contexts/LanguageContext';
import FloatingAssistant from './FloatingAssistant';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { name: t('dashboard'), path: '/', icon: Home },
    { name: t('symptoms'), path: '/symptoms', icon: Stethoscope },
    { name: t('chat'), path: '/chat', icon: MessageCircle },
    { name: t('live'), path: '/live', icon: Activity },
    { name: t('scan'), path: '/scan', icon: ScanLine },
    { name: t('vaccination'), path: '/vaccination', icon: Syringe },
    { name: t('resources'), path: '/resources', icon: MapPin },
    { name: t('knowledge'), path: '/knowledge', icon: BookOpen },
    { name: t('news'), path: '/news', icon: Newspaper },
    { name: t('feedback'), path: '/feedback', icon: Star },
  ];

  const mobileTabs = [
    { name: t('dashboard'), path: '/', icon: Home },
    { name: t('symptoms'), path: '/symptoms', icon: Stethoscope },
    { name: t('chat'), path: '/chat', icon: MessageCircle },
    { name: t('scan'), path: '/scan', icon: ScanLine },
    { name: t('vaccination'), path: '/vaccination', icon: Syringe },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: t('admin'), path: '/admin', icon: ShieldCheck });
  }

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed lg:sticky top-0 z-50 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              Sehat Mitra
            </span>
            <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4">
             <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Trophy className="text-amber-500" size={16} />
                   <span className="text-[10px] font-black text-amber-800 dark:text-amber-200 uppercase tracking-widest">{t('points')}</span>
                </div>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{user?.points || 0}</span>
             </div>
          </div>

          <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all
                    ${isActive 
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-tighter">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex w-full items-center px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <span className="lg:hidden font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2">
               <Bot size={20} />
               Mitra
            </span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
             {/* Points Badge */}
             <div className="hidden sm:flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-800">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-xs font-black text-amber-700 dark:text-amber-300">{user?.points || 0}</span>
             </div>

             {/* Language Dropdown */}
             <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all border border-gray-100 dark:border-gray-600"
                >
                  <Globe size={18} className="text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-bold uppercase tracking-widest hidden md:block">
                    {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName}
                  </span>
                </button>

                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-20 overflow-hidden py-1 animate-in slide-in-from-top-2">
                       {SUPPORTED_LANGUAGES.map((lang) => (
                         <button
                           key={lang.code}
                           onClick={() => {
                             setLanguage(lang.code);
                             setIsLangOpen(false);
                           }}
                           className={`w-full flex flex-col items-start px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${language === lang.code ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''}`}
                         >
                           <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">{lang.nativeName}</span>
                           <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">{lang.name}</span>
                         </button>
                       ))}
                    </div>
                  </>
                )}
             </div>

             {/* Theme Toggle */}
             <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl dark:text-gray-400 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 24.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
          </div>
        </header>

        {/* Adjust bottom padding for mobile navigation */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Global Overlays */}
        <FloatingAssistant />

        {/* Mobile Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-4">
          <nav className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] flex items-center justify-around h-16 px-2">
             {mobileTabs.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   className={`
                     flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative
                     ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}
                   `}
                 >
                   <div className={`
                      p-2 rounded-xl transition-all duration-300
                      ${isActive ? 'bg-brand-50 dark:bg-brand-900/30 -translate-y-1' : ''}
                   `}>
                     <item.icon size={22} className={isActive ? 'animate-pulse' : ''} />
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-tighter mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60 scale-90'}`}>
                      {item.name}
                   </span>
                   {isActive && (
                     <div className="absolute -top-1 w-1 h-1 bg-brand-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                   )}
                 </NavLink>
               );
             })}
          </nav>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
