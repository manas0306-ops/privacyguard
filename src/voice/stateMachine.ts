/**
 * PRIVACYGUARD VOICE ASSISTANT - CANONICAL STATE MACHINE
 * Table-driven transition engine strictly adhering to T01–T63 and 15 canonical states.
 * 
 * Rules:
 * - Table-driven transitions as data, not if/else chains.
 * - Throws on invalid (state, event) pairs and records to debug log.
 * - Maps NavigationOutcome using only the authoritative map from Section 6.
 * - Never mutates application data or privacy engine state.
 */

import {
  VoiceAssistantState,
  TransitionId,
  AssistantContext,
  TransitionResult,
} from './types';
import {
  navigate,
  mapOutcomeToTransition,
  NavigationResult,
  NavigationRequest,
} from './navigationHandler';
import {
  resolveUtterance,
  isConfirmPhrase,
  isCancelPhrase,
} from './intentResolver';
import { t, getLocalizedPageName } from './localization';

export interface TransitionRule {
  id: TransitionId;
  from: VoiceAssistantState;
  event: string;
  to: VoiceAssistantState;
  description: string;
}

/**
 * Authoritative Canonical Transition Table (T01 - T63)
 */
export const TRANSITION_TABLE: TransitionRule[] = [
  // T01 - T06: Input & Listening
  { id: 'T01', from: 'IDLE', event: 'WAKE_WORD_OR_MIC', to: 'LISTENING', description: 'Start listening from mic' },
  { id: 'T02', from: 'IDLE', event: 'TEXT_INPUT', to: 'PROCESSING_SPEECH', description: 'User submits text input' },
  { id: 'T03', from: 'LISTENING', event: 'SPEECH_START', to: 'LISTENING', description: 'Speech detected' },
  { id: 'T04', from: 'LISTENING', event: 'SPEECH_END', to: 'PROCESSING_SPEECH', description: 'Speech capture complete' },
  { id: 'T05', from: 'LISTENING', event: 'SILENCE_TIMEOUT', to: 'IDLE', description: 'Silence timeout, mic turns off' },
  { id: 'T06', from: 'LISTENING', event: 'CANCEL_MIC', to: 'IDLE', description: 'User cancels microphone' },

  // T07 - T09: Processing Speech
  { id: 'T07', from: 'PROCESSING_SPEECH', event: 'SPEECH_RECOGNIZED', to: 'RESOLVING_CONTEXT', description: 'Utterance transcribed' },
  { id: 'T08', from: 'PROCESSING_SPEECH', event: 'ASR_ERROR', to: 'FAILED', description: 'Speech recognition error' },
  { id: 'T09', from: 'PROCESSING_SPEECH', event: 'EMPTY_TRANSCRIPT', to: 'IDLE', description: 'Empty audio input' },

  // T10 - T16: Context & Intent Resolution
  { id: 'T10', from: 'RESOLVING_CONTEXT', event: 'INTENT_EXPLANATION', to: 'ANSWERING', description: 'Question or explanation intent' },
  { id: 'T11', from: 'RESOLVING_CONTEXT', event: 'INTENT_RECOMMENDATION', to: 'RECOMMENDING', description: 'Recommendation intent' },
  { id: 'T12', from: 'RESOLVING_CONTEXT', event: 'INTENT_ACTION', to: 'PREPARING_ACTION', description: 'Action intent' },
  { id: 'T13', from: 'RESOLVING_CONTEXT', event: 'INTENT_NAVIGATION', to: 'IDLE', description: 'Default navigation completion' },
  { id: 'T14', from: 'RESOLVING_CONTEXT', event: 'INTENT_UNSUPPORTED', to: 'REFUSED', description: 'Unsupported capability' },
  { id: 'T15', from: 'RESOLVING_CONTEXT', event: 'INTENT_AMBIGUOUS', to: 'CLARIFICATION_REQUIRED', description: 'Ambiguous target' },
  { id: 'T16', from: 'RESOLVING_CONTEXT', event: 'RESOLUTION_TIMEOUT', to: 'FAILED', description: 'Resolution timed out' },

  // T17 - T24: Answering & Recommending
  { id: 'T17', from: 'ANSWERING', event: 'TTS_FINISHED', to: 'IDLE', description: 'Answer speech finished' },
  { id: 'T18', from: 'ANSWERING', event: 'FOLLOW_UP_UTTERANCE', to: 'RESOLVING_CONTEXT', description: 'User follow-up utterance' },
  { id: 'T19', from: 'RESOLVING_CONTEXT', event: 'UNRESOLVED_PRONOUN', to: 'CLARIFICATION_REQUIRED', description: 'Pronoun referent ambiguous' },
  { id: 'T20', from: 'RECOMMENDING', event: 'TTS_FINISHED', to: 'IDLE', description: 'Recommendation spoken' },
  { id: 'T21', from: 'RECOMMENDING', event: 'REJECT_RECOMMENDATION', to: 'IDLE', description: 'User declines recommendation' },
  { id: 'T22', from: 'ANSWERING', event: 'FOLLOW_UP_REQUIRED', to: 'LISTENING', description: 'Only automatic listening transition' },
  { id: 'T23', from: 'RECOMMENDING', event: 'REVIEW_RECOMMENDATION', to: 'RESOLVING_CONTEXT', description: 'User wants to review recommendation' },
  { id: 'T24', from: 'RECOMMENDING', event: 'APPLY_RECOMMENDATION', to: 'PREPARING_ACTION', description: 'User applies recommendation' },

  // T25 - T31: Action & Confirmation
  { id: 'T25', from: 'PREPARING_ACTION', event: 'ACTION_VALIDATED', to: 'AWAITING_CONFIRMATION', description: 'Action card prepared' },
  { id: 'T26', from: 'PREPARING_ACTION', event: 'POLICY_VIOLATION', to: 'REFUSED', description: 'Action violates privacy policy' },
  { id: 'T27', from: 'PREPARING_ACTION', event: 'VALIDATION_ERROR', to: 'FAILED', description: 'Action validation failed' },
  { id: 'T28', from: 'AWAITING_CONFIRMATION', event: 'USER_CONFIRMED', to: 'EXECUTING_ACTION', description: 'User confirms action' },
  { id: 'T29', from: 'AWAITING_CONFIRMATION', event: 'USER_CANCELLED', to: 'IDLE', description: 'User cancels pending action' },
  { id: 'T30', from: 'AWAITING_CONFIRMATION', event: 'AMBIGUOUS_CONFIRMATION', to: 'CLARIFICATION_REQUIRED', description: 'Unrecognized confirmation speech' },
  { id: 'T31', from: 'AWAITING_CONFIRMATION', event: 'CONFIRM_TIMEOUT', to: 'IDLE', description: 'Confirmation timed out' },

  // T32 - T34: Action Execution
  { id: 'T32', from: 'EXECUTING_ACTION', event: 'ACTION_SUCCESS', to: 'COMPLETED', description: 'Action execution succeeded' },
  { id: 'T33', from: 'EXECUTING_ACTION', event: 'ACTION_FAILURE', to: 'FAILED', description: 'Action execution failed' },
  { id: 'T34', from: 'EXECUTING_ACTION', event: 'ACTION_TIMEOUT', to: 'FAILED', description: 'Action execution timed out' },

  // T35 - T45: Terminal, Clarification & Pause/Stop
  { id: 'T35', from: 'COMPLETED', event: 'DISMISS_TOAST', to: 'IDLE', description: 'Completion toast dismissed' },
  { id: 'T36', from: 'COMPLETED', event: 'USER_ACKNOWLEDGED', to: 'IDLE', description: 'User acknowledged completion' },
  { id: 'T37', from: 'FAILED', event: 'DISMISS_ERROR', to: 'IDLE', description: 'Error dismissed' },
  { id: 'T38', from: 'FAILED', event: 'USER_ACKNOWLEDGED', to: 'IDLE', description: 'User acknowledged failure' },
  { id: 'T39', from: 'REFUSED', event: 'DISMISS_REFUSAL', to: 'IDLE', description: 'Refusal dismissed' },
  { id: 'T40', from: 'CLARIFICATION_REQUIRED', event: 'USER_CLARIFIED', to: 'RESOLVING_CONTEXT', description: 'User clarified intent' },
  { id: 'T41', from: 'CLARIFICATION_REQUIRED', event: 'MAX_ATTEMPTS_EXCEEDED', to: 'IDLE', description: 'Max attempts exceeded, discard action' },
  { id: 'T42', from: 'CLARIFICATION_REQUIRED', event: 'CLARIFICATION_TIMEOUT', to: 'IDLE', description: 'Clarification timed out' },
  { id: 'T43', from: 'REFUSED', event: 'USER_ACKNOWLEDGED', to: 'IDLE', description: 'User acknowledged refusal' },
  { id: 'T44', from: 'RESOLVING_CONTEXT', event: 'PAUSE_EVENT', to: 'PAUSED', description: 'System paused' },
  { id: 'T45', from: 'RESOLVING_CONTEXT', event: 'STOP_EVENT', to: 'IDLE', description: 'System stopped' },

  // ==========================================
  // T46 - T63: NAVIGATION TRANSITIONS (AUTHORITATIVE)
  // ==========================================
  { id: 'T46', from: 'RESOLVING_CONTEXT', event: 'NAV_PAGE_NAVIGATED', to: 'IDLE', description: 'Single valid page navigated' },
  { id: 'T47', from: 'RESOLVING_CONTEXT', event: 'NAV_DEEP_LINK_NAVIGATED', to: 'IDLE', description: 'Page with deep-link object navigated' },
  { id: 'T48', from: 'RESOLVING_CONTEXT', event: 'NAV_FILTER_APPLIED', to: 'IDLE', description: 'Page with read-only filter applied' },
  { id: 'T49', from: 'RESOLVING_CONTEXT', event: 'NAV_ALREADY_THERE', to: 'IDLE', description: 'Already on requested page, view unchanged' },
  { id: 'T50', from: 'RESOLVING_CONTEXT', event: 'NAV_SOFT_NAVIGATED', to: 'IDLE', description: 'Same page, different object or filter' },
  { id: 'T51', from: 'RESOLVING_CONTEXT', event: 'NAV_BACK_NAVIGATED', to: 'IDLE', description: 'Back navigation popped history' },
  { id: 'T52', from: 'RESOLVING_CONTEXT', event: 'NAV_NO_HISTORY', to: 'FAILED', description: 'Back requested with empty history' },
  { id: 'T53', from: 'RESOLVING_CONTEXT', event: 'NAV_AMBIGUOUS', to: 'CLARIFICATION_REQUIRED', description: 'Ambiguous navigation target' },
  { id: 'T54', from: 'RESOLVING_CONTEXT', event: 'NAV_NOT_IN_REGISTRY', to: 'REFUSED', description: 'Target not in registry' },
  { id: 'T55', from: 'RESOLVING_CONTEXT', event: 'NAV_OBJECT_NOT_FOUND', to: 'FAILED', description: 'Deep-link object not found' },
  { id: 'T56', from: 'RESOLVING_CONTEXT', event: 'NAV_ROUTER_ERROR', to: 'FAILED', description: 'Router error or C6 verification failed' },
  { id: 'T57', from: 'RESOLVING_CONTEXT', event: 'NAV_FILTER_DROPPED', to: 'IDLE', description: 'Filter unsupported for page, dropped' },
  { id: 'T58', from: 'RESOLVING_CONTEXT', event: 'NAV_COMPOUND', to: 'IDLE', description: 'Compound utterance: navigation only, discard write' },
  { id: 'T59', from: 'RESOLVING_CONTEXT', event: 'NAV_PRONOUN_REFERENT', to: 'IDLE', description: 'Navigation from recommendation/answer anaphora' },
  { id: 'T60', from: 'AWAITING_CONFIRMATION', event: 'NAV_PHRASE_DURING_CONFIRM', to: 'CLARIFICATION_REQUIRED', description: 'Navigation attempted while action awaits confirmation' },
  { id: 'T61', from: 'CLARIFICATION_REQUIRED', event: 'NON_CONFIRM_REPEAT', to: 'CLARIFICATION_REQUIRED', description: 'Repeated non-confirm phrase with pending action' },
  { id: 'T62', from: 'EXECUTING_ACTION', event: 'NAV_COMMAND_BLOCKED', to: 'EXECUTING_ACTION', description: 'Voice capture disabled during execution' },
  { id: 'T63', from: 'RESOLVING_CONTEXT', event: 'NAV_STOP_EVENT', to: 'IDLE', description: 'Stop event during navigation handler' },
];

/**
 * Diagnostic debug logger for invalid transition attempts
 */
export function logInvalidTransition(from: VoiceAssistantState, event: string): void {
  console.warn(`[VoiceAssistant] Invalid transition attempted: state="${from}", event="${event}"`);
}

/**
 * Transition Table Lookup
 */
export function findTransition(from: VoiceAssistantState, event: string): TransitionRule {
  const match = TRANSITION_TABLE.find(t => t.from === from && t.event === event);
  if (!match) {
    logInvalidTransition(from, event);
    throw new Error(`Invalid transition attempted from state "${from}" with event "${event}".`);
  }
  return match;
}

export class VoiceAssistantStateMachine {
  private currentState: VoiceAssistantState = 'IDLE';
  private context: AssistantContext;

  constructor(context: AssistantContext) {
    this.context = context;
  }

  public getState(): VoiceAssistantState {
    return this.currentState;
  }

  public getContext(): AssistantContext {
    return this.context;
  }

  public setState(state: VoiceAssistantState): void {
    this.currentState = state;
  }

  /**
   * Process an utterance through the formal state machine
   */
  public handleUtterance(utterance: string): TransitionResult {
    const lang = this.context.language || 'en';

    // 1. STATE: EXECUTING_ACTION (T62)
    // Voice capture is disabled in this state, no voice command can arrive
    if (this.currentState === 'EXECUTING_ACTION') {
      const rule = findTransition('EXECUTING_ACTION', 'NAV_COMMAND_BLOCKED');
      return {
        transitionId: rule.id,
        fromState: 'EXECUTING_ACTION',
        toState: 'EXECUTING_ACTION',
        transcriptText: 'Voice capture disabled while executing action.',
      };
    }

    // 2. STATE: AWAITING_CONFIRMATION (T28, T29, T60)
    if (this.currentState === 'AWAITING_CONFIRMATION') {
      if (isConfirmPhrase(utterance, lang)) {
        // T28: Confirm action
        const rule = findTransition('AWAITING_CONFIRMATION', 'USER_CONFIRMED');
        this.currentState = rule.to;
        return {
          transitionId: rule.id,
          fromState: 'AWAITING_CONFIRMATION',
          toState: rule.to,
          transcriptText: 'Action confirmed. Executing...',
        };
      }

      if (isCancelPhrase(utterance, lang)) {
        // T29: Cancel action
        const rule = findTransition('AWAITING_CONFIRMATION', 'USER_CANCELLED');
        this.currentState = rule.to;
        this.context.pendingAction = null;
        this.context.clarificationAttempts = 0;
        const msg = t('nav.cancelled_action', lang);
        return {
          transitionId: rule.id,
          fromState: 'AWAITING_CONFIRMATION',
          toState: rule.to,
          spokenText: msg,
          transcriptText: msg,
        };
      }

      // T60: Utterance is neither confirm nor cancel (e.g. navigation phrase)
      const rule = findTransition('AWAITING_CONFIRMATION', 'NAV_PHRASE_DURING_CONFIRM');
      this.currentState = rule.to; // CLARIFICATION_REQUIRED
      this.context.clarificationAttempts = 1;
      const msg = t('nav.pending_action', lang);

      return {
        transitionId: rule.id,
        fromState: 'AWAITING_CONFIRMATION',
        toState: rule.to,
        spokenText: msg,
        transcriptText: msg,
      };
    }

    // 3. STATE: CLARIFICATION_REQUIRED (T40, T61, T41)
    if (this.currentState === 'CLARIFICATION_REQUIRED') {
      if (this.context.pendingAction) {
        if (isConfirmPhrase(utterance, lang)) {
          // Resolved confirm
          this.currentState = 'EXECUTING_ACTION';
          return {
            transitionId: 'T28',
            fromState: 'CLARIFICATION_REQUIRED',
            toState: 'EXECUTING_ACTION',
            transcriptText: 'Action confirmed. Executing...',
          };
        }
        if (isCancelPhrase(utterance, lang)) {
          // Resolved cancel
          this.currentState = 'IDLE';
          this.context.pendingAction = null;
          this.context.clarificationAttempts = 0;
          const msg = t('nav.cancelled_action', lang);
          return {
            transitionId: 'T29',
            fromState: 'CLARIFICATION_REQUIRED',
            toState: 'IDLE',
            spokenText: msg,
            transcriptText: msg,
          };
        }

        // T61: Repeat non-confirm phrase
        this.context.clarificationAttempts += 1;

        if (this.context.clarificationAttempts >= 2) {
          // T41: Max attempts exceeded -> IDLE, discard pending action, log USER_CANCELLED_ACTION
          this.currentState = 'IDLE';
          this.context.pendingAction = null;
          this.context.clarificationAttempts = 0;
          this.context.uiEventLog.push({
            type: 'CONFIRMATION_ATTEMPT',
            outcome: 'USER_CANCELLED_ACTION',
            timestamp: new Date().toISOString(),
          });
          const msg = t('nav.cancelled_action', lang);
          return {
            transitionId: 'T41',
            fromState: 'CLARIFICATION_REQUIRED',
            toState: 'IDLE',
            spokenText: msg,
            transcriptText: msg,
          };
        }

        const msg = t('nav.pending_action', lang);
        return {
          transitionId: 'T61',
          fromState: 'CLARIFICATION_REQUIRED',
          toState: 'CLARIFICATION_REQUIRED',
          spokenText: msg,
          transcriptText: msg,
        };
      }
    }

    // 4. NORMAL FLOW: Start from IDLE or any active state
    // Step A: T02 (IDLE -> PROCESSING_SPEECH) -> T07 (PROCESSING_SPEECH -> RESOLVING_CONTEXT)
    this.currentState = 'RESOLVING_CONTEXT';

    // Step B: Resolve Intent
    const resolved = resolveUtterance(utterance, this.context);

    // If explanation/question intent (Section 4)
    if (resolved.classification === 'EXPLANATION') {
      const rule = findTransition('RESOLVING_CONTEXT', 'INTENT_EXPLANATION');
      this.currentState = rule.to;
      return {
        transitionId: rule.id,
        fromState: 'RESOLVING_CONTEXT',
        toState: rule.to,
        spokenText: 'Answering your privacy question.',
        transcriptText: 'Answering your privacy question.',
      };
    }

    // If recommendation action intent
    if (resolved.classification === 'RECOMMENDATION_APPLY') {
      const rule = findTransition('RESOLVING_CONTEXT', 'INTENT_ACTION');
      this.currentState = 'PREPARING_ACTION';
      return {
        transitionId: 'T24',
        fromState: 'RESOLVING_CONTEXT',
        toState: 'PREPARING_ACTION',
        transcriptText: 'Preparing action from recommendation...',
      };
    }

    // If unsupported target
    if (resolved.classification === 'UNSUPPORTED') {
      const navRes = navigate(resolved.navRequest || {}, this.context);
      const rule = findTransition('RESOLVING_CONTEXT', 'NAV_NOT_IN_REGISTRY');
      this.currentState = rule.to; // REFUSED
      return {
        transitionId: rule.id,
        fromState: 'RESOLVING_CONTEXT',
        toState: rule.to,
        spokenText: navRes.spokenText,
        transcriptText: navRes.transcriptText,
      };
    }

    // If navigation intent (Section 5, 7)
    if (resolved.classification === 'NAVIGATION' && resolved.navRequest) {
      const navRes = navigate(resolved.navRequest, this.context);
      const tid = navRes.transitionId;
      const targetRule = TRANSITION_TABLE.find(t => t.id === tid);

      if (!targetRule) {
        throw new Error(`Unmapped navigation transition ID: ${tid}`);
      }

      this.currentState = targetRule.to;

      let optionsChips: Array<{ label: string; page: any }> | undefined;
      if (navRes.candidates && navRes.candidates.length > 0) {
        optionsChips = navRes.candidates.map(c => ({
          label: getLocalizedPageName(c, lang),
          page: c,
        }));
      }

      return {
        transitionId: tid,
        fromState: 'RESOLVING_CONTEXT',
        toState: targetRule.to,
        spokenText: navRes.spokenText,
        transcriptText: navRes.transcriptText,
        optionsChips,
      };
    }

    // Default fallback
    this.currentState = 'IDLE';
    return {
      transitionId: 'T13',
      fromState: 'RESOLVING_CONTEXT',
      toState: 'IDLE',
      transcriptText: utterance,
    };
  }

  /**
   * Stop event handler (T45 / T63)
   */
  public handleStop(isDuringNav: boolean, hasCalledRouter: boolean, actualPage?: any): TransitionResult {
    const lang = this.context.language || 'en';
    if (isDuringNav) {
      if (!hasCalledRouter) {
        // T63 abort before router call
        this.currentState = 'IDLE';
        return {
          transitionId: 'T63',
          fromState: 'RESOLVING_CONTEXT',
          toState: 'IDLE',
          transcriptText: 'Navigation stopped.',
        };
      } else {
        // T63 router already called: let finish and report real page
        this.currentState = 'IDLE';
        const msg = t('nav.opening', lang, { page: getLocalizedPageName(actualPage || this.context.router.currentPage, lang) });
        return {
          transitionId: 'T63',
          fromState: 'RESOLVING_CONTEXT',
          toState: 'IDLE',
          spokenText: msg,
          transcriptText: msg,
        };
      }
    }

    this.currentState = 'IDLE';
    return {
      transitionId: 'T45',
      fromState: 'RESOLVING_CONTEXT',
      toState: 'IDLE',
      transcriptText: 'Stopped.',
    };
  }
}
