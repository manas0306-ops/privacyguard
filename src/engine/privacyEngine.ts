import {
  ConsentRecord,
  DataRequest,
  EngineEvaluation,
  PrivacyScoreBreakdown,
  DataAsset,
  DecisionType
} from '../types/privacy';

/**
 * Standard minimal data requirements defined by Privacy-by-Design standards (GDPR Art. 5(1)(c) Data Minimization)
 */
export const MINIMUM_NECESSARY_DATA_MAP: Record<string, string[]> = {
  'Weather': ['City', 'Country', 'General Location', 'Approximate Location'],
  'Navigation': ['Location', 'Approximate Location', 'GPS Coordinates', 'Exact GPS'],
  'Analytics': ['Session Duration', 'Crash Logs', 'App Version', 'Device Model'],
  'Advertising': ['Anonymized Segment ID'],
  'Personalization': ['Language Preference', 'Theme Selection'],
  'Health Tracking': ['Daily Step Count', 'Active Minutes'],
  'Account Management': ['Account Email', 'Username']
};

/**
 * High-sensitivity data categories
 */
export const HIGH_SENSITIVITY_DATA = [
  'Exact GPS',
  'Location',
  'Contacts',
  'Health Metrics',
  'Heart Rate',
  'Biometrics',
  'Financial Data',
  'Purchase History'
];

export interface EnginePolicyState {
  consents: ConsentRecord[];
  isLockdownActive: boolean;
  blockedRequestsCount: number;
  dataAssets: DataAsset[];
}

/**
 * Central Privacy Engine Evaluation
 * Answering the 4 foundational questions:
 * 1. WHAT data is being requested?
 * 2. WHY is it being requested?
 * 3. DOES the user have consented to that purpose?
 * 4. IS that data actually necessary?
 */
export function evaluateRequest(
  request: DataRequest,
  policy: EnginePolicyState
): EngineEvaluation {
  const timestamp = new Date().toISOString();
  const detailedReasons: string[] = [];
  const requestedData = request.requestedData || [];

  // Check 0: Emergency Privacy Lockdown Mode
  if (policy.isLockdownActive) {
    const isCriticalEssential = request.purpose.toLowerCase() === 'navigation' && 
                                request.service.toLowerCase().includes('maps');
    
    if (!isCriticalEssential) {
      return {
        decision: 'BLOCK',
        reason: 'Privacy Lockdown is ACTIVE: All non-essential telemetry, background trackers, and commercial profiling are strictly blocked.',
        detailedReasons: [
          'System is operating under Emergency Privacy Lockdown posture.',
          `Request from "${request.service}" for purpose "${request.purpose}" is classified as non-essential.`,
          'Zero data egress permitted to third-party endpoints.'
        ],
        risk: 'CRITICAL',
        originalRequestedData: requestedData,
        allowedData: [],
        unnecessaryData: requestedData,
        consentCheckPassed: false,
        purposeCheckPassed: false,
        minimizationPassed: false,
        violatedPolicy: 'LOCKDOWN_ENFORCEMENT',
        timestamp
      };
    }
  }

  // Check 1: Find Consent Records for the requested data categories
  // Normalize strings for matching
  const matchingConsents = policy.consents.filter(c => {
    // Check if consent data required matches any requested data (or category)
    const matchesData = requestedData.some(d => 
      c.dataRequired.some(cr => cr.toLowerCase() === d.toLowerCase()) ||
      c.category.toLowerCase() === d.toLowerCase() ||
      (d.toLowerCase().includes('location') && c.category.toLowerCase() === 'location') ||
      (d.toLowerCase().includes('gps') && c.category.toLowerCase() === 'location')
    );
    return matchesData;
  });

  // 1a: Check if consent exists at all
  if (matchingConsents.length === 0) {
    detailedReasons.push(`No active consent record registered for data categories: [${requestedData.join(', ')}].`);
    return {
      decision: 'BLOCK',
      reason: `No consent found authorizing "${request.service}" to collect [${requestedData.join(', ')}].`,
      detailedReasons,
      risk: 'HIGH',
      originalRequestedData: requestedData,
      allowedData: [],
      unnecessaryData: requestedData,
      consentCheckPassed: false,
      purposeCheckPassed: false,
      minimizationPassed: false,
      violatedPolicy: 'CONSENT_MISSING',
      timestamp
    };
  }

  // 1b: Check if any matching consent is WITHDRAWN or DISABLED
  const activeConsents = matchingConsents.filter(c => c.status === 'ACTIVE');
  const inactiveConsents = matchingConsents.filter(c => c.status !== 'ACTIVE');

  if (activeConsents.length === 0 && inactiveConsents.length > 0) {
    const statusNote = inactiveConsents[0].status === 'WITHDRAWN' ? 'withdrawn by user' : 'disabled';
    detailedReasons.push(`Consent for ${inactiveConsents[0].category} was explicitly ${statusNote}.`);
    detailedReasons.push(`Service "${request.service}" attempted access against a revoked authorization.`);

    return {
      decision: 'BLOCK',
      reason: `Consent for ${inactiveConsents[0].category} is ${inactiveConsents[0].status}. Access denied.`,
      detailedReasons,
      risk: 'CRITICAL',
      originalRequestedData: requestedData,
      allowedData: [],
      unnecessaryData: requestedData,
      consentCheckPassed: false,
      purposeCheckPassed: false,
      minimizationPassed: false,
      violatedPolicy: 'CONSENT_REVOKED',
      timestamp
    };
  }

  // Check 2: PURPOSE VERIFICATION (The Heart of the System)
  // Does the user's active consent authorize THIS specific purpose?
  const normalizedReqPurpose = request.purpose.trim().toLowerCase();
  
  // Find active consents that match the exact purpose or service
  const purposeAuthorizedConsents = activeConsents.filter(c => {
    const consentPurpose = c.purpose.trim().toLowerCase();
    return consentPurpose === normalizedReqPurpose || 
           (consentPurpose === 'navigation' && normalizedReqPurpose === 'navigation') ||
           (consentPurpose === 'analytics' && normalizedReqPurpose === 'analytics') ||
           (consentPurpose === 'weather' && (normalizedReqPurpose === 'weather' || normalizedReqPurpose === 'forecast'));
  });

  if (purposeAuthorizedConsents.length === 0) {
    // Purpose mismatch!
    const allowedPurposes = Array.from(new Set(activeConsents.map(c => c.purpose))).join(', ');
    const dataDesc = requestedData.join(', ');
    
    detailedReasons.push(`Your policy authorizes ${dataDesc} strictly for: "${allowedPurposes}".`);
    detailedReasons.push(`Incoming request specified unauthorized purpose: "${request.purpose}".`);
    detailedReasons.push(`Purpose limitation principle violated (GDPR Art. 5(1)(b)).`);

    return {
      decision: 'BLOCK',
      reason: `Your consent allows ${dataDesc} for "${allowedPurposes}", not "${request.purpose}".`,
      detailedReasons,
      risk: 'HIGH',
      originalRequestedData: requestedData,
      allowedData: [],
      unnecessaryData: requestedData,
      consentCheckPassed: true,
      purposeCheckPassed: false,
      minimizationPassed: false,
      violatedPolicy: 'PURPOSE_MISMATCH',
      timestamp
    };
  }

  // Check 3: DATA MINIMIZATION ENGINE (Privacy by Design)
  // Even when purpose is authorized, does the service need ALL of this data?
  const standardNecessaryForPurpose = MINIMUM_NECESSARY_DATA_MAP[request.purpose] || 
                                      MINIMUM_NECESSARY_DATA_MAP[purposeAuthorizedConsents[0].purpose] || 
                                      [];

  const necessaryData: string[] = [];
  const unnecessaryData: string[] = [];

  requestedData.forEach(item => {
    // Normalization check against purpose requirements
    const isNecessary = standardNecessaryForPurpose.some(nec => 
      nec.toLowerCase() === item.toLowerCase() ||
      item.toLowerCase().includes(nec.toLowerCase()) ||
      nec.toLowerCase().includes(item.toLowerCase())
    );

    // Explicit high-risk overcollection flags:
    // Weather NEVER needs Contacts, Device ID, or Exact GPS (City is sufficient)
    if (normalizedReqPurpose.includes('weather')) {
      if (item.toLowerCase().includes('contact') || 
          item.toLowerCase().includes('device id') || 
          item.toLowerCase().includes('exact gps')) {
        unnecessaryData.push(item);
        return;
      }
    }

    // Analytics NEVER needs exact location or contacts
    if (normalizedReqPurpose.includes('analytics')) {
      if (item.toLowerCase().includes('location') || 
          item.toLowerCase().includes('gps') || 
          item.toLowerCase().includes('contact')) {
        unnecessaryData.push(item);
        return;
      }
    }

    if (isNecessary) {
      necessaryData.push(item);
    } else {
      unnecessaryData.push(item);
    }
  });

  // If there is unnecessary/excessive data requested
  if (unnecessaryData.length > 0) {
    detailedReasons.push(`Service requested ${requestedData.length} data points, but only ${necessaryData.length || 1} is strictly required for "${request.purpose}".`);
    detailedReasons.push(`Potentially unnecessary / intrusive attributes identified: [${unnecessaryData.join(', ')}].`);
    detailedReasons.push(`Data Minimization Principle applied: Over-collection flagged.`);

    return {
      decision: 'ALLOW_MINIMUM',
      risk: unnecessaryData.some(d => HIGH_SENSITIVITY_DATA.includes(d)) ? 'MEDIUM' : 'LOW',
      reason: `The requested data exceeds the minimum needed for "${request.purpose}". Recommended safe subset available.`,
      detailedReasons,
      originalRequestedData: requestedData,
      allowedData: necessaryData.length > 0 ? necessaryData : ['Approximate Region / City'],
      unnecessaryData,
      consentCheckPassed: true,
      purposeCheckPassed: true,
      minimizationPassed: false,
      violatedPolicy: 'DATA_OVERCOLLECTION',
      timestamp
    };
  }

  // Check 4: Fully Compliant Request
  detailedReasons.push(`Active consent verified for "${request.service}".`);
  detailedReasons.push(`Purpose "${request.purpose}" matches authorized scope.`);
  detailedReasons.push(`Requested attributes [${requestedData.join(', ')}] meet strict data minimization standards.`);

  return {
    decision: 'ALLOW',
    risk: 'LOW',
    reason: `Request approved: Satisfies purpose limitation and data minimization policies.`,
    detailedReasons,
    originalRequestedData: requestedData,
    allowedData: requestedData,
    unnecessaryData: [],
    consentCheckPassed: true,
    purposeCheckPassed: true,
    minimizationPassed: true,
    violatedPolicy: null,
    timestamp
  };
}

/**
 * Transparent Privacy Score Calculation
 * Based on live state variables (no random numbers!)
 */
export function calculatePrivacyScore(
  consents: ConsentRecord[],
  dataAssets: DataAsset[],
  blockedRequestsCount: number,
  isLockdownActive: boolean,
  pendingDeletionCount: number
): PrivacyScoreBreakdown {
  const baseScore = 100;
  const deductions: { label: string; points: number; description: string; count: number }[] = [];
  const recommendations: string[] = [];

  // Factor 1: Active High-Sensitivity Consents without strict necessity (4 pts each)
  const highRiskActiveConsents = consents.filter(c => 
    c.status === 'ACTIVE' && 
    c.isOptional && 
    (c.category === 'Location' || c.purpose === 'Marketing' || c.purpose === 'Profiling')
  );
  if (highRiskActiveConsents.length > 0) {
    const pts = highRiskActiveConsents.length * 4;
    deductions.push({
      label: 'Optional High-Risk Consents',
      points: pts,
      description: `${highRiskActiveConsents.length} optional permissions granting access to sensitive data (e.g., Marketing, Continuous Tracking).`,
      count: highRiskActiveConsents.length
    });
    recommendations.push(`Review and withdraw optional marketing or location tracking permissions.`);
  }

  // Factor 2: Retention Warnings / Data Aging (3 pts each)
  const expiringAssets = dataAssets.filter(a => a.daysRemaining <= 5 && a.consentStatus === 'ACTIVE');
  if (expiringAssets.length > 0) {
    const pts = expiringAssets.length * 3;
    deductions.push({
      label: 'Retention Limit Approaching',
      points: pts,
      description: `${expiringAssets.length} data categories approaching retention expiration without scheduled erasure.`,
      count: expiringAssets.length
    });
    recommendations.push(`Purge or archive records nearing their 30-day/90-day retention cutoff.`);
  }

  // Factor 3: Third-Party Service Surface Area (2 pts per third-party tracker)
  const thirdPartyServices = new Set(consents.filter(c => c.status === 'ACTIVE').map(c => c.service));
  const excessiveThirdParties = Math.max(0, thirdPartyServices.size - 2);
  if (excessiveThirdParties > 0) {
    const pts = excessiveThirdParties * 2;
    deductions.push({
      label: 'Third-Party Exposure Surface',
      points: pts,
      description: `${thirdPartyServices.size} active external services holding personal data tokens.`,
      count: excessiveThirdParties
    });
    recommendations.push(`Restrict non-essential analytics vendors to reduce attack surface.`);
  }

  // Factor 4: Blocked Threat Invasions (Credit or Penalty context)
  // If recent blocked requests exist, it indicates active tracking attempts (2 pts penalty per blocked leak attempt)
  if (blockedRequestsCount > 0) {
    const pts = Math.min(10, blockedRequestsCount * 2);
    deductions.push({
      label: 'Intercepted Surveillance Attempts',
      points: pts,
      description: `${blockedRequestsCount} inbound data exfiltration attempts intercepted by PrivacyGuard.`,
      count: blockedRequestsCount
    });
  }

  // Calculate final score
  let totalDeductions = deductions.reduce((acc, curr) => acc + curr.points, 0);

  // Bonus: Privacy Lockdown adds +10 resilience bonus
  if (isLockdownActive) {
    totalDeductions = Math.max(0, totalDeductions - 12);
  }

  // Bonus: Pending/Completed Deletion requests improve posture
  if (pendingDeletionCount > 0) {
    totalDeductions = Math.max(0, totalDeductions - 3);
  }

  const finalScore = Math.max(25, Math.min(100, baseScore - totalDeductions));

  return {
    score: finalScore,
    baseScore,
    deductions,
    recommendations
  };
}
