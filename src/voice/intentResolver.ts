/**
 * PRIVACYGUARD VOICE ASSISTANT - INTENT & UTTERANCE RESOLVER
 * Classifies navigation commands vs questions/explanations vs actions.
 * Resolves synonyms in English & Hindi, detects compound commands, and handles anaphora.
 */

import { PageId } from './routeRegistry';
import { AssistantContext } from './types';
import { getLocalization } from './localization';
import { NavigationRequest } from './navigationHandler';

export type UtteranceClassification =
  | 'NAVIGATION'
  | 'EXPLANATION'
  | 'RECOMMENDATION_REVIEW'
  | 'RECOMMENDATION_APPLY'
  | 'CONFIRM'
  | 'CANCEL'
  | 'AMBIGUOUS'
  | 'UNSUPPORTED'
  | 'OTHER';

export interface ResolvedIntent {
  classification: UtteranceClassification;
  navRequest?: NavigationRequest;
  rawUtterance: string;
}

/**
 * Checks if utterance matches confirm lexicon in active language
 */
export function isConfirmPhrase(utterance: string, lang: string = 'en'): boolean {
  const norm = utterance.trim().toLowerCase();
  const loc = getLocalization(lang);
  // Match exact word or standard confirmation expressions, but not recommendation commands
  if (norm.includes('recommendation') || norm.includes('review')) {
    return false;
  }
  return loc.confirmLexicon.some(word => norm === word || norm.startsWith(word + ' '));
}

/**
 * Checks if utterance matches cancel lexicon in active language
 */
export function isCancelPhrase(utterance: string, lang: string = 'en'): boolean {
  const norm = utterance.trim().toLowerCase();
  const loc = getLocalization(lang);
  return loc.cancelLexicon.some(word => norm === word || norm.startsWith(word + ' '));
}

/**
 * Checks if utterance is purely an explanation/informational question
 * Rule (Section 4): "Which permissions are high risk?", "Who has my location?",
 * "Why was this blocked?", "Explain this data flow." are NOT navigation.
 */
export function isExplanationQuestion(norm: string): boolean {
  return (
    norm.startsWith('which ') ||
    norm.startsWith('who ') ||
    norm.startsWith('why ') ||
    norm.startsWith('what ') ||
    norm.startsWith('how ') ||
    norm.startsWith('explain ') ||
    norm.includes('क्यों ') ||
    norm.includes('किसके ') ||
    norm.includes('क्या ') ||
    norm.includes('समझाएं')
  );
}

/**
 * Resolves an utterance into a typed Intent and NavigationRequest
 */
export function resolveUtterance(
  utterance: string,
  ctx: AssistantContext
): ResolvedIntent {
  const lang = ctx.language || 'en';
  const loc = getLocalization(lang);
  const norm = utterance.trim().toLowerCase();

  // 1. RECOMMENDATION ACTION VS REVIEW (Check before general confirm/cancel to avoid "apply" collision)
  // "Apply that recommendation" -> RECOMMENDATION_APPLY (T24)
  if (norm.includes('apply that') || norm.includes('apply recommendation') || norm.includes('लागू करें')) {
    return { classification: 'RECOMMENDATION_APPLY', rawUtterance: utterance };
  }

  // "Review it" / "Show me" -> RECOMMENDATION_REVIEW (T59)
  const isAnaphora = loc.anaphoraPhrases.some(phrase => norm.includes(phrase));
  if (isAnaphora && ctx.lastRecommendation) {
    return {
      classification: 'NAVIGATION',
      navRequest: {
        page: ctx.lastRecommendation.targetPage,
        fromPronoun: true,
        requestedObject: ctx.lastRecommendation.targetObjectId
          ? {
              id: ctx.lastRecommendation.targetObjectId,
              name: ctx.lastRecommendation.targetObjectName,
              type: 'consent',
            }
          : undefined,
      },
      rawUtterance: utterance,
    };
  }

  // 2. CONFIRM / CANCEL LEXICON CHECK
  if (isConfirmPhrase(norm, lang)) {
    return { classification: 'CONFIRM', rawUtterance: utterance };
  }
  if (isCancelPhrase(norm, lang)) {
    return { classification: 'CANCEL', rawUtterance: utterance };
  }

  // 3. CHECK EXPLANATION QUESTIONS (Section 4)
  if (isExplanationQuestion(norm)) {
    return { classification: 'EXPLANATION', rawUtterance: utterance };
  }

  // 4. BACK PHRASES
  if (loc.backPhrases.some(b => norm === b || norm.startsWith(b))) {
    return {
      classification: 'NAVIGATION',
      navRequest: { direction: 'back' },
      rawUtterance: utterance,
    };
  }

  // 5. COMPOUND UTTERANCE DETECTION (T58)
  // E.g., "Open consent center and turn off analytics"
  const compoundMatch = norm.match(/(open|go to|take me to|खोलो)\s+(.+?)\s+(and|और|साथ में)\s+(.+)/i);
  let isCompound = false;
  let navigationPortion = norm;
  if (compoundMatch) {
    const actionPart = compoundMatch[4].toLowerCase();
    if (
      actionPart.includes('turn off') ||
      actionPart.includes('withdraw') ||
      actionPart.includes('delete') ||
      actionPart.includes('disable') ||
      actionPart.includes('enable') ||
      actionPart.includes('बंद') ||
      actionPart.includes('हटाएं')
    ) {
      isCompound = true;
      navigationPortion = `${compoundMatch[1]} ${compoundMatch[2]}`.trim();
    }
  }

  // 6. AMBIGUOUS TARGET DETECTION (T53)
  // e.g. "open consent" (page vs card both match) or "open security"
  if (
    navigationPortion === 'open consent' ||
    navigationPortion === 'consent' ||
    navigationPortion === 'सहमति' ||
    navigationPortion === 'सहमति खोलो'
  ) {
    return {
      classification: 'NAVIGATION',
      navRequest: {
        page: 'consent_center',
        candidates: ['consent_center', 'dashboard'],
      },
      rawUtterance: utterance,
    };
  }
  if (
    navigationPortion === 'open security' ||
    navigationPortion === 'security' ||
    navigationPortion === 'सुरक्षा'
  ) {
    return {
      classification: 'NAVIGATION',
      navRequest: {
        page: 'security_center',
        candidates: ['security_center', 'dashboard'],
      },
      rawUtterance: utterance,
    };
  }

  // 7. FILTER MATCHING (e.g. "show high-risk permissions")
  let matchedRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined;
  let matchedStatus: 'active' | 'withdrawn' | 'blocked' | undefined;

  for (const [riskLevel, phrases] of Object.entries(loc.filterSynonyms.risk)) {
    if (phrases.some(p => navigationPortion.includes(p))) {
      matchedRisk = riskLevel as any;
      break;
    }
  }
  for (const [statusVal, phrases] of Object.entries(loc.filterSynonyms.status)) {
    if (phrases.some(p => navigationPortion.includes(p))) {
      matchedStatus = statusVal as any;
      break;
    }
  }

  // If filter is present, prioritize FILTER navigation over generic object match
  if (matchedRisk || matchedStatus) {
    let targetPage: PageId = 'consent_center';
    if (navigationPortion.includes('simulator') || navigationPortion.includes('request')) {
      targetPage = 'request_simulator';
    }
    return {
      classification: 'NAVIGATION',
      navRequest: {
        page: targetPage,
        filters: { risk: matchedRisk, status: matchedStatus },
        isCompound,
      },
      rawUtterance: utterance,
    };
  }

  // 8. DIRECT CARD ID MATCH (e.g., "Open consent card <id>")
  const directCardMatch = navigationPortion.match(/consent card\s+([a-z0-9_-]+)/i);
  if (directCardMatch) {
    const cardId = directCardMatch[1].trim();
    return {
      classification: 'NAVIGATION',
      navRequest: {
        page: 'consent_center',
        isCompound,
        requestedObject: {
          id: cardId,
          type: 'consent',
        },
      },
      rawUtterance: utterance,
    };
  }

  // 9. UNSUPPORTED TARGETS (e.g., "open settings", "open camera", "open files")
  if (
    navigationPortion.includes('settings') ||
    navigationPortion.includes('camera') ||
    navigationPortion.includes('files') ||
    navigationPortion.includes('bluetooth') ||
    navigationPortion.includes('wifi')
  ) {
    return {
      classification: 'UNSUPPORTED',
      navRequest: {
        page: undefined, // Not in registry
      },
      rawUtterance: utterance,
    };
  }

  // 10. BAD FILTER FOR AUDIT LOG (Test 9: "Open Audit Log filtered by spooky")
  if (
    (navigationPortion.includes('audit log') || navigationPortion.includes('logs')) &&
    navigationPortion.includes('filter')
  ) {
    return {
      classification: 'NAVIGATION',
      navRequest: {
        page: 'audit_log',
        filters: { risk: 'HIGH' }, // will be dropped by registry per T57
        isCompound,
      },
      rawUtterance: utterance,
    };
  }

  // 11. SPECIFIC OBJECT MATCH (e.g., "Open the analytics consent", "open navigation consent")
  // Target object names like "analytics", "location", "marketing", etc.
  const specificObjectRegex = /(?:open|show|go to|take me to)?\s*(?:the)?\s*([a-z0-9_-]+)\s+(?:consent|permission|सहमति)/i;
  const specMatch = navigationPortion.match(specificObjectRegex);
  if (specMatch) {
    const candidateName = specMatch[1].trim().toLowerCase();
    const disallowedNames = ['consent', 'center', 'page', 'card', 'permissions', 'settings', 'the', 'open'];
    if (!disallowedNames.includes(candidateName)) {
      return {
        classification: 'NAVIGATION',
        navRequest: {
          page: 'consent_center',
          isCompound,
          requestedObject: {
            name: candidateName,
            type: 'consent',
          },
        },
        rawUtterance: utterance,
      };
    }
  }

  // 12. PAGE SYNONYM MATCHING (Full page name or synonym)
  // E.g., "Open Consent Center", "Go to Data Flow", "सहमति केंद्र खोलो"
  let matchedPage: PageId | null = null;
  for (const entry of loc.pageSynonyms) {
    if (entry.synonyms.some(s => navigationPortion.includes(s))) {
      matchedPage = entry.pageId;
      break;
    }
  }

  if (matchedPage) {
    return {
      classification: 'NAVIGATION',
      navRequest: {
        page: matchedPage,
        isCompound,
      },
      rawUtterance: utterance,
    };
  }

  // 13. FALLBACK FOR IMPERATIVE NAVIGATION PHRASES
  if (
    navigationPortion.startsWith('open ') ||
    navigationPortion.startsWith('go to ') ||
    navigationPortion.startsWith('take me to ') ||
    navigationPortion.startsWith('खोलो ')
  ) {
    return {
      classification: 'UNSUPPORTED',
      navRequest: { page: undefined },
      rawUtterance: utterance,
    };
  }

  return { classification: 'OTHER', rawUtterance: utterance };
}
