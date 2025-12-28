
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { UserProfile } from '../types';

// Fix for default marker icons in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface SkillMapProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    // Crucial: invalidateSize fixes maps not loading entirely after dynamic renders
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.flyTo(center, 12, { animate: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [center, map]);

  return null;
};

const SkillMap: React.FC<SkillMapProps> = ({ users, currentUser, onSelectUser }) => {
  // Ensure we have a valid center, defaulting to India if something is wrong
  const center: [number, number] = currentUser.location 
    ? [currentUser.location.lat, currentUser.location.lng] 
    : [20.5937, 78.9629];

  return (
    <div className="w-full h-full relative bg-slate-100" style={{ minHeight: '100%', display: 'flex' }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', flex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />
        
        {/* Current User Marker */}
        <Marker position={center}>
          <Popup>
            <div className="text-center p-1">
              <div className="font-black text-indigo-600 text-sm">{currentUser.name} (You)</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentUser.city}</div>
            </div>
          </Popup>
        </Marker>

        {/* Other Registered Users - Names specifically shown */}
        {users.filter(u => u.id !== currentUser.id).map(user => (
          user.location && (
            <Marker key={user.id} position={[user.location.lat, user.location.lng]}>
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={`https://picsum.photos/seed/${user.id}/40/40`} 
                      className="w-10 h-10 rounded-xl border-2 border-indigo-50 shadow-sm" 
                      alt={user.name} 
                    />
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 text-sm leading-tight truncate">{user.name}</h3>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{user.city}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4 bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] leading-tight">
                      <span className="font-black text-indigo-600 uppercase">Teaches:</span> <span className="text-slate-700">{user.teachSkills.join(', ') || 'N/A'}</span>
                    </p>
                    <p className="text-[10px] leading-tight">
                      <span className="font-black text-pink-600 uppercase">Wants:</span> <span className="text-slate-700">{user.wantSkills.join(', ') || 'N/A'}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => onSelectUser(user)}
                    className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-md active:scale-95"
                  >
                    Chat with {user.name.split(' ')[0]}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default SkillMap;
