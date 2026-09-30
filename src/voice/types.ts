/**
 * PRIVACYGUARD VOICE ASSISTANT
 * Canonical State Types, Contracts & Event Definitions
 * 
 * Precedence Rule 1: Canonical 15 states, T01-T63 authoritative.
 * Precedence Rule 2: UI-only navigation subroutine; never modifies data or privacy state.
 * Constraint C1: NO "NAVIGATING" state exists. Navigation is synchronous subroutine from RESOLVING_CONTEXT.
 */

import { PageId, NavParams, NavFilters } from './routeRegistry';

// Exactly 15 Canonical States - No additions, no deletions, no renames
export type VoiceAssistantState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING_SPEECH'
  | 'RESOLVING_CONTEXT'
  | 'ANSWERING'
  | 'RECOMMENDING'
  | 'PREPARING_ACTION'
  | 'AWAITING_CONFIRMATION'
  | 'EXECUTING_ACTION'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUSED'
  | 'CLARIFICATION_REQUIRED'
  | 'SLEEPING'
  | 'PAUSED';

// Canonical Transitions T01-T63
export type TransitionId =
  | 'T01' | 'T02' | 'T03' | 'T04' | 'T05' | 'T06' | 'T07' | 'T08' | 'T09' | 'T10'
  | 'T11' | 'T12' | 'T13' | 'T14' | 'T15' | 'T16' | 'T17' | 'T18' | 'T19' | 'T20'
  | 'T21' | 'T22' | 'T23' | 'T24' | 'T25' | 'T26' | 'T27' | 'T28' | 'T29' | 'T30'
  | 'T31' | 'T32' | 'T33' | 'T34' | 'T35' | 'T36' | 'T37' | 'T38' | 'T39' | 'T40'
  | 'T41' | 'T42' | 'T43' | 'T44' | 'T45' | 'T46' | 'T47' | 'T48' | 'T49' | 'T50'
  | 'T51' | 'T52' | 'T53' | 'T54' | 'T55' | 'T56' | 'T57' | 'T58' | 'T59' | 'T60'
  | 'T61' | 'T62' | 'T63';

// Voiceover Subsystem States (separate from assistant state machine)
export type VoiceoverState =
  | 'VOICEOVER_IDLE'
  | 'VOICEOVER_SPEAKING'
  | 'VOICEOVER_PAUSED';

export type VoiceoverTransitionId = 'V01' | 'V02';

export interface HistoryEntry {
  page: PageId;
  params?: NavParams;
  filters?: NavFilters;
  timestamp: number;
}

export interface PendingAction {
  id: string;
  type: 'WITHDRAW_CONSENT' | 'UPDATE_CONSENT' | 'LOCKDOWN' | 'ERASURE';
  targetId?: string;
  targetName?: string;
  description: string;
  payload?: Record<string, unknown>;
  createdAt: number;
}

export interface RouterInterface {
  currentPage: PageId;
  currentParams?: NavParams;
  currentFilters?: NavFilters;
  navigate: (page: PageId, params?: NavParams, filters?: NavFilters) => boolean;
}

export interface UIEventLogEntry {
  type: 'NAVIGATION_PERFORMED' | 'CHIP_SELECTED' | 'CONFIRMATION_ATTEMPT' | 'VOICEOVER_STOPPED';
  page?: PageId;
  paramsKeys?: string[];
  filters?: NavFilters;
  outcome?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface SelectedObjectContext {
  id: string;
  type: 'consent' | 'category' | 'service' | 'request';
  name: string;
  data?: Record<string, unknown>;
}

export interface RecommendationContext {
  id: string;
  targetPage: PageId;
  targetObjectId?: string;
  targetObjectName?: string;
  description: string;
  actionPayload?: Record<string, unknown>;
}

export interface AssistantContext {
  router: RouterInterface;
  language: 'en' | 'hi';
  spokenOutputEnabled: boolean;
  historyStack: HistoryEntry[];
  selectedObject: SelectedObjectContext | null;
  activeFilters: NavFilters | null;
  lastNavigatedAt: number | null;
  lastRecommendation: RecommendationContext | null;
  lastAnswer: string | null;
  pendingAction: PendingAction | null;
  clarificationAttempts: number;
  uiEventLog: UIEventLogEntry[];
  // Read-only state references for count calculation & existence check
  consents: Array<{ id: string; category: string; purpose: string; service: string; status: string; retentionDays: number }>;
  dataAssets: Array<{ id: string; category: string; service: string; sensitivity: string; consentStatus: string }>;
  services: Array<{ id: string; name: string }>;
  isVoiceCaptureEnabled: boolean;
}

export interface TransitionResult {
  transitionId: TransitionId;
  fromState: VoiceAssistantState;
  toState: VoiceAssistantState;
  spokenText?: string;
  transcriptText?: string;
  optionsChips?: Array<{ label: string; page: PageId; params?: NavParams }>;
  contextUpdates?: Partial<AssistantContext>;
}
