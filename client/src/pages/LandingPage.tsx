import React, { useState } from 'react';
import { Activity, Partner } from '../types';
import { 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  EyeOff, 
  UserX, 
  ArrowUpRight, 
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  activities: Activity[];
  partners: Partner[];
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  activities,
  partners,
  onNavigate,
  onOpenAuth,
}) => {
  const [activeSportFilter, setActiveSportFilter] = useState('FOOTBALL');

  const sportsList = [
    { id: 'RUNNING', label: 'RUNNING' },
    { id: 'BADMINTON', label: 'BADMINTON' },
    { id: 'FOOTBALL', label: 'FOOTBALL' },
    { id: 'CYCLING', label: 'CYCLING' },
    { id: 'TENNIS', label: 'TENNIS' },
    { id: 'BASKETBALL', label: 'BASKETBALL' },
    { id: 'CRICKET', label: 'CRICKET' },
    { id: 'SWIMMING', label: 'SWIMMING' },
    { id: 'YOGA', label: 'YOGA' },
    { id: 'HIKING', label: 'HIKING' },
    { id: 'GYM', label: 'GYM' },
    { id: 'VOLLEYBALL', label: 'VOLLEYBALL' },
  ];

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen">
      
      {/* 1. HERO SECTION (Exactly matching screenshot 4 with rounded dark wine frame inside ivory page) */}
      <section className="px-4 sm:px-8 pt-6 pb-12">
        <div className="max-w-7xl mx-auto bg-[#231215] rounded-[36px] overflow-hidden p-8 sm:p-14 lg:p-16 text-white relative shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Headline & Content */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Badge: FIND YOUR PEOPLE */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#341b20] border border-[#4d2830] text-xs font-mono tracking-wider uppercase text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                FIND YOUR PEOPLE
              </div>

              {/* Huge Condensed Display Headline */}
              <h1 className="font-display text-5xl sm:text-7xl lg:text-[84px] uppercase font-bold tracking-tight text-white leading-[0.92]">
                YOUR NEXT <br />
                WORKOUT <br />
                SHOULDN'T BE A <br />
                <span className="text-[#CCFF00]">SOLO MISSION.</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-white/70 max-w-lg font-sans leading-relaxed">
                Find people who share your pace, your schedule, and your favorite sports. From early-morning runs to weekend matches, your next sports partner is closer than you think.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-display font-bold text-base uppercase tracking-wider px-8 py-4 rounded-full transition-transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <span>Get Started with Google</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => onNavigate('activities')}
                  className="bg-transparent hover:bg-white/10 text-white font-display font-semibold text-base uppercase tracking-wider px-7 py-4 rounded-full border border-white/20 transition-all flex items-center gap-2"
                >
                  <span>Explore Activities</span>
                  <ArrowUpRight size={16} className="text-[#CCFF00]" />
                </button>
              </div>

            </div>

            {/* Right Image Feature & Floating Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[28px] overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80"
                  alt="Athletes running together outdoors at sunrise"
                  className="w-full h-[480px] object-cover"
                />
                
                {/* Floating Bottom Card: EXAMPLE ACTIVITY */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#FAF7F0] text-[#221013] p-5 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-black/50 block font-bold mb-1">
                    EXAMPLE ACTIVITY
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-xl uppercase font-bold text-[#221013]">
                        7 AM RIVERSIDE RUN
                      </h4>
                      <p className="text-xs text-[#221013]/70 font-sans mt-0.5">
                        Tomorrow 7:00 • Green Lake Park • 3 spots open
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('activities')}
                      className="w-9 h-9 rounded-full bg-[#231215] text-white flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#121212] transition-colors shrink-0"
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. PICK YOUR GAME: SPORTS PILLS (Matching screenshot 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#221013] mb-6">
          PICK YOUR GAME.
        </h2>

        {/* Horizontal scrollable / wrap sports pills */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-12">
          {sportsList.map((sport) => {
            const isSelected = activeSportFilter === sport.id;
            const isHighlightLime = sport.id === 'FOOTBALL' || sport.id === 'CRICKET' || sport.id === 'GYM';

            return (
              <button
                key={sport.id}
                onClick={() => {
                  setActiveSportFilter(sport.id);
                  onNavigate('activities');
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all transform hover:-translate-y-0.5 ${
                  isSelected
                    ? 'bg-[#231215] text-white shadow-md'
                    : isHighlightLime
                    ? 'bg-[#CCFF00] text-[#121212] font-extrabold hover:bg-[#bdf000]'
                    : 'bg-white hover:bg-neutral-200 text-[#221013] border border-neutral-300'
                }`}
              >
                {sport.label}
              </button>
            );
          })}
        </div>

        {/* 3. 3-STEP EDITORIAL COLOR CARDS (01 Lime, 02 Coral, 03 Dark Wine - Matching screenshot 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 01 Lime Card */}
          <div className="bg-[#CCFF00] text-[#121212] p-8 sm:p-10 rounded-[28px] flex flex-col justify-between min-h-[260px] shadow-sm">
            <span className="font-display text-6xl font-bold leading-none">01</span>
            <div>
              <h3 className="font-display text-2xl uppercase font-bold tracking-tight mb-2">
                CREATE A PROFILE
              </h3>
              <p className="text-xs font-medium text-black/80 leading-relaxed">
                Your sports, level, goals and when you're free.
              </p>
            </div>
          </div>

          {/* 02 Coral Card */}
          <div className="bg-[#E76244] text-white p-8 sm:p-10 rounded-[28px] flex flex-col justify-between min-h-[260px] shadow-sm">
            <span className="font-display text-6xl font-bold leading-none text-white/90">02</span>
            <div>
              <h3 className="font-display text-2xl uppercase font-bold tracking-tight mb-2">
                FIND YOUR PEOPLE
              </h3>
              <p className="text-xs font-medium text-white/90 leading-relaxed">
                Match with partners and groups at your pace, nearby.
              </p>
            </div>
          </div>

          {/* 03 Deep Wine Card */}
          <div className="bg-[#2A1519] text-white p-8 sm:p-10 rounded-[28px] flex flex-col justify-between min-h-[260px] shadow-sm">
            <span className="font-display text-6xl font-bold leading-none text-white/70">03</span>
            <div>
              <h3 className="font-display text-2xl uppercase font-bold tracking-tight mb-2">
                SHOW UP
              </h3>
              <p className="text-xs font-medium text-white/75 leading-relaxed">
                Join a session, meet up, and keep the streak going.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. HAPPENING NEAR YOU: CLEAN WHITE CARDS (Matching screenshot 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#221013]">
              HAPPENING NEAR YOU.
            </h2>
            <p className="text-xs text-[#221013]/60 font-sans mt-1">
              Examples of the sessions you'll find
            </p>
          </div>
          <button
            onClick={() => onNavigate('activities')}
            className="mt-3 sm:mt-0 text-xs font-bold uppercase tracking-wider text-[#221013] hover:underline flex items-center gap-1"
          >
            Explore all activities <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              sport: 'RUNNING • CASUAL',
              title: '7 AM RIVERSIDE RUN',
              time: 'Tomorrow · 7:00',
              location: 'Riverside path',
              spots: '3 spots open',
              image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=700&q=80',
            },
            {
              sport: 'BADMINTON • INTERMEDIATE',
              title: 'DOUBLES BADMINTON',
              time: 'Sat · 18:30',
              location: 'City sports hall',
              spots: 'Needs 2 players',
              image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=700&q=80',
            },
            {
              sport: 'CYCLING • ADVANCED',
              title: 'SUNDAY COASTAL RIDE',
              time: 'Sun · 6:30',
              location: 'North coast road',
              spots: 'Open group',
              image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=700&q=80',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('activities')}
              className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-neutral-200"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#E76244] font-bold">
                  {item.sport}
                </span>
                <h3 className="font-display text-2xl uppercase font-bold text-[#221013] tracking-tight">
                  {item.title}
                </h3>
                <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#221013]/60 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[#221013]/50" /> {item.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#221013]/50" /> {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-[#221013]/50" /> {item.spots}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BUILT FOR TRUST SECTION (Matching screenshots 1 and 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="bg-[#231215] text-white rounded-[32px] p-8 sm:p-14 shadow-xl">
          <h2 className="font-display text-4xl sm:text-5xl uppercase font-bold tracking-tight mb-8">
            BUILT FOR <span className="text-[#CCFF00]">TRUST.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Trust item 1 */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#CCFF00] mb-3">
                <EyeOff size={20} />
              </div>
              <h4 className="font-display text-lg uppercase font-bold tracking-wide">
                No exact location
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Share a general area, never your home address.
              </p>
            </div>

            {/* Trust item 2 */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#CCFF00] mb-3">
                <Lock size={20} />
              </div>
              <h4 className="font-display text-lg uppercase font-bold tracking-wide">
                Privacy controls
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Choose who sees your profile and schedule.
              </p>
            </div>

            {/* Trust item 3 */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#CCFF00] mb-3">
                <UserX size={20} />
              </div>
              <h4 className="font-display text-lg uppercase font-bold tracking-wide">
                Report & block
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Flag behavior and block anyone, anytime.
              </p>
            </div>

            {/* Trust item 4 */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#CCFF00] mb-3">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-display text-lg uppercase font-bold tracking-wide">
                Public meetups
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Sessions are designed around public venues.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION: "FIND YOUR PEOPLE. SHOW UP. KEEP MOVING." (Matching screenshot 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20 text-center">
        <div className="space-y-8 max-w-4xl mx-auto">
          <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl uppercase font-bold text-[#231215] tracking-tight leading-[0.92]">
            FIND YOUR PEOPLE. <br />
            SHOW UP. KEEP MOVING.
          </h2>

          <div>
            <button
              onClick={() => onOpenAuth('register')}
              className="bg-[#231215] hover:bg-[#341b20] text-white font-display font-bold text-base uppercase tracking-wider px-10 py-4 rounded-full transition-transform hover:scale-105 shadow-xl inline-flex items-center gap-2"
            >
              <span>GET STARTED</span>
              <ArrowUpRight size={18} className="text-[#CCFF00]" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
