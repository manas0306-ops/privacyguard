/**
 * PRIVACYGUARD VOICE ASSISTANT - NAVIGATION HANDLER
 * 
 * Non-Negotiable Architectural Rules:
 * C1. No NAVIGATING state. Synchronous sub-routine called from RESOLVING_CONTEXT.
 * C2. Pure with respect to application data. Never mutates consent, data, score, audit log, retention, lockdown.
 *     NEVER imports Action Engine or Policy Engine.
 * C3. Needs no confirmation and never passes through PREPARING_ACTION.
 * C4. ANSWERING and RECOMMENDING never change the route.
 * C5. Navigation never starts the microphone. Ends in IDLE.
 * C6. Post-condition verification: router.currentPage must equal resolvedPage. Otherwise ROUTER_ERROR / FAILED.
 * C7. Never guess. Ambiguous -> CLARIFICATION_REQUIRED. Unsupported -> REFUSED.
 * C8. Cannot be invoked by Voiceover.
 */

import {
  PageId,
  NavParams,
  NavFilters,
  isPageInRegistry,
  filterSupportedFilters,
} from './routeRegistry';
import {
  AssistantContext,
  HistoryEntry,
  TransitionId,
} from './types';
import { voiceoverBus } from './voiceoverBus';
import { t, getLocalizedPageName } from './localization';

export interface NavigationRequest {
  page?: PageId;
  params?: NavParams;
  filters?: NavFilters;
  direction?: 'back';
  candidates?: PageId[];
  isCompound?: boolean;
  fromPronoun?: boolean;
  requestedObject?: {
    id?: string;
    name?: string;
    type?: 'consent' | 'category' | 'service' | 'request';
  };
}

export type NavigationOutcome =
  | 'PAGE_NAVIGATED'
  | 'DEEP_LINK_NAVIGATED'
  | 'FILTER_APPLIED'
  | 'ALREADY_THERE'
  | 'SOFT_NAVIGATED'
  | 'BACK_NAVIGATED'
  | 'NO_HISTORY'
  | 'AMBIGUOUS'
  | 'NOT_IN_REGISTRY'
  | 'OBJECT_NOT_FOUND'
  | 'ROUTER_ERROR'
  | 'FILTER_DROPPED';

export interface NavigationResult {
  outcome: NavigationOutcome;
  resolvedPage: PageId;
  transitionId: TransitionId;
  appliedParams?: NavParams;
  appliedFilters?: NavFilters;
  droppedFilters?: string[];
  matchCount?: number;
  candidates?: PageId[];
  spokenText?: string;
  transcriptText?: string;
}

// Bounded history stack (max 10)
const MAX_HISTORY = 10;

// Single-flight navigation lock
let isNavigatingInProgress = false;

export function resetNavigationLock(): void {
  isNavigatingInProgress = false;
}

export function isSingleFlightBusy(): boolean {
  return isNavigatingInProgress;
}

/**
 * Outcome to Transition ID mapper (Authoritative map from Section 6 & 7)
 */
export function mapOutcomeToTransition(
  outcome: NavigationOutcome,
  req?: NavigationRequest
): TransitionId {
  if (req?.isCompound) {
    return 'T58';
  }
  if (req?.fromPronoun && outcome === 'DEEP_LINK_NAVIGATED') {
    return 'T59';
  }

  switch (outcome) {
    case 'PAGE_NAVIGATED':
      return 'T46';
    case 'DEEP_LINK_NAVIGATED':
      return 'T47';
    case 'FILTER_APPLIED':
      return 'T48';
    case 'ALREADY_THERE':
      return 'T49';
    case 'SOFT_NAVIGATED':
      return 'T50';
    case 'BACK_NAVIGATED':
      return 'T51';
    case 'NO_HISTORY':
      return 'T52';
    case 'AMBIGUOUS':
      return 'T53';
    case 'NOT_IN_REGISTRY':
      return 'T54';
    case 'OBJECT_NOT_FOUND':
      return 'T55';
    case 'ROUTER_ERROR':
      return 'T56';
    case 'FILTER_DROPPED':
      return 'T57';
    default:
      return 'T56';
  }
}

/**
 * Helper to push an entry to the bounded history stack
 */
export function pushHistory(
  stack: HistoryEntry[],
  page: PageId,
  params?: NavParams,
  filters?: NavFilters
): HistoryEntry[] {
  const newEntry: HistoryEntry = {
    page,
    params: params ? { ...params } : undefined,
    filters: filters ? { ...filters } : undefined,
    timestamp: Date.now(),
  };

  const nextStack = [...stack, newEntry];
  if (nextStack.length > MAX_HISTORY) {
    return nextStack.slice(nextStack.length - MAX_HISTORY);
  }
  return nextStack;
}

/**
 * Helper to replace top of history stack for soft navigation
 */
export function replaceTopHistory(
  stack: HistoryEntry[],
  page: PageId,
  params?: NavParams,
  filters?: NavFilters
): HistoryEntry[] {
  if (stack.length === 0) {
    return pushHistory(stack, page, params, filters);
  }
  const nextStack = [...stack];
  nextStack[nextStack.length - 1] = {
    page,
    params: params ? { ...params } : undefined,
    filters: filters ? { ...filters } : undefined,
    timestamp: Date.now(),
  };
  return nextStack;
}

/**
 * Main Synchronous Navigation Subroutine
 */
export function navigate(
  req: NavigationRequest,
  ctx: AssistantContext,
  options?: { shouldAbortBeforeRouterCall?: boolean }
): NavigationResult {
  const lang = ctx.language || 'en';
  // Always read current router state freshly
  const currentActualPage = ctx.router.currentPage;
  const currentParams = ctx.router.currentParams;
  const currentFilters = ctx.router.currentFilters;

  // Single-flight check: if already navigating, reject with ROUTER_ERROR
  if (isNavigatingInProgress) {
    const tid: TransitionId = 'T56';
    const text = t('nav.router_failed', lang, {
      page: req.page ? getLocalizedPageName(req.page, lang) : currentActualPage,
      currentPage: getLocalizedPageName(currentActualPage, lang),
    });
    return {
      outcome: 'ROUTER_ERROR',
      resolvedPage: currentActualPage,
      transitionId: tid,
      spokenText: text,
      transcriptText: text,
    };
  }

  isNavigatingInProgress = true;

  try {
    // 1. DIRECTION: BACK
    if (req.direction === 'back') {
      if (ctx.historyStack.length <= 1) {
        // T52: NO_HISTORY
        const text = t('nav.no_history', lang);
        return {
          outcome: 'NO_HISTORY',
          resolvedPage: currentActualPage,
          transitionId: 'T52',
          spokenText: text,
          transcriptText: text,
        };
      }

      // Pop current, get previous
      const currentStack = [...ctx.historyStack];
      currentStack.pop(); // Remove current view
      const targetEntry = currentStack[currentStack.length - 1];

      if (options?.shouldAbortBeforeRouterCall) {
        // T63 aborted before router call
        return {
          outcome: 'ROUTER_ERROR',
          resolvedPage: currentActualPage,
          transitionId: 'T63',
          spokenText: t('nav.already_there', lang, { page: getLocalizedPageName(currentActualPage, lang) }),
          transcriptText: t('nav.already_there', lang, { page: getLocalizedPageName(currentActualPage, lang) }),
        };
      }

      // Call router to navigate back
      const navSuccess = ctx.router.navigate(
        targetEntry.page,
        targetEntry.params,
        targetEntry.filters
      );

      // C6: Post-condition verification
      if (!navSuccess || ctx.router.currentPage !== targetEntry.page) {
        const text = t('nav.router_failed', lang, {
          page: getLocalizedPageName(targetEntry.page, lang),
          currentPage: getLocalizedPageName(ctx.router.currentPage, lang),
        });
        return {
          outcome: 'ROUTER_ERROR',
          resolvedPage: ctx.router.currentPage,
          transitionId: 'T56',
          spokenText: text,
          transcriptText: text,
        };
      }

      // V01: Emit SCREEN_CHANGED
      voiceoverBus.emitScreenChanged({
        page: targetEntry.page,
        params: targetEntry.params,
        filters: targetEntry.filters,
      });

      // Update history in context
      ctx.historyStack = currentStack;
      ctx.lastNavigatedAt = Date.now();
      ctx.selectedObject = null;
      ctx.activeFilters = targetEntry.filters || null;

      // Log UI event
      ctx.uiEventLog.push({
        type: 'NAVIGATION_PERFORMED',
        page: targetEntry.page,
        paramsKeys: targetEntry.params ? Object.keys(targetEntry.params) : [],
        filters: targetEntry.filters,
        outcome: 'BACK_NAVIGATED',
        timestamp: new Date().toISOString(),
      });

      const text = t('nav.going_back', lang, {
        page: getLocalizedPageName(targetEntry.page, lang),
      });

      return {
        outcome: 'BACK_NAVIGATED',
        resolvedPage: targetEntry.page,
        transitionId: 'T51',
        appliedParams: targetEntry.params,
        appliedFilters: targetEntry.filters,
        spokenText: text,
        transcriptText: text,
      };
    }

    // 2. AMBIGUOUS CHECK (T53)
    if (req.candidates && req.candidates.length > 1) {
      const candidatesText = req.candidates
        .map(c => getLocalizedPageName(c, lang))
        .join(', ');
      const text = t('nav.ambiguous', lang, { options: candidatesText });
      return {
        outcome: 'AMBIGUOUS',
        resolvedPage: currentActualPage,
        transitionId: 'T53',
        candidates: req.candidates.slice(0, 3),
        spokenText: text,
        transcriptText: text,
      };
    }

    // 3. TARGET REGISTRY CHECK (T54)
    if (!req.page || !isPageInRegistry(req.page)) {
      const text = t('nav.unsupported_with_list', lang);
      return {
        outcome: 'NOT_IN_REGISTRY',
        resolvedPage: currentActualPage,
        transitionId: 'T54',
        spokenText: text,
        transcriptText: text,
      };
    }

    const targetPage = req.page;

    // 4. DEEP LINK OBJECT VERIFICATION (T55)
    let foundObject: { id: string; name: string; type: 'consent' | 'category' | 'service' | 'request' } | null = null;
    if (req.requestedObject) {
      const { id, name, type } = req.requestedObject;

      if (targetPage === 'consent_center') {
        const match = ctx.consents.find(c => {
          if (id && c.id === id) return true;
          if (name) {
            const lowName = name.toLowerCase();
            return (
              c.purpose.toLowerCase().includes(lowName) ||
              c.service.toLowerCase().includes(lowName) ||
              c.category.toLowerCase().includes(lowName)
            );
          }
          return false;
        });

        if (!match) {
          const text = t('nav.object_not_found', lang, {
            currentPage: getLocalizedPageName(currentActualPage, lang),
          });
          return {
            outcome: 'OBJECT_NOT_FOUND',
            resolvedPage: currentActualPage,
            transitionId: 'T55',
            spokenText: text,
            transcriptText: text,
          };
        }

        foundObject = {
          id: match.id,
          name: match.purpose,
          type: 'consent',
        };
        req.params = { ...(req.params || {}), consentId: match.id };
      } else if (targetPage === 'my_data') {
        const match = ctx.dataAssets.find(a => {
          if (id && a.id === id) return true;
          if (name) {
            return (
              a.category.toLowerCase().includes(name.toLowerCase()) ||
              a.service.toLowerCase().includes(name.toLowerCase())
            );
          }
          return false;
        });

        if (!match) {
          const text = t('nav.object_not_found', lang, {
            currentPage: getLocalizedPageName(currentActualPage, lang),
          });
          return {
            outcome: 'OBJECT_NOT_FOUND',
            resolvedPage: currentActualPage,
            transitionId: 'T55',
            spokenText: text,
            transcriptText: text,
          };
        }

        foundObject = {
          id: match.id,
          name: match.category,
          type: 'category',
        };
        req.params = { ...(req.params || {}), dataCategory: match.category };
      }
    }

    // 5. FILTER VALIDATION & DROPPING (T57 / T48)
    const { supported: validFilters, dropped: droppedFilters } = filterSupportedFilters(
      targetPage,
      req.filters
    );
    const filterDropped = droppedFilters.length > 0;

    // 6. ALREADY_THERE CHECK (T49)
    const isSamePage = currentActualPage === targetPage;
    const isSameParams = JSON.stringify(currentParams || {}) === JSON.stringify(req.params || {});
    const isSameFilters = JSON.stringify(currentFilters || {}) === JSON.stringify(validFilters || {});

    if (isSamePage && isSameParams && isSameFilters && !filterDropped && !req.isCompound) {
      const text = t('nav.already_there', lang, {
        page: getLocalizedPageName(targetPage, lang),
      });
      return {
        outcome: 'ALREADY_THERE',
        resolvedPage: currentActualPage,
        transitionId: 'T49',
        spokenText: text,
        transcriptText: text,
      };
    }

    // 7. SOFT NAVIGATION (T50): Same page, different params or filters
    if (isSamePage && (!isSameParams || !isSameFilters) && !filterDropped && !req.isCompound) {
      if (options?.shouldAbortBeforeRouterCall) {
        return {
          outcome: 'ROUTER_ERROR',
          resolvedPage: currentActualPage,
          transitionId: 'T63',
          spokenText: t('nav.already_there', lang, { page: getLocalizedPageName(currentActualPage, lang) }),
          transcriptText: t('nav.already_there', lang, { page: getLocalizedPageName(currentActualPage, lang) }),
        };
      }

      ctx.router.navigate(targetPage, req.params, validFilters);

      ctx.historyStack = replaceTopHistory(ctx.historyStack, targetPage, req.params, validFilters);
      ctx.lastNavigatedAt = Date.now();
      if (foundObject) {
        ctx.selectedObject = foundObject;
      }
      ctx.activeFilters = validFilters || null;

      ctx.uiEventLog.push({
        type: 'NAVIGATION_PERFORMED',
        page: targetPage,
        paramsKeys: req.params ? Object.keys(req.params) : [],
        filters: validFilters,
        outcome: 'SOFT_NAVIGATED',
        timestamp: new Date().toISOString(),
      });

      const text = t('nav.opening', lang, {
        page: getLocalizedPageName(targetPage, lang),
      });

      return {
        outcome: 'SOFT_NAVIGATED',
        resolvedPage: targetPage,
        transitionId: 'T50',
        appliedParams: req.params,
        appliedFilters: validFilters,
        spokenText: text,
        transcriptText: text,
      };
    }

    // 8. ROUTER CALL ABORT SIMULATION FOR T63
    if (options?.shouldAbortBeforeRouterCall) {
      return {
        outcome: 'ROUTER_ERROR',
        resolvedPage: currentActualPage,
        transitionId: 'T63',
        spokenText: t('nav.already_there', lang, { page: getLocalizedPageName(currentActualPage, lang) }),
        transcriptText: t('nav.already_there', lang, { page: getLocalizedPageName(currentActualPage, lang) }),
      };
    }

    // 9. EXECUTE ROUTER CALL
    let navSuccess = false;
    try {
      navSuccess = ctx.router.navigate(targetPage, req.params, validFilters);
    } catch {
      navSuccess = false;
    }

    // C6: POST-CONDITION VERIFICATION
    if (!navSuccess || ctx.router.currentPage !== targetPage) {
      const text = t('nav.router_failed', lang, {
        page: getLocalizedPageName(targetPage, lang),
        currentPage: getLocalizedPageName(ctx.router.currentPage, lang),
      });
      return {
        outcome: 'ROUTER_ERROR',
        resolvedPage: ctx.router.currentPage,
        transitionId: 'T56',
        spokenText: text,
        transcriptText: text,
      };
    }

    // 10. SUCCESSFUL NAVIGATION ACTIONS
    // V01: Emit SCREEN_CHANGED to stop Voiceover immediately
    voiceoverBus.emitScreenChanged({
      page: targetPage,
      params: req.params,
      filters: validFilters,
    });

    // Update history stack
    ctx.historyStack = pushHistory(ctx.historyStack, targetPage, req.params, validFilters);
    ctx.lastNavigatedAt = Date.now();
    ctx.activeFilters = validFilters || null;

    // Set or clear selectedObject per Section 9
    if (foundObject) {
      ctx.selectedObject = foundObject;
    } else {
      ctx.selectedObject = null;
    }

    // Log UI event (NOT security audit log!)
    ctx.uiEventLog.push({
      type: 'NAVIGATION_PERFORMED',
      page: targetPage,
      paramsKeys: req.params ? Object.keys(req.params) : [],
      filters: validFilters,
      outcome: filterDropped
        ? 'FILTER_DROPPED'
        : foundObject
        ? 'DEEP_LINK_NAVIGATED'
        : validFilters
        ? 'FILTER_APPLIED'
        : 'PAGE_NAVIGATED',
      timestamp: new Date().toISOString(),
    });

    // 11. DETERMINE PRECISE OUTCOME & TRANSITION
    // T58: Compound Utterance
    if (req.isCompound) {
      const text = t('nav.compound_followup', lang, {
        page: getLocalizedPageName(targetPage, lang),
      });
      return {
        outcome: 'PAGE_NAVIGATED',
        resolvedPage: targetPage,
        transitionId: 'T58',
        appliedParams: req.params,
        appliedFilters: validFilters,
        spokenText: text,
        transcriptText: text,
      };
    }

    // T57: Filter Dropped
    if (filterDropped) {
      const text = t('nav.filter_dropped', lang, {
        page: getLocalizedPageName(targetPage, lang),
      });
      return {
        outcome: 'FILTER_DROPPED',
        resolvedPage: targetPage,
        transitionId: 'T57',
        appliedParams: req.params,
        appliedFilters: validFilters,
        droppedFilters,
        spokenText: text,
        transcriptText: text,
      };
    }

    // T47 / T59: Deep Link Navigated
    if (foundObject) {
      const tid: TransitionId = req.fromPronoun ? 'T59' : 'T47';
      const text = t('nav.opening_object', lang, {
        object: foundObject.name,
      });
      return {
        outcome: 'DEEP_LINK_NAVIGATED',
        resolvedPage: targetPage,
        transitionId: tid,
        appliedParams: req.params,
        appliedFilters: validFilters,
        spokenText: text,
        transcriptText: text,
      };
    }

    // T48: Filter Applied
    if (validFilters && Object.keys(validFilters).length > 0) {
      // Calculate matchCount strictly from application state
      let matchCount = 0;
      if (targetPage === 'consent_center') {
        matchCount = ctx.consents.filter(c => {
          if (validFilters.risk) {
            // Check risk mapping: e.g. Analytics / Location HIGH
            if (validFilters.risk === 'HIGH' && (c.category === 'Location' || c.purpose.toLowerCase().includes('advertising') || c.category === 'Analytics')) {
              return true;
            }
          }
          if (validFilters.status) {
            return c.status.toLowerCase() === validFilters.status.toLowerCase();
          }
          return false;
        }).length;
      }

      const filterLabel = validFilters.risk
        ? `${validFilters.risk.toLowerCase()}-risk`
        : validFilters.status || '';

      const text = t('nav.showing_filtered', lang, {
        count: matchCount,
        filter: filterLabel,
      });

      return {
        outcome: 'FILTER_APPLIED',
        resolvedPage: targetPage,
        transitionId: 'T48',
        appliedParams: req.params,
        appliedFilters: validFilters,
        matchCount,
        spokenText: text,
        transcriptText: text,
      };
    }

    // T46: Page Navigated
    const text = t('nav.opening', lang, {
      page: getLocalizedPageName(targetPage, lang),
    });

    return {
      outcome: 'PAGE_NAVIGATED',
      resolvedPage: targetPage,
      transitionId: 'T46',
      appliedParams: req.params,
      appliedFilters: validFilters,
      spokenText: text,
      transcriptText: text,
    };
  } finally {
    isNavigatingInProgress = false;
  }
}
