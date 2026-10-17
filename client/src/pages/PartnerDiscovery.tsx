import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Partner, Activity } from '../types';
import { 
  Search, 
  MapPin, 
  Flame, 
  Clock, 
  UserPlus, 
  Sparkles, 
  Info, 
  Trophy, 
  Send, 
  ShieldCheck,
  Calendar,
  Award
} from 'lucide-react';

interface PartnerDiscoveryProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const PartnerDiscovery: React.FC<PartnerDiscoveryProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'partners' | 'leaderboard'>('partners');

  // Filters
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedIntensity, setSelectedIntensity] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');

  // Invite-to-Activity Modal (Anti-Dating Feature)
  const [inviteModalPartner, setInviteModalPartner] = useState<Partner | null>(null);
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [inviteNote, setInviteNote] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Breakdown detail modal
  const [breakdownPartner, setBreakdownPartner] = useState<Partner | null>(null);

  const sportsFilterPills = [
    'All',
    'Running',
    'Badminton',
    'Football',
    'Tennis',
    'Cycling',
    'Gym & Lifting',
  ];

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport !== 'All') params.append('sport', selectedSport);
      if (selectedLevel !== 'All') params.append('level', selectedLevel);
      if (selectedIntensity !== 'All') params.append('intensity', selectedIntensity);
      if (selectedDay !== 'All') params.append('day', selectedDay);

      const [partRes, leadRes] = await Promise.all([
        apiRequest<{ partners: Partner[] }>(`/partners?${params.toString()}`),
        apiRequest<{ leaderboard: any[] }>('/partners/leaderboard'),
      ]);

      setPartners(partRes.partners);
      setLeaderboard(leadRes.leaderboard);
    } catch (err: any) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [selectedSport, selectedLevel, selectedIntensity, selectedDay]);

  const handleOpenInviteModal = async (partner: Partner) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setInviteModalPartner(partner);
    setInviteSuccess(null);
    setInviteNote(`Hey ${partner.displayName}! Saw your schedule aligns with mine. Would love to have you join this session!`);

    try {
      const res = await apiRequest<{ activities: Activity[] }>('/activities');
      setUserActivities(res.activities);
      if (res.activities.length > 0) {
        setSelectedActivityId(res.activities[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteModalPartner || !selectedActivityId) return;
    setInviting(true);
    try {
      await apiRequest(`/activities/${selectedActivityId}/invite`, {
        method: 'POST',
        body: JSON.stringify({
          recipientId: inviteModalPartner.id,
          message: inviteNote,
        }),
      });
      setInviteSuccess(`Invitation sent to ${inviteModalPartner.displayName}!`);
      setTimeout(() => {
        setInviteSuccess(null);
        setInviteModalPartner(null);
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to send activity invite');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-300 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E76244]/10 text-[#E76244] font-mono text-xs uppercase font-bold tracking-wider mb-3">
              <ShieldCheck size={13} /> Anti-Dating Safe Sports Matching
            </div>
            <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-[#221013] leading-none">
              Sports Partner Discovery & Leaderboard
            </h1>
            <p className="text-sm text-[#221013]/70 mt-2 max-w-xl font-sans">
              Connect around sports intent and shared activities. No dating swiping. Earn points for verified attendance.
            </p>
          </div>

          {/* Sub-navigation tabs: Partners vs Leaderboard */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-neutral-200 shadow-sm">
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-5 py-2 rounded-full font-display text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === 'partners'
                  ? 'bg-[#231215] text-white shadow-sm'
                  : 'text-[#221013]/70 hover:text-[#221013]'
              }`}
            >
              Partner Directory
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-display text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-[#231215] text-white shadow-sm'
                  : 'text-[#221013]/70 hover:text-[#221013]'
              }`}
            >
              <Trophy size={14} className="text-[#CCFF00]" />
              Local Leaderboard
            </button>
          </div>
        </div>

        {activeTab === 'partners' ? (
          <>
            {/* Filter Control Box */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-neutral-200 shadow-sm space-y-6">
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
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013]/60 mb-1.5">
                    Intensity
                  </label>
                  <select
                    value={selectedIntensity}
                    onChange={(e) => setSelectedIntensity(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#221013] focus:border-[#221013] focus:outline-none"
                  >
                    <option value="All">All Intensities</option>
                    <option value="Light">Light / Casual</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High / Competitive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013]/60 mb-1.5">
                    Day of Week
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#221013] focus:border-[#221013] focus:outline-none"
                  >
                    <option value="All">Any Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Partners Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-3 border-[#221013] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase text-neutral-500">
                  Matching compatible training schedules...
                </p>
              </div>
            ) : partners.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-neutral-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                <Flame size={36} className="text-[#E76244] mx-auto mb-3" />
                <h3 className="font-display text-2xl uppercase text-[#221013] mb-2">
                  No Athletes Match Criteria
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Try adjusting your sport or day filter to discover more partners in your area.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {partners.map((partner) => {
                  const comp = partner.compatibility;
                  const score = comp?.overallPercentage || 80;

                  return (
                    <div
                      key={partner.id}
                      className="bg-white rounded-[26px] border border-neutral-200 hover:border-neutral-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1.5 group"
                    >
                      <div>
                        {/* Top: Avatar, Name, Points & Match */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={partner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt={partner.displayName}
                              className="w-14 h-14 rounded-full object-cover border-2 border-[#231215] shadow-sm shrink-0"
                            />
                            <div>
                              <h3 className="font-display text-2xl uppercase tracking-tight text-[#221013] group-hover:text-[#E76244] transition-colors leading-none">
                                {partner.displayName}
                              </h3>
                              <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1 font-medium">
                                <MapPin size={12} className="text-[#E76244]" />
                                <span>{partner.distanceBucket || partner.area || partner.city}</span>
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-emerald-700 font-bold">
                                <Award size={12} />
                                <span>{partner.points} Points</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setBreakdownPartner(partner)}
                            className="flex flex-col items-center bg-[#FAF7F0] hover:bg-neutral-200 border border-neutral-300 px-3 py-1.5 rounded-xl transition-all"
                            title="Click to view explainable matching score factors"
                          >
                            <span className="font-display text-lg font-bold text-[#221013] leading-none">
                              {score}%
                            </span>
                            <span className="text-[9px] font-mono uppercase text-neutral-500 flex items-center gap-0.5">
                              Match <Info size={10} />
                            </span>
                          </button>
                        </div>

                        {/* Mandatory Sports Intent Bio */}
                        <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-neutral-200 mb-5">
                          <span className="text-[10px] font-mono uppercase text-[#E76244] font-bold block mb-1">
                            Sports Goal & Intent:
                          </span>
                          <p className="text-xs text-[#221013]/80 leading-relaxed font-medium">
                            "{partner.bio || 'Training for upcoming events and looking for consistent weekly workout partners.'}"
                          </p>
                        </div>

                        {/* Disciplines */}
                        <div className="space-y-3 mb-6">
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block mb-1.5">
                              Sports Disciplines
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {partner.sports.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-[#221013]"
                                >
                                  <strong className="text-[#E76244]">{s.sport?.name}</strong> • {s.experienceLevel}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Weekly Availability */}
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block mb-1.5">
                              Weekly Availability
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {partner.availabilities.slice(0, 3).map((av, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded bg-neutral-100 text-[11px] text-neutral-600 flex items-center gap-1 font-medium"
                                >
                                  <Clock size={11} className="text-[#221013]" />
                                  {av.dayOfWeek.slice(0, 3)}: {av.timeSlot.split(' ')[0]}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Action: INVITE TO ACTIVITY (Replaces dating 1-1 connect button!) */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
                          <Flame size={14} className="text-[#E76244]" />
                          <span>{partner.streakCount} wk streak</span>
                        </div>

                        <button
                          onClick={() => handleOpenInviteModal(partner)}
                          className="flex items-center gap-2 bg-[#231215] hover:bg-[#341b20] text-white font-display font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-md transform hover:scale-105"
                        >
                          <Calendar size={14} className="text-[#CCFF00]" />
                          <span>Invite to Activity</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* LOCAL LEADERBOARD VIEW */
          <div className="bg-white rounded-[32px] border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
              <div>
                <span className="text-xs font-mono uppercase text-[#E76244] font-bold tracking-wider block mb-1">
                  Verified Local Standings
                </span>
                <h2 className="font-display text-3xl uppercase tracking-tight text-[#221013]">
                  All-India Athletic Leaderboard 🇮🇳
                </h2>
                <p className="text-xs text-neutral-500 mt-1 font-sans">
                  Points awarded for verified check-ins (+50), hosting sessions (+25), and consistent weekly streaks.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-xs font-mono font-bold text-[#221013]">
                <Award size={16} className="text-[#CCFF00]" /> Active Season 2026
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-mono uppercase text-[11px]">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Athlete</th>
                    <th className="py-3 px-4">City / Area</th>
                    <th className="py-3 px-4">Discipline</th>
                    <th className="py-3 px-4">Sessions</th>
                    <th className="py-3 px-4">Streak</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {leaderboard.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#FAF7F0] transition-colors">
                      <td className="py-4 px-4 font-display text-lg font-bold">
                        {index === 0 && <span className="text-amber-500">🥇 #1</span>}
                        {index === 1 && <span className="text-slate-400">🥈 #2</span>}
                        {index === 2 && <span className="text-amber-700">🥉 #3</span>}
                        {index > 2 && <span className="text-neutral-400">#{index + 1}</span>}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={item.displayName}
                            className="w-9 h-9 rounded-full object-cover border border-[#221013]"
                          />
                          <span className="font-display text-base uppercase font-bold text-[#221013]">
                            {item.displayName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-600 font-medium">
                        {item.area || item.city}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-mono text-[#221013]">
                          {item.sports[0]?.sport?.name || 'Multi-Sport'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-[#221013]">
                        {item.totalSessions} sessions
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-emerald-700 font-bold">
                          <Flame size={12} className="text-[#E76244]" /> {item.streakCount} wks
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-display text-xl font-bold text-[#221013]">
                          {item.points}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 ml-1">pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invite to Activity Modal */}
        {inviteModalPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[32px] border border-neutral-200 p-8 max-w-lg w-full shadow-2xl relative">
              <h3 className="font-display text-3xl uppercase text-[#221013] mb-1">
                Invite {inviteModalPartner.displayName}
              </h3>
              <p className="text-xs text-neutral-500 mb-6 font-sans">
                Select an upcoming sports activity to invite them to. This keeps all communication focused on sports participation.
              </p>

              {inviteSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
                  {inviteSuccess}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                      Select Sports Activity *
                    </label>
                    <select
                      value={selectedActivityId}
                      onChange={(e) => setSelectedActivityId(e.target.value)}
                      className="w-full bg-[#FAF7F0] border border-neutral-300 rounded-xl px-4 py-3 text-xs font-semibold text-[#221013] focus:border-[#221013] focus:outline-none"
                    >
                      {userActivities.map((act) => (
                        <option key={act.id} value={act.id}>
                          {act.sport.name}: {act.title} ({new Date(act.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#221013] mb-1.5">
                      Personal Sports Note
                    </label>
                    <textarea
                      rows={3}
                      value={inviteNote}
                      onChange={(e) => setInviteNote(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] text-xs focus:border-[#221013] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalPartner(null)}
                      className="px-5 py-2.5 text-xs font-bold uppercase text-neutral-500 hover:text-[#221013]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={inviting || !selectedActivityId}
                      onClick={handleSendInvite}
                      className="px-7 py-3 rounded-full bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-md flex items-center gap-2 hover:bg-neutral-800"
                    >
                      <Send size={14} className="text-[#CCFF00]" />
                      <span>{inviting ? 'Sending Invite...' : 'Send Activity Invite'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Explainable Compatibility Factors Modal */}
        {breakdownPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[32px] border border-neutral-200 p-8 max-w-lg w-full shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#E76244] font-bold block">
                    Sports Alignment Breakdown
                  </span>
                  <h3 className="font-display text-2xl uppercase text-[#221013]">
                    {breakdownPartner.displayName}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#CCFF00] text-[#121212] font-display font-bold text-xl flex items-center justify-center shadow-sm">
                  {breakdownPartner.compatibility?.overallPercentage || 80}%
                </div>
              </div>

              <p className="text-xs text-neutral-600 mb-6 bg-[#FAF7F0] p-3.5 rounded-xl border border-neutral-200">
                {breakdownPartner.compatibility?.matchSummary || 'Calculated based on your sports profile and overlapping weekly availability.'}
              </p>

              <div className="space-y-4 mb-6">
                {breakdownPartner.compatibility?.factors.map((factor, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#221013] uppercase tracking-wider">
                        {factor.label} (Weight: {Math.round(factor.weight * 100)}%)
                      </span>
                      <span className="font-mono text-[#E76244] font-bold">
                        {Math.round(factor.score * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#231215] h-full rounded-full"
                        style={{ width: `${Math.round(factor.score * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 block">{factor.detail}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setBreakdownPartner(null)}
                className="w-full py-3 rounded-full bg-[#231215] text-white text-xs font-bold uppercase"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
