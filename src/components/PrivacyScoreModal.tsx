import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  X,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

export const PrivacyScoreModal: React.FC = () => {
  const {
    isScoreModalOpen,
    setIsScoreModalOpen,
    scoreBreakdown,
    isLockdownActive,
    setActiveTab
  } = usePrivacy();

  if (!isScoreModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-slate-900/95 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Transparent Privacy Score Breakdown
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Algorithmic Audit • Zero Synthetic Randomness
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScoreModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Score Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Current Calculated Posture
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-extrabold font-mono ${
                scoreBreakdown.score >= 85 ? 'text-emerald-400' :
                scoreBreakdown.score >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {scoreBreakdown.score}
              </span>
              <span className="text-slate-500 font-mono text-sm">/ 100 Base Points</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 block">Baseline Formula</span>
            <span className="text-xs text-slate-300 font-mono">
              100 - Σ(Telemetry Risk Deductions)
            </span>
            {isLockdownActive && (
              <span className="text-[11px] font-mono text-emerald-400 block mt-1">
                +12 Lockdown Resilience Bonus
              </span>
            )}
          </div>
        </div>

        {/* Calculation Line Items (Feature 11) */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider block">
            Why is my score {scoreBreakdown.score}?
          </span>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {scoreBreakdown.deductions.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero deductions! Your privacy posture is in an optimal hardened state.</span>
              </div>
            ) : (
              scoreBreakdown.deductions.map((d, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      <span>{d.label}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {d.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-rose-400 bg-rose-950/80 border border-rose-500/30 shrink-0">
                    -{d.points} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendations */}
        {scoreBreakdown.recommendations.length > 0 && (
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 space-y-1.5">
            <span className="font-bold text-blue-300 uppercase font-mono text-[10px] tracking-wider block">
              Automated Hardening Recommendations:
            </span>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              {scoreBreakdown.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              setIsScoreModalOpen(false);
              setActiveTab('consent');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Review Consents in Consent Center →
          </button>
          <button
            onClick={() => setIsScoreModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
