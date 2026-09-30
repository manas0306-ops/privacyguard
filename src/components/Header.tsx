import React from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Database,
  Sliders,
  Radio,
  Share2,
  FileText,
  Activity
} from 'lucide-react';
import mandalaWatermark from '../assets/mandala-watermark.png';
import { usePrivacy } from '../context/PrivacyContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLockdownActive,
    toggleLockdown,
    scoreBreakdown,
    setIsScoreModalOpen,
    setIsCopilotOpen,
    startTour,
    resetDemoState,
    auditLogs,
    currentTheme,
    toggleTheme
  } = usePrivacy();

  const isCosmic = currentTheme === 'cosmic';
  const isBurgundy = currentTheme === 'burgundy';
  const isDarkRed = isCosmic || isBurgundy;
  const blockedCount = auditLogs.filter(a => a.decision === 'BLOCK').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'inventory', label: 'My Data', icon: Database },
    { id: 'consent', label: 'Consent Center', icon: Sliders },
    { id: 'simulator', label: 'Request Simulator', icon: Radio, highlight: true },
    { id: 'flow', label: 'Data Flow', icon: Share2 },
    { id: 'audit', label: 'Audit Log', icon: FileText, badge: blockedCount > 0 ? `${blockedCount} BLOCKED` : undefined }
  ];

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
      isCosmic
        ? 'border-red-900/15 bg-[#fff8e7]/94 backdrop-blur-md shadow-sm'
        : isBurgundy
          ? 'border-[#fff8e7]/15 bg-[#160308]/92 backdrop-blur-md'
          : 'border-slate-800 bg-[#070b14]/90 backdrop-blur-md'
    }`}>
      {/* Top Banner when Lockdown is Active */}
      {isLockdownActive && (
        <div className={`border-b px-4 py-1.5 flex items-center justify-between text-xs animate-pulse ${
          isCosmic
            ? 'bg-rose-100 border-rose-300 text-rose-900'
            : 'bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <ShieldAlert className={`w-4 h-4 shrink-0 ${isCosmic ? 'text-rose-700' : 'text-rose-400'}`} />
            <span className={`font-semibold tracking-wide uppercase ${isCosmic ? 'text-rose-900' : 'text-rose-300'}`}>
              PRIVACY LOCKDOWN ACTIVE:
            </span>
            <span className={`hidden sm:inline ${isCosmic ? 'text-rose-800' : 'text-rose-200'}`}>
              Non-essential data egress, commercial tracking, and optional telemetry are strictly restricted.
            </span>
            <button
              onClick={toggleLockdown}
              className="ml-auto underline hover:opacity-80 transition-opacity cursor-pointer font-medium"
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Mission */}
          <div className="flex items-center gap-3">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl border overflow-hidden transition-all duration-300 ${
              isCosmic
                ? 'bg-gradient-to-br from-red-600 via-rose-700 to-red-900 border-red-400/50 shadow-md'
                : isBurgundy
                  ? 'bg-gradient-to-br from-red-950 via-burgundy-900 to-[#180308] border-red-500/40 shadow-[0_0_15px_rgba(220,38,38,0.35)]'
                  : 'bg-gradient-to-br from-amber-500/20 via-yellow-600/30 to-amber-700/40 border-amber-500/40 shadow-glow-amber'
            }`}>
              <img
                src={mandalaWatermark}
                alt=""
                className={`absolute inset-0 w-full h-full animate-spin-very-slow pointer-events-none transition-opacity duration-300 ${
                  isCosmic ? 'opacity-40' : isBurgundy ? 'opacity-55' : 'opacity-35'
                }`}
              />
              <Shield className={`w-5 h-5 relative z-10 ${isCosmic ? 'text-[#fff8e7]' : isBurgundy ? 'text-red-400' : 'text-amber-400'}`} />
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping-slow ${
                isCosmic ? 'bg-amber-300' : isBurgundy ? 'bg-red-400' : 'bg-amber-400'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg tracking-tight ${
                  isCosmic
                    ? 'bg-gradient-to-r from-red-950 via-red-800 to-rose-700 bg-clip-text text-transparent'
                    : isBurgundy
                      ? 'bg-gradient-to-r from-[#fff8e7] via-[#faedd0] to-red-300 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-amber-200 via-yellow-100 to-slate-200 bg-clip-text text-transparent'
                }`}>
                  PRIVACYGUARD
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full border ${
                  isCosmic
                    ? 'bg-red-100 text-red-900 border-red-300 font-semibold'
                    : isBurgundy
                      ? 'bg-red-950/90 text-[#fff8e7] border-red-500/40'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                }`}>
                  FIREWALL MVP
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${
                isCosmic ? 'text-[#5e1c28]' : isBurgundy ? 'text-[#fff8e7]/70' : 'text-slate-400'
              }`}>
                Your Personal Data. <span className={isCosmic ? 'text-red-700 font-semibold' : isBurgundy ? 'text-red-400' : 'text-amber-400/90'}>Your Rules.</span>
              </p>
            </div>
          </div>

          {/* Quick Actions Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Visual Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-sm ${
                isCosmic
                  ? 'bg-white hover:bg-red-50 text-red-950 border-red-300 shadow-[0_2px_10px_rgba(185,28,28,0.1)]'
                  : isBurgundy
                    ? 'bg-red-950/70 hover:bg-red-900/80 text-[#fff8e7] border-red-500/40 hover:border-red-400 shadow-[0_0_12px_rgba(220,38,38,0.25)]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 shadow-glow-sm'
              }`}
              title={`Active: ${isCosmic ? 'Cosmic Latte' : isBurgundy ? 'Velvet Red' : 'Cyber Blue'} (click to cycle)`}
              aria-label="Toggle visual theme"
            >
              <span className="text-sm leading-none">{isCosmic ? '☕' : isBurgundy ? '🍷' : '⚡'}</span>
              <span className="hidden md:inline font-mono tracking-tight text-[11px]">
                {isCosmic ? 'Cosmic Latte' : isBurgundy ? 'Velvet Red' : 'Cyber Blue'}
              </span>
            </button>

            {/* Privacy Score Button */}
            <button
              onClick={() => setIsScoreModalOpen(true)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
                isCosmic
                  ? 'bg-white hover:bg-red-50 border-red-200 hover:border-red-300'
                  : isBurgundy
                    ? 'bg-red-950/70 hover:bg-red-900/80 border-red-500/30 hover:border-red-400/60'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/60 hover:border-cyan-500/40'
              }`}
              title="Click to see why your score is this value"
            >
              <div className="flex flex-col text-left">
                <span className={`text-[10px] uppercase font-mono tracking-wider ${
                  isCosmic ? 'text-[#5e1c28]' : isBurgundy ? 'text-[#fff8e7]/70' : 'text-slate-400'
                }`}>Privacy Score</span>
                <span className={`text-sm font-bold font-mono ${
                  scoreBreakdown.score >= 85 ? (isCosmic ? 'text-emerald-700' : 'text-emerald-400') :
                  scoreBreakdown.score >= 70 ? (isCosmic ? 'text-amber-800' : isBurgundy ? 'text-[#fff8e7]' : 'text-amber-400') : 'text-rose-600'
                }`}>
                  {scoreBreakdown.score}<span className={`text-xs ${
                    isCosmic ? 'text-[#882b3d]' : isBurgundy ? 'text-[#fff8e7]/40' : 'text-slate-500'
                  }`}>/100</span>
                </span>
              </div>
              <HelpCircle className={`w-3.5 h-3.5 transition-colors ${
                isCosmic ? 'text-[#5e1c28] group-hover:text-red-700' : isBurgundy ? 'text-[#fff8e7]/60 group-hover:text-[#fff8e7]' : 'text-slate-400 group-hover:text-cyan-400'
              }`} />
            </button>

            {/* Privacy Lockdown Button (Feature 16) */}
            <button
              onClick={toggleLockdown}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer border ${
                isLockdownActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-md'
                  : isCosmic
                    ? 'bg-white hover:bg-rose-50 text-red-950 border-red-300'
                    : isBurgundy
                      ? 'bg-red-950/70 hover:bg-rose-950/60 text-[#fff8e7] hover:text-rose-200 border-red-500/30 hover:border-rose-500/40'
                      : 'bg-slate-900/80 hover:bg-rose-950/50 text-slate-300 hover:text-rose-200 border-slate-700/60 hover:border-rose-500/40'
              }`}
            >
              {isLockdownActive ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-white" />
                  <span>LOCKDOWN ON</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-rose-500" />
                  <span>LOCKDOWN</span>
                </>
              )}
            </button>

            {/* Start Demo Button (Feature 25) */}
            <button
              onClick={startTour}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                isCosmic
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white border-red-400/50 shadow-md'
                  : isBurgundy
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-[#fff8e7] border-red-400/40 shadow-[0_0_20px_rgba(220,38,38,0.35)]'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/40 shadow-glow-sm'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold">START DEMO</span>
            </button>

            {/* Privacy Copilot Button (Feature 15) */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
                isCosmic
                  ? 'bg-white hover:bg-red-50 text-red-950 border-red-200'
                  : isBurgundy
                    ? 'bg-red-950/70 hover:bg-red-900/80 text-[#fff8e7] border-red-500/30 hover:border-red-400/50'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-indigo-500/40'
              }`}
              title="Ask Privacy Copilot"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isCosmic ? 'text-red-600' : isBurgundy ? 'text-red-400' : 'text-indigo-400'}`} />
              <span className="hidden md:inline font-medium">Copilot</span>
            </button>

            {/* Reset State */}
            <button
              onClick={resetDemoState}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isCosmic
                  ? 'text-[#5e1c28] hover:text-red-900 hover:bg-red-100/60'
                  : isBurgundy
                    ? 'text-[#fff8e7]/60 hover:text-[#fff8e7] hover:bg-red-950/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
              title="Reset Demo to Original State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <nav className={`flex space-x-1 sm:space-x-2 border-t py-2 overflow-x-auto no-scrollbar transition-colors duration-300 ${
          isCosmic ? 'border-red-900/15' : isBurgundy ? 'border-[#fff8e7]/15' : 'border-slate-800/80'
        }`}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? isCosmic
                      ? 'bg-red-600 text-white font-semibold shadow-md'
                      : isBurgundy
                        ? 'bg-red-950/90 text-[#fff8e7] border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.35)]'
                        : 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : isCosmic
                      ? 'text-[#5e1c28] hover:text-red-950 hover:bg-red-100/50'
                      : isBurgundy
                        ? 'text-[#fff8e7]/75 hover:text-[#fff8e7] hover:bg-red-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive 
                    ? (isCosmic ? 'text-white' : isBurgundy ? 'text-red-400' : 'text-cyan-400') 
                    : (isCosmic ? 'text-red-700' : isBurgundy ? 'text-[#fff8e7]/60' : 'text-slate-400')
                }`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded font-semibold ${
                    isCosmic 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isCosmic ? 'bg-red-600 animate-pulse' : isBurgundy ? 'bg-red-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
