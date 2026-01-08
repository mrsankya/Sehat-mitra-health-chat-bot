
import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr';

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    symptoms: 'Symptom Checker',
    chat: 'Sehat Chat',
    live: 'Live Pulse',
    scan: 'Smart Scan',
    vaccination: 'Vaccination',
    resources: 'Find Resources',
    knowledge: 'Knowledge Base',
    news: 'Health News',
    feedback: 'Feedback',
    admin: 'Admin Dashboard',
    welcome: 'Namaste',
    partner_desc: 'Your AI Health Partner',
    points: 'Sehat Points',
    wallet: 'Sehat Wallet',
    status: 'Health Status',
    chat_now: 'Chat Now',
    check_symptoms: 'Check Symptoms',
    available_points: 'Points Available',
    level_novice: 'Health Novice',
    level_warrior: 'Wellness Warrior',
    level_master: 'Medical Master'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    symptoms: 'लक्षण जांच',
    chat: 'सेहत चैट',
    live: 'लाइव पल्स',
    scan: 'स्मार्ट स्कैन',
    vaccination: 'टीकाकरण',
    resources: 'संसाधन खोजें',
    knowledge: 'ज्ञान केंद्र',
    news: 'स्वास्थ्य समाचार',
    feedback: 'प्रतिक्रिया',
    admin: 'एडमिन डैशबोर्ड',
    welcome: 'नमस्ते',
    partner_desc: 'आपका AI स्वास्थ्य साथी',
    points: 'सेहत पॉइंट्स',
    wallet: 'सेहत वॉलेट',
    status: 'स्वास्थ्य स्थिति',
    chat_now: 'अभी चैट करें',
    check_symptoms: 'लक्षणों की जाँच करें',
    available_points: 'उपलब्ध पॉइंट्स',
    level_novice: 'स्वास्थ्य नौसिखिया',
    level_warrior: 'वेलनेस योद्धा',
    level_master: 'मेडिकल मास्टर'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    symptoms: 'লক্ষণ পরীক্ষক',
    chat: 'সেহাত চ্যাট',
    live: 'লাইভ পালস',
    scan: 'স্মার্ট স্ক্যান',
    vaccination: 'টিকাদান',
    resources: 'সম্পদ খুঁজুন',
    knowledge: 'জ্ঞান ভাণ্ডার',
    news: 'স্বাস্থ্য সংবাদ',
    feedback: 'মতামত',
    admin: 'অ্যাডমিন ড্যাশবোর্ড',
    welcome: 'নমস্কার',
    partner_desc: 'আপনার AI স্বাস্থ্য সঙ্গী',
    points: 'সেহাত পয়েন্ট',
    wallet: 'সেহাত ওয়ালেট',
    status: 'স্বাস্থ্য অবস্থা',
    chat_now: 'চ্যাট করুন',
    check_symptoms: 'লক্ষণ পরীক্ষা করুন',
    available_points: 'পয়েন্ট উপলব্ধ',
    level_novice: 'স্বাস্থ্য নবীন',
    level_warrior: 'ওয়েলনেস যোদ্ধা',
    level_master: 'মেডিকেল মাস্টার'
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    symptoms: 'लक्षण तपासक',
    chat: 'सेहत चॅट',
    live: 'लाइव्ह पल्स',
    scan: 'स्मार्ट स्कॅन',
    vaccination: 'लसीकरण',
    resources: 'संसाधने शोधा',
    knowledge: 'ज्ञान केंद्र',
    news: 'आरोग्य बातम्या',
    feedback: 'प्रतिक्रिया',
    admin: 'अ‍ॅडमिन डॅशबोर्ड',
    welcome: 'नमस्कार',
    partner_desc: 'तुमचा AI आरोग्य साथी',
    points: 'सेहत पॉइंट्स',
    wallet: 'सेहत वॉलेट',
    status: 'आरोग्य स्थिती',
    chat_now: 'आत्ता चॅट करा',
    check_symptoms: 'लक्षणे तपासा',
    available_points: 'उपलब्ध पॉइंट्स',
    level_novice: 'आरोग्य नवशिका',
    level_warrior: 'वेलनेस वॉरियर',
    level_master: 'मेडिकल मास्टर'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem('sehat_lang') as LanguageCode) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sehat_lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
