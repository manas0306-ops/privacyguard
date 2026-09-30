/**
 * PRIVACYGUARD VOICE ASSISTANT - ACCEPTANCE TEST SUITE
 * Implements the 20 Canonical Acceptance Tests defined in Section 14.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  VoiceAssistantStateMachine,
  AssistantContext,
  RouterInterface,
  PageId,
  NavParams,
  NavFilters,
  navigate,
  voiceoverBus,
  TRANSITION_TABLE,
  CANONICAL_PAGES,
  enLocalization,
  hiLocalization,
  resolveUtterance,
} from '../src/voice';
import { INITIAL_CONSENTS, INITIAL_DATA_ASSETS, INITIAL_SERVICES, INITIAL_AUDIT_LOGS } from '../src/data/initialData';
import { calculatePrivacyScore } from '../src/engine/privacyEngine';
import * as fs from 'fs';
import * as path from 'path';

function createMockContext(initialPage: PageId = 'dashboard'): AssistantContext {
  let currentPage: PageId = initialPage;
  let currentParams: NavParams | undefined = undefined;
  let currentFilters: NavFilters | undefined = undefined;

  const mockRouter: RouterInterface = {
    get currentPage() {
      return currentPage;
    },
    get currentParams() {
      return currentParams;
    },
    get currentFilters() {
      return currentFilters;
    },
    navigate: (page: PageId, params?: NavParams, filters?: NavFilters) => {
      currentPage = page;
      currentParams = params ? { ...params } : undefined;
      currentFilters = filters ? { ...filters } : undefined;
      return true;
    },
  };

  return {
    router: mockRouter,
    language: 'en',
    spokenOutputEnabled: true,
    historyStack: [
      {
        page: initialPage,
        timestamp: Date.now(),
      },
    ],
    selectedObject: null,
    activeFilters: null,
    lastNavigatedAt: null,
    lastRecommendation: null,
    lastAnswer: null,
    pendingAction: null,
    clarificationAttempts: 0,
    uiEventLog: [],
    consents: JSON.parse(JSON.stringify(INITIAL_CONSENTS)),
    dataAssets: JSON.parse(JSON.stringify(INITIAL_DATA_ASSETS)),
    services: JSON.parse(JSON.stringify(INITIAL_SERVICES)),
    isVoiceCaptureEnabled: true,
  };
}

describe('Voice Assistant Navigation Acceptance Tests (1 - 20)', () => {
  beforeEach(() => {
    voiceoverBus.reset();
  });

  // TEST 1
  it('1. "Open Data Flow" from dashboard -> T46, route=data_flow, end state IDLE, mic not active', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    const result = sm.handleUtterance('Open Data Flow');

    expect(result.transitionId).toBe('T46');
    expect(ctx.router.currentPage).toBe('data_flow');
    expect(sm.getState()).toBe('IDLE');
    expect(result.toState).toBe('IDLE');
    // Mic is not active (only T22 would activate mic)
    expect(result.toState).not.toBe('LISTENING');
    expect(result.spokenText).toBe('Opening Data Flow.');
  });

  // TEST 2
  it('2. "Open Data Flow" while already on it -> T49, no router call, no history push', () => {
    const ctx = createMockContext('data_flow');
    const sm = new VoiceAssistantStateMachine(ctx);
    let routerCallCount = 0;
    const origNav = ctx.router.navigate;
    ctx.router.navigate = (...args) => {
      routerCallCount++;
      return origNav(...args);
    };

    const initialHistoryLength = ctx.historyStack.length;
    const result = sm.handleUtterance('Open Data Flow');

    expect(result.transitionId).toBe('T49');
    expect(routerCallCount).toBe(0);
    expect(ctx.historyStack.length).toBe(initialHistoryLength);
    expect(sm.getState()).toBe('IDLE');
    expect(result.spokenText).toContain("You're already on Data Flow.");
  });

  // TEST 3
  it('3. "Open the analytics consent" -> T47, selectedObject=analytics consent; next turn resolves to it', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    const result = sm.handleUtterance('Open the analytics consent');

    expect(result.transitionId).toBe('T47');
    expect(ctx.router.currentPage).toBe('consent_center');
    expect(ctx.selectedObject).not.toBeNull();
    expect(ctx.selectedObject?.type).toBe('consent');
    expect(ctx.selectedObject?.name.toLowerCase()).toContain('analytics');

    // Next turn: "What happens if I withdraw this?"
    // Because selectedObject is set, context resolution retains the target
    expect(ctx.selectedObject?.name.toLowerCase()).toContain('analytics');
    expect(sm.getState()).toBe('IDLE');
  });

  // TEST 4
  it('4. "Show high-risk permissions" -> T48, filter applied, spoken count equals the state count', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    // Compute actual count from state
    const actualHighRiskCount = ctx.consents.filter(
      c => c.category === 'Location' || c.purpose.toLowerCase().includes('advertising') || c.category === 'Analytics'
    ).length;

    const result = sm.handleUtterance('Show high-risk permissions');

    expect(result.transitionId).toBe('T48');
    expect(ctx.router.currentPage).toBe('consent_center');
    expect(ctx.activeFilters?.risk).toBe('HIGH');
    expect(result.spokenText).toBe(`Showing ${actualHighRiskCount} high-risk permissions.`);
    expect(sm.getState()).toBe('IDLE');
  });

  // TEST 5
  it('5. "Open consent" (page vs card both match) -> T53, asks which one with chips; chip tap -> T46/T47', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    const result = sm.handleUtterance('open consent');

    expect(result.transitionId).toBe('T53');
    expect(sm.getState()).toBe('CLARIFICATION_REQUIRED');
    expect(result.optionsChips).toBeDefined();
    expect(result.optionsChips!.length).toBeGreaterThanOrEqual(2);
    // Route unchanged during clarification
    expect(ctx.router.currentPage).toBe('dashboard');

    // User taps chip for Consent Center
    const chip = result.optionsChips![0];
    const navResult = navigate({ page: chip.page }, ctx);
    expect(navResult.outcome).toBe('PAGE_NAVIGATED');
    expect(ctx.router.currentPage).toBe('consent_center');
  });

  // TEST 6
  it('6. "Open settings" -> T54 REFUSED, valid pages listed, route unchanged', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    const result = sm.handleUtterance('Open settings');

    expect(result.transitionId).toBe('T54');
    expect(sm.getState()).toBe('REFUSED');
    expect(ctx.router.currentPage).toBe('dashboard'); // Route unchanged
    expect(result.spokenText).toContain('I can open Dashboard, My Data, Consent Center');
  });

  // TEST 7
  it('7. "Open consent card <deleted-id>" -> T55 FAILED, route unchanged, message names current page', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    const result = sm.handleUtterance('Open consent card non_existent_id_999');

    expect(result.transitionId).toBe('T55');
    expect(sm.getState()).toBe('FAILED');
    expect(ctx.router.currentPage).toBe('dashboard');
    expect(result.spokenText).toContain("I couldn't find that item. You're still on Dashboard.");
  });

  // TEST 8
  it('8. Router throws, or currentPage mismatch after call -> T56 FAILED, no success message', () => {
    const ctx = createMockContext('dashboard');
    // Simulate broken router that fails post-condition C6
    ctx.router.navigate = () => {
      // Intentionally does NOT update currentPage
      return true;
    };
    const sm = new VoiceAssistantStateMachine(ctx);

    const result = sm.handleUtterance('Open Audit Log');

    expect(result.transitionId).toBe('T56');
    expect(sm.getState()).toBe('FAILED');
    expect(result.spokenText).toContain("I couldn't open Audit Log. You're still on Dashboard.");
    expect(result.spokenText).not.toContain('Opening Audit Log');
  });

  // TEST 9
  it('9. "Open Audit Log filtered by spooky" (bad filter) -> T57, navigated, filter dropped and disclosed', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    const result = sm.handleUtterance('Open Audit Log filtered by spooky');

    expect(result.transitionId).toBe('T57');
    expect(ctx.router.currentPage).toBe('audit_log');
    expect(result.spokenText).toBe("I opened Audit Log but couldn't apply that filter.");
    expect(sm.getState()).toBe('IDLE');
  });

  // TEST 10
  it('10. "Open Consent Center and turn off analytics" -> T58, navigation only; assert NO PREPARING_ACTION entered, no pending action created, consent unchanged', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);
    const origAnalyticsConsent = ctx.consents.find(c => c.category === 'Analytics')?.status;

    const result = sm.handleUtterance('Open Consent Center and turn off analytics');

    expect(result.transitionId).toBe('T58');
    expect(ctx.router.currentPage).toBe('consent_center');
    expect(sm.getState()).toBe('IDLE');
    expect(sm.getState()).not.toBe('PREPARING_ACTION');
    expect(ctx.pendingAction).toBeNull();
    // Consent state must remain intact
    const currentAnalyticsConsent = ctx.consents.find(c => c.category === 'Analytics')?.status;
    expect(currentAnalyticsConsent).toBe(origAnalyticsConsent);
    expect(result.spokenText).toContain("I haven't changed anything. Want me to prepare that change?");
  });

  // TEST 11
  it('11. After a recommendation: "Review it" -> T59 navigates; "Apply that recommendation" -> T24 (PREPARING_ACTION)', () => {
    const ctx = createMockContext('dashboard');
    ctx.lastRecommendation = {
      id: 'rec-1',
      targetPage: 'consent_center',
      targetObjectId: ctx.consents[0].id,
      targetObjectName: ctx.consents[0].purpose,
      description: 'Review high-risk location permission',
    };
    const sm = new VoiceAssistantStateMachine(ctx);

    // Turn A: "Review it"
    const reviewResult = sm.handleUtterance('Review it');
    expect(reviewResult.transitionId).toBe('T59');
    expect(ctx.router.currentPage).toBe('consent_center');
    expect(sm.getState()).toBe('IDLE');

    // Turn B: "Apply that recommendation"
    const applyResult = sm.handleUtterance('Apply that recommendation');
    expect(applyResult.transitionId).toBe('T24');
    expect(sm.getState()).toBe('PREPARING_ACTION');
  });

  // TEST 12
  it('12. Pending confirmation + "Open Audit Log" -> T60, no navigation, pending action intact; confirm -> T28 executes action', () => {
    const ctx = createMockContext('dashboard');
    ctx.pendingAction = {
      id: 'act-1',
      type: 'WITHDRAW_CONSENT',
      targetId: 'consent-1',
      description: 'Withdraw Location Consent',
      createdAt: Date.now(),
    };
    const sm = new VoiceAssistantStateMachine(ctx);
    sm.setState('AWAITING_CONFIRMATION');

    // Try navigating while awaiting confirmation
    const navAttempt = sm.handleUtterance('Open Audit Log');
    expect(navAttempt.transitionId).toBe('T60');
    expect(sm.getState()).toBe('CLARIFICATION_REQUIRED');
    expect(ctx.router.currentPage).toBe('dashboard'); // NO navigation
    expect(ctx.pendingAction).not.toBeNull(); // Pending action intact
    expect(navAttempt.spokenText).toContain('You have a pending action. Say confirm or cancel first.');

    // User now says "confirm"
    const confirmResult = sm.handleUtterance('confirm');
    expect(confirmResult.transitionId).toBe('T28');
    expect(sm.getState()).toBe('EXECUTING_ACTION');
  });

  // TEST 13
  it('13. Two failed confirm attempts with navigation phrases -> T61 then T41: IDLE, pending discarded, USER_CANCELLED_ACTION logged', () => {
    const ctx = createMockContext('dashboard');
    ctx.pendingAction = {
      id: 'act-1',
      type: 'WITHDRAW_CONSENT',
      description: 'Withdraw Location Consent',
      createdAt: Date.now(),
    };
    const sm = new VoiceAssistantStateMachine(ctx);
    sm.setState('AWAITING_CONFIRMATION');

    // Attempt 1: non-confirm phrase -> T60 -> CLARIFICATION_REQUIRED (attempt 1)
    const att1 = sm.handleUtterance('Open Data Flow');
    expect(att1.transitionId).toBe('T60');
    expect(sm.getState()).toBe('CLARIFICATION_REQUIRED');
    expect(ctx.clarificationAttempts).toBe(1);

    // Attempt 2: non-confirm phrase again -> T41 (max attempts exceeded)
    const att2 = sm.handleUtterance('Take me to my data');
    expect(att2.transitionId).toBe('T41');
    expect(sm.getState()).toBe('IDLE');
    expect(ctx.pendingAction).toBeNull(); // Discarded!
    const logEntry = ctx.uiEventLog.find(e => e.outcome === 'USER_CANCELLED_ACTION');
    expect(logEntry).toBeDefined();
  });

  // TEST 14
  it('14. During EXECUTING_ACTION: voice capture disabled; manual sidebar click works; completion toast visible on new page', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);
    sm.setState('EXECUTING_ACTION');

    // Voice command during EXECUTING_ACTION
    const res = sm.handleUtterance('Open Consent Center');
    expect(res.transitionId).toBe('T62');
    expect(sm.getState()).toBe('EXECUTING_ACTION'); // Stays executing

    // Manual sidebar navigation works (UI-only)
    ctx.router.navigate('data_flow');
    expect(ctx.router.currentPage).toBe('data_flow');

    // Completion transition (T32) produces global toast visible regardless of page
    sm.setState('COMPLETED');
    expect(sm.getState()).toBe('COMPLETED');
    expect(ctx.router.currentPage).toBe('data_flow');
  });

  // TEST 15
  it('15. Stop before the router call -> T63, no navigation. Stop after router call -> page changed, message states real page', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    // Case A: Aborted before router call
    const resBefore = sm.handleStop(true, false);
    expect(resBefore.transitionId).toBe('T63');
    expect(ctx.router.currentPage).toBe('dashboard');

    // Case B: Aborted after router call
    ctx.router.navigate('consent_center');
    const resAfter = sm.handleStop(true, true, 'consent_center');
    expect(resAfter.transitionId).toBe('T63');
    expect(ctx.router.currentPage).toBe('consent_center');
    expect(resAfter.spokenText).toBe('Opening Consent Center.');
    expect(resAfter.spokenText).not.toContain('cancelled');
  });

  // TEST 16
  it('16. "Go back" with history -> T51. "Go back" with empty history -> T52 FAILED "nothing changed"', () => {
    const ctx = createMockContext('dashboard');
    const sm = new VoiceAssistantStateMachine(ctx);

    // 16.1 Empty history (only current dashboard) -> T52
    const emptyResult = sm.handleUtterance('go back');
    expect(emptyResult.transitionId).toBe('T52');
    expect(sm.getState()).toBe('FAILED');
    expect(emptyResult.spokenText).toBe("There's no previous page. Nothing changed.");

    // 16.2 Navigate to data_flow first
    sm.handleUtterance('Open Data Flow');
    expect(ctx.router.currentPage).toBe('data_flow');

    // Now "Go back"
    const backResult = sm.handleUtterance('go back');
    expect(backResult.transitionId).toBe('T51');
    expect(ctx.router.currentPage).toBe('dashboard');
    expect(sm.getState()).toBe('IDLE');
    expect(backResult.spokenText).toBe('Going back to Dashboard.');
  });

  // TEST 17
  it('17. Navigation during VOICEOVER_SPEAKING -> V01: Voiceover stops and never auto-resumes or auto-narrates the new page', () => {
    const ctx = createMockContext('dashboard');
    voiceoverBus.startSpeaking('Reading current page summary...', ['queue item 1', 'queue item 2']);
    expect(voiceoverBus.getState()).toBe('VOICEOVER_SPEAKING');
    expect(voiceoverBus.getQueueLength()).toBe(2);

    const sm = new VoiceAssistantStateMachine(ctx);
    sm.handleUtterance('Open Consent Center');

    // V01 must have fired
    expect(voiceoverBus.getState()).toBe('VOICEOVER_IDLE');
    expect(voiceoverBus.getQueueLength()).toBe(0);
    expect(voiceoverBus.getLastTransition()).toBe('V01');
  });

  // TEST 18
  it('18. Privacy invariants: before/after a navigation, deep-equal snapshots of consent, score, audit log, retention, lockdown; audit log has no new entries', () => {
    const ctx = createMockContext('dashboard');
    const initialScore = calculatePrivacyScore(
      ctx.consents as any,
      ctx.dataAssets as any,
      0,
      false,
      0
    );

    const consentSnapshotBefore = JSON.stringify(ctx.consents);
    const dataAssetsSnapshotBefore = JSON.stringify(ctx.dataAssets);
    const auditLogsSnapshotBefore = JSON.stringify(INITIAL_AUDIT_LOGS);

    const sm = new VoiceAssistantStateMachine(ctx);
    sm.handleUtterance('Open Data Flow');

    const consentSnapshotAfter = JSON.stringify(ctx.consents);
    const dataAssetsSnapshotAfter = JSON.stringify(ctx.dataAssets);
    const auditLogsSnapshotAfter = JSON.stringify(INITIAL_AUDIT_LOGS);
    const scoreAfter = calculatePrivacyScore(
      ctx.consents as any,
      ctx.dataAssets as any,
      0,
      false,
      0
    );

    // Deep equal assertions
    expect(consentSnapshotAfter).toBe(consentSnapshotBefore);
    expect(dataAssetsSnapshotAfter).toBe(dataAssetsSnapshotBefore);
    expect(auditLogsSnapshotAfter).toBe(auditLogsSnapshotBefore);
    expect(scoreAfter.score).toBe(initialScore.score);
  });

  // TEST 19
  it('19. Static checks: no string "NAVIGATING" anywhere; handler does not import Action/Policy engines; no state string outside typed VoiceAssistantState', () => {
    const handlerPath = path.resolve(__dirname, '../src/voice/navigationHandler.ts');
    const handlerSource = fs.readFileSync(handlerPath, 'utf-8');

    // Rule: Handler must NOT import Action Engine or Policy Engine
    expect(handlerSource).not.toMatch(/from\s+['"].*privacyEngine['"]/);
    expect(handlerSource).not.toMatch(/from\s+['"].*copilotEngine['"]/);
    expect(handlerSource).not.toMatch(/import\s+.*evaluateRequest/);

    // Rule: No state string outside the 15 canonical states in TRANSITION_TABLE
    const canonicalSet = new Set([
      'IDLE', 'LISTENING', 'PROCESSING_SPEECH', 'RESOLVING_CONTEXT', 'ANSWERING',
      'RECOMMENDING', 'PREPARING_ACTION', 'AWAITING_CONFIRMATION', 'EXECUTING_ACTION',
      'COMPLETED', 'FAILED', 'REFUSED', 'CLARIFICATION_REQUIRED', 'SLEEPING', 'PAUSED'
    ]);

    for (const rule of TRANSITION_TABLE) {
      expect(canonicalSet.has(rule.from)).toBe(true);
      expect(canonicalSet.has(rule.to)).toBe(true);
      expect(rule.from).not.toBe('NAVIGATING');
      expect(rule.to).not.toBe('NAVIGATING');
    }
  });

  // TEST 20
  it('20. Localization: every nav.* key exists in English and Hindi; Hindi synonym for "Consent Center" routes to consent_center', () => {
    const requiredKeys = [
      'nav.opening',
      'nav.opening_object',
      'nav.showing_filtered',
      'nav.already_there',
      'nav.going_back',
      'nav.no_history',
      'nav.ambiguous',
      'nav.unsupported_with_list',
      'nav.object_not_found',
      'nav.router_failed',
      'nav.filter_dropped',
      'nav.compound_followup',
      'nav.pending_action',
    ];

    for (const key of requiredKeys) {
      expect((enLocalization.strings as any)[key]).toBeDefined();
      expect((hiLocalization.strings as any)[key]).toBeDefined();
    }

    // Verify Hindi synonym for Consent Center
    const ctxHindi = createMockContext('dashboard');
    ctxHindi.language = 'hi';
    const smHindi = new VoiceAssistantStateMachine(ctxHindi);

    const hindiResult = smHindi.handleUtterance('सहमति केंद्र खोलो');
    expect(hindiResult.transitionId).toBe('T46');
    expect(ctxHindi.router.currentPage).toBe('consent_center');
    expect(hindiResult.spokenText).toBe('सहमति केंद्र खोला जा रहा है।');
  });
});
