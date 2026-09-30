export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ConsentStatus = 'ACTIVE' | 'DISABLED' | 'WITHDRAWN';

export type DecisionType = 'ALLOW' | 'ALLOW_MINIMUM' | 'BLOCK';

export type AuditDecisionType = DecisionType | 'WITHDRAW' | 'ERASURE' | 'LOCKDOWN_ON' | 'LOCKDOWN_OFF' | 'CONSENT_UPDATE';

export interface DataAsset {
  id: string;
  category: string; // e.g. "Location", "Device Information", "Analytics", "Purchase History", "Preferences", "Health Metrics"
  collectedAttributes: string[]; // e.g. ["Latitude", "Longitude", "Movement Velocity", "City"]
  purpose: string; // e.g. "Navigation", "Fraud Detection"
  service: string; // e.g. "Maps Service", "Payment Gateway"
  retentionDays: number;
  daysRemaining: number;
  sensitivity: SensitivityLevel;
  consentStatus: ConsentStatus;
  lastAccessed: string;
  recordsCount: number;
  sampleData: Record<string, string>;
}

export interface ConsentRecord {
  id: string;
  category: string;
  purpose: string; // e.g. "Navigation", "Analytics", "Personalization", "Marketing"
  dataRequired: string[]; // e.g. ["Location", "GPS"]
  service: string; // e.g. "Maps Service", "Analytics SDK", "AdNetwork Pro"
  status: ConsentStatus;
  isOptional: boolean;
  retentionDays: number;
  description: string;
  updatedAt: string;
}

export interface ServiceProfile {
  id: string;
  name: string;
  category: 'NAVIGATION' | 'ANALYTICS' | 'ADVERTISING' | 'WEATHER' | 'COMMERCE' | 'UTILITY';
  domain: string;
  trustScore: number; // 0 - 100
  dataAccessList: string[];
  activeConnections: number;
}

export interface DataRequest {
  id: string;
  service: string; // e.g. "Advertising Service", "Weather Service"
  requestedData: string[]; // e.g. ["Location", "Exact GPS", "Contacts", "Device ID"]
  purpose: string; // e.g. "Advertising", "Weather", "Analytics", "Navigation"
  timestamp?: string;
}

export interface EngineEvaluation {
  decision: DecisionType;
  reason: string;
  detailedReasons: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  originalRequestedData: string[];
  allowedData: string[];
  unnecessaryData: string[];
  consentCheckPassed: boolean;
  purposeCheckPassed: boolean;
  minimizationPassed: boolean;
  violatedPolicy: string | null;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  actor: string;
  data: string[];
  purpose: string;
  decision: AuditDecisionType;
  reason: string;
  risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evaluation?: EngineEvaluation;
}

export interface DeletionRequest {
  id: string;
  categories: string[];
  requestedAt: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED';
  progress: number;
  targetServices: string[];
  confirmedRecordsCount: number;
}

export interface ScoreDeduction {
  label: string;
  points: number;
  description: string;
  count: number;
}

export interface PrivacyScoreBreakdown {
  score: number;
  baseScore: number;
  deductions: ScoreDeduction[];
  recommendations: string[];
}
