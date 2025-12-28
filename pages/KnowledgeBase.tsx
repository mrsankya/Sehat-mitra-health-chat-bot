import React, { useState } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { getDiseaseInfo } from '../services/geminiService';
import { DiseaseInfo } from '../types';

const FAQs = [
  {
    q: "How can I prevent common mosquito-borne diseases like Dengue?",
    a: "Prevent mosquito bites by using repellents, wearing long-sleeved clothes, and sleeping under mosquito nets. Ensure there is no stagnant water around your home where mosquitoes can breed."
  },
  {
    q: "What constitutes a balanced diet?",
    a: "A balanced diet includes a variety of foods: fruits, vegetables, grains, protein foods, and dairy. It provides the nutrients your body needs to work effectively."
  },
  {
    q: "Why is hand hygiene important?",
    a: "Washing hands with soap and water removes germs that can make you sick. It is one of the most effective ways to prevent the spread of infections."
  }
];

export default function KnowledgeBase() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchDisease, setSearchDisease] = useState('');
  const [diseaseInfo, setDiseaseInfo] = useState<DiseaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiseaseSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDisease) return;
    setLoading(true);
    setDiseaseInfo(null);
    setError('');
    try {
        const info = await getDiseaseInfo(searchDisease);
        setDiseaseInfo(info);
    } catch (e: any) {
        console.error(e);
        setError("Couldn't find that disease. Try common ones like 'Fever', 'Malaria', or 'Dengue'.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <BookOpen className="w-12 h-12 text-brand-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Health Encyclopedia</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Get detailed, simplified explanations about diseases and conditions.</p>
        
        <form onSubmit={handleDiseaseSearch} className="max-w-md mx-auto relative mb-4">
          <input 
            type="text" 
            value={searchDisease}
            onChange={(e) => setSearchDisease(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
            placeholder="Search (e.g. Malaria, Fever)..."
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </form>

        {error && (
            <div className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg text-sm mb-4">
                {error}
            </div>
        )}

        {diseaseInfo && (
            <div className="mt-8 text-left bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-bold text-brand-700 dark:text-brand-300 capitalize">{diseaseInfo.name}</h3>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/30 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      <Info size={10} /> Verified Content
                   </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{diseaseInfo.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Symptoms
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {diseaseInfo.symptoms?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-semibold text-green-500 mb-2 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                           Prevention
                        </h4>
                         <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {diseaseInfo.prevention?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-semibold text-blue-500 mb-2 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                           Treatment
                        </h4>
                         <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {diseaseInfo.treatment?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* FAQ Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {FAQs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {faq.q}
                {openFaq === index ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 pt-0 text-gray-600 dark:text-gray-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}