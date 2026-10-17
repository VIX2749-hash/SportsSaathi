import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, ExternalLink, Calendar, MessageSquare, UserPlus } from 'lucide-react';

interface NotificationsProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest<{ notifications: NotificationItem[] }>('/notifications');
      setNotifications(res.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.readAt) {
      await apiRequest(`/notifications/${notif.id}/read`, { method: 'PATCH' }).catch(() => {});
    }
    if (notif.link) {
      if (notif.link.includes('activities/')) {
        const id = notif.link.split('activities/')[1];
        onNavigate('activity-detail', id);
      } else if (notif.link.includes('messages')) {
        onNavigate('messages');
      } else {
        onNavigate('dashboard');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-brand-wineBorder pb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-lime block mb-1">
            Activity Updates
          </span>
          <h1 className="font-display text-3xl uppercase tracking-tight text-brand-ivory">
            Notifications
          </h1>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-mono uppercase text-brand-lime hover:underline"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-brand-ivoryMuted">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder p-12 text-center">
          <Bell size={32} className="text-brand-lime mx-auto mb-3" />
          <p className="text-xs text-brand-ivoryMuted">
            You're all caught up! No new connection requests or session updates.
          </p>
        </div>
      ) : (
        <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder divide-y divide-brand-wineBorder/50 overflow-hidden shadow-xl">
          {notifications.map((n) => {
            const isUnread = !n.readAt;
            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                  isUnread ? 'bg-brand-wine/90 border-l-4 border-brand-lime' : 'hover:bg-brand-wine/40'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-brand-wineCard border border-brand-wineBorder shrink-0 text-brand-lime">
                  {n.type === 'CONNECTION_REQUEST' && <UserPlus size={18} />}
                  {n.type === 'ACTIVITY_JOIN' && <Calendar size={18} />}
                  {n.type === 'MESSAGE_RECEIVED' && <MessageSquare size={18} />}
                  {!['CONNECTION_REQUEST', 'ACTIVITY_JOIN', 'MESSAGE_RECEIVED'].includes(n.type) && <Bell size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold uppercase text-brand-ivory">{n.title}</h4>
                    <span className="text-[10px] font-mono text-brand-ivoryMuted">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-brand-ivoryMuted leading-relaxed">{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
