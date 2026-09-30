import React, { useState } from 'react';
import {
  Database,
  MapPin,
  Smartphone,
  BarChart3,
  ShoppingBag,
  Sliders,
  Heart,
  Eye,
  Trash2,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { DataAsset, SensitivityLevel } from '../types/privacy';

export const DataInventory: React.FC = () => {
  const {
    dataAssets,
    withdrawConsent,
    deleteDataAsset,
    consents,
    setInspectingAsset,
    setIsErasureModalOpen
  } = usePrivacy();

  const [filterSensitivity, setFilterSensitivity] = useState<string>('ALL');

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'location': return MapPin;
      case 'device information': return Smartphone;
      case 'analytics': return BarChart3;
      case 'purchase history': return ShoppingBag;
      case 'preferences': return Sliders;
      case 'health metrics': return Heart;
      default: return Database;
    }
  };

  const getSensitivityBadge = (level: SensitivityLevel) => {
    switch (level) {
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">HIGH SENSITIVITY</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">LOW</span>;
    }
  };

  const filteredAssets = dataAssets.filter(asset => {
    if (filterSensitivity === 'ALL') return true;
    return asset.sensitivity === filterSensitivity;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Personal Data Inventory (My Data)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete inventory of all personal attributes collected across connected applications. No real personal data is ever collected or exposed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sensitivity Filters */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs font-mono">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterSensitivity(lvl)}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  filterSensitivity === lvl
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsErasureModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-rose-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Erase Data</span>
          </button>
        </div>
      </div>

      {/* Grid of Data Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => {
          const Icon = getCategoryIcon(asset.category);
          const isExpiringSoon = asset.daysRemaining <= 5 && asset.consentStatus === 'ACTIVE';

          // Match consent id to allow withdrawing
          const matchedConsent = consents.find(
            c => c.category.toLowerCase() === asset.category.toLowerCase()
          );

          return (
            <div
              key={asset.id}
              className={`glass-panel rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                isExpiringSoon
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-400 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{asset.category}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {asset.recordsCount.toLocaleString()} records stored
                      </p>
                    </div>
                  </div>
                  {getSensitivityBadge(asset.sensitivity)}
                </div>

                {/* Metadata Items */}
                <div className="space-y-2 text-xs divide-y divide-slate-800/80 pt-1">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Purpose:</span>
                    <span className="text-slate-200 font-medium text-right max-w-[60%] truncate">
                      {asset.purpose}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Used by:</span>
                    <span className="text-cyan-400 font-medium font-mono text-right">
                      {asset.service}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Retention:</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className={isExpiringSoon ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {asset.retentionDays} days
                      </span>
                      {isExpiringSoon && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/90 px-1 rounded border border-amber-600/40">
                          {asset.daysRemaining}d left
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Consent Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      asset.consentStatus === 'ACTIVE'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    }`}>
                      {asset.consentStatus}
                    </span>
                  </div>
                </div>

                {/* Collected Data Chips */}
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block mb-1.5">
                    Data Attributes Collected:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.collectedAttributes.map((attr, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Details, Withdraw Consent, Delete */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setInspectingAsset(asset)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Details</span>
                </button>

                {matchedConsent && matchedConsent.status === 'ACTIVE' && (
                  <button
                    onClick={() => withdrawConsent(matchedConsent.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-600/40 transition-colors cursor-pointer"
                    title="Revoke consent for this purpose"
                  >
                    <XCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Withdraw</span>
                  </button>
                )}

                <button
                  onClick={() => deleteDataAsset(asset.id)}
                  className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-600/40 transition-colors cursor-pointer"
                  title="Purge this data asset completely"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
