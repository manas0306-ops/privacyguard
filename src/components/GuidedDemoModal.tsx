import React from 'react';
import {
  Play,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Layers,
  RotateCcw
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

export const GuidedDemoModal: React.FC = () => {
  const {
    isTourActive,
    tourStep,
    nextTourStep,
    prevTourStep,
    endTour,
    setActiveTab,
    processDataRequest,
    withdrawConsent,
    consents,
    toggleLockdown,
    isLockdownActive,
    submitErasureRequest,
    resetDemoState
  } = usePrivacy();

  if (!isTourActive) return null;

  const totalSteps = 12;

  // Execute associated automated actions when stepping through the tour
  const handleStepAction = (step: number) => {
    switch (step) {
      case 1:
        setActiveTab('dashboard');
        break;
      case 2:
        setActiveTab('flow');
        break;
      case 3:
        setActiveTab('simulator');
        break;
      case 4:
      case 5:
      case 6:
        setActiveTab('simulator');
        break;
      case 7: {
        setActiveTab('consent');
        const locConsent = consents.find(c => c.category === 'Location');
        if (locConsent) withdrawConsent(locConsent.id);
        break;
      }
      case 8: {
        setActiveTab('simulator');
        processDataRequest({
          id: `req-tour-${Date.now()}`,
          service: 'Advertising Service',
          requestedData: ['Location'],
          purpose: 'Advertising'
        });
        break;
      }
      case 9:
        setActiveTab('audit');
        break;
      case 10: {
        submitErasureRequest(['Location', 'Analytics']);
        setActiveTab('dashboard');
        break;
      }
      case 11: {
        if (!isLockdownActive) toggleLockdown();
        setActiveTab('dashboard');
        break;
      }
      case 12:
        setActiveTab('dashboard');
        break;
      default:
        break;
    }
  };

  const stepDetails: Record<number, { title: string; subtitle: string; body: string; buttonText: string }> = {
    1: {
      title: 'Step 1: Baseline Dashboard Inspection',
      subtitle: 'Observe Initial Posture',
      body: 'PrivacyGuard computes your live Privacy Score (82/100) based on active permissions, high-risk tracking endpoints, and data retention alerts.',
      buttonText: 'Next: Inspect Data Flow'
    },
    2: {
      title: 'Step 2: Data Flow Topology',
      subtitle: 'Zero-Trust Gateway Architecture',
      body: 'All outgoing telemetry from mobile apps and browser clients is forced to route through PrivacyGuard before reaching any external cloud service.',
      buttonText: 'Next: Simulate Inbound Threat'
    },
    3: {
      title: 'Step 3: Live Surveillance Request',
      subtitle: 'Simulating Inbound Ad Tracker',
      body: 'An external Advertising Service attempts to extract personal Location and movement velocity records.',
      buttonText: 'Next: PrivacyGuard Evaluates Request'
    },
    4: {
      title: 'Step 4: Real-time Multi-Gate Evaluation',
      subtitle: 'Consent • Purpose • Minimization',
      body: 'The engine evaluates: (1) Does consent exist? (2) Does the purpose match user authorization? (3) Does the requested payload exceed minimum necessity?',
      buttonText: 'Next: Enforce Verdict'
    },
    5: {
      title: 'Step 5: Threat Intercepted & Blocked',
      subtitle: 'Access Denied in Real-Time',
      body: 'REQUEST BLOCKED! The firewall halts packet egress and generates a cryptographic audit record.',
      buttonText: 'Next: Inspect Human Rationale'
    },
    6: {
      title: 'Step 6: Transparent Explanation ("Why?")',
      subtitle: 'No Mysterious Black Box',
      body: '"Your consent allows Location strictly for Navigation, not Advertising." The user is given clear, legal and technical accountability.',
      buttonText: 'Next: Revoke Location Consent'
    },
    7: {
      title: 'Step 7: User Revokes Consent',
      subtitle: 'Instant Policy Propagation',
      body: 'The user revokes Location authorization in the Consent Center. This dynamically changes the live firewall rules in memory.',
      buttonText: 'Next: Re-test Request'
    },
    8: {
      title: 'Step 8: Re-testing Against Revoked Consent',
      subtitle: 'Immediate Enforcement Verified',
      body: 'The advertising service attempts the same request again. Because consent is now revoked, it is blocked again with: "Consent for Location is WITHDRAWN."',
      buttonText: 'Next: Inspect Audit Trail'
    },
    9: {
      title: 'Step 9: Immutable Audit Trail',
      subtitle: 'Verifiable Event Log',
      body: 'Both interception events, along with the user revocation action, are permanently logged with timestamps, actors, and decision rationales.',
      buttonText: 'Next: Trigger GDPR Erasure'
    },
    10: {
      title: 'Step 10: Right to be Forgotten (Erasure)',
      subtitle: 'Cryptographic Deletion Workflow',
      body: 'User requests permanent deletion of Location and Analytics records. Status advances from REQUESTED → PROCESSING → COMPLETED with deletion verification.',
      buttonText: 'Next: Activate Privacy Lockdown'
    },
    11: {
      title: 'Step 11: Emergency Privacy Lockdown',
      subtitle: 'One-Click Defensive Posture',
      body: 'Activate Privacy Lockdown with a single click. All optional background telemetry, advertising segments, and third-party trackers are immediately frozen.',
      buttonText: 'Next: View Final Impact'
    },
    12: {
      title: 'Step 12: PRIVACY UNDER CONTROL',
      subtitle: 'Hackathon Demo Complete',
      body: 'Threats Intercepted: 2 • Unnecessary Attributes Minimized: 1 • Consents Reviewed: 3 • Deletion Requests: 1. Privacy is not a checkbox; it is a continuous control system.',
      buttonText: 'Finish Walkthrough'
    }
  };

  const current = stepDetails[tourStep] || stepDetails[1];

  const handleNext = () => {
    if (tourStep < totalSteps) {
      const next = tourStep + 1;
      nextTourStep();
      handleStepAction(next);
    } else {
      endTour();
    }
  };

  const handlePrev = () => {
    if (tourStep > 1) {
      const prev = tourStep - 1;
      prevTourStep();
      handleStepAction(prev);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full glass-panel p-5 rounded-2xl border-2 border-cyan-400/80 bg-slate-900/95 shadow-glow-sm animate-in slide-in-from-bottom duration-300">
      <div className="space-y-3">
        {/* Step Indicator and Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
              HACKATHON DEMO WALKTHROUGH ({tourStep}/{totalSteps})
            </span>
          </div>
          <button
            onClick={endTour}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div>
          <h4 className="font-bold text-base text-white">{current.title}</h4>
          <span className="text-xs font-mono text-cyan-400 font-semibold block mb-1">
            {current.subtitle}
          </span>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            {current.body}
          </p>
        </div>

        {/* Step 12 Summary Card */}
        {tourStep === 12 && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono space-y-1 text-cyan-200">
            <div className="flex justify-between">
              <span>Blocked Requests:</span>
              <span className="text-rose-400 font-bold">2 Threats Halted</span>
            </div>
            <div className="flex justify-between">
              <span>Unnecessary Attributes:</span>
              <span className="text-amber-400 font-bold">1 Overcollection Flagged</span>
            </div>
            <div className="flex justify-between">
              <span>Consents Reviewed:</span>
              <span className="text-white font-bold">3 Purposes Tuned</span>
            </div>
            <div className="flex justify-between">
              <span>Deletion Requests:</span>
              <span className="text-emerald-400 font-bold">1 Verified Certificate</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={tourStep === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-sm cursor-pointer transition-all"
          >
            <span>{current.buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
