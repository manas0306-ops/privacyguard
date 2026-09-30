import React from 'react';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Info
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { ConsentRecord, ConsentStatus } from '../types/privacy';

export const ConsentCenter: React.FC = () => {
  const {
    consents,
    updateConsentStatus,
    withdrawConsent,
    scoreBreakdown
  } = usePrivacy();

  const getStatusBadge = (status: ConsentStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
            DISABLED
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            REVOKED / WITHDRAWN
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Consent Management Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Granular purpose-based authorizations. Changing your consent immediately reconfigures the live privacy firewall rules, recalculates your privacy score, and blocks unauthorized requests.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-400">Live Posture</span>
            <span className="font-bold text-emerald-400 font-mono">
              Score: {scoreBreakdown.score}/100
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Notice on Real Enforcement */}
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-100">Live Privacy Engine Integration:</span> Unlike superficial consent banners, these settings govern the core <code className="bg-blue-900/40 px-1 py-0.5 rounded text-blue-200">evaluateRequest()</code> firewall. If a service requests data for a withdrawn or disabled purpose, access is immediately intercepted and blocked.
        </div>
      </div>

      {/* Consent Cards Table / Grid */}
      <div className="space-y-4">
        {consents.map((consent) => {
          const isActive = consent.status === 'ACTIVE';
          const isWithdrawn = consent.status === 'WITHDRAWN';

          return (
            <div
              key={consent.id}
              className={`glass-panel rounded-2xl p-5 sm:p-6 border transition-all duration-200 ${
                isActive
                  ? 'border-slate-800 hover:border-slate-700'
                  : isWithdrawn
                  ? 'border-rose-950/60 bg-rose-950/10'
                  : 'border-slate-800/60 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Purpose and Meta Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {consent.purpose}
                    </h3>
                    {getStatusBadge(consent.status)}
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {consent.isOptional ? 'Optional Permission' : 'Core Required'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Service: <span className="text-cyan-400 font-semibold">{consent.service}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300">
                    {consent.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                      Authorized Data:
                    </span>
                    {consent.dataRequired.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-900 font-mono text-cyan-300 border border-cyan-900/60"
                      >
                        {item}
                      </span>
                    ))}
                    <span className="text-xs text-slate-500 font-mono ml-2">
                      • Retention: {consent.retentionDays} days
                    </span>
                  </div>
                </div>

                {/* 3 Action Buttons: Enable, Disable, Withdraw */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Enable Button */}
                  <button
                    onClick={() => updateConsentStatus(consent.id, 'ACTIVE')}
                    disabled={isActive}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-emerald-950/70 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enable</span>
                  </button>

                  {/* Disable Button */}
                  <button
                    onClick={() => updateConsentStatus(consent.id, 'DISABLED')}
                    disabled={consent.status === 'DISABLED'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      consent.status === 'DISABLED'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <ShieldOff className="w-3.5 h-3.5" />
                    <span>Disable</span>
                  </button>

                  {/* Withdraw Button */}
                  <button
                    onClick={() => withdrawConsent(consent.id)}
                    disabled={isWithdrawn}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isWithdrawn
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
