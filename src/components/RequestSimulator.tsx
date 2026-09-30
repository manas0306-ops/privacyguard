import React, { useState } from 'react';
import {
  Radio,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Filter,
  Layers,
  ChevronRight,
  Database,
  Info,
  Check,
  X
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { DataRequest, EngineEvaluation } from '../types/privacy';

interface PredefinedScenario {
  id: string;
  name: string;
  badge: string;
  service: string;
  requestedData: string[];
  purpose: string;
  expectedResult: 'BLOCK' | 'ALLOW_MINIMUM' | 'ALLOW';
  description: string;
}

const PREDEFINED_SCENARIOS: PredefinedScenario[] = [
  {
    id: 'sc-1',
    name: 'Scenario 1: Analytics Surveillance',
    badge: 'Purpose Violation',
    service: 'Analytics Service',
    requestedData: ['Location', 'GPS Coordinates'],
    purpose: 'Analytics',
    expectedResult: 'BLOCK',
    description: 'Analytics SDK attempting to harvest precise GPS data under the guise of telemetry.'
  },
  {
    id: 'sc-2',
    name: 'Scenario 2: Ad Tracker Profiling',
    badge: 'High Risk Interception',
    service: 'Advertising Service',
    requestedData: ['Location', 'Movement Velocity'],
    purpose: 'Advertising',
    expectedResult: 'BLOCK',
    description: 'Ad Network requesting continuous location for behavioral retargeting.'
  },
  {
    id: 'sc-3',
    name: 'Scenario 3: Weather Data Over-collection',
    badge: 'Minimization Flag',
    service: 'Weather Service',
    requestedData: ['City', 'Country', 'Exact GPS', 'Contacts', 'Device ID'],
    purpose: 'Weather',
    expectedResult: 'ALLOW_MINIMUM',
    description: 'Weather app asking for Contacts, Device ID, and Exact GPS when City is sufficient.'
  },
  {
    id: 'sc-4',
    name: 'Scenario 4: Legitimate Navigation Route',
    badge: 'Compliant Request',
    service: 'Maps Service',
    requestedData: ['Approximate Location', 'GPS Coordinates'],
    purpose: 'Navigation',
    expectedResult: 'ALLOW',
    description: 'Navigation app requesting GPS strictly for turn-by-turn route calculations.'
  }
];

export const RequestSimulator: React.FC = () => {
  const { processDataRequest, consents, isLockdownActive, setActiveTab } = usePrivacy();

  // Current Simulation State
  const [activeScenarioId, setActiveScenarioId] = useState<string>('sc-2');
  const [currentRequest, setCurrentRequest] = useState<DataRequest>({
    id: 'req-sim-02',
    service: 'Advertising Service',
    requestedData: ['Location', 'Movement Velocity'],
    purpose: 'Advertising'
  });

  // Pipeline Animation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStage, setSimulationStage] = useState<number>(0);
  // Stages: 0: Idle, 1: Intercepted, 2: Consent Check, 3: Purpose Check, 4: Minimization, 5: Risk Decision, 6: Completed Result
  const [lastEvaluation, setLastEvaluation] = useState<EngineEvaluation | null>(null);

  // Custom Request Builder Mode
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customService, setCustomService] = useState<string>('Advertising Service');
  const [customPurpose, setCustomPurpose] = useState<string>('Advertising');
  const [customData, setCustomData] = useState<string[]>(['Location']);

  const allAvailableDataOptions = [
    'Location',
    'GPS Coordinates',
    'Exact GPS',
    'City',
    'Country',
    'Contacts',
    'Device ID',
    'Session Duration',
    'Crash Logs',
    'Step Count',
    'Heart Rate'
  ];

  const handleSelectScenario = (sc: PredefinedScenario) => {
    setActiveScenarioId(sc.id);
    setCurrentRequest({
      id: `req-${Date.now()}`,
      service: sc.service,
      requestedData: [...sc.requestedData],
      purpose: sc.purpose
    });
    setLastEvaluation(null);
    setSimulationStage(0);
  };

  const handleRunSimulation = () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setSimulationStage(1);
    setLastEvaluation(null);

    // Stage 1: Intercepted (300ms)
    setTimeout(() => {
      setSimulationStage(2); // Consent Check

      // Stage 2: Consent Check (600ms)
      setTimeout(() => {
        setSimulationStage(3); // Purpose Check

        // Stage 3: Purpose Check (900ms)
        setTimeout(() => {
          setSimulationStage(4); // Minimization Check

          // Stage 4: Minimization (1200ms)
          setTimeout(() => {
            setSimulationStage(5); // Risk Decision

            // Stage 5: Verdict (1500ms)
            setTimeout(() => {
              const evalResult = processDataRequest(currentRequest);
              setLastEvaluation(evalResult);
              setSimulationStage(6);
              setIsSimulating(false);
            }, 350);
          }, 350);
        }, 350);
      }, 350);
    }, 350);
  };

  const toggleCustomDataSelection = (item: string) => {
    setCustomData(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const applyCustomRequest = () => {
    if (customData.length === 0) return;
    setCurrentRequest({
      id: `req-custom-${Date.now()}`,
      service: customService,
      requestedData: customData,
      purpose: customPurpose
    });
    setLastEvaluation(null);
    setSimulationStage(0);
    setIsCustomMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Live Privacy Request Simulator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Simulate live application requests intercepting the PrivacyGuard firewall. Witness real-time purpose verification, data minimization enforcement, and instant policy blocking.
          </p>
        </div>

        <button
          onClick={() => setIsCustomMode(!isCustomMode)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-center shrink-0"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>{isCustomMode ? 'Use Preset Scenarios' : 'Custom Request Builder'}</span>
        </button>
      </div>

      {/* Custom Request Builder Drawer/Panel */}
      {isCustomMode && (
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Build Custom Simulated Third-Party Request
            </span>
            <span className="text-xs text-slate-400">Test any arbitrary service &amp; purpose combinations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Service Name:</label>
              <select
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Advertising Service">Advertising Service (AdNetwork Edge)</option>
                <option value="Analytics Service">Analytics Service (Telemetry Engine)</option>
                <option value="Weather Service">Weather Service (Weather Radar Stream)</option>
                <option value="Maps Service">Maps Service (Navigation API)</option>
                <option value="Unknown Tracker Inc.">Unknown Tracker Inc. (Third Party)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Requested Purpose:</label>
              <select
                value={customPurpose}
                onChange={(e) => setCustomPurpose(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Advertising">Advertising / Retargeting</option>
                <option value="Analytics">Analytics / Telemetry</option>
                <option value="Weather">Weather / Forecast</option>
                <option value="Navigation">Navigation / Routing</option>
                <option value="Marketing">Commercial Marketing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Data Attributes to Request:
            </label>
            <div className="flex flex-wrap gap-2">
              {allAvailableDataOptions.map((item) => {
                const isSelected = customData.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleCustomDataSelection(item)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-400 font-semibold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsCustomMode(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={applyCustomRequest}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm cursor-pointer"
            >
              Load Custom Scenario
            </button>
          </div>
        </div>
      )}

      {/* Scenario Selector Tabs */}
      {!isCustomMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PREDEFINED_SCENARIOS.map((sc) => {
            const isSelected = activeScenarioId === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500/60 bg-cyan-950/20 shadow-glow-sm'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      sc.expectedResult === 'BLOCK' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' :
                      sc.expectedResult === 'ALLOW_MINIMUM' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {sc.badge}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <h4 className="font-bold text-sm text-white">{sc.name.split(':')[1] || sc.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{sc.service}</span>
                  <span className="text-cyan-400 font-semibold">{sc.purpose}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* The Central WOW Component: Active Request & 6-Stage Pipeline Animation */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/80 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Background glow depending on outcome */}
        {lastEvaluation && (
          <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            lastEvaluation.decision === 'BLOCK' ? 'bg-rose-500/15' :
            lastEvaluation.decision === 'ALLOW_MINIMUM' ? 'bg-amber-500/15' : 'bg-emerald-500/15'
          }`} />
        )}

        {/* Incoming Request Inspection Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Inbound Third-Party Telemetry Request
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-base text-white">{currentRequest.service}</span>
              <span className="text-xs text-slate-500">wants</span>
              <span className="font-mono text-cyan-300 font-semibold">[{currentRequest.requestedData.join(', ')}]</span>
              <span className="text-xs text-slate-500">for purpose</span>
              <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-mono text-xs border border-blue-500/30 font-semibold">
                "{currentRequest.purpose}"
              </span>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shrink-0 ${
              isSimulating
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-glow-sm'
            }`}
          >
            {isSimulating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Firewall Rules...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>EVALUATE REQUEST</span>
              </>
            )}
          </button>
        </div>

        {/* 6-Stage Interception Pipeline Visualizer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="uppercase tracking-wider">PrivacyGuard Interception Pipeline</span>
            <span>Stage {Math.min(6, simulationStage)} / 6</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {/* Step 1: Intercept */}
            <div className={`p-3 rounded-xl border text-center transition-all ${
              simulationStage >= 1
                ? 'bg-slate-900 border-cyan-500/60 text-cyan-300 shadow-glow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Step 1</div>
              <div className="font-bold text-xs">Intercept</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Payload captured</div>
            </div>

            {/* Step 2: Consent Check */}
            <div className={`p-3 rounded-xl border text-center transition-all ${
              simulationStage >= 2
                ? 'bg-slate-900 border-blue-500/60 text-blue-300 shadow-glow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Step 2</div>
              <div className="font-bold text-xs">Consent Check</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Verify user grant</div>
            </div>

            {/* Step 3: Purpose Check */}
            <div className={`p-3 rounded-xl border text-center transition-all ${
              simulationStage >= 3
                ? 'bg-slate-900 border-indigo-500/60 text-indigo-300 shadow-glow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Step 3</div>
              <div className="font-bold text-xs">Purpose Check</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Purpose match?</div>
            </div>

            {/* Step 4: Minimization */}
            <div className={`p-3 rounded-xl border text-center transition-all ${
              simulationStage >= 4
                ? 'bg-slate-900 border-amber-500/60 text-amber-300 shadow-glow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Step 4</div>
              <div className="font-bold text-xs">Minimization</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Excessive data?</div>
            </div>

            {/* Step 5: Risk Decision */}
            <div className={`p-3 rounded-xl border text-center transition-all ${
              simulationStage >= 5
                ? 'bg-slate-900 border-purple-500/60 text-purple-300 shadow-glow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Step 5</div>
              <div className="font-bold text-xs">Risk Matrix</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Policy scoring</div>
            </div>

            {/* Step 6: Firewall Verdict */}
            <div className={`p-3 rounded-xl border text-center transition-all ${
              simulationStage >= 6
                ? lastEvaluation?.decision === 'BLOCK'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-glow-rose'
                  : lastEvaluation?.decision === 'ALLOW_MINIMUM'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-glow-amber'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-glow-emerald'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Step 6</div>
              <div className="font-bold text-xs">
                {simulationStage >= 6 ? lastEvaluation?.decision : 'Verdict'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {simulationStage >= 6 ? 'Action Enforced' : 'Pending...'}
              </div>
            </div>
          </div>
        </div>

        {/* Stage 6: The Verdict & WOW Explanation (Feature 4, 5, 8, 12) */}
        {simulationStage === 6 && lastEvaluation && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Big Verdict Banner */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              lastEvaluation.decision === 'BLOCK'
                ? 'bg-rose-950/40 border-rose-500/50 shadow-glow-rose'
                : lastEvaluation.decision === 'ALLOW_MINIMUM'
                ? 'bg-amber-950/40 border-amber-500/50 shadow-glow-amber'
                : 'bg-emerald-950/40 border-emerald-500/50 shadow-glow-emerald'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border shrink-0 ${
                  lastEvaluation.decision === 'BLOCK' ? 'bg-rose-900/80 text-rose-200 border-rose-600' :
                  lastEvaluation.decision === 'ALLOW_MINIMUM' ? 'bg-amber-900/80 text-amber-200 border-amber-600' :
                  'bg-emerald-900/80 text-emerald-200 border-emerald-600'
                }`}>
                  {lastEvaluation.decision === 'BLOCK' ? <XCircle className="w-8 h-8" /> :
                   lastEvaluation.decision === 'ALLOW_MINIMUM' ? <AlertTriangle className="w-8 h-8" /> :
                   <CheckCircle2 className="w-8 h-8" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-2xl tracking-tight text-white">
                      {lastEvaluation.decision === 'BLOCK' ? 'REQUEST BLOCKED' :
                       lastEvaluation.decision === 'ALLOW_MINIMUM' ? 'DATA MINIMIZATION WARNING' :
                       'REQUEST APPROVED'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                      lastEvaluation.risk === 'CRITICAL' ? 'bg-rose-900 text-rose-200' :
                      lastEvaluation.risk === 'HIGH' ? 'bg-rose-900 text-rose-300' :
                      lastEvaluation.risk === 'MEDIUM' ? 'bg-amber-900 text-amber-300' :
                      'bg-emerald-900 text-emerald-300'
                    }`}>
                      {lastEvaluation.risk} RISK
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    {lastEvaluation.reason}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Minimization or Block Review */}
              {lastEvaluation.decision === 'ALLOW_MINIMUM' && (
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => {
                      alert(`Allowed safe minimized subset: [${lastEvaluation.allowedData.join(', ')}]. Blocked unnecessary attributes: [${lastEvaluation.unnecessaryData.join(', ')}].`);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-sm"
                  >
                    Allow Minimum Data
                  </button>
                  <button
                    onClick={() => {
                      alert('Request manually blocked.');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-200 transition-colors cursor-pointer"
                  >
                    Block Request
                  </button>
                </div>
              )}
            </div>

            {/* Feature 12 & WOW Explanation: "WHY IS THIS HAPPENING?" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detailed Technical Reasoning */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Why was this decision made?
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {lastEvaluation.detailedReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 shrink-0 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Breakdown Table: Necessary vs Unnecessary */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Attribute Necessity Breakdown (Privacy-by-Design)
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold block mb-1">
                      ✓ Necessary for this purpose:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {lastEvaluation.allowedData.length > 0 ? (
                        lastEvaluation.allowedData.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 font-mono italic">None authorized</span>
                      )}
                    </div>
                  </div>

                  {lastEvaluation.unnecessaryData.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-mono text-rose-400 font-semibold block mb-1">
                        ✗ Flagged as unnecessary / over-collection:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {lastEvaluation.unnecessaryData.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 font-mono text-[11px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Navigation to Audit Log */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                This event has been permanently recorded in your immutable Audit Log.
              </span>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Inspect Audit Entry →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
