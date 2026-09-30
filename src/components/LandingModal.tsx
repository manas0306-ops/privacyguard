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
import mandalaWatermark from '../assets/mandala-watermark.png';
import { usePrivacy } from '../context/PrivacyContext';

export const LandingModal: React.FC = () => {
  const { startTour, isLandingModalOpen, setIsLandingModalOpen, currentTheme } = usePrivacy();
  const isCosmic = currentTheme === 'cosmic';
  const isBurgundy = currentTheme === 'burgundy';
  const isDarkRed = isCosmic || isBurgundy;

  const handleEnter = (withTour: boolean) => {
    sessionStorage.setItem('privacyguard_has_entered', 'true');
    setIsLandingModalOpen(false);
    if (withTour) {
      startTour();
    }
  };

  if (!isLandingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full max-w-xl glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6 overflow-hidden border ${
        isDarkRed
          ? 'border-red-500/40 bg-gradient-to-b from-[#26050e] via-[#1c0309] to-[#140207] text-[#fff8e7] shadow-[0_0_50px_rgba(220,38,38,0.25)]'
          : 'border-cyan-500/40 bg-[#0b1120]/95 text-slate-100'
      }`}>
        {/* Glow backdrop */}
        <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isDarkRed ? 'bg-red-600/30' : 'bg-cyan-500/20'
        }`} />
        <div className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isDarkRed ? 'bg-rose-600/25' : 'bg-blue-600/20'
        }`} />

        {/* Shield Icon with Golden Mandala Watermark Aura */}
        <div className="relative z-10 w-28 h-28 mx-auto flex items-center justify-center">
          <img
            src={mandalaWatermark}
            alt=""
            className={`absolute inset-0 w-full h-full animate-spin-very-slow ${
              isDarkRed ? 'opacity-55 drop-shadow-[0_0_25px_rgba(255,248,231,0.5)]' : 'opacity-45 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]'
            }`}
          />
          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border ${
            isDarkRed
              ? 'bg-gradient-to-tr from-red-950 via-burgundy-900 to-[#180308] border-red-500/50 shadow-red-600/30 text-red-400'
              : 'bg-gradient-to-tr from-amber-500/20 via-yellow-600/30 to-amber-700/40 border-amber-400/60 shadow-amber-500/25'
          }`}>
            <Shield className={`w-8 h-8 ${isDarkRed ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="relative z-10 space-y-2">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono border ${
            isDarkRed
              ? 'bg-red-950/90 border-red-500/40 text-[#fff8e7]'
              : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDarkRed ? 'bg-red-400' : 'bg-amber-400'}`} />
            CYBERSECURITY &amp; PRIVACY-PRESERVING TECHNOLOGY
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            isDarkRed
              ? 'bg-gradient-to-r from-[#fff8e7] via-[#faedd0] to-[#fff8e7] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,248,231,0.35)]'
              : 'text-white'
          }`}>
            PRIVACYGUARD
          </h1>
          <p className={`text-lg sm:text-xl font-medium ${isDarkRed ? 'text-[#fff8e7]' : 'text-slate-300'}`}>
            Your Personal Data. <span className={isDarkRed ? 'text-red-400 font-bold' : 'text-amber-400'}>Your Rules.</span>
          </p>
        </div>

        {/* Key Features Callout: Deep Maroon boxes with Cosmic Latte typography */}
        <div className="relative z-10 grid grid-cols-2 gap-3 text-left max-w-md mx-auto text-xs">
          <div className={`p-3 rounded-xl border space-y-1 ${
            isDarkRed ? 'bg-[#150207]/90 border-red-500/35 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className={`font-bold flex items-center gap-1.5 ${isDarkRed ? 'text-red-400' : 'text-cyan-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Purpose Firewall
            </span>
            <p className={`text-[11px] ${isDarkRed ? 'text-[#fff8e7]/80' : 'text-slate-400'}`}>
              Blocks apps from using data outside granted consent.
            </p>
          </div>

          <div className={`p-3 rounded-xl border space-y-1 ${
            isDarkRed ? 'bg-[#150207]/90 border-red-500/35 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Data Minimization
            </span>
            <p className={`text-[11px] ${isDarkRed ? 'text-[#fff8e7]/80' : 'text-slate-400'}`}>
              Filters unnecessary attributes before transmission.
            </p>
          </div>
        </div>

        {/* Enter Actions: Vibrant Red primary & Deep Maroon secondary with Cosmic Latte text */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleEnter(false)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isDarkRed
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-[#fff8e7] border border-red-400/40 shadow-red-600/30'
                : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25'
            }`}
          >
            <span>Enter Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleEnter(true)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isDarkRed
                ? 'bg-red-950/80 hover:bg-red-900/90 text-[#fff8e7] border-red-500/40 shadow-sm'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-amber-500/30 hover:border-amber-400'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${isDarkRed ? 'text-red-400' : 'text-amber-400'}`} />
            <span>Start Guided Pitch Tour</span>
          </button>
        </div>

        <p className={`relative z-10 text-[11px] font-mono ${isDarkRed ? 'text-[#fff8e7]/60' : 'text-slate-500'}`}>
          Personal Data Firewall MVP • Ready for Live Judging
        </p>
      </div>
    </div>
  );
};
