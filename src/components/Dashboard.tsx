import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Database,
  Globe,
  Ban,
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  Clock,
  Radio
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

export const Dashboard: React.FC = () => {
  const {
    scoreBreakdown,
    consents,
    dataAssets,
    services,
    auditLogs,
    deletionRequests,
    isLockdownActive,
    setActiveTab,
    setIsScoreModalOpen,
    setIsErasureModalOpen,
    deleteDataAsset,
    setInspectingAsset,
    currentTheme
  } = usePrivacy();

  const isCosmic = currentTheme === 'cosmic';
  const isBurgundy = currentTheme === 'burgundy';
  const isDarkRed = isCosmic || isBurgundy;
  const activeConsentsCount = consents.filter(c => c.status === 'ACTIVE').length;
  const totalConsentsCount = consents.length;
  const categoriesCount = dataAssets.length;
  const thirdPartiesCount = new Set(consents.filter(c => c.status === 'ACTIVE').map(c => c.service)).size;
  const blockedRequestsCount = auditLogs.filter(a => a.decision === 'BLOCK').length;
  const pendingDeletionsCount = deletionRequests.filter(d => d.status !== 'COMPLETED').length;

  // Retention Alert check (Feature 10)
  const expiringAsset = dataAssets.find(a => a.daysRemaining <= 5 && a.consentStatus === 'ACTIVE');

  // Recent 4 Audit Logs for the feed
  const recentAudits = auditLogs.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className={`relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border shadow-xl ${
        isDarkRed ? 'border-[#fff8e7]/15' : 'border-slate-700/60'
      }`}>
        <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          isDarkRed
            ? 'bg-gradient-to-br from-red-600/35 via-rose-600/20 to-transparent'
            : 'bg-cyan-500/10'
        }`} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              isDarkRed
                ? 'bg-red-950/90 border border-red-500/50 text-[#fff8e7] shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                : 'bg-cyan-950/70 border border-cyan-500/30 text-cyan-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isDarkRed ? 'bg-red-400' : 'bg-cyan-400'} animate-pulse`} />
              CYBERSECURITY &amp; PRIVACY FIREWALL ACTIVE
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDarkRed ? 'text-[#fff8e7]' : 'text-white'
            }`}>
              Personal Data Firewall Dashboard
            </h1>
            <p className={`text-sm max-w-2xl leading-relaxed ${
              isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'
            }`}>
              PrivacyGuard operates as a transparent gatekeeper between your digital identity and external third parties.
              Inspect collected records, enforce strict purpose limitation, minimize data exposure, and simulate live interception.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer shadow-lg ${
                isDarkRed
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-[#fff8e7] border border-red-400/40 shadow-[0_0_20px_rgba(220,38,38,0.35)]'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-glow-sm'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Launch Simulator</span>
            </button>
            <button
              onClick={() => setIsErasureModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border ${
                isDarkRed
                  ? 'bg-red-950/70 hover:bg-rose-950/60 text-[#fff8e7] border-red-500/30 hover:border-rose-500/40'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700'
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Request Erasure</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature 10: Retention Alert Banner */}
      {expiringAsset && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border shadow-sm ${
          isDarkRed
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-glow-amber'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-glow-amber'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-900/60 text-amber-300 border border-amber-600/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-100">RETENTION ALERT</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/80 border border-amber-500/40 text-amber-300">
                  {expiringAsset.daysRemaining} DAYS REMAINING
                </span>
              </div>
              <p className="text-xs text-amber-300/90 mt-0.5">
                "{expiringAsset.category}" data held by {expiringAsset.service} is approaching its {expiringAsset.retentionDays}-day retention cutoff ({expiringAsset.recordsCount} records).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                setInspectingAsset(expiringAsset);
                setActiveTab('inventory');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-900/40 hover:bg-amber-900/70 border border-amber-600/40 text-amber-200 transition-colors cursor-pointer"
            >
              Review
            </button>
            <button
              onClick={() => deleteDataAsset(expiringAsset.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm"
            >
              Delete Records
            </button>
          </div>
        </div>
      )}

      {/* Primary 6 Metrics Grid (Feature 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Privacy Score */}
        <div
          onClick={() => setIsScoreModalOpen(true)}
          className={`col-span-2 sm:col-span-1 glass-panel p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
            isDarkRed
              ? 'border-slate-700/60 hover:border-red-500/50'
              : 'border-slate-700/60 hover:border-cyan-500/40'
          }`}
        >
          <div className={`flex items-center justify-between text-xs mb-2 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
            <span className="font-mono uppercase tracking-wider text-[11px]">Privacy Score</span>
            <ShieldCheck className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              isDarkRed ? 'text-[#fff8e7]' : 'text-cyan-400'
            }`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold font-mono ${
              scoreBreakdown.score >= 85 ? 'text-emerald-400' :
              scoreBreakdown.score >= 70 ? (isDarkRed ? 'text-[#fff8e7]' : 'text-amber-400') : 'text-rose-400'
            }`}>
              {scoreBreakdown.score}
            </span>
            <span className={`text-xs font-mono ${isDarkRed ? 'text-[#bdae93]' : 'text-slate-500'}`}>/100</span>
          </div>
          <p className={`text-[11px] mt-1 flex items-center gap-1 ${
            isDarkRed
              ? 'text-slate-400 group-hover:text-[#fff8e7]'
              : 'text-slate-400 group-hover:text-cyan-300'
          }`}>
            <span>Why this score?</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 2: Active Consents */}
        <div
          onClick={() => setActiveTab('consent')}
          className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer group ${
            isDarkRed
              ? 'border-slate-700/60 hover:border-red-500/50'
              : 'border-slate-700/60 hover:border-blue-500/40'
          }`}
        >
          <div className={`flex items-center justify-between text-xs mb-2 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
            <span className="font-mono uppercase tracking-wider text-[11px]">Active Consents</span>
            <Sliders className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              isDarkRed ? 'text-red-400' : 'text-blue-400'
            }`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold font-mono ${isDarkRed ? 'text-[#fff8e7]' : 'text-white'}`}>
              {activeConsentsCount}
            </span>
            <span className={`text-xs font-mono ${isDarkRed ? 'text-[#bdae93]' : 'text-slate-500'}`}>/{totalConsentsCount}</span>
          </div>
          <p className={`text-[11px] mt-1 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>Granular purposes</p>
        </div>

        {/* Metric 3: Data Categories */}
        <div
          onClick={() => setActiveTab('inventory')}
          className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer group ${
            isDarkRed
              ? 'border-slate-700/60 hover:border-red-500/50'
              : 'border-slate-700/60 hover:border-indigo-500/40'
          }`}
        >
          <div className={`flex items-center justify-between text-xs mb-2 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
            <span className="font-mono uppercase tracking-wider text-[11px]">Data Categories</span>
            <Database className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              isDarkRed ? 'text-[#fff8e7]' : 'text-indigo-400'
            }`} />
          </div>
          <div className={`text-3xl font-extrabold font-mono ${isDarkRed ? 'text-[#fff8e7]' : 'text-white'}`}>
            {categoriesCount}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>In personal inventory</p>
        </div>

        {/* Metric 4: Third Parties */}
        <div
          onClick={() => setActiveTab('flow')}
          className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer group ${
            isDarkRed
              ? 'border-slate-700/60 hover:border-red-500/50'
              : 'border-slate-700/60 hover:border-purple-500/40'
          }`}
        >
          <div className={`flex items-center justify-between text-xs mb-2 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
            <span className="font-mono uppercase tracking-wider text-[11px]">Third Parties</span>
            <Globe className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              isDarkRed ? 'text-red-400' : 'text-purple-400'
            }`} />
          </div>
          <div className={`text-3xl font-extrabold font-mono ${isDarkRed ? 'text-[#fff8e7]' : 'text-white'}`}>
            {thirdPartiesCount}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>Connected endpoints</p>
        </div>

        {/* Metric 5: Blocked Requests */}
        <div
          onClick={() => setActiveTab('audit')}
          className="glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer group"
        >
          <div className={`flex items-center justify-between text-xs mb-2 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
            <span className="font-mono uppercase tracking-wider text-[11px]">Blocked Requests</span>
            <Ban className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">
            {blockedRequestsCount}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>Surveillance intercepted</p>
        </div>

        {/* Metric 6: Deletion Requests */}
        <div
          onClick={() => setIsErasureModalOpen(true)}
          className="glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className={`flex items-center justify-between text-xs mb-2 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
            <span className="font-mono uppercase tracking-wider text-[11px]">Deletion Requests</span>
            <Trash2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className={`text-3xl font-extrabold font-mono ${isDarkRed ? 'text-[#fff8e7]' : 'text-white'}`}>
            {pendingDeletionsCount}
          </div>
          <p className={`text-[11px] mt-1 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>GDPR erasure tickets</p>
        </div>
      </div>

      {/* Main Grid: Live Firewall Feed + Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Interception Feed */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className={`text-base font-bold tracking-tight ${isDarkRed ? 'text-[#fff8e7]' : 'text-white'}`}>
                Live Data Firewall Activity
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className={`text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                isDarkRed ? 'text-[#fff8e7] hover:text-red-300' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <span>View Full Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentAudits.map((event) => (
              <div
                key={event.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 text-[10px] font-mono font-bold uppercase rounded-md shrink-0 ${
                    event.decision === 'ALLOW' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' :
                    event.decision === 'ALLOW_MINIMUM' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' :
                    event.decision === 'BLOCK' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' :
                    isDarkRed ? 'bg-red-950/80 text-[#fff8e7] border border-red-500/30' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {event.decision === 'ALLOW_MINIMUM' ? 'MINIMIZED' : event.decision}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isDarkRed ? 'text-[#fff8e7]' : 'text-slate-100'}`}>{event.actor}</span>
                      <span className={`text-xs ${isDarkRed ? 'text-[#bdae93]' : 'text-slate-500'}`}>•</span>
                      <span className={`text-xs font-mono ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>Purpose: {event.purpose}</span>
                    </div>
                    <p className={`text-xs mt-0.5 line-clamp-1 ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
                      {event.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className={`text-[11px] font-mono flex items-center gap-1 ${isDarkRed ? 'text-[#bdae93]' : 'text-slate-500'}`}>
                    <Clock className="w-3 h-3" />
                    {event.timeFormatted}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={`pt-2 flex items-center justify-between text-xs border-t ${
            isDarkRed ? 'text-[#eadfc5] border-slate-800/60' : 'text-slate-400 border-slate-800/60'
          }`}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className={`w-4 h-4 ${isDarkRed ? 'text-[#fff8e7]' : 'text-cyan-400'}`} />
              Continuous GDPR Article 5 &amp; 6 enforcement active
            </span>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`font-semibold cursor-pointer transition-colors ${
                isDarkRed ? 'text-[#fff8e7] hover:text-red-300' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              Test Scenarios →
            </button>
          </div>
        </div>

        {/* Right 1 Col: Before / After Comparison (Feature 26) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className={`w-4 h-4 ${isDarkRed ? 'text-red-400' : 'text-cyan-400'}`} />
              <h2 className={`text-base font-bold ${isDarkRed ? 'text-[#fff8e7]' : 'text-white'}`}>
                Privacy Posture Impact
              </h2>
            </div>
            <p className={`text-xs ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
              Measuring the tangible protection provided by the PrivacyGuard data firewall.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Standard Exposure (Before) */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isDarkRed ? 'bg-slate-900/80 border-[#fff8e7]/15' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className={`text-[10px] font-mono uppercase tracking-wider ${isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}`}>
                Unprotected Web
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Permissions:</span>
                  <span className={`font-mono font-bold ${isDarkRed ? 'text-[#fff8e7]' : 'text-slate-200'}`}>8 active</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Unnecessary:</span>
                  <span className="text-rose-400 font-mono font-bold">3 leaky</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Third Parties:</span>
                  <span className={`font-mono ${isDarkRed ? 'text-[#fff8e7]' : 'text-slate-200'}`}>5 trackers</span>
                </div>
                <div className={`flex justify-between pt-1 border-t ${isDarkRed ? 'border-[#fff8e7]/15' : 'border-slate-800'}`}>
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Score:</span>
                  <span className="text-rose-400 font-mono font-bold">72/100</span>
                </div>
              </div>
            </div>

            {/* PrivacyGuard Protected (After) */}
            <div className={`p-3.5 rounded-xl border space-y-2 shadow-sm ${
              isDarkRed
                ? 'bg-red-950/40 border-red-500/40 shadow-glow-sm'
                : 'bg-cyan-950/30 border-cyan-500/40 shadow-glow-sm'
            }`}>
              <div className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                isDarkRed ? 'text-[#fff8e7]' : 'text-cyan-400'
              }`}>
                With PrivacyGuard
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Permissions:</span>
                  <span className={`font-mono font-bold ${isDarkRed ? 'text-[#fff8e7]' : 'text-slate-200'}`}>{activeConsentsCount} audited</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Unnecessary:</span>
                  <span className="text-emerald-400 font-mono font-bold">0 minimized</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Third Parties:</span>
                  <span className={`font-mono ${isDarkRed ? 'text-[#fff8e7]' : 'text-slate-200'}`}>{thirdPartiesCount} isolated</span>
                </div>
                <div className={`flex justify-between pt-1 border-t ${isDarkRed ? 'border-red-900/50' : 'border-cyan-900/50'}`}>
                  <span className={isDarkRed ? 'text-[#eadfc5]' : 'text-slate-400'}>Score:</span>
                  <span className="text-emerald-400 font-mono font-bold">{scoreBreakdown.score}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Lockdown Callout */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Lockdown status:</span>
            <span className={`font-mono font-bold uppercase text-[11px] ${
              isLockdownActive ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isLockdownActive ? 'Locked Down' : 'Normal Shield'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
