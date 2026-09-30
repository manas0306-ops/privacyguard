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

  const isBurgundy = currentTheme === 'burgundy';
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
      isBurgundy
        ? 'border-cream-300/15 bg-[#140309]/92 backdrop-blur-md'
        : 'border-slate-800 bg-[#070b14]/90 backdrop-blur-md'
    }`}>
      {/* Top Banner when Lockdown is Active */}
      {isLockdownActive && (
        <div className="bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-b border-rose-500/40 px-4 py-1.5 flex items-center justify-between text-xs text-rose-200 animate-pulse">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold tracking-wide uppercase text-rose-300">
              PRIVACY LOCKDOWN ACTIVE:
            </span>
            <span className="hidden sm:inline text-rose-200">
              Non-essential data egress, commercial tracking, and optional telemetry are strictly restricted.
            </span>
            <button
              onClick={toggleLockdown}
              className="ml-auto underline hover:text-white transition-colors cursor-pointer"
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
              isBurgundy
                ? 'bg-gradient-to-br from-burgundy-900/60 via-maroon-800/40 to-burgundy-950/80 border-cream-300/40 shadow-[0_0_15px_rgba(212,77,100,0.3)]'
                : 'bg-gradient-to-br from-amber-500/20 via-yellow-600/30 to-amber-700/40 border-amber-500/40 shadow-glow-amber'
            }`}>
              <img
                src={mandalaWatermark}
                alt=""
                className={`absolute inset-0 w-full h-full animate-spin-very-slow pointer-events-none transition-opacity duration-300 ${
                  isBurgundy ? 'opacity-50' : 'opacity-35'
                }`}
              />
              <Shield className={`w-5 h-5 relative z-10 ${isBurgundy ? 'text-cream-200' : 'text-amber-400'}`} />
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping-slow ${
                isBurgundy ? 'bg-cream-300' : 'bg-amber-400'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg tracking-tight ${
                  isBurgundy
                    ? 'bg-gradient-to-r from-cream-100 via-cream-200 to-amber-200 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-amber-200 via-yellow-100 to-slate-200 bg-clip-text text-transparent'
                }`}>
                  PRIVACYGUARD
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full border ${
                  isBurgundy
                    ? 'bg-burgundy-950/90 text-cream-200 border-cream-300/30'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                }`}>
                  FIREWALL MVP
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${isBurgundy ? 'text-cream-300/70' : 'text-slate-400'}`}>
                Your Personal Data. <span className={isBurgundy ? 'text-cream-200' : 'text-amber-400/90'}>Your Rules.</span>
              </p>
            </div>
          </div>

          {/* Quick Actions Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Visual Theme Switcher Button (Burgundy & Cream <-> Cyber Blue) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-sm ${
                isBurgundy
                  ? 'bg-burgundy-950/70 hover:bg-burgundy-900/80 text-cream-200 border-cream-300/30 hover:border-cream-200/60 shadow-[0_0_12px_rgba(212,77,100,0.2)]'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 shadow-glow-sm'
              }`}
              title={isBurgundy ? "Switch to Cyber Blue theme" : "Switch to Royal Burgundy & Cream theme"}
              aria-label="Toggle visual theme"
            >
              <span className="text-sm leading-none">{isBurgundy ? '🍷' : '⚡'}</span>
              <span className="hidden md:inline font-mono tracking-tight text-[11px]">
                {isBurgundy ? 'Burgundy & Cream' : 'Cyber Blue'}
              </span>
            </button>

            {/* Privacy Score Button */}
            <button
              onClick={() => setIsScoreModalOpen(true)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
                isBurgundy
                  ? 'bg-burgundy-950/70 hover:bg-burgundy-900/80 border-cream-300/20 hover:border-cream-300/50'
                  : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/60 hover:border-cyan-500/40'
              }`}
              title="Click to see why your score is this value"
            >
              <div className="flex flex-col text-left">
                <span className={`text-[10px] uppercase font-mono tracking-wider ${isBurgundy ? 'text-cream-300/60' : 'text-slate-400'}`}>Privacy Score</span>
                <span className={`text-sm font-bold font-mono ${
                  scoreBreakdown.score >= 85 ? 'text-emerald-400' :
                  scoreBreakdown.score >= 70 ? (isBurgundy ? 'text-cream-200' : 'text-amber-400') : 'text-rose-400'
                }`}>
                  {scoreBreakdown.score}<span className={`text-xs ${isBurgundy ? 'text-cream-300/40' : 'text-slate-500'}`}>/100</span>
                </span>
              </div>
              <HelpCircle className={`w-3.5 h-3.5 transition-colors ${
                isBurgundy ? 'text-cream-300/60 group-hover:text-cream-100' : 'text-slate-400 group-hover:text-cyan-400'
              }`} />
            </button>

            {/* Privacy Lockdown Button (Feature 16) */}
            <button
              onClick={toggleLockdown}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer border ${
                isLockdownActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-glow-rose'
                  : isBurgundy
                    ? 'bg-burgundy-950/70 hover:bg-rose-950/60 text-cream-200 hover:text-rose-200 border-cream-300/20 hover:border-rose-500/40'
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
                  <Unlock className="w-3.5 h-3.5 text-rose-400" />
                  <span>LOCKDOWN</span>
                </>
              )}
            </button>

            {/* Start Demo Button (Feature 25) */}
            <button
              onClick={startTour}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs border shadow-glow-sm transition-all cursor-pointer ${
                isBurgundy
                  ? 'bg-gradient-to-r from-maroon-700 via-burgundy-700 to-burgundy-800 hover:from-maroon-600 hover:to-burgundy-600 text-cream-50 border-cream-300/30'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/40'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold">START DEMO</span>
            </button>

            {/* Privacy Copilot Button (Feature 15) */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
                isBurgundy
                  ? 'bg-burgundy-950/70 hover:bg-burgundy-900/80 text-cream-200 border-cream-300/20 hover:border-cream-300/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-indigo-500/40'
              }`}
              title="Ask Privacy Copilot"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBurgundy ? 'text-cream-300' : 'text-indigo-400'}`} />
              <span className="hidden md:inline">Copilot</span>
            </button>

            {/* Reset State */}
            <button
              onClick={resetDemoState}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBurgundy
                  ? 'text-cream-300/60 hover:text-cream-100 hover:bg-burgundy-950/80'
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
          isBurgundy ? 'border-cream-300/10' : 'border-slate-800/80'
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
                    ? isBurgundy
                      ? 'bg-burgundy-900/80 text-cream-100 border border-cream-300/40 shadow-[0_0_12px_rgba(212,77,100,0.3)]'
                      : 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : isBurgundy
                      ? 'text-cream-300/70 hover:text-cream-100 hover:bg-burgundy-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive 
                    ? (isBurgundy ? 'text-cream-200' : 'text-cyan-400') 
                    : (isBurgundy ? 'text-cream-300/60' : 'text-slate-400')
                }`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 font-semibold">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isBurgundy ? 'bg-cream-300 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
