import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#FAF7F0] border-t border-neutral-200 py-12 text-[#221013]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold uppercase tracking-tight text-[#221013]">
              MOVE TOGETHER.
            </span>
          </div>

          {/* Clean Horizontal Links: About, Help, Privacy, Terms, Contact (Matching screenshot 1) */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-[#221013]/70">
            <button onClick={() => onNavigate('home')} className="hover:text-[#221013] transition-colors">
              About
            </button>
            <button onClick={() => onNavigate('safety')} className="hover:text-[#221013] transition-colors">
              Help
            </button>
            <button onClick={() => onNavigate('safety')} className="hover:text-[#221013] transition-colors">
              Privacy
            </button>
            <button onClick={() => onNavigate('safety')} className="hover:text-[#221013] transition-colors">
              Terms
            </button>
            <button onClick={() => onNavigate('safety')} className="hover:text-[#221013] transition-colors">
              Contact
            </button>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-[11px] text-[#221013]/40">
          © {new Date().getFullYear()} MOVE TOGETHER. ALL RIGHTS RESERVED. FIND YOUR PEOPLE. SHOW UP. KEEP MOVING.
        </div>
      </div>
    </footer>
  );
};
