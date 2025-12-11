import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Newspaper, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { getHealthNews } from '../services/geminiService';

export default function HealthNews() {
  const [news, setNews] = useState<{ text: string, groundingChunks?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHealthNews();
      setNews(data);
    } catch (err) {
      setError('Failed to load health news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Newspaper className="text-brand-600 dark:text-brand-400" />
          Health News Feed
        </h2>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
          title="Refresh News"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !news && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
          <p>Curating the latest health updates for you...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800">
          {error}
        </div>
      )}

      {news && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{news.text}</ReactMarkdown>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500">
                  AI-generated summary based on latest search results.
                </div>
             </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
               <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                 <ExternalLink size={16} /> Sources
               </h3>
               {news.groundingChunks?.filter((c: any) => c.web).length === 0 ? (
                 <p className="text-sm text-gray-500">No specific sources cited.</p>
               ) : (
                 <div className="space-y-3">
                   {news.groundingChunks?.map((chunk: any, idx: number) => {
                     if (!chunk.web) return null;
                     return (
                       <a
                         key={idx}
                         href={chunk.web.uri}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors group"
                       >
                         <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                           {chunk.web.title}
                         </p>
                         <p className="text-xs text-gray-500 mt-1 truncate">
                           {new URL(chunk.web.uri).hostname}
                         </p>
                       </a>
                     );
                   })}
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}