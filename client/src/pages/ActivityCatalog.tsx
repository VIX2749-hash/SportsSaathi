import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Activity } from '../types';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Flame, 
  ArrowUpRight, 
  PlusCircle, 
  DollarSign, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

interface ActivityCatalogProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

// Curated high-res athletic photography matching sport disciplines
const sportCoverImages: Record<string, string> = {
  'Running': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=700&q=80',
  'Badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=700&q=80',
  'Tennis': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=700&q=80',
  'Football': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=700&q=80',
  'Cycling': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=700&q=80',
  'Gym & Lifting': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
  'Yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80',
  'Hiking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=700&q=80',
};

export const ActivityCatalog: React.FC<ActivityCatalogProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedIntensity, setSelectedIntensity] = useState('All');
  const [sort, setSort] = useState('soonest');

  const sportsFilterPills = [
    'All',
    'Running',
    'Badminton',
    'Football',
    'Tennis',
    'Cycling',
    'Gym & Lifting',
  ];

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSport !== 'All') params.append('sport', selectedSport);
      if (selectedLevel !== 'All') params.append('level', selectedLevel);
      if (selectedIntensity !== 'All') params.append('intensity', selectedIntensity);
      if (sort !== 'soonest') params.append('sort', sort);

      const res = await apiRequest<{ activities: Activity[] }>(`/activities?${params.toString()}`);
      setActivities(res.activities);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedSport, selectedLevel, selectedIntensity, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities();
  };

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Editorial Page Header & Host Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-300 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E76244]/10 text-[#E76244] font-mono text-xs uppercase font-bold tracking-wider mb-3">
              <Sparkles size={13} /> Activity Discovery
            </div>
            <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-[#221013] leading-none">
              Find Nearby Sports Sessions
            </h1>
            <p className="text-sm text-[#221013]/70 mt-2 max-w-xl font-sans">
              Morning runs, court reservations, turf pickup, and group rides organized by local athletes.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) onOpenAuth('login');
              else onNavigate('create-activity');
            }}
            className="flex items-center gap-2.5 bg-[#231215] hover:bg-[#341b20] text-white font-display font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-xl shrink-0"
          >
            <PlusCircle size={18} className="text-[#CCFF00]" />
            <span>Host An Activity</span>
          </button>
        </div>

        {/* Clean Filter Control Card */}
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-neutral-200 shadow-sm space-y-6">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search by session title, park name, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 rounded-full bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-sm placeholder-neutral-400 focus:border-[#221013] focus:outline-none transition-colors"
            />
            <Search size={18} className="absolute left-4 top-4 text-neutral-400" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-6 py-2 bg-[#231215] text-white font-display font-bold text-xs uppercase rounded-full hover:bg-neutral-800 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Sports Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-400 mr-2">
              Sports:
            </span>
            {sportsFilterPills.map((sport) => {
              const isSelected = selectedSport === sport;
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSelectedSport(sport)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    isSelected
                      ? 'bg-[#231215] text-white shadow-sm'
                      : 'bg-[#FAF7F0] hover:bg-neutral-200 text-[#221013] border border-neutral-300'
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013]/60 mb-1.5">
                Skill Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-[#FAF7F0] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#221013] focus:border-[#221013] focus:outline-none"
              >
                <option value="All">All Skill Levels</option>
                <option value="Beginner">Beginner Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced / Competitive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013]/60 mb-1.5">
                Pace / Intensity
              </label>
              <select
                value={selectedIntensity}
                onChange={(e) => setSelectedIntensity(e.target.value)}
                className="w-full bg-[#FAF7F0] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#221013] focus:border-[#221013] focus:outline-none"
              >
                <option value="All">All Intensities</option>
                <option value="Light">Light / Recovery</option>
                <option value="Moderate">Moderate Pace</option>
                <option value="High">High / Hard Workout</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013]/60 mb-1.5">
                Sort Schedule
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-[#FAF7F0] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#221013] focus:border-[#221013] focus:outline-none"
              >
                <option value="soonest">Happening Soonest</option>
                <option value="newest">Recently Posted</option>
              </select>
            </div>
          </div>

        </div>

        {/* Dynamic Activity Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#221013] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase text-neutral-500">
              Loading active sports sessions...
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-neutral-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <Flame size={36} className="text-[#E76244] mx-auto mb-3" />
            <h3 className="font-display text-2xl uppercase text-[#221013] mb-2">
              No Activities Match Your Filters
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Be the first to schedule an athletic meetup for this discipline!
            </p>
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else onNavigate('create-activity');
              }}
              className="px-6 py-3 rounded-full bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-md"
            >
              Host This Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {activities.map((act) => {
              const isFull = (act.spotsRemaining || 0) <= 0;
              const eventDate = new Date(act.startsAt);
              const cardImage = sportCoverImages[act.sport.name] || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=700&q=80';

              return (
                <div
                  key={act.id}
                  onClick={() => onNavigate('activity-detail', act.id)}
                  className="bg-white rounded-[26px] overflow-hidden border border-neutral-200 hover:border-neutral-400 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Editorial Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={cardImage}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Sport Badge Top Left */}
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#221013] text-[11px] font-mono uppercase font-bold tracking-wider shadow-sm">
                        {act.sport.name} • {act.experienceLevel}
                      </span>

                      {/* Fee Pill Top Right */}
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#231215]/90 text-white text-[11px] font-mono font-bold">
                        {act.cost === 0 ? 'FREE' : `₹${act.cost}`}
                      </span>

                      {/* Date bottom overlay */}
                      <span className="absolute bottom-3 left-4 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow">
                        <Clock size={13} className="text-[#CCFF00]" />
                        {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-display text-2xl uppercase tracking-tight text-[#221013] group-hover:text-[#E76244] transition-colors leading-snug">
                        {act.title}
                      </h3>

                      <p className="text-xs text-[#221013]/70 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>

                      <div className="space-y-1.5 pt-3 border-t border-neutral-100 text-xs text-[#221013]/60">
                        <div className="flex items-center gap-1.5 truncate font-medium">
                          <MapPin size={13} className="text-[#E76244] shrink-0" />
                          <span className="truncate">{act.generalLocation}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Users size={13} className="text-[#221013]/50 shrink-0" />
                            <span>{act.confirmedCount || 1} / {act.maxParticipants} joined</span>
                          </div>
                          <span className={`font-mono text-xs font-bold ${isFull ? 'text-[#E76244]' : 'text-emerald-700'}`}>
                            {isFull ? 'Session Full' : `${act.spotsRemaining} spots left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-neutral-100">
                    <span className="text-[11px] font-mono uppercase text-neutral-400">
                      Duration: {act.durationMinutes} min
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wider text-[#221013] group-hover:text-[#E76244] flex items-center gap-1">
                      {act.isUserJoined ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={14} /> Registered
                        </span>
                      ) : (
                        <>
                          <span>View Details</span>
                          <ArrowUpRight size={15} />
                        </>
                      )}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
