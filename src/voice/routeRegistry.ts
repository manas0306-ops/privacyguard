/**
 * PRIVACYGUARD VOICE ASSISTANT - ROUTE REGISTRY
 * Single source of truth for all navigable pages, allowed parameters, and allowed filters.
 */

export type PageId =
  | 'dashboard'
  | 'my_data'
  | 'consent_center'
  | 'request_simulator'
  | 'data_flow'
  | 'audit_log'
  | 'security_center'
  | 'privacy_copilot';

export interface NavParams {
  consentId?: string;
  dataCategory?: string;
  serviceId?: string;
  requestId?: string;
}

export interface NavFilters {
  risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'active' | 'withdrawn' | 'blocked';
}

export interface PageRegistryEntry {
  pageId: PageId;
  canonicalName: string;
  allowedParams: Array<keyof NavParams>;
  allowedFilters: Array<keyof NavFilters>;
}

export const CANONICAL_PAGES: PageId[] = [
  'dashboard',
  'my_data',
  'consent_center',
  'request_simulator',
  'data_flow',
  'audit_log',
  'security_center',
  'privacy_copilot',
];

export const ROUTE_REGISTRY: Record<PageId, PageRegistryEntry> = {
  dashboard: {
    pageId: 'dashboard',
    canonicalName: 'Dashboard',
    allowedParams: [],
    allowedFilters: [],
  },
  my_data: {
    pageId: 'my_data',
    canonicalName: 'My Data',
    allowedParams: ['dataCategory'],
    allowedFilters: [],
  },
  consent_center: {
    pageId: 'consent_center',
    canonicalName: 'Consent Center',
    allowedParams: ['consentId'],
    allowedFilters: ['risk', 'status'],
  },
  request_simulator: {
    pageId: 'request_simulator',
    canonicalName: 'Request Simulator',
    allowedParams: ['requestId'],
    allowedFilters: ['status'],
  },
  data_flow: {
    pageId: 'data_flow',
    canonicalName: 'Data Flow',
    allowedParams: ['serviceId'],
    allowedFilters: [],
  },
  audit_log: {
    pageId: 'audit_log',
    canonicalName: 'Audit Log',
    allowedParams: [],
    allowedFilters: [], // none in MVP
  },
  security_center: {
    pageId: 'security_center',
    canonicalName: 'Security Center',
    allowedParams: [],
    allowedFilters: [],
  },
  privacy_copilot: {
    pageId: 'privacy_copilot',
    canonicalName: 'Privacy Copilot',
    allowedParams: [],
    allowedFilters: [],
  },
};

/**
 * Validates if a raw identifier belongs to the canonical 8-page registry
 */
export function isPageInRegistry(page: string): page is PageId {
  return CANONICAL_PAGES.includes(page as PageId);
}

/**
 * Returns parameter keys allowed for a given page
 */
export function getAllowedParams(page: PageId): Array<keyof NavParams> {
  return ROUTE_REGISTRY[page]?.allowedParams || [];
}

/**
 * Returns filter keys allowed for a given page
 */
export function getAllowedFilters(page: PageId): Array<keyof NavFilters> {
  return ROUTE_REGISTRY[page]?.allowedFilters || [];
}

/**
 * Sanitizes filters according to page permissions.
 * Unsupported filters are dropped and recorded.
 */
export function filterSupportedFilters(
  page: PageId,
  filters?: NavFilters
): { supported?: NavFilters; dropped: string[] } {
  if (!filters) {
    return { supported: undefined, dropped: [] };
  }

  const allowed = getAllowedFilters(page);
  const supported: NavFilters = {};
  const dropped: string[] = [];

  for (const key of Object.keys(filters) as Array<keyof NavFilters>) {
    if (filters[key] !== undefined) {
      if (allowed.includes(key)) {
        supported[key] = filters[key] as any;
      } else {
        dropped.push(key);
      }
    }
  }

  return {
    supported: Object.keys(supported).length > 0 ? supported : undefined,
    dropped,
  };
}
