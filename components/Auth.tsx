
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Card } from './ui/Card';

interface AuthProps {
  onAuthComplete: (user: UserProfile, isNew: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const storedUsers: UserProfile[] = JSON.parse(localStorage.getItem('skillswap_users') || '[]');

    if (isLogin) {
      const user = storedUsers.find(u => u.email === email && u.password === password);
      if (user) {
        onAuthComplete(user, false);
      } else {
        setError('Invalid email or password');
      }
    } else {
      if (storedUsers.some(u => u.email === email)) {
        setError('Email already exists');
        return;
      }
      const newUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        email,
        password,
        zipCode: '',
        city: '',
        state: '',
        country: '',
        teachSkills: [],
        wantSkills: [],
      };
      // We don't save to the global list until onboarding is done to avoid partial profiles
      onAuthComplete(newUser, true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">SkillSwap</h1>
          <p className="text-slate-500 mt-2">{isLogin ? 'Welcome back, neighbor!' : 'Create your local account'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input 
              type="email"
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-600 font-semibold hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
