import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { 
  User, 
  MapPin, 
  Flame, 
  Award, 
  ShieldCheck, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  LogOut,
  Sliders
} from 'lucide-react';

interface ProfileSettingsProps {
  onOpenOnboarding: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onOpenOnboarding }) => {
  const { user, updateUser, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || 'Bengaluru, India');
  const [area, setArea] = useState(user?.area || 'Indiranagar');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileVisibility, setProfileVisibility] = useState(user?.profileVisibility || 'PUBLIC');
  const [searchRadiusKm, setSearchRadiusKm] = useState(user?.searchRadiusKm || 25);
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    try {
      const res = await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName,
          bio,
          city,
          area,
          avatarUrl,
          profileVisibility,
          searchRadiusKm,
        }),
      });

      updateUser(res.user);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-wineBorder pb-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-lime block mb-1">
            Athlete Settings
          </span>
          <h1 className="font-display text-4xl uppercase tracking-tight text-brand-ivory">
            My Sports Profile
          </h1>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-wineCard border border-brand-lime/40 text-brand-lime text-xs font-mono uppercase font-bold hover:bg-brand-wine"
        >
          <Sliders size={14} /> Re-run 5-Step Onboarding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Card: Summary & Stats */}
        <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-6 flex flex-col justify-between">
          <div className="text-center space-y-3">
            <img
              src={avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={displayName}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-brand-lime mx-auto shadow-lime-glow"
            />
            <h3 className="font-display text-2xl uppercase text-brand-ivory">{displayName}</h3>
            <p className="text-xs text-brand-ivoryMuted">{area || city}</p>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-brand-wineBorder">
              <div className="p-3 rounded-2xl bg-brand-wine border border-brand-wineBorder">
                <span className="font-display text-2xl text-brand-coral font-bold">{user.streakCount}</span>
                <span className="block text-[10px] uppercase font-mono text-brand-ivoryMuted">Wk Streak</span>
              </div>
              <div className="p-3 rounded-2xl bg-brand-wine border border-brand-wineBorder">
                <span className="font-display text-2xl text-brand-lime font-bold">{user.totalSessions}</span>
                <span className="block text-[10px] uppercase font-mono text-brand-ivoryMuted">Sessions</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-wineBorder">
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl border border-brand-coral/40 text-brand-coral hover:bg-brand-coral/10 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Card: Edit Profile Fields */}
        <div className="md:col-span-2 bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-6 sm:p-8">
          
          {successMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-brand-lime/10 border border-brand-lime text-brand-lime text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Profile preferences successfully updated!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1">
                  Neighborhood / Area
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-xs focus:border-brand-lime focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1">
                Athlete Bio & Motivation
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-brand-wine border border-brand-wineBorder">
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-ivory mb-1">
                  Profile Visibility
                </label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-full p-2 rounded-lg bg-brand-wineDark border border-brand-wineBorder text-xs text-brand-ivory focus:border-brand-lime focus:outline-none"
                >
                  <option value="PUBLIC">Public (All local athletes)</option>
                  <option value="CONNECTIONS_ONLY">Connections Only</option>
                  <option value="PRIVATE">Hidden / Incognito</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-ivory mb-1">
                  Search Radius ({searchRadiusKm} km)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={searchRadiusKm}
                  onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                  className="w-full accent-brand-lime cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-lime hover:bg-brand-limeHover text-brand-dark font-display font-bold text-xs uppercase shadow-lime-glow transition-all"
              >
                <Save size={16} />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
};
