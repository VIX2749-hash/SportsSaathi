import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  EyeOff, 
  AlertTriangle, 
  UserX, 
  Lock, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';

interface SafetyHubProps {
  onNavigate: (tab: string) => void;
}

export const SafetyHub: React.FC<SafetyHubProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Safety Header */}
      <div className="border-b border-brand-wineBorder pb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-lime block mb-2">
          Trust & Accountability
        </span>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-brand-ivory">
          Safety & Privacy Standards
        </h1>
        <p className="text-sm text-brand-ivoryMuted mt-1 max-w-2xl">
          Move Together is built around public athletic accountability. We prioritize verified public venues, explicit consent, and privacy guarantees.
        </p>
      </div>

      {/* Core Safety Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: Public Spaces Only */}
        <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-7 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-lime/10 border border-brand-lime flex items-center justify-center text-brand-lime mb-2">
            <MapPin size={24} />
          </div>
          <h3 className="font-display text-2xl uppercase text-brand-ivory">
            1. Public & Well-Lit Meeting Locations
          </h3>
          <p className="text-xs text-brand-ivoryMuted leading-relaxed">
            All introductory sessions, partner meetups, and group activities must be held in established public spaces: municipal parks, public running tracks, booked recreation courts, or gym facilities. Private residences are strictly discouraged.
          </p>
        </div>

        {/* Pillar 2: Location Privacy */}
        <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-7 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-coral/10 border border-brand-coral flex items-center justify-center text-brand-coral mb-2">
            <EyeOff size={24} />
          </div>
          <h3 className="font-display text-2xl uppercase text-brand-ivory">
            2. Two-Tier Location Disclosure
          </h3>
          <p className="text-xs text-brand-ivoryMuted leading-relaxed">
            We never broadcast your live GPS coordinates or exact residential address. Public activity listings reveal only the generalized park or neighborhood area. Specific meeting instructions are unlocked only for athletes confirmed by the host.
          </p>
        </div>

        {/* Pillar 3: No Swiping or Vanity Dating Mechanics */}
        <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-7 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-lime/10 border border-brand-lime flex items-center justify-center text-brand-lime mb-2">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-display text-2xl uppercase text-brand-ivory">
            3. Purely Athletic Purpose
          </h3>
          <p className="text-xs text-brand-ivoryMuted leading-relaxed">
            This platform is strictly for sports, fitness motivation, and training partnership. Unsolicited romantic solicitation, harassment, or inappropriate conduct will result in immediate suspension and blocking.
          </p>
        </div>

        {/* Pillar 4: Reporting and Blocking */}
        <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-7 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-coral/10 border border-brand-coral flex items-center justify-center text-brand-coral mb-2">
            <UserX size={24} />
          </div>
          <h3 className="font-display text-2xl uppercase text-brand-ivory">
            4. One-Click Block & Fast Reporting
          </h3>
          <p className="text-xs text-brand-ivoryMuted leading-relaxed">
            Any user or activity can be flagged or blocked instantly from session cards and direct message threads. Blocked users can no longer see your activities, send requests, or access conversations.
          </p>
        </div>

      </div>

      {/* First Meetup Checklist */}
      <div className="bg-brand-wine rounded-3xl border border-brand-wineBorder p-8">
        <h3 className="font-display text-2xl uppercase text-brand-ivory mb-4">
          Safe First Workout Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-brand-ivory">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-brand-lime shrink-0 mt-0.5" />
            <span>Exchange a message in advance to align on expected pace and session duration.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-brand-lime shrink-0 mt-0.5" />
            <span>Tell a friend or family member where and when you are exercising.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-brand-lime shrink-0 mt-0.5" />
            <span>Meet during daytime hours or in brightly lit sports complexes with other people present.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-brand-lime shrink-0 mt-0.5" />
            <span>Bring personal hydration, phone, and any required gear (e.g. racket/helmet).</span>
          </div>
        </div>
      </div>

    </div>
  );
};
