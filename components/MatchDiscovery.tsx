
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { Card } from './ui/Card';

interface MatchDiscoveryProps {
  currentUser: UserProfile;
  others: UserProfile[];
  onSwipeRight: (user: UserProfile) => void;
  onSwipeLeft: (user: UserProfile) => void;
}

const MatchDiscovery: React.FC<MatchDiscoveryProps> = ({ currentUser, others, onSwipeRight, onSwipeLeft }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simple matching algorithm: score based on overlapping teach/want skills
  const scoredUsers = useMemo(() => {
    return others
      .filter(u => u.id !== currentUser.id)
      .map(u => {
        let score = 0;
        u.teachSkills.forEach(s => {
          if (currentUser.wantSkills.some(ws => ws.toLowerCase().includes(s.toLowerCase()))) score += 2;
        });
        u.wantSkills.forEach(s => {
          if (currentUser.teachSkills.some(ts => ts.toLowerCase().includes(s.toLowerCase()))) score += 2;
        });
        return { ...u, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [others, currentUser]);

  const activeUser = scoredUsers[currentIndex];

  const handleAction = (direction: 'left' | 'right') => {
    if (!activeUser) return;
    if (direction === 'right') onSwipeRight(activeUser);
    else onSwipeLeft(activeUser);
    setCurrentIndex(prev => prev + 1);
  };

  if (!activeUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold text-slate-800">You've reached the world's end!</h2>
        <p className="text-slate-500 mt-2">Check back later for more neighbors or try updating your skills.</p>
      </div>
    );
  }

  const overlapTeaches = activeUser.teachSkills.filter(s => currentUser.wantSkills.some(ws => ws.toLowerCase().includes(s.toLowerCase())));
  const overlapWants = activeUser.wantSkills.filter(s => currentUser.teachSkills.some(ts => ts.toLowerCase().includes(s.toLowerCase())));

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
      <div className="relative w-full max-w-sm h-[500px]">
        <Card className="absolute inset-0 flex flex-col shadow-2xl border-2 border-slate-100 overflow-hidden group">
          <div className="h-2/3 bg-slate-200 relative overflow-hidden">
            <img 
              src={`https://picsum.photos/seed/${activeUser.id}/400/600`} 
              alt={activeUser.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
              <h3 className="text-2xl font-black">{activeUser.name}</h3>
              <p className="text-sm font-medium opacity-90">{activeUser.city}, {activeUser.country}</p>
            </div>
            {activeUser.matchScore > 0 && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                High Match
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 space-y-4 bg-white overflow-y-auto">
            <div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Teaches</p>
              <div className="flex flex-wrap gap-1">
                {activeUser.teachSkills.map(s => (
                  <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${overlapTeaches.includes(s) ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest mb-1">Wants to Learn</p>
              <div className="flex flex-wrap gap-1">
                {activeUser.wantSkills.map(s => (
                  <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${overlapWants.includes(s) ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-6 mt-8">
        <button 
          onClick={() => handleAction('left')}
          className="w-16 h-16 bg-white border-2 border-red-100 rounded-full flex items-center justify-center text-red-500 shadow-xl hover:bg-red-50 active:scale-90 transition-all"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button 
          onClick={() => handleAction('right')}
          className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-90 transition-all"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default MatchDiscovery;
