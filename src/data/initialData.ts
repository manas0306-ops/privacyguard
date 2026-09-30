import { DataAsset, ConsentRecord, ServiceProfile, AuditEvent } from '../types/privacy';

export const INITIAL_DATA_ASSETS: DataAsset[] = [
  {
    id: 'da-loc',
    category: 'Location',
    collectedAttributes: ['Latitude', 'Longitude', 'Altitude', 'Movement Velocity', 'Frequent Routes'],
    purpose: 'Navigation & Turn-by-Turn Routing',
    service: 'Maps Service',
    retentionDays: 30,
    daysRemaining: 3, // Approaching retention limit -> triggers retention alert!
    sensitivity: 'HIGH',
    consentStatus: 'ACTIVE',
    lastAccessed: '12 mins ago',
    recordsCount: 1420,
    sampleData: {
      'Current Coord': '37.7749° N, 122.4194° W',
      'Accuracy Radius': '± 4.2 meters',
      'Last Geofence': 'Home Sector Alpha',
      'Speed Vector': '0.0 km/h (Stationary)'
    }
  },
  {
    id: 'da-dev',
    category: 'Device Information',
    collectedAttributes: ['Device Model', 'OS Build', 'Battery Level', 'Screen Resolution', 'WiFi SSID'],
    purpose: 'Security Verification & Hardware Compatibility',
    service: 'Auth Provider',
    retentionDays: 180,
    daysRemaining: 120,
    sensitivity: 'LOW',
    consentStatus: 'ACTIVE',
    lastAccessed: '1 hour ago',
    recordsCount: 45,
    sampleData: {
      'Hardware': 'Apple Silicon MacBook / iPhone 16 Pro',
      'OS Platform': 'Darwin 24.1.0',
      'Battery State': '88% (Discharging)',
      'Network': 'WPA3 Enterprise (Shielded)'
    }
  },
  {
    id: 'da-ana',
    category: 'Analytics',
    collectedAttributes: ['Session Duration', 'Button Clicks', 'Scroll Depth', 'Feature Latency'],
    purpose: 'Performance Monitoring & Reliability',
    service: 'Telemetry Engine',
    retentionDays: 60,
    daysRemaining: 24,
    sensitivity: 'LOW',
    consentStatus: 'ACTIVE',
    lastAccessed: '3 mins ago',
    recordsCount: 8940,
    sampleData: {
      'Session Time': '14m 22s',
      'Interactions': '38 events logged',
      'Crash Free Rate': '99.98%',
      'Render Latency': '12.4ms'
    }
  },
  {
    id: 'da-pur',
    category: 'Purchase History',
    collectedAttributes: ['Order IDs', 'Transaction Amounts', 'Billing Postal Code', 'Payment Token'],
    purpose: 'Order Fulfillment & Tax Records',
    service: 'Checkout Gateway',
    retentionDays: 365,
    daysRemaining: 280,
    sensitivity: 'HIGH',
    consentStatus: 'ACTIVE',
    lastAccessed: '2 days ago',
    recordsCount: 12,
    sampleData: {
      'Last Purchase': '$49.00 (Pro Security Bundle)',
      'Token Ref': 'tok_sec_993817x',
      'Billing Region': 'California, US',
      'Risk Classification': '0.01 (Clean)'
    }
  },
  {
    id: 'da-pre',
    category: 'Preferences',
    collectedAttributes: ['Dark Mode Toggle', 'Language code', 'Notification Cadence', 'Accessibility Scale'],
    purpose: 'User Interface Customization',
    service: 'UI Settings',
    retentionDays: 365,
    daysRemaining: 310,
    sensitivity: 'LOW',
    consentStatus: 'ACTIVE',
    lastAccessed: 'Just now',
    recordsCount: 8,
    sampleData: {
      'Interface Theme': 'Dark Stealth',
      'Language': 'en-US',
      'High Contrast': 'Disabled',
      'Audit Alerts': 'Real-time Push'
    }
  },
  {
    id: 'da-hea',
    category: 'Health Metrics',
    collectedAttributes: ['Daily Steps', 'Resting Heart Rate', 'Sleep Duration', 'Active Calories'],
    purpose: 'Wellness Tracking & Step Goals',
    service: 'HealthSync Pro',
    retentionDays: 90,
    daysRemaining: 48,
    sensitivity: 'HIGH',
    consentStatus: 'ACTIVE',
    lastAccessed: '5 hours ago',
    recordsCount: 720,
    sampleData: {
      'Steps Today': '8,420 steps',
      'Avg Heart Rate': '68 bpm',
      'Sleep Logged': '7h 45m',
      'Activity Score': 'Optimal'
    }
  }
];

export const INITIAL_CONSENTS: ConsentRecord[] = [
  {
    id: 'c-nav',
    category: 'Location',
    purpose: 'Navigation',
    dataRequired: ['Location', 'Approximate Location', 'GPS Coordinates'],
    service: 'Maps Service',
    status: 'ACTIVE',
    isOptional: false,
    retentionDays: 30,
    description: 'Enables live turn-by-turn guidance and route optimization.',
    updatedAt: '2 days ago'
  },
  {
    id: 'c-ana',
    category: 'Analytics',
    purpose: 'Analytics',
    dataRequired: ['Session Duration', 'Crash Logs', 'App Version'],
    service: 'Analytics Service',
    status: 'ACTIVE',
    isOptional: true,
    retentionDays: 60,
    description: 'Collects anonymized performance metrics to resolve crashes.',
    updatedAt: '1 week ago'
  },
  {
    id: 'c-per',
    category: 'Preferences',
    purpose: 'Personalization',
    dataRequired: ['Language Preference', 'Theme Selection'],
    service: 'UI Settings',
    status: 'ACTIVE',
    isOptional: true,
    retentionDays: 365,
    description: 'Customizes application layout, appearance, and accessibility.',
    updatedAt: '3 weeks ago'
  },
  {
    id: 'c-mkt',
    category: 'Marketing',
    purpose: 'Marketing',
    dataRequired: ['Browsing Interests', 'Ad Segment ID'],
    service: 'AdNetwork Pro',
    status: 'ACTIVE',
    isOptional: true,
    retentionDays: 14,
    description: 'Commercial interest grouping for promotional offers.',
    updatedAt: '1 month ago'
  },
  {
    id: 'c-hea',
    category: 'Health Metrics',
    purpose: 'Health Tracking',
    dataRequired: ['Daily Step Count', 'Active Minutes'],
    service: 'HealthSync Pro',
    status: 'ACTIVE',
    isOptional: true,
    retentionDays: 90,
    description: 'Synchronizes activity rings and daily wellness achievements.',
    updatedAt: '5 days ago'
  },
  {
    id: 'c-wea',
    category: 'Weather',
    purpose: 'Weather',
    dataRequired: ['City', 'Country', 'General Location'],
    service: 'Weather Service',
    status: 'ACTIVE',
    isOptional: true,
    retentionDays: 7,
    description: 'Local temperature, precipitation warnings, and air quality.',
    updatedAt: '1 day ago'
  }
];

export const INITIAL_SERVICES: ServiceProfile[] = [
  {
    id: 'srv-maps',
    name: 'Maps Service',
    category: 'NAVIGATION',
    domain: 'maps.navigation-api.net',
    trustScore: 94,
    dataAccessList: ['Location', 'GPS Coordinates'],
    activeConnections: 1
  },
  {
    id: 'srv-analytics',
    name: 'Analytics Service',
    category: 'ANALYTICS',
    domain: 'telemetry.global-insights.io',
    trustScore: 78,
    dataAccessList: ['Session Duration', 'Crash Logs'],
    activeConnections: 2
  },
  {
    id: 'srv-adnetwork',
    name: 'Advertising Service',
    category: 'ADVERTISING',
    domain: 'tracker.adnetwork-edge.com',
    trustScore: 42,
    dataAccessList: ['Anonymized Segment ID'],
    activeConnections: 0
  },
  {
    id: 'srv-weather',
    name: 'Weather Service',
    category: 'WEATHER',
    domain: 'api.weather-radar-stream.org',
    trustScore: 86,
    dataAccessList: ['City', 'Country'],
    activeConnections: 1
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeFormatted: '2 hours ago',
    actor: 'Maps Service',
    data: ['Location', 'Approximate Location'],
    purpose: 'Navigation',
    decision: 'ALLOW',
    reason: 'Verified active navigation consent and legitimate purpose match.',
    risk: 'LOW'
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    timeFormatted: '1 hour ago',
    actor: 'Advertising Service',
    data: ['Location'],
    purpose: 'Advertising',
    decision: 'BLOCK',
    reason: 'BLOCKED: Consent permits Location for Navigation, not Advertising.',
    risk: 'HIGH'
  },
  {
    id: 'aud-003',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    timeFormatted: '30 mins ago',
    actor: 'Weather Service',
    data: ['Exact GPS', 'Contacts', 'City'],
    purpose: 'Weather',
    decision: 'ALLOW_MINIMUM',
    reason: 'Data Minimization applied: Filtered out Contacts and Exact GPS; forwarded City only.',
    risk: 'MEDIUM'
  }
];
