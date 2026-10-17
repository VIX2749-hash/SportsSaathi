import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { ConversationSummary, MessageItem } from '../types';
import { 
  Send, 
  MessageSquare, 
  ShieldAlert, 
  ArrowLeft, 
  User, 
  CheckCheck, 
  AlertCircle 
} from 'lucide-react';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activePartner, setActivePartner] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Safety Block & Report
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await apiRequest<{ conversations: ConversationSummary[] }>('/messages/conversations');
      setConversations(res.conversations);
      if (res.conversations.length > 0 && !activeConvId) {
        setActiveConvId(res.conversations[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await apiRequest<{ messages: MessageItem[]; otherUser: any }>(`/messages/conversations/${convId}`);
      setMessages(res.messages);
      setActivePartner(res.otherUser);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const interval = setInterval(() => {
        fetchMessages(activeConvId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    setSending(true);
    try {
      const res = await apiRequest(`/messages/conversations/${activeConvId}`, {
        method: 'POST',
        body: JSON.stringify({ body: inputText }),
      });
      setMessages((prev) => [...prev, res.message]);
      setInputText('');
      fetchConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleBlockPartner = async () => {
    if (!activePartner) return;
    if (!confirm(`Are you sure you want to block ${activePartner.displayName}? They will not be able to message you or see your sessions.`)) return;

    try {
      await apiRequest('/safety/block', {
        method: 'POST',
        body: JSON.stringify({ blockedUserId: activePartner.id }),
      });
      alert('User blocked successfully.');
      setActiveConvId(null);
      fetchConversations();
    } catch (err: any) {
      alert(err.message || 'Failed to block user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-lime block mb-1">
          Direct Athlete Communication
        </span>
        <h1 className="font-display text-4xl uppercase tracking-tight text-brand-ivory">
          Messages & Connections
        </h1>
      </div>

      <div className="bg-brand-wineCard rounded-3xl border border-brand-wineBorder overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left: Conversation List */}
        <div className="md:col-span-4 border-r border-brand-wineBorder flex flex-col bg-brand-wineDark/50">
          <div className="p-4 border-b border-brand-wineBorder">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ivory">
              Conversations ({conversations.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-brand-wineBorder/40">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-ivoryMuted">
                <MessageSquare size={28} className="text-brand-lime mx-auto mb-2" />
                No active conversations yet. Connect with athletes on the Partner Discovery page to start messaging!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      isActive ? 'bg-brand-wineCard border-l-4 border-brand-lime' : 'hover:bg-brand-wine'
                    }`}
                  >
                    <img
                      src={conv.otherUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={conv.otherUser.displayName}
                      className="w-11 h-11 rounded-full object-cover border border-brand-lime shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-display text-base uppercase text-brand-ivory truncate">
                          {conv.otherUser.displayName}
                        </h4>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-brand-coral text-brand-ivory text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-ivoryMuted truncate">
                        {conv.lastMessage?.body || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Window */}
        <div className="md:col-span-8 flex flex-col justify-between bg-brand-wine">
          {activeConvId && activePartner ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-brand-wineBorder bg-brand-wineCard flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activePartner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={activePartner.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-brand-lime"
                  />
                  <div>
                    <h3 className="font-display text-lg uppercase text-brand-ivory leading-none">
                      {activePartner.displayName}
                    </h3>
                    <span className="text-[11px] text-brand-ivoryMuted">{activePartner.city}</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowSafetyMenu(!showSafetyMenu)}
                    className="p-2 text-brand-ivoryMuted hover:text-brand-coral transition-colors rounded-lg"
                    title="Safety options"
                  >
                    <ShieldAlert size={18} />
                  </button>

                  {showSafetyMenu && (
                    <div className="absolute right-0 top-10 w-48 bg-brand-wineDark border border-brand-wineBorder rounded-xl shadow-xl p-2 z-20 space-y-1">
                      <button
                        onClick={handleBlockPartner}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-brand-coral hover:bg-brand-wine rounded-lg"
                      >
                        Block Athlete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-brand-lime text-brand-dark font-medium rounded-tr-none'
                            : 'bg-brand-wineCard text-brand-ivory border border-brand-wineBorder rounded-tl-none'
                        }`}
                      >
                        {m.body}
                      </div>
                      <span className="text-[10px] font-mono text-brand-ivoryMuted mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-brand-wineCard border-t border-brand-wineBorder flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message (e.g. Confirming meetup location & pace)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory text-xs focus:border-brand-lime focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-6 py-3 rounded-xl bg-brand-lime hover:bg-brand-limeHover text-brand-dark font-display font-bold text-xs uppercase shadow-lime-glow flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-brand-ivoryMuted">
              <MessageSquare size={36} className="text-brand-lime mb-2" />
              <p className="text-xs">Select a conversation on the left to start chatting.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
