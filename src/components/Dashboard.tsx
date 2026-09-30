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
    setInspectingAsset
  } = usePrivacy();

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
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-slate-700/60 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              CYBERSECURITY &amp; PRIVACY FIREWALL ACTIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personal Data Firewall Dashboard
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              PrivacyGuard operates as a transparent gatekeeper between your digital identity and external third parties.
              Inspect collected records, enforce strict purpose limitation, minimize data exposure, and simulate live interception.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm shadow-glow-sm transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Launch Simulator</span>
            </button>
            <button
              onClick={() => setIsErasureModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-medium text-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Request Erasure</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature 10: Retention Alert Banner */}
      {expiringAsset && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 shadow-glow-amber">
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600/90 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm"
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
          className="col-span-2 sm:col-span-1 glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-cyan-500/40 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider text-[11px]">Privacy Score</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold font-mono ${
              scoreBreakdown.score >= 85 ? 'text-emerald-400' :
              scoreBreakdown.score >= 70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {scoreBreakdown.score}
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-cyan-300">
            <span>Why this score?</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 2: Active Consents */}
        <div
          onClick={() => setActiveTab('consent')}
          className="glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-blue-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider text-[11px]">Active Consents</span>
            <Sliders className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold font-mono text-white">
              {activeConsentsCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/{totalConsentsCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Granular purposes</p>
        </div>

        {/* Metric 3: Data Categories */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider text-[11px]">Data Categories</span>
            <Database className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {categoriesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">In personal inventory</p>
        </div>

        {/* Metric 4: Third Parties */}
        <div
          onClick={() => setActiveTab('flow')}
          className="glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider text-[11px]">Third Parties</span>
            <Globe className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {thirdPartiesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Connected endpoints</p>
        </div>

        {/* Metric 5: Blocked Requests */}
        <div
          onClick={() => setActiveTab('audit')}
          className="glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider text-[11px]">Blocked Requests</span>
            <Ban className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">
            {blockedRequestsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Surveillance intercepted</p>
        </div>

        {/* Metric 6: Deletion Requests */}
        <div
          onClick={() => setIsErasureModalOpen(true)}
          className="glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider text-[11px]">Deletion Requests</span>
            <Trash2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {pendingDeletionsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">GDPR erasure tickets</p>
        </div>
      </div>

      {/* Main Grid: Live Firewall Feed + Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Interception Feed */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Data Firewall Activity
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
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
                    'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {event.decision === 'ALLOW_MINIMUM' ? 'MINIMIZED' : event.decision}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">{event.actor}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-mono">Purpose: {event.purpose}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {event.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.timeFormatted}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Continuous GDPR Article 5 &amp; 6 enforcement active
            </span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Test Scenarios →
            </button>
          </div>
        </div>

        {/* Right 1 Col: Before / After Comparison (Feature 26) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                Privacy Posture Impact
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Measuring the tangible protection provided by the PrivacyGuard data firewall.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Standard Exposure (Before) */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Unprotected Web
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Permissions:</span>
                  <span className="text-slate-200 font-mono font-bold">8 active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unnecessary:</span>
                  <span className="text-rose-400 font-mono font-bold">3 leaky</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Third Parties:</span>
                  <span className="text-slate-200 font-mono">5 trackers</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Score:</span>
                  <span className="text-rose-400 font-mono font-bold">72/100</span>
                </div>
              </div>
            </div>

            {/* PrivacyGuard Protected (After) */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2 shadow-glow-sm">
              <div className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-bold">
                With PrivacyGuard
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Permissions:</span>
                  <span className="text-slate-200 font-mono font-bold">{activeConsentsCount} audited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unnecessary:</span>
                  <span className="text-emerald-400 font-mono font-bold">0 minimized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Third Parties:</span>
                  <span className="text-slate-200 font-mono">{thirdPartiesCount} isolated</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-cyan-900/50">
                  <span className="text-slate-400">Score:</span>
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
