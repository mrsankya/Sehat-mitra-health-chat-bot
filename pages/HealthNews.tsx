import React, { useState, useEffect } from 'react';
import { Newspaper, Loader2, RefreshCw, ExternalLink, Calendar, Link as LinkIcon, Info } from 'lucide-react';
import { getHealthNews } from '../services/geminiService';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl?: string;
  isDefault?: boolean;
}

// High-quality, generic medical/health placeholder image
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1000&auto=format&fit=crop";

const DEFAULT_NEWS: NewsItem[] = [
  {
    title: "The Importance of Routine Health Checkups",
    summary: "Regular screenings can detect diseases early when they are most treatable. Learn which tests are essential for your age group.",
    source: "Sehat Mitra Guide",
    date: "Evergreen",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop",
    isDefault: true
  },
  {
    title: "Understanding Balanced Nutrition for Better Immunity",
    summary: "A diet rich in diverse fruits, vegetables, and proteins is the cornerstone of a strong immune system. Discover local superfoods.",
    source: "Health Essentials",
    date: "Evergreen",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop",
    isDefault: true
  },
  {
    title: "Mental Wellness: Breaking the Stigma in Communities",
    summary: "Mental health is just as important as physical health. Simple practices like mindfulness and open communication can make a huge difference.",
    source: "Wellness Hub",
    date: "Evergreen",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    isDefault: true
  }
];

export default function HealthNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(DEFAULT_NEWS);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHealthNews();
      if (data.items && data.items.length > 0) {
        // Filter out any potential duplicates and combine with defaults
        // Live news comes first
        setNewsItems([...data.items, ...DEFAULT_NEWS]);
        setGroundingChunks(data.groundingChunks || []);
      } else {
        // If API returns empty but doesn't throw, keep defaults
        setNewsItems(DEFAULT_NEWS);
      }
    } catch (err) {
      console.error("News fetch error:", err);
      setError('Failed to fetch real-time news. Showing standard health guides.');
      setNewsItems(DEFAULT_NEWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Newspaper className="text-brand-600 dark:text-brand-400" />
            Health & Wellness Feed
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time updates combined with essential health guides.
          </p>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Refresh Feed'}
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-center gap-3">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           {newsItems.map((item, idx) => (
             <article 
               key={`${item.title}-${idx}`} 
               className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 group relative"
             >
               {item.isDefault && (
                 <div className="absolute top-3 left-3 z-10 bg-brand-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                   Essential Guide
                 </div>
               )}
               <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                 <img 
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                      }
                    }}
                 />
               </div>
               <div className="flex flex-col flex-1 p-5">
                 <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-medium mb-2">
                    <span className="uppercase tracking-wider truncate max-w-[150px]">{item.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar size={12} /> {item.date}
                    </span>
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                   {item.title}
                 </h3>
                 <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-1">
                   {item.summary}
                 </p>
               </div>
             </article>
           ))}
        </div>

        {/* Sidebar Sources */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-2xl border border-brand-100 dark:border-brand-900/30 sticky top-6">
             <h3 className="font-semibold text-brand-900 dark:text-brand-100 mb-4 flex items-center gap-2">
               <LinkIcon size={18} /> Verified Links
             </h3>
             {groundingChunks.filter((c: any) => c.web).length === 0 ? (
               <div className="text-center py-4">
                 <p className="text-sm text-gray-500 italic">
                   {loading ? "Searching web sources..." : "Browse the latest guides on the left."}
                 </p>
               </div>
             ) : (
               <div className="space-y-3">
                 {groundingChunks.map((chunk: any, idx: number) => {
                   if (!chunk.web) return null;
                   return (
                     <a
                       key={idx}
                       href={chunk.web.uri}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 hover:shadow-sm border border-transparent hover:border-brand-200 dark:hover:border-brand-800 transition-all group"
                     >
                       <div className="mt-1 min-w-[16px]">
                          <ExternalLink size={14} className="text-gray-400 group-hover:text-brand-500" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                           {chunk.web.title}
                         </p>
                         <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                           {new URL(chunk.web.uri).hostname}
                         </p>
                       </div>
                     </a>
                   );
                 })}
               </div>
             )}
             
             <div className="mt-6 pt-6 border-t border-brand-100 dark:border-brand-900/30">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-widest">Health Disclaimer</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  News is curated using AI search grounding. Default guides are for educational purposes. Always consult a healthcare professional before acting on news information.
                </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}