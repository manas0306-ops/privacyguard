import React, { useState, useEffect } from 'react';
import {
  Shield,
  ArrowRight,
  Play,
  Lock,
  Radio,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

export const LandingModal: React.FC = () => {
  const { startTour } = usePrivacy();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Check if previously dismissed in this session
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('privacyguard_has_entered');
    if (hasSeen) {
      setIsOpen(false);
    }
  }, []);

  const handleEnter = (withTour: boolean) => {
    sessionStorage.setItem('privacyguard_has_entered', 'true');
    setIsOpen(false);
    if (withTour) {
      startTour();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-500/40 bg-[#0b1120]/95 shadow-2xl text-center space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-indigo-600/40 border border-cyan-400/50 flex items-center justify-center shadow-glow-sm">
          <Shield className="w-10 h-10 text-cyan-400" />
        </div>

        {/* Title and Tagline */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            CYBERSECURITY &amp; PRIVACY-PRESERVING TECHNOLOGY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            PRIVACYGUARD
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-300">
            Your Personal Data. <span className="text-cyan-400">Your Rules.</span>
          </p>
        </div>

        {/* Key Features Callout */}
        <div className="relative z-10 grid grid-cols-2 gap-3 text-left max-w-md mx-auto text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Purpose Firewall
            </span>
            <p className="text-slate-400 text-[11px]">
              Blocks apps from using data outside granted consent.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Data Minimization
            </span>
            <p className="text-slate-400 text-[11px]">
              Filters unnecessary attributes before transmission.
            </p>
          </div>
        </div>

        {/* Enter Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleEnter(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Enter Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleEnter(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-current" />
            <span>Start Guided Pitch Tour</span>
          </button>
        </div>

        <p className="relative z-10 text-[11px] font-mono text-slate-500">
          Personal Data Firewall MVP • Ready for Live Judging
        </p>
      </div>
    </div>
  );
};
