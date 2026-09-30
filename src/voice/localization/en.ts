/**
 * English Voice Assistant Localization & Synonym Maps
 */

import { PageId } from '../routeRegistry';

export const enLocalization = {
  strings: {
    'nav.opening': 'Opening {page}.',
    'nav.opening_object': 'Opening the {object} consent.',
    'nav.showing_filtered': 'Showing {count} {filter} permissions.',
    'nav.already_there': "You're already on {page}.",
    'nav.going_back': 'Going back to {page}.',
    'nav.no_history': "There's no previous page. Nothing changed.",
    'nav.ambiguous': 'Which one did you mean: {options}?',
    'nav.unsupported_with_list':
      'I can open Dashboard, My Data, Consent Center, Request Simulator, Data Flow, Audit Log, Security Center, or Privacy Copilot.',
    'nav.object_not_found': "I couldn't find that item. You're still on {currentPage}.",
    'nav.router_failed': "I couldn't open {page}. You're still on {currentPage}.",
    'nav.filter_dropped': "I opened {page} but couldn't apply that filter.",
    'nav.compound_followup': "Opened {page}. I haven't changed anything. Want me to prepare that change?",
    'nav.pending_action': 'You have a pending action. Say confirm or cancel first.',
    'nav.cancelled_action': 'Action cancelled. No changes were made.',
  },

  pageNames: {
    dashboard: 'Dashboard',
    my_data: 'My Data',
    consent_center: 'Consent Center',
    request_simulator: 'Request Simulator',
    data_flow: 'Data Flow',
    audit_log: 'Audit Log',
    security_center: 'Security Center',
    privacy_copilot: 'Privacy Copilot',
  } as Record<PageId, string>,

  // Synonyms mapping user utterances to canonical PageId
  pageSynonyms: [
    { synonyms: ['dashboard', 'home', 'main page', 'overview'], pageId: 'dashboard' as PageId },
    { synonyms: ['my data', 'data inventory', 'inventory', 'personal data', 'my data inventory', 'stored data'], pageId: 'my_data' as PageId },
    { synonyms: ['consent center', 'consent page', 'consents', 'permissions', 'consent management', 'permission settings'], pageId: 'consent_center' as PageId },
    { synonyms: ['request simulator', 'simulator', 'test requests', 'firewall test', 'simulation'], pageId: 'request_simulator' as PageId },
    { synonyms: ['data flow', 'data flow map', 'flow map', 'flow diagram', 'data map', 'map'], pageId: 'data_flow' as PageId },
    { synonyms: ['audit log', 'audit logs', 'logs', 'audit', 'activity log', 'history log'], pageId: 'audit_log' as PageId },
    { synonyms: ['security center', 'security', 'firewall status', 'lockdown center'], pageId: 'security_center' as PageId },
    { synonyms: ['privacy copilot', 'copilot', 'assistant', 'ai copilot', 'privacy assistant', 'chat'], pageId: 'privacy_copilot' as PageId },
  ],

  // Filter word triggers
  filterSynonyms: {
    risk: {
      CRITICAL: ['critical risk', 'critical permissions'],
      HIGH: ['high-risk', 'high risk', 'risky'],
      MEDIUM: ['medium risk'],
      LOW: ['low risk'],
    },
    status: {
      active: ['active', 'enabled', 'active permissions', 'active consents'],
      withdrawn: ['withdrawn', 'revoked', 'disabled'],
      blocked: ['blocked', 'rejected'],
    },
  },

  // Back navigation triggers
  backPhrases: ['go back', 'back', 'previous page', 'take me back', 'return', 'previous'],

  // Confirmation lexicon
  confirmLexicon: ['confirm', 'yes', 'proceed', 'approve', 'do it', 'apply', 'ok', 'sure'],

  // Cancellation lexicon
  cancelLexicon: ['cancel', 'no', 'stop', 'abort', 'dismiss', 'never mind', 'reject'],

  // Pronoun anaphora
  anaphoraPhrases: ['review it', 'show me', 'open it', 'take me there', 'look at that', 'view it'],
};
