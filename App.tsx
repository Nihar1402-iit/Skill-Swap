
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, ViewState, Message } from './types';
import Auth from './components/Auth';
import ProfileSetup from './components/ProfileSetup';
import SkillMap from './components/SkillMap';
import MatchDiscovery from './components/MatchDiscovery';
import ChatRoom from './components/ChatRoom';
import { Card } from './components/ui/Card';

// Removed Sarah, Marcus, Chloe, and James as requested. 
// Starting with an empty or limited verified set.
const INITIAL_MOCK_USERS: UserProfile[] = [];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('AUTH');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Load Initial Users and Login State
  useEffect(() => {
    const stored = localStorage.getItem('skillswap_users');
    let usersList: UserProfile[] = [];
    if (stored) {
      usersList = JSON.parse(stored);
    } else {
      usersList = INITIAL_MOCK_USERS;
      localStorage.setItem('skillswap_users', JSON.stringify(usersList));
    }
    setAllUsers(usersList);

    const current = localStorage.getItem('skillswap_logged_in_user');
    if (current) {
      const user = JSON.parse(current);
      const latestInfo = usersList.find(u => u.id === user.id);
      setCurrentUser(latestInfo || user);
      setCurrentView('MAP');
    }
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if ('vibrate' in navigator) navigator.vibrate(200);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleAuthComplete = (user: UserProfile, isNew: boolean) => {
    if (isNew) {
      setCurrentUser(user);
      setCurrentView('ONBOARDING');
    } else {
      setCurrentUser(user);
      setCurrentView('MAP');
      localStorage.setItem('skillswap_logged_in_user', JSON.stringify(user));
    }
  };

  const handleProfileComplete = (profile: UserProfile) => {
    const updatedUsers = [...allUsers.filter(u => u.id !== profile.id), profile];
    setAllUsers(updatedUsers);
    localStorage.setItem('skillswap_users', JSON.stringify(updatedUsers));
    setCurrentUser(profile);
    localStorage.setItem('skillswap_logged_in_user', JSON.stringify(profile));
    setCurrentView('MAP');
    showNotification("Profile set up! Welcome to SkillSwap, " + profile.name);
  };

  const handleLogout = () => {
    localStorage.removeItem('skillswap_logged_in_user');
    setCurrentUser(null);
    setCurrentView('AUTH');
  };

  const handleSwipeRight = (target: UserProfile) => {
    showNotification(`It's a Match! Message ${target.name} now.`);
  };

  if (currentView === 'AUTH') return <Auth onAuthComplete={handleAuthComplete} />;
  if (currentView === 'ONBOARDING' && currentUser) return <ProfileSetup initialUser={currentUser} onComplete={handleProfileComplete} />;
  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in slide-in-from-top duration-300">
          <Card className="bg-slate-900 border-none shadow-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-black uppercase tracking-widest mb-0.5">SkillSwap Alert</p>
              <p className="text-slate-300 text-sm font-medium">{notification}</p>
            </div>
          </Card>
        </div>
      )}

      <header className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">SkillSwap</h1>
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            {currentUser.city || 'Setting up...'}, {currentUser.country}
          </p>
        </div>
        <div 
          onClick={() => setCurrentView('PROFILE')}
          className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden active:scale-95"
        >
          <img src={`https://picsum.photos/seed/${currentUser.id}/128/128`} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0">
        {currentView === 'MAP' && (
          <SkillMap 
            users={allUsers} 
            currentUser={currentUser} 
            onSelectUser={(u) => {
              setSelectedUser(u);
              setCurrentView('MESSAGES');
            }}
          />
        )}

        {currentView === 'DISCOVER' && (
          <MatchDiscovery 
            currentUser={currentUser} 
            others={allUsers} 
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={() => {}}
          />
        )}

        {currentView === 'GALLERY' && (
          <div className="p-6 space-y-6 pb-32 max-w-2xl mx-auto w-full overflow-y-auto">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">✨</span>
              Active Users
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {allUsers.filter(u => u.id !== currentUser.id).length === 0 ? (
                <div className="py-10 text-center text-slate-400">No other users registered yet. Invite your friends!</div>
              ) : (
                allUsers.filter(u => u.id !== currentUser.id).map(user => (
                  <Card 
                    key={user.id} 
                    className="p-5 flex gap-5 border-slate-50 hover:border-indigo-100 group"
                    onClick={() => {
                      setSelectedUser(user);
                      setCurrentView('MESSAGES');
                    }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <img src={`https://picsum.photos/seed/${user.id}/200/200`} alt={user.name} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{user.name}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">{user.city}, {user.country}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">Teach: {user.teachSkills[0] || 'TBD'}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-pink-50 text-pink-700 rounded-md">Want: {user.wantSkills[0] || 'TBD'}</span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'PROFILE' && (
          <div className="p-8 space-y-8 pb-32 max-w-xl mx-auto w-full overflow-y-auto">
            <div className="text-center space-y-5">
              <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-100 mx-auto border-8 border-white shadow-2xl overflow-hidden -rotate-2">
                <img src={`https://picsum.photos/seed/${currentUser.id}/300/300`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{currentUser.name}</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{currentUser.city}, {currentUser.country}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-slate-900 text-white border-none shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Expertise</h3>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentUser.teachSkills.map(s => (
                    <span key={s} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold backdrop-blur-md border border-white/5">{s}</span>
                  ))}
                </div>
              </Card>
              <Card className="p-6 bg-white border-slate-100 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600">Curiosity</h3>
                  <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentUser.wantSkills.map(s => (
                    <span key={s} className="px-4 py-2 bg-pink-50 text-pink-700 rounded-xl text-sm font-bold border border-pink-100">{s}</span>
                  ))}
                </div>
              </Card>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-slate-50 text-slate-500 font-black text-sm rounded-3xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98]"
            >
              Sign Out from Neighborhood
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-2 flex items-center justify-around z-50">
        <button 
          onClick={() => setCurrentView('MAP')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all rounded-[2rem] ${currentView === 'MAP' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
        <button 
          onClick={() => setCurrentView('DISCOVER')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all rounded-[2rem] ${currentView === 'DISCOVER' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
        <button 
          onClick={() => setCurrentView('GALLERY')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all rounded-[2rem] ${currentView === 'GALLERY' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <button 
          onClick={() => setCurrentView('PROFILE')}
          className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all rounded-[2rem] ${currentView === 'PROFILE' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </button>
      </nav>

      {currentView === 'MESSAGES' && selectedUser && (
        <ChatRoom 
          currentUser={currentUser} 
          otherUser={selectedUser} 
          onNewMessage={showNotification}
          onBack={() => {
            setCurrentView('MAP');
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
