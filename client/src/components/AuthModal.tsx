import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose, onSuccess }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom prompt for Google account testing
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('rohan.sharma@gmail.com');
  const [googleName, setGoogleName] = useState('Rohan Sharma');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Display name is required');
          setLoading(false);
          return;
        }
        await register({ email, password, displayName });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle({
        email: googleEmail.trim(),
        displayName: googleName.trim(),
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
      setGooglePromptOpen(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    setEmail(demoEmail);
    setPassword('password123');
    try {
      await login(demoEmail, 'password123');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-brand-wineCard rounded-[32px] border border-brand-wineBorder p-8 md:p-10 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-brand-ivoryMuted hover:text-brand-lime hover:bg-brand-wine transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 mb-3 bg-brand-lime text-brand-dark font-display font-bold text-xs uppercase rounded-md tracking-wider">
            {mode === 'login' ? 'Athletic Access' : 'Join Sports Saathi'}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-brand-ivory leading-none">
            {mode === 'login' ? 'Welcome Back' : 'Create Athlete Profile'}
          </h2>
          <p className="text-xs text-brand-ivoryMuted mt-2">
            Find compatible training partners and discover verified sports spaces across your city.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-brand-coral/10 border border-brand-coral/40 text-brand-coral text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. GOOGLE ONE-CLICK SIGN IN BUTTON (Primary Highlighted Option) */}
        {!googlePromptOpen ? (
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={() => setGooglePromptOpen(true)}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-md transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-brand-wineBorder w-full" />
              <span className="bg-brand-wineCard px-3 text-[11px] font-mono uppercase text-brand-ivoryMuted">
                Or with email
              </span>
              <div className="border-t border-brand-wineBorder w-full" />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-brand-wine border border-brand-lime/40 mb-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-brand-lime">
              <span>Google Account Sign-In</span>
              <button
                type="button"
                onClick={() => setGooglePromptOpen(false)}
                className="text-[10px] text-brand-ivoryMuted hover:text-brand-ivory"
              >
                Back
              </button>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-ivoryMuted mb-1">
                Google Display Name
              </label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-brand-wineDark border border-brand-wineBorder text-brand-ivory text-xs focus:border-brand-lime focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-ivoryMuted mb-1">
                Google Account Email
              </label>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-brand-wineDark border border-brand-wineBorder text-brand-ivory text-xs focus:border-brand-lime focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleGoogleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-lime text-brand-dark font-display font-bold text-xs uppercase tracking-wider hover:bg-brand-limeHover shadow-lime-glow"
            >
              {loading ? 'Authenticating with Google...' : 'Authorize & Enter'}
            </button>
          </div>
        )}

        {/* Traditional Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-ivoryMuted">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory placeholder-brand-ivoryMuted/50 text-xs focus:outline-none focus:border-brand-lime transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-ivoryMuted">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory placeholder-brand-ivoryMuted/50 text-xs focus:outline-none focus:border-brand-lime transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-ivory mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-ivoryMuted">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-wine border border-brand-wineBorder text-brand-ivory placeholder-brand-ivoryMuted/50 text-xs focus:outline-none focus:border-brand-lime transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-wine hover:bg-brand-wineHover text-brand-ivory border border-brand-wineBorder hover:border-brand-lime font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In with Email' : 'Register with Email'}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Accounts Quick Login */}
        <div className="mt-6 pt-5 border-t border-brand-wineBorder/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-ivoryMuted mb-2 text-center">
            One-Click Test with Demo Athletes:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('rohan.sharma@gmail.com')}
              className="py-1.5 px-2 bg-brand-wine hover:bg-brand-wineHover border border-brand-wineBorder hover:border-brand-lime rounded-lg text-[11px] text-brand-ivory text-left truncate transition-colors flex items-center gap-1.5"
            >
              <span>🏏</span>
              <span className="truncate">Rohan (Cricket & 5K)</span>
            </button>
            <button
              onClick={() => handleDemoLogin('ananya.iyer@gmail.com')}
              className="py-1.5 px-2 bg-brand-wine hover:bg-brand-wineHover border border-brand-wineBorder hover:border-brand-lime rounded-lg text-[11px] text-brand-ivory text-left truncate transition-colors flex items-center gap-1.5"
            >
              <span>🏸</span>
              <span className="truncate">Ananya (Badminton)</span>
            </button>
            <button
              onClick={() => handleDemoLogin('vikram.malhotra@gmail.com')}
              className="py-1.5 px-2 bg-brand-wine hover:bg-brand-wineHover border border-brand-wineBorder hover:border-brand-lime rounded-lg text-[11px] text-brand-ivory text-left truncate transition-colors flex items-center gap-1.5"
            >
              <span>⚽</span>
              <span className="truncate">Vikram (Turf 7v7)</span>
            </button>
            <button
              onClick={() => handleDemoLogin('alex.rivera@example.com')}
              className="py-1.5 px-2 bg-brand-wine hover:bg-brand-wineHover border border-brand-wineBorder hover:border-brand-lime rounded-lg text-[11px] text-brand-ivory text-left truncate transition-colors flex items-center gap-1.5 opacity-90"
            >
              <span>🏃</span>
              <span className="truncate">Alex (Marathoner)</span>
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <p className="text-xs text-brand-ivoryMuted">
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="ml-1.5 text-brand-lime font-bold hover:underline uppercase text-xs"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
