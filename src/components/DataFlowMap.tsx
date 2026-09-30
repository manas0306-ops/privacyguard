import React, { useState } from 'react';
import {
  Share2,
  User,
  Smartphone,
  Shield,
  MapPin,
  BarChart3,
  CloudRain,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Lock
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { ServiceProfile } from '../types/privacy';

export const DataFlowMap: React.FC = () => {
  const { services, consents, isLockdownActive, dataAssets } = usePrivacy();

  // Selected Service for detailed node inspection
  const [selectedService, setSelectedService] = useState<ServiceProfile>(services[0]);

  // Find consent and data attributes for the selected service
  const serviceConsent = consents.find(
    c => c.service.toLowerCase().includes(selectedService.name.toLowerCase()) ||
         selectedService.name.toLowerCase().includes(c.service.toLowerCase())
  );

  const serviceAsset = dataAssets.find(
    a => a.service.toLowerCase().includes(selectedService.name.toLowerCase()) ||
         selectedService.name.toLowerCase().includes(a.service.toLowerCase())
  );

  const getServiceStatus = (serviceName: string) => {
    if (isLockdownActive && !serviceName.toLowerCase().includes('maps')) {
      return { label: 'RESTRICTED (LOCKDOWN)', color: 'rose', allowed: false };
    }
    const matched = consents.find(c => c.service.toLowerCase().includes(serviceName.toLowerCase()));
    if (!matched || matched.status === 'WITHDRAWN') {
      return { label: 'ACCESS REVOKED', color: 'rose', allowed: false };
    }
    if (matched.status === 'DISABLED') {
      return { label: 'DISABLED', color: 'slate', allowed: false };
    }
    if (serviceName.toLowerCase().includes('weather')) {
      return { label: 'DATA MINIMIZED', color: 'amber', allowed: true };
    }
    return { label: 'AUTHORIZED FLOW', color: 'emerald', allowed: true };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Interactive Data Flow Architecture
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Live topological map of personal data propagation. All data flows traverse the central PrivacyGuard firewall before reaching external cloud endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Allowed
          </span>
          <span className="flex items-center gap-1 text-amber-400 ml-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Minimized
          </span>
          <span className="flex items-center gap-1 text-rose-400 ml-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Blocked
          </span>
        </div>
      </div>

      {/* Main Grid: Visual SVG Diagram + Node Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Animated Flow Canvas */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

          {/* Flow Diagram Structure */}
          <div className="relative z-10 space-y-12 my-auto">
            {/* Stage 1: User & Local Device */}
            <div className="flex items-center justify-center gap-6">
              {/* User Node */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-center shadow-lg w-36">
                <div className="w-10 h-10 mx-auto rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-white">USER IDENTITY</div>
                <div className="text-[10px] text-slate-400 font-mono">California, US</div>
              </div>

              {/* Arrow */}
              <div className="flex-1 max-w-[80px] h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
                <div className="absolute -top-1 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 rotate-45" />
              </div>

              {/* Mobile App Node */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-center shadow-lg w-40">
                <div className="w-10 h-10 mx-auto rounded-full bg-cyan-600/30 text-cyan-400 flex items-center justify-center mb-2 border border-cyan-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-white">MOBILE APP CLIENT</div>
                <div className="text-[10px] text-slate-400 font-mono">Sensors &amp; APIs</div>
              </div>
            </div>

            {/* Vertical Flow to PrivacyGuard Firewall */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 relative">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute -left-[3px] top-1/2" />
              </div>

              {/* THE FIREWALL NODE */}
              <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-2 border-cyan-400 shadow-glow-sm text-center max-w-md w-full relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[10px] uppercase font-mono tracking-widest shadow-md">
                  Active Gateway &amp; Firewall
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
                  <span className="font-extrabold text-base tracking-wider text-white">
                    PRIVACYGUARD ENGINE
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/90 font-mono mt-1">
                  Consent Verification • Purpose Enforcement • Minimization
                </p>
              </div>

              <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-slate-700" />
            </div>

            {/* Stage 3: Connected Third-Party Services */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {services.map((srv) => {
                const status = getServiceStatus(srv.name);
                const isSelected = selectedService.id === srv.id;

                return (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 shadow-glow-sm scale-105'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-2 h-2 rounded-full ${
                        status.color === 'emerald' ? 'bg-emerald-400' :
                        status.color === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <span className="text-[9px] font-mono text-slate-500">
                        {srv.trustScore}% trust
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white truncate">{srv.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                      {srv.domain}
                    </div>

                    <div className={`mt-2 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded text-center ${
                      status.color === 'emerald' ? 'bg-emerald-950/80 text-emerald-300' :
                      status.color === 'amber' ? 'bg-amber-950/80 text-amber-300' :
                      'bg-rose-950/80 text-rose-300'
                    }`}>
                      {status.allowed ? 'CONNECTED' : 'BLOCKED'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 pt-4 text-center text-xs text-slate-400 font-mono border-t border-slate-800">
            Click on any service endpoint above to inspect its real-time telemetry payload and consent status.
          </div>
        </div>

        {/* Right 1 Col: Node Inspector Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Endpoint Inspector
                </span>
                <h3 className="font-extrabold text-lg text-white mt-0.5">
                  {selectedService.name}
                </h3>
                <span className="text-xs font-mono text-cyan-400">
                  {selectedService.domain}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                <Share2 className="w-5 h-5" />
              </div>
            </div>

            {/* Inspector Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">
                  Firewall Gateway Posture:
                </span>
                <div className="flex items-center gap-2">
                  {getServiceStatus(selectedService.name).allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="font-bold text-white">
                    {getServiceStatus(selectedService.name).label}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">
                  Authorized Purpose:
                </span>
                <span className="font-semibold text-slate-200">
                  {serviceConsent?.purpose || 'None Configured'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">
                  Data Received:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedService.dataAccessList.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">
                  Retention Policy:
                </span>
                <div className="flex items-center gap-1.5 font-mono text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{serviceConsent?.retentionDays || 30} days strict cutoff</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              All egress packets to {selectedService.name} are continuously filtered by PrivacyGuard's Zero-Trust egress proxy.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
