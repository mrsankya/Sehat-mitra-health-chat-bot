
import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Feedback } from '../types';

const MOCK_FEEDBACKS: Feedback[] = [
  { id: '1', userName: 'Amit K.', rating: 5, comment: 'Sehat Mitra helped me understand my fever symptoms quickly!', timestamp: new Date() },
  { id: '2', userName: 'Priya S.', rating: 5, comment: 'The vaccination schedule is a lifesaver for new parents.', timestamp: new Date() },
  { id: '3', userName: 'Rahul M.', rating: 4, comment: 'Impressive AI! Very simple to use in Hindi.', timestamp: new Date() },
  { id: '4', userName: 'Sneha L.', rating: 5, comment: 'The live pulse check feels like magic. Highly recommended.', timestamp: new Date() },
  { id: '5', userName: 'Vikram R.', rating: 5, comment: 'Best health partner app in India so far.', timestamp: new Date() },
];

export default function FeedbackTicker() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const savedFeedbacks = localStorage.getItem('sehat_feedbacks');
    if (savedFeedbacks) {
      const parsed = JSON.parse(savedFeedbacks).map((f: any) => ({ ...f, timestamp: new Date(f.timestamp) }));
      setFeedbacks([...MOCK_FEEDBACKS, ...parsed]);
    } else {
      setFeedbacks(MOCK_FEEDBACKS);
    }
  }, []);

  useEffect(() => {
    if (feedbacks.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
        setIsVisible(true);
      }, 500); // Wait for fade out
    }, 5000); // Show each for 5 seconds

    return () => clearInterval(interval);
  }, [feedbacks]);

  if (feedbacks.length === 0) return null;

  const current = feedbacks[currentIndex];

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 md:left-6 lg:left-72 z-40 pointer-events-none max-w-[calc(100vw-2rem)] md:max-w-xs w-full transition-all duration-500">
      <div className={`
        bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 
        p-3 rounded-2xl shadow-xl transition-all duration-500 transform
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}>
        <div className="flex items-start gap-3">
          <div className="bg-brand-500/20 p-2 rounded-xl text-brand-600 dark:text-brand-400">
            <MessageCircle size={14} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{current.userName}</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={8} 
                    className={i < current.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'} 
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] md:text-[11px] text-gray-800 dark:text-gray-200 line-clamp-2 italic leading-snug font-bold">
              "{current.comment}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
