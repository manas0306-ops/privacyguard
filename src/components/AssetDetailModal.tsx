import React from 'react';
import {
  X,
  Database,
  Clock,
  Shield,
  Trash2,
  XCircle,
  FileCode,
  Info
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

export const AssetDetailModal: React.FC = () => {
  const {
    inspectingAsset,
    setInspectingAsset,
    withdrawConsent,
    deleteDataAsset,
    consents
  } = usePrivacy();

  if (!inspectingAsset) return null;

  const matchedConsent = consents.find(
    c => c.category.toLowerCase() === inspectingAsset.category.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-slate-900/95 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {inspectingAsset.category}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">
                  {inspectingAsset.recordsCount.toLocaleString()} RECORDS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Asset Identifier: {inspectingAsset.id} • Service: {inspectingAsset.service}
              </p>
            </div>
          </div>
          <button
            onClick={() => setInspectingAsset(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Attributes */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-mono text-[10px] uppercase block">Authorized Purpose</span>
            <span className="font-semibold text-slate-200">{inspectingAsset.purpose}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-mono text-[10px] uppercase block">Retention Cutoff</span>
            <span className="font-semibold text-amber-400 font-mono">
              {inspectingAsset.retentionDays} days ({inspectingAsset.daysRemaining}d remaining)
            </span>
          </div>
        </div>

        {/* Fictional Sample Payload Inspector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Simulated Data Payload
            </span>
            <span className="text-[10px] text-slate-500">Synthetic Sandbox Values</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs space-y-1.5 overflow-x-auto">
            {Object.entries(inspectingAsset.sampleData).map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <span className="text-cyan-400">{k}:</span>
                <span className="text-slate-300">"{v}"</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Synthetic demonstration record. No real personal telemetry, GPS coordinates, or credentials are used.
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {matchedConsent && matchedConsent.status === 'ACTIVE' && (
              <button
                onClick={() => {
                  withdrawConsent(matchedConsent.id);
                  setInspectingAsset(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/50 hover:bg-amber-900 text-amber-200 border border-amber-600/40 cursor-pointer transition-colors"
              >
                <XCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Withdraw Consent</span>
              </button>
            )}

            <button
              onClick={() => {
                deleteDataAsset(inspectingAsset.id);
                setInspectingAsset(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-600/40 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Purge Records</span>
            </button>
          </div>

          <button
            onClick={() => setInspectingAsset(null)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
