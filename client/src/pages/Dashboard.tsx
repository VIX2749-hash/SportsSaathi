import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Activity, Partner, NotificationItem } from '../types';
import { 
  Flame, 
  Award, 
  Calendar, 
  Users, 
  MapPin, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  MessageSquare,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, refreshUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const [actRes, partRes, connRes] = await Promise.all([
          apiRequest<{ activities: Activity[] }>('/activities').catch(() => ({ activities: [] })),
          apiRequest<{ partners: Partner[] }>('/partners').catch(() => ({ partners: [] })),
          apiRequest<{ received: any[] }>('/connections').catch(() => ({ received: [] })),
        ]);

        if (!isMounted) return;
        setActivities(Array.isArray(actRes?.activities) ? actRes.activities : []);
        setPartners(Array.isArray(partRes?.partners) ? partRes.partners : []);
        const rec = Array.isArray(connRes?.received) ? connRes.received : [];
        setPendingRequests(rec.filter((r) => r && r.status === 'PENDING'));
      } catch (err: any) {
        console.error('Dashboard load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleRespondConnection = async (connectionId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      await apiRequest(`/connections/${connectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setPendingRequests((prev) => (prev || []).filter((r) => r && r.id !== connectionId));
      if (status === 'ACCEPTED') {
        onNavigate('messages');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update connection');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center px-4">
        <h2 className="font-display text-3xl uppercase text-[#221013] mb-4">
          Please Log In to View Your Dashboard
        </h2>
        <button
          onClick={() => onOpenAuth('login')}
          className="px-8 py-3.5 rounded-full bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-md"
        >
          Sign In
        </button>
      </div>
    );
  }

  const safeActivities = Array.isArray(activities) ? activities : [];
  const safePartners = Array.isArray(partners) ? partners : [];
  const safePending = Array.isArray(pendingRequests) ? pendingRequests : [];

  const myUpcoming = safeActivities.filter((act) => act && (act.isUserJoined || act.isOrganizer));
  const displayName = user.displayName || 'Athlete';
  const firstName = displayName.split(' ')[0] || 'Athlete';

  return (
    <div className="bg-[#FAF7F0] text-[#221013] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-[32px] border border-neutral-200 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FAF7F0] text-[#221013] border border-neutral-300 text-xs font-mono font-bold uppercase">
                Athlete Dashboard
              </span>
              <span className="text-xs text-neutral-500 font-medium">{user.city || 'India'}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-[#221013] leading-none">
              Welcome Back, <span className="text-[#E76244]">{firstName}</span>
            </h1>

            <p className="text-sm text-neutral-600 max-w-xl font-sans">
              You have {myUpcoming.length} active sports session{myUpcoming.length !== 1 ? 's' : ''} scheduled this week.
            </p>
          </div>

          {/* Consistency Streak Card */}
          <div className="flex items-center gap-4 bg-[#FAF7F0] p-5 rounded-2xl border border-neutral-200">
            <div className="w-14 h-14 rounded-2xl bg-[#E76244]/15 border border-[#E76244]/30 flex items-center justify-center text-[#E76244]">
              <Flame size={30} />
            </div>
            <div>
              <span className="font-display text-3xl font-bold text-[#221013] block leading-tight">
                {user.streakCount || 0} Week Streak
              </span>
              <span className="text-[11px] font-mono uppercase text-neutral-500 font-bold">
                {user.totalSessions || 0} Total Sessions Completed
              </span>
            </div>
          </div>
        </div>

        {/* Pending Requests Alert */}
        {safePending.length > 0 && (
          <div className="bg-white border-2 border-[#CCFF00] rounded-[28px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#221013] font-mono text-xs uppercase font-bold tracking-wider">
              <UserPlus size={16} className="text-[#E76244]" /> Pending Sports Connection Requests ({safePending.length})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safePending.map((req) => (

                <div
                  key={req.id}
                  className="bg-[#FAF7F0] p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.requester?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={req.requester?.displayName || 'Sports Athlete'}
                      className="w-11 h-11 rounded-full object-cover border border-[#221013]"
                    />
                    <div>
                      <h4 className="font-display text-lg uppercase text-[#221013] leading-none">
                        {req.requester?.displayName || 'Sports Athlete'}
                      </h4>
                      <p className="text-xs text-neutral-500 italic line-clamp-1 mt-0.5">
                        "{req.message || 'Wants to connect'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespondConnection(req.id, 'DECLINED')}
                      className="px-3.5 py-1.5 rounded-full border border-neutral-300 text-neutral-500 text-xs font-bold uppercase hover:text-[#E76244]"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespondConnection(req.id, 'ACCEPTED')}
                      className="px-5 py-1.5 rounded-full bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-sm hover:bg-neutral-800"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate('create-activity')}
            className="p-6 rounded-[24px] bg-white border border-neutral-200 hover:border-neutral-400 text-left flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
          >
            <div>
              <span className="font-display text-2xl uppercase text-[#221013] group-hover:text-[#E76244] block transition-colors">
                Host An Activity
              </span>
              <span className="text-xs text-neutral-500 mt-0.5 block">Schedule a session for others to join</span>
            </div>
            <PlusCircle size={26} className="text-[#221013] group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('partners')}
            className="p-6 rounded-[24px] bg-white border border-neutral-200 hover:border-neutral-400 text-left flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
          >
            <div>
              <span className="font-display text-2xl uppercase text-[#221013] group-hover:text-[#E76244] block transition-colors">
                Find Partners
              </span>
              <span className="text-xs text-neutral-500 mt-0.5 block">Discover athletes with matching hours</span>
            </div>
            <Users size={26} className="text-[#221013] group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('activities')}
            className="p-6 rounded-[24px] bg-white border border-neutral-200 hover:border-neutral-400 text-left flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
          >
            <div>
              <span className="font-display text-2xl uppercase text-[#221013] group-hover:text-[#E76244] block transition-colors">
                Explore Activities
              </span>
              <span className="text-xs text-neutral-500 mt-0.5 block">Browse upcoming matches & groups</span>
            </div>
            <Calendar size={26} className="text-[#221013] group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* My Registered Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-300 pb-3">
            <h2 className="font-display text-3xl uppercase tracking-tight text-[#221013]">
              My Scheduled Sessions ({myUpcoming.length})
            </h2>
            <button
              onClick={() => onNavigate('activities')}
              className="text-xs font-bold uppercase text-[#E76244] hover:underline"
            >
              Browse All Activities
            </button>
          </div>

          {myUpcoming.length === 0 ? (
            <div className="p-10 rounded-[28px] bg-white border border-neutral-200 text-center max-w-md mx-auto shadow-sm">
              <Calendar size={36} className="text-[#E76244] mx-auto mb-3" />
              <p className="text-xs text-neutral-500 mb-5">
                You haven't joined or hosted any upcoming sports sessions yet.
              </p>
              <button
                onClick={() => onNavigate('activities')}
                className="px-6 py-2.5 rounded-full bg-[#231215] text-white font-display font-bold text-xs uppercase shadow-sm"
              >
                Discover Sessions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myUpcoming.map((act) => (
                <div
                  key={act.id}
                  onClick={() => onNavigate('activity-detail', act.id)}
                  className="bg-white rounded-[24px] border border-neutral-200 hover:border-neutral-400 p-6 flex flex-col justify-between cursor-pointer group transition-all shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#221013] border border-neutral-200 text-[11px] font-mono font-bold uppercase">
                        {act.sport?.name || 'Sport'}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {new Date(act.startsAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl uppercase text-[#221013] group-hover:text-[#E76244] transition-colors mb-2 leading-snug">
                      {act.title}
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-2 mb-4">
                      {act.generalLocation}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-700 font-bold">
                      {act.isOrganizer ? 'Organizer' : 'Confirmed Athlete'}
                    </span>
                    <span className="text-[#221013] group-hover:text-[#E76244] flex items-center gap-1 font-bold uppercase">
                      Details <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Partners */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-neutral-300 pb-3">
            <h2 className="font-display text-3xl uppercase tracking-tight text-[#221013]">
              Recommended Training Partners
            </h2>
            <button
              onClick={() => onNavigate('partners')}
              className="text-xs font-bold uppercase text-[#E76244] hover:underline"
            >
              View Directory ({safePartners.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safePartners.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-[24px] border border-neutral-200 p-6 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={p.displayName || 'Athlete'}
                        className="w-12 h-12 rounded-full object-cover border border-[#221013]"
                      />
                      <div>
                        <h4 className="font-display text-xl uppercase text-[#221013] leading-none">{p.displayName || 'Athlete'}</h4>
                        <p className="text-xs text-neutral-500 mt-1">{p.area || p.city || 'India'}</p>
                      </div>
                    </div>
                    <span className="font-display text-lg font-bold text-[#E76244]">
                      {p.compatibility?.overallPercentage || 80}%
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 italic line-clamp-2 mb-4 leading-relaxed">
                    "{p.bio || 'Ready for routine sessions!'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-500">
                    {p.sports?.[0]?.sport?.name || 'Multi-Sport'}
                  </span>
                  <button
                    onClick={() => onNavigate('partners')}
                    className="text-xs font-bold uppercase text-[#221013] hover:underline"
                  >
                    View Match →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
