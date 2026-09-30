import React, { useState } from 'react';
import {
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

export const ErasureModal: React.FC = () => {
  const {
    isErasureModalOpen,
    setIsErasureModalOpen,
    submitErasureRequest,
    deletionRequests
  } = usePrivacy();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Location',
    'Analytics'
  ]);

  if (!isErasureModalOpen) return null;

  const availableCategories = [
    { id: 'Location', label: 'Location & GPS History', desc: '1,420 coordinate logs held by Maps Service' },
    { id: 'Analytics', label: 'Analytics & Telemetry Identifiers', desc: '8,940 telemetry events held by Analytics Engine' },
    { id: 'Purchase History', label: 'Purchase & Payment History', desc: '12 transaction orders held by Checkout Gateway' },
    { id: 'Device Information', label: 'Device & Hardware Fingerprints', desc: '45 hardware state records held by Auth Provider' },
    { id: 'Health Metrics', label: 'Health & Biometric Telemetry', desc: '720 step/heart rate logs held by HealthSync Pro' }
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const latestRequest = deletionRequests[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) return;
    submitErasureRequest(selectedCategories);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/30 bg-slate-900/95 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Request Personal Data Erasure (GDPR Art. 17)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Right to be Forgotten • Cryptographic Purge Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsErasureModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Disclaimer Label (Mandatory from prompt) */}
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">Demo workflow</strong> — Connected services would perform the physical cryptographic database deletion in production. PrivacyGuard generates verifiable deletion tickets and synchronizes your inventory state.
          </span>
        </div>

        {/* Active Simulation Status Display if a request is underway */}
        {latestRequest && latestRequest.status !== 'COMPLETED' ? (
          <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Erasure Ticket Dispatch in Progress
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                STATUS: {latestRequest.status}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${latestRequest.progress}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Broadcasting deletion signals for [{latestRequest.categories.join(', ')}] to downstream replica nodes...
            </p>
          </div>
        ) : latestRequest && latestRequest.status === 'COMPLETED' ? (
          <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm text-white">Erasure Verification Certificate Issued</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Successfully purged {latestRequest.confirmedRecordsCount.toLocaleString()} records across connected services. Consent records revoked and inventory synchronized.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsErasureModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider block">
                Select Data Categories to Permanently Purge:
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableCategories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-rose-950/20 border-rose-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-white">{cat.label}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{cat.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-rose-500 focus:ring-rose-400 h-4 w-4 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsErasureModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedCategories.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Submit Erasure Request ({selectedCategories.length})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
