
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Card } from './ui/Card';

interface ProfileSetupProps {
  initialUser: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ initialUser, onComplete }) => {
  const [name, setName] = useState(initialUser.name || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [teachSkills, setTeachSkills] = useState(['', '', '']);
  const [wantSkills, setWantSkills] = useState(['', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !country) return;

    setIsProcessing(true);
    
    let lat = 0;
    let lng = 0;
    
    try {
      // Improved Geocoding Query: Least specific to most specific or using structured parameters
      // Structured queries in Nominatim (country, state, city, postalcode) are most accurate.
      const params = new URLSearchParams({
        format: 'json',
        country: country,
        state: state,
        city: city,
        postalcode: zip,
        limit: '1'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      const data = await response.json();
      
      if (data && data[0]) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      } else {
        // Fallback: If structured search fails, try a simple query string with the hierarchy the user requested
        const queryStr = `${country}, ${state}, ${city}, ${zip}`;
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&limit=1`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData[0]) {
          lat = parseFloat(fallbackData[0].lat);
          lng = parseFloat(fallbackData[0].lon);
        } else {
          // Absolute fallback (e.g. if geocoding fails completely)
          lat = 20.5937; // Center of India
          lng = 78.9629;
        }
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      lat = 20.5937;
      lng = 78.9629;
    }

    const profile: UserProfile = {
      ...initialUser,
      name,
      city,
      state,
      country,
      zipCode: zip,
      teachSkills: teachSkills.filter(s => s.trim() !== ''),
      wantSkills: wantSkills.filter(s => s.trim() !== ''),
      location: { lat, lng }
    };
    
    onComplete(profile);
  };

  const handleSkillChange = (idx: number, val: string, type: 'teach' | 'want') => {
    if (type === 'teach') {
      const updated = [...teachSkills];
      updated[idx] = val;
      setTeachSkills(updated);
    } else {
      const updated = [...wantSkills];
      updated[idx] = val;
      setWantSkills(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800">Finish your profile</h1>
          <p className="text-slate-500 font-medium">Verify your location and skills to find neighbors</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">1. Address</h2>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
                <input required className="w-full px-4 py-2 border rounded-xl" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <input required className="w-full px-4 py-2 border rounded-xl" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. India" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State / Region</label>
                  <input required className="w-full px-4 py-2 border rounded-xl" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Maharashtra" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input required className="w-full px-4 py-2 border rounded-xl" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pin Code / ZIP</label>
                <input required className="w-full px-4 py-2 border rounded-xl" value={zip} onChange={e => setZip(e.target.value)} placeholder="e.g. 400001" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-pink-600">2. Expertise</h2>
              <div>
                <label className="block text-xs font-bold text-indigo-600 mb-1">I can teach...</label>
                {teachSkills.map((s, i) => (
                  <input key={`t-${i}`} className="w-full px-4 py-2 border rounded-xl mb-1 text-sm" value={s} onChange={e => handleSkillChange(i, e.target.value, 'teach')} placeholder={`Skill ${i+1}`} />
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-pink-600 mb-1">I want to learn...</label>
                {wantSkills.map((s, i) => (
                  <input key={`w-${i}`} className="w-full px-4 py-2 border rounded-xl mb-1 text-sm" value={s} onChange={e => handleSkillChange(i, e.target.value, 'want')} placeholder={`Skill ${i+1}`} />
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest"
          >
            {isProcessing ? 'Geocoding Location...' : 'Enter SkillSwap Neighborhood'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSetup;
