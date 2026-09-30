import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  DataAsset,
  ConsentRecord,
  ServiceProfile,
  AuditEvent,
  DeletionRequest,
  ConsentStatus,
  DataRequest,
  EngineEvaluation,
  PrivacyScoreBreakdown
} from '../types/privacy';
import {
  INITIAL_DATA_ASSETS,
  INITIAL_CONSENTS,
  INITIAL_SERVICES,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { evaluateRequest, calculatePrivacyScore } from '../engine/privacyEngine';

interface PrivacyContextType {
  dataAssets: DataAsset[];
  consents: ConsentRecord[];
  services: ServiceProfile[];
  auditLogs: AuditEvent[];
  deletionRequests: DeletionRequest[];
  isLockdownActive: boolean;
  scoreBreakdown: PrivacyScoreBreakdown;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Actions
  toggleLockdown: () => void;
  updateConsentStatus: (id: string, status: ConsentStatus) => void;
  withdrawConsent: (id: string) => void;
  deleteDataAsset: (id: string) => void;
  submitErasureRequest: (categories: string[]) => void;
  processDataRequest: (request: DataRequest) => EngineEvaluation;
  resetDemoState: () => void;
  
  // Guided Demo Tour
  isTourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
  setTourStep: (step: number) => void;

  // Selected Inspect Item
  inspectingAsset: DataAsset | null;
  setInspectingAsset: (asset: DataAsset | null) => void;
  
  // Modals
  isErasureModalOpen: boolean;
  setIsErasureModalOpen: (open: boolean) => void;
  isScoreModalOpen: boolean;
  setIsScoreModalOpen: (open: boolean) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isLandingModalOpen: boolean;
  setIsLandingModalOpen: (open: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataAssets, setDataAssets] = useState<DataAsset[]>(INITIAL_DATA_ASSETS);
  const [consents, setConsents] = useState<ConsentRecord[]>(INITIAL_CONSENTS);
  const [services] = useState<ServiceProfile[]>(INITIAL_SERVICES);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [isLockdownActive, setIsLockdownActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Tour & Modal states
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);
  const [inspectingAsset, setInspectingAsset] = useState<DataAsset | null>(null);
  const [isErasureModalOpen, setIsErasureModalOpen] = useState<boolean>(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isLandingModalOpen, setIsLandingModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('privacyguard_has_entered');
    }
    return true;
  });

  // Derive blocked requests count
  const blockedCount = useMemo(() => {
    return auditLogs.filter(a => a.decision === 'BLOCK').length;
  }, [auditLogs]);

  // Derive pending deletion count
  const pendingDeletionCount = useMemo(() => {
    return deletionRequests.filter(d => d.status !== 'COMPLETED').length;
  }, [deletionRequests]);

  // Recalculate Privacy Score based on live state
  const scoreBreakdown = useMemo(() => {
    return calculatePrivacyScore(
      consents,
      dataAssets,
      blockedCount,
      isLockdownActive,
      pendingDeletionCount
    );
  }, [consents, dataAssets, blockedCount, isLockdownActive, pendingDeletionCount]);

  // Process incoming data request through the core privacy engine
  const processDataRequest = useCallback((request: DataRequest): EngineEvaluation => {
    const evaluation = evaluateRequest(request, {
      consents,
      isLockdownActive,
      blockedRequestsCount: blockedCount,
      dataAssets
    });

    // Format readable time
    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Create Audit Record
    const newAuditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      timeFormatted,
      actor: request.service,
      data: request.requestedData,
      purpose: request.purpose,
      decision: evaluation.decision,
      reason: evaluation.reason,
      risk: evaluation.risk,
      evaluation
    };

    setAuditLogs(prev => [newAuditEvent, ...prev]);

    return evaluation;
  }, [consents, isLockdownActive, blockedCount, dataAssets]);

  // Update consent status
  const updateConsentStatus = useCallback((id: string, status: ConsentStatus) => {
    const consent = consents.find(c => c.id === id);
    if (!consent) return;

    setConsents(prev =>
      prev.map(c => (c.id === id ? { ...c, status, updatedAt: 'Just now' } : c))
    );

    // Sync corresponding data assets
    setDataAssets(prev =>
      prev.map(a => (a.category.toLowerCase() === consent.category.toLowerCase() ? { ...a, consentStatus: status } : a))
    );

    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Add audit log
    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: now.toISOString(),
      timeFormatted,
      actor: 'User Policy Control',
      data: [consent.category],
      purpose: consent.purpose,
      decision: 'CONSENT_UPDATE',
      reason: `User updated consent status for "${consent.category}" (${consent.purpose}) to ${status}.`,
      risk: status === 'ACTIVE' ? 'LOW' : 'MEDIUM'
    };
    setAuditLogs(prev => [audit, ...prev]);
  }, [consents]);

  // Withdraw consent completely
  const withdrawConsent = useCallback((id: string) => {
    updateConsentStatus(id, 'WITHDRAWN');
  }, [updateConsentStatus]);

  // Delete specific data asset
  const deleteDataAsset = useCallback((id: string) => {
    const asset = dataAssets.find(a => a.id === id);
    if (!asset) return;

    setDataAssets(prev => prev.filter(a => a.id !== id));

    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: now.toISOString(),
      timeFormatted,
      actor: 'User Data Inventory',
      data: [asset.category],
      purpose: asset.purpose,
      decision: 'ERASURE',
      reason: `User manually deleted personal data asset: "${asset.category}" (${asset.recordsCount} records purged).`,
      risk: 'LOW'
    };
    setAuditLogs(prev => [audit, ...prev]);
  }, [dataAssets]);

  // Toggle Privacy Lockdown (The WOW Feature 3)
  const toggleLockdown = useCallback(() => {
    setIsLockdownActive(prev => {
      const nextState = !prev;
      const now = new Date();
      const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (nextState) {
        // Lockdown ON: disable optional consents
        setConsents(cList =>
          cList.map(c => (c.isOptional ? { ...c, status: 'DISABLED', updatedAt: 'Lockdown enforced' } : c))
        );

        setAuditLogs(logs => [
          {
            id: `aud-${Date.now()}`,
            timestamp: now.toISOString(),
            timeFormatted,
            actor: 'PrivacyGuard Firewall',
            data: ['All Optional Telemetry', 'Marketing Profiles', 'Analytics Identifiers'],
            purpose: 'Emergency Privacy Lockdown',
            decision: 'LOCKDOWN_ON',
            reason: 'PRIVACY LOCKDOWN ACTIVATED: All non-essential third-party data egress immediately halted.',
            risk: 'CRITICAL'
          },
          ...logs
        ]);
      } else {
        // Lockdown OFF
        setConsents(cList =>
          cList.map(c => ({ ...c, status: 'ACTIVE', updatedAt: 'Standard policy restored' }))
        );

        setAuditLogs(logs => [
          {
            id: `aud-${Date.now()}`,
            timestamp: now.toISOString(),
            timeFormatted,
            actor: 'PrivacyGuard Firewall',
            data: ['Standard Policy Scope'],
            purpose: 'Lockdown Release',
            decision: 'LOCKDOWN_OFF',
            reason: 'Privacy Lockdown deactivated: Restored configured granular user consent policies.',
            risk: 'LOW'
          },
          ...logs
        ]);
      }

      return nextState;
    });
  }, []);

  // Submit GDPR Erasure Request (Feature 9)
  const submitErasureRequest = useCallback((categories: string[]) => {
    const id = `del-${Date.now()}`;
    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Find affected target services
    const targets = Array.from(
      new Set(
        consents
          .filter(c => categories.some(cat => cat.toLowerCase() === c.category.toLowerCase()))
          .map(c => c.service)
      )
    );

    const affectedRecords = dataAssets
      .filter(a => categories.some(cat => cat.toLowerCase() === a.category.toLowerCase()))
      .reduce((sum, a) => sum + a.recordsCount, 0);

    const newRequest: DeletionRequest = {
      id,
      categories,
      requestedAt: now.toISOString(),
      status: 'REQUESTED',
      progress: 15,
      targetServices: targets.length > 0 ? targets : ['External Connected Services'],
      confirmedRecordsCount: affectedRecords || 1200
    };

    setDeletionRequests(prev => [newRequest, ...prev]);

    // Audit log
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        timeFormatted,
        actor: 'User GDPR Controller',
        data: categories,
        purpose: 'Right to be Forgotten (Erasure)',
        decision: 'ERASURE',
        reason: `User submitted verifiable data erasure request for [${categories.join(', ')}] across ${targets.length || 1} downstream services.`,
        risk: 'LOW'
      },
      ...prev
    ]);

    // Simulate progress: REQUESTED -> PROCESSING (1.2s) -> COMPLETED (2.8s)
    setTimeout(() => {
      setDeletionRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'PROCESSING', progress: 65 } : r))
      );
    }, 1200);

    setTimeout(() => {
      setDeletionRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'COMPLETED', progress: 100 } : r))
      );

      // Remove or zero out erased categories from dataAssets
      setDataAssets(prev =>
        prev.filter(a => !categories.some(cat => cat.toLowerCase() === a.category.toLowerCase()))
      );

      // Withdraw corresponding consents
      setConsents(prev =>
        prev.map(c =>
          categories.some(cat => cat.toLowerCase() === c.category.toLowerCase())
            ? { ...c, status: 'WITHDRAWN', updatedAt: 'Data erased' }
            : c
        )
      );

      // Audit log completion
      setAuditLogs(prev => [
        {
          id: `aud-${Date.now()}-done`,
          timestamp: new Date().toISOString(),
          timeFormatted: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
          actor: 'Downstream Services (Audit Confirmed)',
          data: categories,
          purpose: 'Data Deletion Complete',
          decision: 'ERASURE',
          reason: `Verification Certificate issued: ${affectedRecords || 1200} records permanently erased from connected databases.`,
          risk: 'LOW'
        },
        ...prev
      ]);
    }, 2800);
  }, [consents, dataAssets]);

  // Reset entire demo to fresh initial state
  const resetDemoState = useCallback(() => {
    setDataAssets(INITIAL_DATA_ASSETS);
    setConsents(INITIAL_CONSENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDeletionRequests([]);
    setIsLockdownActive(false);
    setActiveTab('dashboard');
    setIsTourActive(false);
    setTourStep(1);
  }, []);

  // Guided Tour Navigation
  const startTour = useCallback(() => {
    setIsTourActive(true);
    setTourStep(1);
    setActiveTab('dashboard');
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStep(prev => prev + 1);
  }, []);

  const prevTourStep = useCallback(() => {
    setTourStep(prev => Math.max(1, prev - 1));
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
  }, []);

  return (
    <PrivacyContext.Provider
      value={{
        dataAssets,
        consents,
        services,
        auditLogs,
        deletionRequests,
        isLockdownActive,
        scoreBreakdown,
        activeTab,
        setActiveTab,
        toggleLockdown,
        updateConsentStatus,
        withdrawConsent,
        deleteDataAsset,
        submitErasureRequest,
        processDataRequest,
        resetDemoState,
        isTourActive,
        tourStep,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        setTourStep,
        inspectingAsset,
        setInspectingAsset,
        isErasureModalOpen,
        setIsErasureModalOpen,
        isScoreModalOpen,
        setIsScoreModalOpen,
        isCopilotOpen,
        setIsCopilotOpen,
        isLandingModalOpen,
        setIsLandingModalOpen
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextType => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
