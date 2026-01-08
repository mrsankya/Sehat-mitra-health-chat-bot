
import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, Calendar, Bot, Trophy } from 'lucide-react';
import { Feedback } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackPage() {
  const { user, addPoints } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sehat_feedbacks');
    if (saved) {
      setFeedbacks(JSON.parse(saved).map((f: any) => ({ ...f, timestamp: new Date(f.timestamp) })));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    setIsSubmitting(true);
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      userName: user?.name || 'Anonymous',
      rating,
      comment,
      timestamp: new Date()
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('sehat_feedbacks', JSON.stringify(updated));
    
    // Award points for feedback
    addPoints(50);
    
    // Reset form
    setRating(0);
    setComment('');
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-16 relative">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-brand-50 dark:bg-brand-900/20 rounded-full mb-2">
          <Star className="w-10 h-10 text-amber-500 animate-pulse" fill="currentColor" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Community Feedback</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-lg">
          Earn <span className="text-amber-600 font-black">50 Sehat Points</span> by sharing your story!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Feedback Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Bot size={22} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Share Your Story</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          (hover || rating) >= star 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-gray-200 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Your Thoughts</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was your experience?"
                  className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    <Send size={18} />
                    Submit Feedback
                  </>
                )}
              </button>

              {showSuccess && (
                <div className="bg-amber-500 text-white p-4 rounded-xl shadow-lg text-center text-sm font-black uppercase tracking-widest animate-in fade-in zoom-in flex items-center justify-center gap-2">
                  <Trophy size={16} /> +50 Points Awarded!
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Feedback List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ThumbsUp className="text-brand-600" />
              User Reviews
            </h3>
            <span className="bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-4 py-1 rounded-full text-xs font-bold">
              {feedbacks.length + 5} Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((f) => (
              <div key={f.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900 flex items-center justify-center text-brand-600 font-bold">
                      {f.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{f.userName}</h4>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {f.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic text-sm">
                  "{f.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
