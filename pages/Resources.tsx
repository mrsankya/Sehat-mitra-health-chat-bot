import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { findHealthResources } from '../services/geminiService';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';

export default function Resources() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | undefined>(undefined);
  const [results, setResults] = useState<{ text: string, groundingChunks?: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'found' | 'error'>('idle');

  useEffect(() => {
    // Attempt to get location on mount for better results
    if (navigator.geolocation) {
        setLocationStatus('locating');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocationStatus('found');
            },
            (err) => {
                console.warn("Location access denied or failed", err);
                setLocationStatus('error');
            }
        );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);
    try {
      const data = await findHealthResources(query, location);
      setResults(data);
    } catch (error) {
      console.error(error);
      setResults({ text: "Failed to fetch resources. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="text-orange-500" />
            Find Local Health Resources
        </h2>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Cardiologists nearby, 24hr pharmacy in Mumbai"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center"
          >
             {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </form>
        
        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            {locationStatus === 'locating' && <span className="flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Getting your location...</span>}
            {locationStatus === 'found' && <span className="text-green-600 dark:text-green-400 flex items-center"><Navigation className="w-3 h-3 mr-1"/> Using your current location</span>}
            {locationStatus === 'error' && <span className="text-red-500">Location access denied. Results may be less accurate.</span>}
        </div>
      </div>

      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
           {/* If we have grounding chunks (Google Maps data), we can render them nicely */}
           {results.groundingChunks && results.groundingChunks.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   {results.groundingChunks.map((chunk: any, i: number) => {
                       // Only render if it's a map grounding chunk
                       if (!chunk.web?.uri && !chunk.web?.title) return null; // Fallback logic if maps chunks structure differs, but prompt says web uri structure. The prompt says groundingChunks.maps.uri for maps.
                       // Let's handle general grounding chunks just in case, but specific for maps:
                       // "To get place URLs, in the form [{"maps": {"uri": "", "title": ""}, ... }]"
                       
                       // Let's assume the structure provided in the prompt example
                       const mapData = chunk.web || chunk.maps; // Defensive coding
                       if (!mapData) return null;

                       return (
                           <a 
                            key={i} 
                            href={mapData.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                           >
                               <h3 className="font-semibold text-brand-600 dark:text-brand-400">{mapData.title}</h3>
                               <p className="text-xs text-gray-500 mt-1">View on Google Maps</p>
                           </a>
                       )
                   })}
               </div>
           ) : null}

           <div className="prose dark:prose-invert max-w-none">
             <ReactMarkdown>{results.text}</ReactMarkdown>
           </div>
           
           <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 text-center">
               Results provided by Google Maps Grounding via Gemini. Verify hours and availability.
           </div>
        </div>
      )}
    </div>
  );
}