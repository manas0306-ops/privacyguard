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
    auditLogs
  } = usePrivacy();

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-md">
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
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-600/30 to-amber-700/40 border border-amber-500/40 shadow-glow-amber overflow-hidden">
              <img
                src={mandalaWatermark}
                alt=""
                className="absolute inset-0 w-full h-full opacity-35 animate-spin-very-slow pointer-events-none"
              />
              <Shield className="w-5 h-5 text-amber-400 relative z-10" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-slate-200 bg-clip-text text-transparent">
                  PRIVACYGUARD
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30">
                  FIREWALL MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Your Personal Data. <span className="text-amber-400/90">Your Rules.</span>
              </p>
            </div>
          </div>

          {/* Quick Actions Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Privacy Score Button */}
            <button
              onClick={() => setIsScoreModalOpen(true)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm"
              title="Click to see why your score is this value"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Privacy Score</span>
                <span className={`text-sm font-bold font-mono ${
                  scoreBreakdown.score >= 85 ? 'text-emerald-400' :
                  scoreBreakdown.score >= 70 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {scoreBreakdown.score}<span className="text-xs text-slate-500">/100</span>
                </span>
              </div>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </button>

            {/* Privacy Lockdown Button (Feature 16) */}
            <button
              onClick={toggleLockdown}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer border ${
                isLockdownActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-glow-rose'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 shadow-glow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold">START DEMO</span>
            </button>

            {/* Privacy Copilot Button (Feature 15) */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-indigo-500/40 transition-all cursor-pointer"
              title="Ask Privacy Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Copilot</span>
            </button>

            {/* Reset State */}
            <button
              onClick={resetDemoState}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Reset Demo to Original State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 py-2 overflow-x-auto no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded bg-rose-950/80 text-rose-300 border border-rose-500/30 font-semibold">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
