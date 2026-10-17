import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Sport } from '../types';
import { 
  ArrowLeft, 
  PlusCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Flame, 
  AlertCircle, 
  Trophy,
  DollarSign
} from 'lucide-react';

interface CreateActivityProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const CreateActivity: React.FC<CreateActivityProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [activityType, setActivityType] = useState<'SESSION' | 'CASUAL' | 'TOURNAMENT'>('SESSION');
  const [title, setTitle] = useState('');
  const [sportId, setSportId] = useState('');
  const [description, setDescription] = useState('');
  const [tournamentFormat, setTournamentFormat] = useState('Single Elimination');
  const [tournamentPrize, setTournamentPrize] = useState('Medals & Official Certificate');
  
  // Date & Time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 30, 0, 0);
  const [startDateStr, setStartDateStr] = useState(tomorrow.toISOString().slice(0, 16));
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Location
  const [generalLocation, setGeneralLocation] = useState('Green Lake Park, Seattle');
  const [meetingPointDetails, setMeetingPointDetails] = useState('');

  // Capacity & Rules
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState('All Levels');
  const [intensity, setIntensity] = useState('Moderate');
  const [equipmentNotes, setEquipmentNotes] = useState('');
  const [cost, setCost] = useState(0);

  useEffect(() => {
    apiRequest<{ sports: Sport[] }>('/sports')
      .then((res) => {
        setSports(res.sports);
        if (res.sports.length > 0) setSportId(res.sports[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        sportId,
        description: description.trim(),
        activityType,
        tournamentFormat: activityType === 'TOURNAMENT' ? tournamentFormat : undefined,
        tournamentPrize: activityType === 'TOURNAMENT' ? tournamentPrize : undefined,
        startsAt: new Date(startDateStr).toISOString(),
        durationMinutes: Number(durationMinutes),
        generalLocation: generalLocation.trim(),
        meetingPointDetails: meetingPointDetails.trim() || undefined,
        maxParticipants: Number(maxParticipants),
        experienceLevel,
        intensity,
        equipmentNotes: equipmentNotes.trim() || undefined,
        cost: Number(cost),
      };

      const res = await apiRequest('/activities', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onNavigate('activity-detail', res.activity.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create activity session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Back button */}
        <button
          onClick={() => onNavigate('activities')}
          className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-500 hover:text-[#221013] transition-colors"
        >
          <ArrowLeft size={16} /> Cancel & Return
        </button>

        <div className="bg-white rounded-[32px] border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8">
          
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E76244] block mb-2">
              Sports Session Organizer
            </span>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#221013] leading-none">
              Host a Sports Session or Tournament
            </h1>
            <p className="text-sm text-neutral-500 mt-2 font-sans">
              Schedule a morning interval run, book a badminton court, or organize a competitive neighborhood tournament.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Activity Type Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-2">
                Event Category *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'SESSION', label: 'Training Session' },
                  { id: 'CASUAL', label: 'Casual Pickup' },
                  { id: 'TOURNAMENT', label: '🏆 Tournament' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setActivityType(type.id as any)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                      activityType === type.id
                        ? 'bg-[#231215] text-white shadow-sm'
                        : 'bg-[#FAF7F0] border-neutral-300 text-[#221013] hover:bg-neutral-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tournament Specific Fields */}
            {activityType === 'TOURNAMENT' && (
              <div className="p-5 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00] space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-[#121212] block">
                  Tournament Logistics & Requirements
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1">
                      Tournament Format
                    </label>
                    <select
                      value={tournamentFormat}
                      onChange={(e) => setTournamentFormat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-[#221013] focus:border-[#221013] focus:outline-none"
                    >
                      <option value="Single Elimination">Single Elimination (Knockout)</option>
                      <option value="Round Robin">Round Robin Group Play</option>
                      <option value="Double Elimination">Double Elimination</option>
                      <option value="Pickup King of the Court">Pickup King of the Court</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1">
                      Trophy / Awards
                    </label>
                    <input
                      type="text"
                      value={tournamentPrize}
                      onChange={(e) => setTournamentPrize(e.target.value)}
                      placeholder="e.g. Medals, Certificate, Official Bragging Rights"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-xs text-[#221013] focus:border-[#221013] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Title & Sport */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise 8K Pace Run or Emerald City 3v3 Basketball Tournament"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-sm focus:border-[#221013] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Sport *
                </label>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-xs font-semibold focus:border-[#221013] focus:outline-none"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                Description & Plan *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe warmup, route, required gear, match rules, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-sm focus:border-[#221013] focus:outline-none resize-none"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-xs font-mono focus:border-[#221013] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Duration (Minutes)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-xs font-semibold focus:border-[#221013] focus:outline-none"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                  <option value={90}>90 Minutes (1.5 Hours)</option>
                  <option value={120}>120 Minutes (2 Hours)</option>
                  <option value={180}>180 Minutes (3 Hours)</option>
                </select>
              </div>
            </div>

            {/* Location (Public vs Private Tier) */}
            <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-neutral-200 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1">
                  Public General Area (Visible to All) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Lake Park, Seattle or Miller Playfield"
                  value={generalLocation}
                  onChange={(e) => setGeneralLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-[#221013] text-sm focus:border-[#221013] focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Must be a safe, well-lit public park, track, court, or facility.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#E76244] mb-1">
                  Confidential Meeting Instructions (Private — Confirmed Attendees Only)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Meet beside boathouse bench #3 near the north water fountain"
                  value={meetingPointDetails}
                  onChange={(e) => setMeetingPointDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-[#221013] text-sm focus:border-[#221013] focus:outline-none"
                />
              </div>
            </div>

            {/* Capacity, Experience, Pace */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Max Participants (2-100)
                </label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-sm focus:border-[#221013] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Skill Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-xs font-semibold focus:border-[#221013] focus:outline-none"
                >
                  <option value="All Levels">All Levels Welcome</option>
                  <option value="Beginner">Beginner Friendly</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced / High Pace</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Pace / Intensity
                </label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-xs font-semibold focus:border-[#221013] focus:outline-none"
                >
                  <option value="Light">Light / Recovery</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High / Competitive</option>
                </select>
              </div>
            </div>

            {/* Equipment & Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Equipment Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring your own tennis racket, balls provided"
                  value={equipmentNotes}
                  onChange={(e) => setEquipmentNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-sm focus:border-[#221013] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                  Cost / Entry Fee (Direct expense share, $0 if free)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-sm focus:border-[#221013] focus:outline-none"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">Cost info only, no in-app payment processing.</span>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => onNavigate('activities')}
                className="px-6 py-3 text-xs font-bold uppercase text-neutral-500 hover:text-[#221013]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-full bg-[#231215] hover:bg-[#341b20] text-white font-display font-bold text-sm uppercase tracking-wider shadow-xl transition-all"
              >
                {loading ? 'Publishing...' : 'Publish Sports Session (+25 Pts)'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
