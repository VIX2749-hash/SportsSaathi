import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Flame, 
  Activity, 
  Compass, 
  Dumbbell, 
  Clock, 
  MapPin, 
  Award,
  Sparkles
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Profile
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || 'Seattle, WA');
  const [area, setArea] = useState(user?.area || 'Capitol Hill');

  // Step 2: Sports
  const availableSports = [
    { name: 'Running', icon: 'Flame', category: 'Endurance' },
    { name: 'Badminton', icon: 'Activity', category: 'Racket' },
    { name: 'Tennis', icon: 'CircleDot', category: 'Racket' },
    { name: 'Football', icon: 'Trophy', category: 'Team' },
    { name: 'Basketball', icon: 'Dribbble', category: 'Team' },
    { name: 'Cycling', icon: 'Bike', category: 'Endurance' },
    { name: 'Gym & Lifting', icon: 'Dumbbell', category: 'Fitness' },
    { name: 'Swimming', icon: 'Waves', category: 'Endurance' },
    { name: 'Hiking', icon: 'Compass', category: 'Outdoor' },
    { name: 'Yoga', icon: 'Smile', category: 'Fitness' },
  ];
  const [selectedSports, setSelectedSports] = useState<string[]>(['Running']);

  // Step 3: Experience & Goals
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [goals, setGoals] = useState('Build consistency & find training partner');
  const [preferredIntensity, setPreferredIntensity] = useState('Moderate');

  // Step 4: Availability
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    'Early Morning (5-8 AM)',
    'Morning (8-12 PM)',
    'Afternoon (12-5 PM)',
    'Evening (5-9 PM)',
    'Flexible',
  ];
  const [selectedDays, setSelectedDays] = useState<string[]>(['Tuesday', 'Thursday', 'Saturday']);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['Early Morning (5-8 AM)', 'Morning (8-12 PM)']);

  // Step 5: Location Radius
  const [searchRadiusKm, setSearchRadiusKm] = useState(25);

  const toggleSport = (sportName: string) => {
    if (selectedSports.includes(sportName)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter((s) => s !== sportName));
      }
    } else {
      setSelectedSports([...selectedSports, sportName]);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Fetch sports from backend to get IDs
      const sportsRes = await apiRequest<{ sports: any[] }>('/sports');
      const sportMap = new Map(sportsRes.sports.map((s) => [s.name, s.id]));

      const sportsPayload = selectedSports.map((sName) => ({
        sportId: sportMap.get(sName) || sportsRes.sports[0]?.id,
        experienceLevel,
        goals,
        preferredIntensity,
      }));

      // Generate availabilities
      const availabilityPayload: any[] = [];
      for (const d of selectedDays) {
        for (const s of selectedSlots) {
          availabilityPayload.push({ dayOfWeek: d, timeSlot: s });
        }
      }

      await apiRequest('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          displayName,
          bio,
          city,
          area,
          searchRadiusKm,
          sports: sportsPayload,
          availabilities: availabilityPayload,
        }),
      });

      await refreshUser();
      onComplete();
    } catch (err: any) {
      alert('Error saving preferences: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-wine py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-8 md:p-10 shadow-2xl relative">
        
        {/* Step Progress Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-mono uppercase tracking-wider text-brand-ivoryMuted">
            <span>Step {step} of 5</span>
            <span className="text-brand-lime font-bold">
              {step === 1 && 'Basic Athlete Profile'}
              {step === 2 && 'Sports Interests'}
              {step === 3 && 'Experience & Goals'}
              {step === 4 && 'Weekly Availability'}
              {step === 5 && 'Discovery Radius'}
            </span>
          </div>
          <div className="w-full bg-brand-wine h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-lime h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-tight text-brand-ivory">
                Build Your Athlete Profile
              </h2>
              <p className="text-sm text-brand-ivoryMuted mt-1">
                Tell the community how you want to be known and where you usually train.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none"
                  placeholder="Your athletic handle or full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
                    City / Metro
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
                    Neighborhood / Primary Area
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none"
                    placeholder="e.g. Ballard, Capitol Hill"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
                  Short Sports Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your typical pace, current goals, or what makes an awesome training partner for you..."
                  className="w-full px-4 py-3 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Sports Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-tight text-brand-ivory">
                Select Your Sports
              </h2>
              <p className="text-sm text-brand-ivoryMuted mt-1">
                Choose the activities you want to find partners or join sessions for.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSports.map((sport) => {
                const isSelected = selectedSports.includes(sport.name);
                return (
                  <button
                    key={sport.name}
                    type="button"
                    onClick={() => toggleSport(sport.name)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-brand-lime text-brand-dark border-brand-lime font-bold shadow-lime-glow'
                        : 'bg-brand-wine border-brand-wineBorder text-brand-ivory hover:border-brand-lime/40'
                    }`}
                  >
                    <span className="text-xs uppercase font-mono tracking-wider opacity-80">{sport.category}</span>
                    <span className="font-display text-lg tracking-tight mt-2">{sport.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Experience & Intensity */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-tight text-brand-ivory">
                Experience & Pace
              </h2>
              <p className="text-sm text-brand-ivoryMuted mt-1">
                Matching with compatible skill levels prevents mismatched sessions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Beginner', 'Casual', 'Intermediate', 'Advanced', 'Competitive'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        experienceLevel === lvl
                          ? 'bg-brand-lime text-brand-dark border-brand-lime shadow-lime-glow'
                          : 'bg-brand-wine border-brand-wineBorder text-brand-ivory hover:border-brand-lime/50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-2">
                  Preferred Session Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Light', 'Moderate', 'High'].map((intensity) => (
                    <button
                      key={intensity}
                      type="button"
                      onClick={() => setPreferredIntensity(intensity)}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        preferredIntensity === intensity
                          ? 'bg-brand-lime text-brand-dark border-brand-lime shadow-lime-glow'
                          : 'bg-brand-wine border-brand-wineBorder text-brand-ivory hover:border-brand-lime/50'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
                  Primary Fitness Goal
                </label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Train for an event, Play socially, Build consistency"
                  className="w-full px-4 py-3 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-sm focus:border-brand-lime focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Availability */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-tight text-brand-ivory">
                When Do You Move?
              </h2>
              <p className="text-sm text-brand-ivoryMuted mt-1">
                We use your schedule overlap to calculate reliable partner compatibility scores.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-2">
                  Preferred Days of the Week
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          isSelected
                            ? 'bg-brand-lime text-brand-dark border-brand-lime font-bold'
                            : 'bg-brand-wine border-brand-wineBorder text-brand-ivory hover:border-brand-lime/40'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ivory mb-2">
                  Preferred Time Windows
                </label>
                <div className="space-y-2">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={`w-full py-2.5 px-4 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-brand-lime text-brand-dark border-brand-lime'
                            : 'bg-brand-wine border-brand-wineBorder text-brand-ivory hover:border-brand-lime/40'
                        }`}
                      >
                        <span>{slot}</span>
                        {isSelected && <CheckCircle2 size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Location Radius & Privacy */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-tight text-brand-ivory">
                Discovery Distance
              </h2>
              <p className="text-sm text-brand-ivoryMuted mt-1">
                Adjust how far you are willing to travel for sessions or partners.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-wine border border-brand-wineBorder space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider text-brand-ivory">Search Radius</span>
                <span className="font-display text-2xl text-brand-lime">{searchRadiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={searchRadiusKm}
                onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                className="w-full accent-brand-lime cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-brand-ivoryMuted">
                <span>5 km (Local Walk)</span>
                <span>25 km (Metro Area)</span>
                <span>50 km (Regional)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-lime/10 border border-brand-lime/30 text-xs text-brand-ivory leading-relaxed">
              <span className="font-bold text-brand-lime">Privacy Guarantee:</span> Your precise live GPS location and exact address are never exposed to others. Only your generalized neighborhood is displayed on partner cards.
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-brand-wineBorder flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-xs font-bold uppercase text-brand-ivoryMuted hover:text-brand-ivory px-4 py-2"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="text-xs font-semibold text-brand-ivoryMuted hover:text-brand-ivory px-2"
            >
              Skip setup for now
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 bg-brand-lime hover:bg-brand-limeHover text-brand-dark font-display font-bold text-xs uppercase px-6 py-3 rounded-xl transition-all shadow-lime-glow"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="flex items-center gap-2 bg-brand-lime hover:bg-brand-limeHover text-brand-dark font-display font-bold text-xs uppercase px-8 py-3 rounded-xl transition-all shadow-lime-glow"
            >
              {loading ? 'Finalizing Profile...' : 'Complete Profile'}
              <Sparkles size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
