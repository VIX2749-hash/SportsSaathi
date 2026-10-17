import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Activity } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Lock, 
  Flame,
  Award,
  QrCode,
  Download,
  AlertTriangle,
  Trophy
} from 'lucide-react';

interface ActivityDetailProps {
  activityId: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ActivityDetail: React.FC<ActivityDetailProps> = ({
  activityId,
  onNavigate,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Group Discussion Message state (For confirmed participants & host only!)
  const [messageBody, setMessageBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Check-In verification state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [inputCheckInCode, setInputCheckInCode] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Safety Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('Inappropriate Conduct');
  const [reportDescription, setReportDescription] = useState('');
  const [reporting, setReporting] = useState(false);

  const fetchActivity = async () => {
    try {
      const res = await apiRequest<{ activity: Activity }>(`/activities/${activityId}`);
      setActivity(res.activity);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const handleJoin = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await apiRequest(`/activities/${activityId}/join`, { method: 'POST' });
      setFeedbackMsg({ text: res.message || 'You have successfully joined the session!', type: 'success' });
      await fetchActivity();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to join session', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this session? Your spot will be made available to other athletes.')) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      await apiRequest(`/activities/${activityId}/leave`, { method: 'POST' });
      setFeedbackMsg({ text: 'You have left the session', type: 'success' });
      await fetchActivity();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to leave session', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm30m = async () => {
    setActionLoading(true);
    try {
      await apiRequest(`/activities/${activityId}/confirm-30m`, { method: 'POST' });
      setFeedbackMsg({ text: "Awesome! Your participation is confirmed and the host has been notified you're on the way.", type: 'success' });
      await fetchActivity();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to confirm', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInLoading(true);
    try {
      await apiRequest(`/activities/${activityId}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ code: inputCheckInCode }),
      });
      setFeedbackMsg({ text: 'Attendance verified! You earned +50 points and built your streak.', type: 'success' });
      setShowCheckInModal(false);
      await fetchActivity();
    } catch (err: any) {
      alert(err.message || 'Invalid check-in code');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) return;
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setSendingMsg(true);
    try {
      await apiRequest(`/activities/${activityId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: messageBody }),
      });
      setMessageBody('');
      await fetchActivity();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDownloadCalendar = () => {
    window.open(`/api/activities/${activityId}/calendar.ics`, '_blank');
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    setReporting(true);
    try {
      await apiRequest('/safety/report', {
        method: 'POST',
        body: JSON.stringify({
          activityId,
          category: reportCategory,
          description: reportDescription,
        }),
      });
      alert('Safety report submitted to moderation.');
      setReportModalOpen(false);
      setReportDescription('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-[#221013] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono uppercase text-neutral-500">Loading session details...</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="font-display text-3xl text-[#221013] uppercase mb-4">Activity Not Found</h2>
        <button
          onClick={() => onNavigate('activities')}
          className="px-6 py-2.5 rounded-full bg-[#231215] text-white font-display font-bold uppercase text-xs"
        >
          Back to Activities
        </button>
      </div>
    );
  }

  const startDate = new Date(activity.startsAt);
  const isFull = (activity.spotsRemaining || 0) <= 0;

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Navigation & Export */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('activities')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-[#221013] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Activities
          </button>

          <button
            onClick={handleDownloadCalendar}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-neutral-300 text-xs font-bold uppercase hover:bg-neutral-100 transition-colors shadow-sm"
          >
            <Download size={14} /> Add to Calendar (.ics)
          </button>
        </div>

        {/* Main Activity Card */}
        <div className="bg-white rounded-[32px] border border-neutral-200 p-8 sm:p-12 shadow-sm relative space-y-6">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-[#231215] text-white text-xs font-mono font-bold uppercase">
                {activity.sport.name}
              </span>
              {activity.activityType === 'TOURNAMENT' ? (
                <span className="px-3.5 py-1 rounded-full bg-[#CCFF00] text-[#121212] text-xs font-mono font-bold uppercase flex items-center gap-1">
                  <Trophy size={13} /> TOURNAMENT
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#FAF7F0] border border-neutral-200 text-xs font-mono uppercase font-semibold">
                  {activity.activityType}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-[#FAF7F0] border border-neutral-200 text-xs font-mono uppercase">
                {activity.experienceLevel}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E76244]/10 text-[#E76244] text-xs font-mono uppercase font-bold">
                {activity.intensity} Pace
              </span>
            </div>

            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#E76244] transition-colors"
            >
              <ShieldAlert size={14} /> Report
            </button>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-[#221013] leading-none">
            {activity.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
            {activity.description}
          </p>

          {/* Tournament Prize / Format if applicable */}
          {activity.activityType === 'TOURNAMENT' && (
            <div className="p-4 rounded-2xl bg-[#CCFF00]/15 border border-[#CCFF00] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#121212] block">
                  Tournament Format & Awards
                </span>
                <span className="font-display text-lg uppercase text-[#221013]">
                  {activity.tournamentFormat || 'Bracket Elimination'} • Prize: {activity.tournamentPrize || 'Trophy & Sports Apparel'}
                </span>
              </div>
              <div className="text-xs font-mono text-[#221013] font-bold">
                Official Sports Saathi Community Bracket
              </div>
            </div>
          )}

          {/* Feedback message banner */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border border-red-300 text-red-800'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#FAF7F0] border border-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block mb-1">
                Date & Start Time
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-[#221013]">
                <Calendar size={14} className="text-[#E76244]" />
                <span>{startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <span className="text-xs text-neutral-500 block pl-5 mt-0.5">
                {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({activity.durationMinutes} min)
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block mb-1">
                General Area (Public)
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-[#221013]">
                <MapPin size={14} className="text-[#E76244]" />
                <span className="truncate">{activity.generalLocation}</span>
              </div>
              <span className="text-[11px] text-neutral-500 pl-5 block mt-0.5">Verified public park/venue</span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block mb-1">
                Roster & Capacity
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-[#221013]">
                <Users size={14} className="text-[#E76244]" />
                <span>{activity.confirmedCount} / {activity.maxParticipants} Confirmed</span>
              </div>
              <span className={`text-[11px] font-mono font-bold pl-5 block mt-0.5 ${isFull ? 'text-[#E76244]' : 'text-emerald-700'}`}>
                {isFull ? 'Session is Full' : `${activity.spotsRemaining} spots available`}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block mb-1">
                Cost Breakdown
              </span>
              <div className="text-base font-display font-bold text-[#221013]">
                {activity.cost === 0 ? 'FREE SESSION' : `₹${activity.cost}`}
              </div>
              <span className="text-[10px] text-neutral-500">Court fee share (no in-app markup)</span>
            </div>
          </div>

          {/* Privacy Tier: Protected Meeting Instructions */}
          <div className="p-6 rounded-2xl bg-[#FAF7F0] border border-neutral-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#221013]">
              <MapPin size={16} className="text-[#E76244]" />
              <span>Exact Meeting Point Instructions</span>
            </div>

            {activity.meetingPointDetails ? (
              <div className="p-4 rounded-xl bg-white border border-neutral-300 text-xs text-[#221013] font-mono">
                📍 {activity.meetingPointDetails}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-500 flex items-center gap-2">
                <Lock size={15} className="text-[#E76244] shrink-0" />
                <span>
                  Exact pin and meetup instructions are unlocked only for confirmed participants to protect athlete privacy.
                </span>
              </div>
            )}
          </div>

          {/* Real-time 30-Minute Prior Confirmation & QR Check-In Widgets */}
          {activity.isUserJoined && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* 30m Prior "I'm on my way!" button */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-900">
                  <Clock size={16} className="text-[#E76244]" />
                  <span>30-Minute Confirmation Ping</span>
                </div>
                <p className="text-xs text-amber-800 font-sans">
                  Let fellow athletes know you're heading to the venue so nobody waits in vain.
                </p>
                {activity.confirmed30mPrior ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 size={14} /> Confirmed: "I'm on my way!"
                  </span>
                ) : (
                  <button
                    onClick={handleConfirm30m}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-sm hover:bg-neutral-800"
                  >
                    Confirm: I'm on my way! 🏃
                  </button>
                )}
              </div>

              {/* Attendance Verification & Streak QR */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-900">
                  <QrCode size={16} className="text-emerald-700" />
                  <span>Physical Check-In (+50 Points)</span>
                </div>
                <p className="text-xs text-emerald-800 font-sans">
                  Verify your presence at the venue using the organizer's QR or 6-digit code.
                </p>
                {activity.attendanceStatus === 'ATTENDED' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg">
                    <Award size={14} /> Attendance Verified (+50 Points Awarded)
                  </span>
                ) : (
                  <button
                    onClick={() => setShowCheckInModal(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-xs uppercase shadow-sm"
                  >
                    Enter Check-In Code / Scan QR
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Organizer Check-In Display Banner */}
          {activity.isOrganizer && (
            <div className="p-5 rounded-2xl bg-[#CCFF00]/20 border border-[#CCFF00] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#121212] block">
                  Organizer Check-In Verification Code
                </span>
                <span className="font-display text-2xl uppercase tracking-wider text-[#221013]">
                  Code: <strong className="text-black bg-white px-2 py-0.5 rounded-lg">{activity.checkInCode || 'MT-7788'}</strong>
                </span>
                <p className="text-xs text-neutral-600 mt-1">
                  Share this code or show your QR screen to attendees at the venue to verify their attendance.
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-300 flex items-center justify-center text-[#221013] shrink-0 shadow-sm">
                <QrCode size={32} />
              </div>
            </div>
          )}

          {/* Primary Action Button (Join / Leave) */}
          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={activity.organizer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={activity.organizer.displayName}
                className="w-12 h-12 rounded-full object-cover border border-[#221013]"
              />
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">Host</span>
                <span className="font-display text-xl text-[#221013] uppercase leading-none">{activity.organizer.displayName}</span>
                <span className="text-xs text-neutral-500 block mt-0.5">{activity.organizer.points || 0} pts • {activity.organizer.streakCount || 0} wk streak</span>
              </div>
            </div>

            <div>
              {activity.isOrganizer ? (
                <span className="inline-block px-8 py-3.5 rounded-full bg-[#FAF7F0] border border-neutral-300 text-[#221013] font-display font-bold text-xs uppercase tracking-wider">
                  You are hosting this activity
                </span>
              ) : activity.isUserJoined ? (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="px-8 py-3.5 rounded-full border-2 border-[#E76244] text-[#E76244] hover:bg-[#E76244] hover:text-white font-display font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {actionLoading ? 'Leaving...' : 'Leave Session'}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading || isFull}
                  className={`px-10 py-4 rounded-full font-display font-bold text-sm uppercase tracking-wider transition-all shadow-xl ${
                    isFull
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-[#231215] hover:bg-[#341b20] text-white hover:scale-105'
                  }`}
                >
                  {actionLoading ? 'Joining...' : isFull ? 'Session is Full' : 'Join Activity'}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Dedicated Activity Group Chat (Joined Athletes Only) */}
        <div className="bg-white rounded-[32px] border border-neutral-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-[#E76244]" />
              <h3 className="font-display text-2xl uppercase text-[#221013]">
                Activity Group Chat ({activity.participants?.length || 1} members)
              </h3>
            </div>
            <span className="text-xs font-mono uppercase text-neutral-400">
              Private coordination thread
            </span>
          </div>

          {!activity.isUserJoined && !activity.isOrganizer ? (
            <div className="p-8 text-center text-xs text-neutral-500 bg-[#FAF7F0] rounded-2xl border border-neutral-200">
              <Lock size={20} className="text-[#E76244] mx-auto mb-2" />
              Activity group discussion is private and unlocked automatically upon joining this session.
            </div>
          ) : (
            <>
              {/* Messages list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {(!activity.messages || activity.messages.length === 0) ? (
                  <p className="text-xs text-neutral-400 italic py-4 text-center">
                    No group messages yet. Post a question regarding gear, exact parking, or warmup below!
                  </p>
                ) : (
                  activity.messages.map((msg) => (
                    <div key={msg.id} className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-neutral-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#221013] uppercase font-display">
                          {msg.sender?.displayName || 'Athlete'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed font-sans">{msg.body}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Ask a question or post an update for the group..."
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  disabled={sendingMsg}
                  className="flex-1 px-4 py-3 rounded-full bg-[#FAF7F0] border border-neutral-300 text-xs text-[#221013] focus:border-[#221013] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !messageBody.trim()}
                  className="px-6 py-3 rounded-full bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-md flex items-center gap-1.5 hover:bg-neutral-800 disabled:opacity-50"
                >
                  <Send size={14} className="text-[#CCFF00]" />
                  <span>Send</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Check-In Modal */}
        {showCheckInModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[32px] border border-neutral-200 p-8 max-w-md w-full shadow-2xl relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <QrCode size={26} />
              </div>
              <h3 className="font-display text-3xl uppercase text-[#221013] mb-1">
                Enter Check-In Code
              </h3>
              <p className="text-xs text-neutral-500 mb-6 font-sans">
                Ask the session host at the venue for the 6-digit code or scan their QR display to confirm attendance and earn points.
              </p>

              <form onSubmit={handleVerifyCheckIn} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. MT-7788"
                  value={inputCheckInCode}
                  onChange={(e) => setInputCheckInCode(e.target.value)}
                  className="w-full text-center font-mono font-bold text-lg uppercase tracking-widest px-4 py-3.5 rounded-xl bg-[#FAF7F0] border border-neutral-300 text-[#221013] focus:border-[#221013] focus:outline-none"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckInModal(false)}
                    className="px-5 py-2.5 text-xs font-bold uppercase text-neutral-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={checkInLoading || !inputCheckInCode.trim()}
                    className="px-7 py-3 rounded-full bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-md hover:bg-neutral-800"
                  >
                    {checkInLoading ? 'Verifying...' : 'Verify & Claim +50 Pts'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
