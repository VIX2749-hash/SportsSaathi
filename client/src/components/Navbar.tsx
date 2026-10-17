import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  MessageSquare, 
  PlusCircle, 
  Menu, 
  X, 
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { apiRequest } from '../services/api';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (user) {
      apiRequest<{ unreadCount: number }>('/notifications')
        .then((data) => setUnreadNotifications(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user, currentTab]);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 xl:gap-6">
          
          {/* Logo Branding */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center cursor-pointer group shrink-0"
          >
            <span className="font-display text-2xl font-bold tracking-tight text-[#221013] whitespace-nowrap">
              SPORTS SAATHI.
            </span>
          </div>

          {/* Desktop Links (3 Pillars + Dashboard) */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
            <button
              onClick={() => onNavigate('partners')}
              className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                currentTab === 'partners' ? 'text-[#E76244]' : 'text-[#221013]/70 hover:text-[#221013]'
              }`}
            >
              Partners
            </button>
            <button
              onClick={() => onNavigate('activities')}
              className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                currentTab === 'activities' ? 'text-[#E76244]' : 'text-[#221013]/70 hover:text-[#221013]'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => onNavigate('spaces')}
              className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                currentTab === 'spaces' ? 'text-[#E76244]' : 'text-[#221013]/70 hover:text-[#221013]'
              }`}
            >
              Spaces
            </button>
            <button
              onClick={() => onNavigate('equipment')}
              className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                currentTab === 'equipment' ? 'text-[#E76244]' : 'text-[#221013]/70 hover:text-[#221013]'
              }`}
            >
              Equipment
            </button>
            {user && (
              <button
                onClick={() => onNavigate('my-bookings')}
                className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                  currentTab === 'my-bookings' ? 'text-[#E76244]' : 'text-[#221013]/70 hover:text-[#221013]'
                }`}
              >
                Bookings
              </button>
            )}
            <button
              onClick={() => onNavigate('safety')}
              className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                currentTab === 'safety' ? 'text-[#E76244]' : 'text-[#221013]/70 hover:text-[#221013]'
              }`}
            >
              Safety
            </button>
            {user && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                  currentTab === 'dashboard' ? 'text-[#E76244]' : 'text-[#221013]/70 hover:text-[#221013]'
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>

          {/* Right Action: Pill JOIN button or User Controls */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate('create-activity')}
                  className="flex items-center gap-1.5 bg-[#221013] text-[#FAF7F0] font-display font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-full hover:bg-neutral-800 transition-all shadow-sm whitespace-nowrap shrink-0"
                >
                  <PlusCircle size={15} className="shrink-0" />
                  <span>Host Activity</span>
                </button>

                {/* Messages */}
                <button
                  onClick={() => onNavigate('messages')}
                  className={`p-2 rounded-full border border-neutral-300 text-[#221013] hover:bg-neutral-200 transition-all shrink-0 ${
                    currentTab === 'messages' ? 'bg-[#221013] text-[#FAF7F0]' : ''
                  }`}
                  title="Messages & Chat"
                >
                  <MessageSquare size={16} />
                </button>

                {/* Notifications */}
                <button
                  onClick={() => onNavigate('notifications')}
                  className="relative p-2 rounded-full border border-neutral-300 text-[#221013] hover:bg-neutral-200 transition-all shrink-0"
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#E76244] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Profile Pill */}
                <div 
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-white border border-neutral-300 cursor-pointer hover:border-[#221013] transition-colors shrink-0 max-w-[130px]"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-5 h-5 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#CCFF00] text-[#121212] font-bold text-xs flex items-center justify-center shrink-0">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[#221013] truncate">{user.displayName.split(' ')[0]}</span>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-neutral-400 hover:text-[#E76244] transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-xs font-bold uppercase tracking-wider text-[#221013]/70 hover:text-[#221013] px-3 py-2 transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-2 rounded-full border-2 border-[#221013] text-[#221013] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#221013] hover:text-white transition-all whitespace-nowrap"
                >
                  JOIN
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#221013] focus:outline-none"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F0] border-b border-neutral-200 px-6 pt-4 pb-6 space-y-4">
          <button
            onClick={() => { onNavigate('partners'); setMobileMenuOpen(false); }}
            className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
          >
            Find Partners
          </button>
          <button
            onClick={() => { onNavigate('activities'); setMobileMenuOpen(false); }}
            className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
          >
            Sports & Activities
          </button>
          <button
            onClick={() => { onNavigate('spaces'); setMobileMenuOpen(false); }}
            className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
          >
            Sports Spaces & Venues
          </button>
          <button
            onClick={() => { onNavigate('equipment'); setMobileMenuOpen(false); }}
            className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
          >
            Equipment Library
          </button>
          {user && (
            <button
              onClick={() => { onNavigate('my-bookings'); setMobileMenuOpen(false); }}
              className="block w-full text-left font-display text-lg uppercase text-[#E76244] py-1"
            >
              My Bookings & Handovers
            </button>
          )}
          <button
            onClick={() => { onNavigate('safety'); setMobileMenuOpen(false); }}
            className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
          >
            Safety Hub
          </button>

          {user ? (
            <>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="block w-full text-left font-display text-lg uppercase text-[#E76244] py-1"
              >
                Dashboard
              </button>
              <button
                onClick={() => { onNavigate('create-activity'); setMobileMenuOpen(false); }}
                className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
              >
                Host an Activity
              </button>
              <button
                onClick={() => { onNavigate('messages'); setMobileMenuOpen(false); }}
                className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
              >
                Messages
              </button>
              <button
                onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                className="block w-full text-left font-display text-lg uppercase text-[#221013] py-1"
              >
                Profile & Settings
              </button>
              <div className="pt-2 border-t border-neutral-200">
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-left text-xs font-bold text-[#E76244] uppercase py-2 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center font-bold text-xs uppercase rounded-full border border-neutral-300 text-[#221013]"
              >
                Log In
              </button>
              <button
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center font-display font-bold text-xs uppercase rounded-full bg-[#221013] text-white"
              >
                Join with Google
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
