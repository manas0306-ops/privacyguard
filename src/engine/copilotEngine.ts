import { ConsentRecord, DataAsset, AuditEvent, PrivacyScoreBreakdown } from '../types/privacy';

export interface CopilotAppContext {
  scoreBreakdown: PrivacyScoreBreakdown;
  consents: ConsentRecord[];
  dataAssets: DataAsset[];
  auditLogs: AuditEvent[];
  isLockdownActive: boolean;
  toggleLockdown?: () => void;
  withdrawConsent?: (id: string) => void;
  submitErasureRequest?: (categories: string[]) => void;
  resetDemoState?: () => void;
  setActiveTab?: (tab: string) => void;
}

/**
 * Robust Math & Calculation Evaluator
 */
export function evaluateMath(query: string): string | null {
  const clean = query.trim().toLowerCase();

  // Percentage calculations: e.g. "15% of 850", "calculate 20% of 1200"
  const percentageMatch = clean.match(/(?:what is|calculate)?\s*(\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(\d+(?:\.\d+)?)/i);
  if (percentageMatch) {
    const pct = parseFloat(percentageMatch[1]);
    const total = parseFloat(percentageMatch[2]);
    const res = (pct / 100) * total;
    return `🧮 **Mathematical Solution:**\n**${pct}%** of **${total.toLocaleString()}** = **${res.toLocaleString()}**`;
  }

  // Arithmetic and standard mathematical expressions
  let expr = clean
    .replace(/^what is\s+/i, '')
    .replace(/^calculate\s+/i, '')
    .replace(/^solve\s+/i, '')
    .replace(/^compute\s+/i, '')
    .replace(/equals\s*\?/i, '')
    .replace(/\?/g, '')
    .trim();

  // Handle sqrt, pow, trig
  let evalReady = expr
    .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
    .replace(/square root of\s+(\d+(?:\.\d+)?)/g, 'Math.sqrt($1)')
    .replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g, 'Math.pow($1, $2)')
    .replace(/sin\(([^)]+)\)/g, 'Math.sin($1)')
    .replace(/cos\(([^)]+)\)/g, 'Math.cos($1)')
    .replace(/abs\(([^)]+)\)/g, 'Math.abs($1)')
    .replace(/pi/g, 'Math.PI');

  // Verify only safe characters exist: digits, operators, parens, Math methods
  if (/^[0-9\.\s\+\-\*\/\(\)\,\^Math\.sqrtpowsincosabsPI]+$/.test(evalReady) && /[0-9]/.test(evalReady)) {
    try {
      const fn = new Function(`return (${evalReady})`);
      const val = fn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const rounded = Math.abs(val - Math.round(val)) < 1e-9 ? Math.round(val) : parseFloat(val.toFixed(6));
        return `🧮 **Mathematical Solution:**\n**${expr}** = **${rounded.toLocaleString()}**`;
      }
    } catch {
      // Not a valid math formula
    }
  }

  return null;
}

/**
 * Universal Unit & Measurement Conversions
 */
export function evaluateUnitConversion(query: string): string | null {
  const clean = query.trim().toLowerCase();

  // Miles <-> Kilometers
  const miToKm = clean.match(/(\d+(?:\.\d+)?)\s*(?:miles|mi)\s*(?:to|in)\s*(?:km|kilometers)/);
  if (miToKm) {
    const val = parseFloat(miToKm[1]);
    return `📏 **Unit Conversion:**\n${val} miles = **${(val * 1.60934).toFixed(3)} km**`;
  }
  const kmToMi = clean.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers)\s*(?:to|in)\s*(?:miles|mi)/);
  if (kmToMi) {
    const val = parseFloat(kmToMi[1]);
    return `📏 **Unit Conversion:**\n${val} km = **${(val / 1.60934).toFixed(3)} miles**`;
  }

  // Celsius <-> Fahrenheit
  const cToF = clean.match(/(-?\d+(?:\.\d+)?)\s*(?:c|celsius)\s*(?:to|in)\s*(?:f|fahrenheit)/);
  if (cToF) {
    const c = parseFloat(cToF[1]);
    const f = (c * 9/5) + 32;
    return `🌡️ **Temperature Conversion:**\n${c}°C = **${f.toFixed(2)}°F**`;
  }
  const fToC = clean.match(/(-?\d+(?:\.\d+)?)\s*(?:f|fahrenheit)\s*(?:to|in)\s*(?:c|celsius)/);
  if (fToC) {
    const f = parseFloat(fToC[1]);
    const c = (f - 32) * 5/9;
    return `🌡️ **Temperature Conversion:**\n${f}°F = **${c.toFixed(2)}°C**`;
  }

  // Pounds <-> Kilograms
  const lbsToKg = clean.match(/(\d+(?:\.\d+)?)\s*(?:lbs|pounds)\s*(?:to|in)\s*(?:kg|kilograms)/);
  if (lbsToKg) {
    const val = parseFloat(lbsToKg[1]);
    return `⚖️ **Weight Conversion:**\n${val} lbs = **${(val * 0.453592).toFixed(3)} kg**`;
  }
  const kgToLbs = clean.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms)\s*(?:to|in)\s*(?:lbs|pounds)/);
  if (kgToLbs) {
    const val = parseFloat(kgToLbs[1]);
    return `⚖️ **Weight Conversion:**\n${val} kg = **${(val / 0.453592).toFixed(3)} lbs**`;
  }

  // Digital storage: GB to MB, TB to GB
  const gbToMb = clean.match(/(\d+(?:\.\d+)?)\s*(?:gb|gigabytes)\s*(?:to|in)\s*(?:mb|megabytes)/);
  if (gbToMb) {
    const val = parseFloat(gbToMb[1]);
    return `💾 **Digital Storage Conversion:**\n${val} GB = **${(val * 1024).toLocaleString()} MB** (binary / MiB) or ${(val * 1000).toLocaleString()} MB (decimal)`;
  }

  return null;
}

/**
 * Interactive App Control & Actions
 */
export function handleAppActions(query: string, ctx: CopilotAppContext): string | null {
  const q = query.toLowerCase();

  // 1. Activate Privacy Lockdown
  if (q.includes('activate lockdown') || q.includes('turn on lockdown') || q.includes('enable lockdown') || q.includes('start lockdown')) {
    if (ctx.isLockdownActive) {
      return "🛡️ **Privacy Lockdown is already ACTIVE.** All non-essential telemetry and tracking requests are currently restricted.";
    }
    if (ctx.toggleLockdown) {
      ctx.toggleLockdown();
      return "🚨 **ACTION EXECUTED: PRIVACY LOCKDOWN ACTIVATED!**\n\nI have immediately restricted all optional third-party telemetry, blocked background trackers, and reinforced your firewall posture with a resilience hardening bonus.";
    }
  }

  // 2. Deactivate Privacy Lockdown
  if (q.includes('deactivate lockdown') || q.includes('turn off lockdown') || q.includes('disable lockdown')) {
    if (!ctx.isLockdownActive) {
      return "✅ **Privacy Lockdown is currently inactive.** The firewall is running under your standard custom consent rules.";
    }
    if (ctx.toggleLockdown) {
      ctx.toggleLockdown();
      return "🔓 **ACTION EXECUTED: PRIVACY LOCKDOWN DEACTIVATED.**\n\nStandard granular user consent policies have been restored.";
    }
  }

  // 3. Reset Demo State
  if (q.includes('reset demo') || q.includes('reset state') || q.includes('restart demo')) {
    if (ctx.resetDemoState) {
      ctx.resetDemoState();
      return "🔄 **ACTION EXECUTED: DEMO STATE RESET.**\n\nAll data assets, consents, and audit logs have been restored to initial pristine demonstration parameters.";
    }
  }

  // 4. Request Deletion / Erase Data
  if (q.includes('erase my location') || q.includes('delete location data') || q.includes('purge location')) {
    if (ctx.submitErasureRequest) {
      ctx.submitErasureRequest(['Location']);
      return "🗑️ **ACTION EXECUTED: GDPR ART. 17 ERASURE INITIATED.**\n\nI have dispatched a verified deletion ticket for your Location records across all connected downstream replicas. You can track completion in the Dashboard.";
    }
  }

  // 5. Navigate to tab
  if (q.includes('go to simulator') || q.includes('open simulator') || q.includes('launch simulator')) {
    if (ctx.setActiveTab) ctx.setActiveTab('simulator');
    return "🚀 **Navigated to Request Simulator.** You can now run live interception tests!";
  }
  if (q.includes('go to audit') || q.includes('open audit log') || q.includes('show audit')) {
    if (ctx.setActiveTab) ctx.setActiveTab('audit');
    return "📋 **Navigated to Audit Log.** Here is your immutable event ledger.";
  }
  if (q.includes('go to data flow') || q.includes('open data flow') || q.includes('show map')) {
    if (ctx.setActiveTab) ctx.setActiveTab('flow');
    return "🗺️ **Navigated to Data Flow Map.** You can inspect all node connections.";
  }
  if (q.includes('go to my data') || q.includes('open inventory') || q.includes('show inventory')) {
    if (ctx.setActiveTab) ctx.setActiveTab('inventory');
    return "📂 **Navigated to My Data Inventory.** Review your collected personal data.";
  }

  return null;
}

/**
 * Real-Time Global World Knowledge Search (Wikipedia REST API + DuckDuckGo Instant Answer)
 * Queries live knowledge across the entire world with zero-API-key & zero-CORS restriction.
 */
export async function fetchWorldKnowledge(query: string): Promise<string | null> {
  try {
    // 1. Clean query to extract core entity or topic
    let cleaned = query
      .replace(/^(who is|who was|what is|what was|what are|where is|when was|when did|tell me about|explain|how does|why is|why are|define)\s+/i, '')
      .replace(/\?+$/, '')
      .trim();

    if (!cleaned || cleaned.length < 2) return null;

    // 2. Search Wikipedia API with origin=* for CORS freedom
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleaned)}&utf8=&format=json&origin=*`;
    const searchResp = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });
    if (!searchResp.ok) return null;

    const searchData = await searchResp.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) {
      // Fallback to DuckDuckGo Instant Answer
      return await fetchDuckDuckGo(cleaned);
    }

    // Top matching title
    const topTitle = results[0].title;

    // 3. Fetch comprehensive introductory extract & description
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|description&exintro=true&explaintext=true&titles=${encodeURIComponent(topTitle)}&format=json&origin=*`;
    const extractResp = await fetch(extractUrl, { headers: { 'Accept': 'application/json' } });
    if (!extractResp.ok) return null;

    const extractData = await extractResp.json();
    const pages = extractData?.query?.pages;
    if (!pages) return null;

    const page: any = Object.values(pages)[0];
    if (!page || !page.extract || page.extract.length < 20) {
      return await fetchDuckDuckGo(cleaned);
    }

    const description = page.description ? `*(${page.description})*` : '';
    // Format response cleanly
    return `🌐 **${page.title}** ${description}\n\n${page.extract}\n\n*(Source: Global Knowledge Network)*`;
  } catch (err) {
    console.warn('World knowledge fetch error, attempting fallback:', err);
    return null;
  }
}

/**
 * Fallback to DuckDuckGo Instant Answer API
 */
async function fetchDuckDuckGo(query: string): Promise<string | null> {
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    const resp = await fetch(ddgUrl);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.AbstractText && data.AbstractText.length > 20) {
      return `🌐 **${data.Heading || query}**\n\n${data.AbstractText}\n\n*(Source: DuckDuckGo Knowledge)*`;
    }
  } catch {
    // Ignore fallback failure
  }
  return null;
}

/**
 * Built-in Cybersecurity, Privacy, and Conversational Intelligence
 */
export function queryBuiltInKnowledge(query: string, ctx: CopilotAppContext): string | null {
  const q = query.toLowerCase();

  // --- PRIVACY & CYBERSECURITY TECHNOLOGIES ---
  if (q.includes('zero knowledge') || q.includes('zk-snark') || q.includes('zkp')) {
    return `🔐 **Zero-Knowledge Proofs (ZKPs):**\n\nA cryptographic protocol allowing one party (the prover) to prove to another party (the verifier) that a statement is true without revealing any information beyond the statement's validity.\n\n• **Core Properties:** Completeness, Soundness, and Zero-Knowledge.\n• **Modern Variants:** ZK-SNARKs (Succinct Non-Interactive Arguments of Knowledge) and ZK-STARKs.\n• **Privacy Applications:** Anonymous credentials, private blockchain transactions, and privacy-preserving identity verification.`;
  }

  if (q.includes('differential privacy')) {
    return `📊 **Differential Privacy (DP):**\n\nA mathematical framework introduced by Cynthia Dwork in 2006 that provides formal guarantees on individual privacy in statistical databases.\n\n• **Core Principle:** An attacker cannot infer whether any single individual's data was included in the dataset, governed by the privacy loss parameter epsilon ($\\epsilon$).\n• **Mechanism:** Carefully calibrated noise (Laplace or Gaussian) is added to aggregate query outputs.\n• **Industry Usage:** Used by Apple (iOS telemetry), Google (RAPPOR / Chrome telemetry), and the US Census Bureau.`;
  }

  if (q.includes('homomorphic encryption') || q.includes('fhe')) {
    return `🛡️ **Fully Homomorphic Encryption (FHE):**\n\nA form of encryption that permits arbitrary computations directly on ciphertext without decrypting it first.\n\n• **Why it matters:** Cloud servers can process sensitive user data (financial calculations, medical diagnostics, AI inference) in encrypted form and return an encrypted result that only the user can decrypt with their private key.\n• **Milestone:** First proven constructible by Craig Gentry in 2009.`;
  }

  if (q.includes('browser fingerprinting') || q.includes('device fingerprinting')) {
    return `🕵️ **Browser / Device Fingerprinting:**\n\nA tracking technique that identifies a browser by combining unique hardware and software signals without relying on HTTP cookies.\n\n• **Signals collected:** Canvas rendering nuances, WebGL vendor strings, installed fonts, audio context frequency decay, screen resolution, timezone, and battery status.\n• **Countermeasures:** PrivacyGuard minimizes hardware attributes; modern browsers (Tor Browser, Brave, Safari) randomize or normalize these APIs.`;
  }

  if (q.includes('cambridge analytica')) {
    return `⚠️ **Cambridge Analytica Scandal (2018):**\n\nA watershed moment in global digital privacy. Political consulting firm Cambridge Analytica harvested personal data from up to 87 million Facebook users without explicit consent.\n\n• **Mechanism:** Data was harvested through a third-party personality quiz app ("thisisyourdigitallife") that exploited Facebook's Open Graph API to harvest not just test-takers' data, but their friends' data as well.\n• **Impact:** Led to Facebook's $5 Billion FTC fine and catalyzed the global enforcement of strict consent and purpose limitation laws like GDPR.`;
  }

  if (q.includes('gdpr') || q.includes('general data protection')) {
    if (q.includes('article 5') || q.includes('art 5') || q.includes('principles')) {
      return `📜 **GDPR Article 5 — Core Data Processing Principles:**\n\n1. **Lawfulness, Fairness & Transparency:** Legitimate basis and clear communication.\n2. **Purpose Limitation (Art. 5(1)(b)):** Data must only be collected for specified, explicit, and legitimate purposes (The foundational rule of PrivacyGuard!).\n3. **Data Minimization (Art. 5(1)(c)):** Adequate, relevant, and limited to what is strictly necessary.\n4. **Accuracy (Art. 5(1)(d)):** Kept up to date.\n5. **Storage Limitation (Art. 5(1)(e)):** Retained only as long as necessary.\n6. **Integrity & Confidentiality (Art. 5(1)(f)):** Secure against unauthorized access or breaches.`;
    }
    if (q.includes('article 17') || q.includes('art 17') || q.includes('forgotten') || q.includes('erasure')) {
      return `🗑️ **GDPR Article 17 — Right to Erasure ("Right to be Forgotten"):**\n\nGrants individuals the legal right to have their personal data permanently erased without undue delay under specific grounds:\n\n• The data is no longer necessary for the original collection purpose.\n• The user withdraws consent and there is no other legal basis.\n• The data was unlawfully processed.\n\n*PrivacyGuard implements a direct prototype workflow for Art. 17 in the "Request Erasure" modal!*`;
    }
    return `🇪🇺 **GDPR (General Data Protection Regulation):**\n\nThe landmark European Union privacy regulation enacted on May 25, 2018. It enforces global extraterritorial reach for any company processing EU citizens' data, mandating explicit consent, purpose limitation, data portability, and fines up to €20M or 4% of global annual turnover.`;
  }

  if (q.includes('ccpa') || q.includes('cpra')) {
    return `🏛️ **CCPA / CPRA (California Consumer Privacy Act / Rights Act):**\n\nComprehensive US state privacy law granting California consumers rights to:\n• Know what personal information is collected.\n• Delete personal information held by businesses.\n• Opt-out of the "sale" or "sharing" of personal data.\n• Non-discrimination for exercising privacy rights.`;
  }

  if (q.includes('dpdp') || q.includes('india') && q.includes('privacy')) {
    return `🇮🇳 **India's Digital Personal Data Protection (DPDP) Act 2023:**\n\nIndia's primary statutory framework governing digital personal data. It mandates notice and consent architectures (Consent Managers), restricts cross-border transfers to unauthorized countries, protects children's data, and imposes penalties up to ₹250 Crore for significant data breaches.`;
  }

  // --- DRAFTING TOOLS (Emails, Policies, Notices) ---
  if (q.includes('draft') && (q.includes('erasure') || q.includes('deletion') || q.includes('email') || q.includes('letter'))) {
    return `📝 **Formal GDPR Article 17 Data Erasure Request Draft:**\n\n\`\`\`text\nTo: Data Protection Officer / Privacy Team [Company Name]\nSubject: Formal Request for Erasure of Personal Data (GDPR Article 17)\n\nDear Privacy Team,\n\nI am writing to formally request the complete erasure of all personal data held about me by your organization, in accordance with Article 17 of the General Data Protection Regulation (GDPR).\n\nDetails for identifying my records:\n• Name: [Your Full Name]\n• Email: [Your Email Address]\n• Account / User ID: [Your Account ID, if applicable]\n\nI hereby withdraw any previously granted consent for the processing of my personal data. Please confirm within 30 days that my records—including backups and downstream third-party processor shares—have been permanently purged.\n\nSincerely,\n[Your Name]\n\`\`\``;
  }

  if (q.includes('draft') && q.includes('privacy policy')) {
    return `📝 **Privacy Policy "Purpose Limitation & Minimization" Clause Draft:**\n\n\`\`\`text\nSection 4: Purpose Limitation & Data Minimization\nWe collect personal data strictly for specified, explicit, and legitimate purposes disclosed at the time of collection. In accordance with Privacy-by-Design principles, we limit data collection to the minimum attributes required to fulfill that specific service. We do not repurpose, cross-reference, or sell personal telemetry to third-party advertising networks without affirmative, granular consent.\n\`\`\``;
  }

  // --- CODING ASSISTANT ---
  if (q.includes('code') || q.includes('python') || q.includes('javascript') || q.includes('typescript') || q.includes('sql') || q.includes('regex')) {
    if (q.includes('email regex') || q.includes('validate email')) {
      return `💻 **Email Validation Regular Expression:**\n\n\`\`\`javascript\nconst emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\n\nfunction isValidEmail(email) {\n  return emailRegex.test(email);\n}\n\`\`\``;
    }
    if (q.includes('reverse a string') || q.includes('reverse string')) {
      return `💻 **Reverse a String in Python & JavaScript:**\n\n**Python:**\n\`\`\`python\ndef reverse_string(s: str) -> str:\n    return s[::-1]\n\`\`\`\n\n**JavaScript / TypeScript:**\n\`\`\`typescript\nconst reverseString = (s: string): string => s.split('').reverse().join('');\n\`\`\``;
    }
  }

  // --- CONVERSATIONAL (JOKES, POEMS, CHIT-CHAT) ---
  if (q.includes('tell me a joke') || q.includes('tell a joke') || q.includes('make me laugh')) {
    const jokes = [
      "Why do privacy enthusiasts love camping?\nBecause they can't be tracked in incognito mode in the woods! 🏕️",
      "Why did the database administrator break up with the third-party cookie?\nBecause there was zero trust and too much tracking! 🍪",
      "Why are encryption keys terrible at sharing secrets?\nBecause they're too private! 🔑"
    ];
    return `😄 **Here's a joke for you:**\n\n${jokes[Math.floor(Math.random() * jokes.length)]}`;
  }

  if (q.includes('write a poem') || q.includes('poem')) {
    return `📜 **Ode to Personal Sovereignty:**\n\n*Through copper wire and fiber stream,*\n*They chase your shadow, track your dream.*\n*A click, a scroll, a fleeting trace,*\n*Recorded in some distant place.*\n\n*Yet stands a shield of quiet might,*\n*A firewall guarded day and night.*\n*No tracker passes unpermitted,*\n*No stolen byte goes uncommitted.*\n\n*Your data stays where it belongs—*\n*Protected, private, sovereign, strong.* 🛡️`;
  }

  // --- LIVE APPLICATION QUERIES ---
  if (q.includes('score') || q.includes('my privacy score')) {
    const deductions = ctx.scoreBreakdown.deductions.map(d => `• -${d.points} pts: ${d.label} (${d.description})`).join('\n');
    return `🛡️ **Your Current Privacy Score:** **${ctx.scoreBreakdown.score}/100**\n\nCalculated dynamically from live system posture:\n${deductions || '• Zero deductions! Optimal hardened security.'}\n${ctx.isLockdownActive ? '• +12 pts: Privacy Lockdown Resilience Bonus\n' : ''}\n💡 *Tip: Click the Privacy Score pill in the header to view full itemized calculations!*`;
  }

  if (q.includes('blocked') || q.includes('intercepted')) {
    const blocks = ctx.auditLogs.filter(a => a.decision === 'BLOCK');
    if (blocks.length === 0) {
      return "✅ **No requests are currently blocked.** You can test live blocking by opening the Request Simulator and running Scenario 1 or 2!";
    }
    const recent = blocks[0];
    return `🚫 **Most Recent Interception:**\n• **Actor:** ${recent.actor}\n• **Data Wanted:** [${recent.data.join(', ')}]\n• **Claimed Purpose:** ${recent.purpose}\n• **Verdict:** BLOCKED\n• **Rationale:** ${recent.reason}\n\nTotal threats intercepted so far: **${blocks.length}**.`;
  }

  if (q.includes('location') && (q.includes('who') || q.includes('apps') || q.includes('access'))) {
    const locConsents = ctx.consents.filter(c => c.category.toLowerCase().includes('location') && c.status === 'ACTIVE');
    if (locConsents.length === 0) {
      return "🔒 **No applications currently have active access to your location.** All location telemetry is blocked.";
    }
    const list = locConsents.map(c => `• **${c.service}** (Strictly for *${c.purpose}*)`).join('\n');
    return `📍 **Active Location Permissions:**\n${list}\n\nPrivacyGuard ensures that if any service attempts to repurpose your coordinates for advertising, it is immediately stopped.`;
  }

  return null;
}

/**
 * Direct Gemini Cloud LLM Query (Optional client-side Gemini API mode)
 */
export async function queryGemini(
  apiKey: string,
  prompt: string,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  ctx: CopilotAppContext
): Promise<string> {
  const systemInstruction = `You are PrivacyGuard Copilot, an elite AI cybersecurity and privacy engineer.
You are embedded inside PrivacyGuard, a Personal Data Firewall MVP.
Current Live System Posture:
- Privacy Score: ${ctx.scoreBreakdown.score}/100
- Active Consents: ${ctx.consents.filter(c => c.status === 'ACTIVE').length} / ${ctx.consents.length}
- Privacy Lockdown Active: ${ctx.isLockdownActive ? 'YES' : 'NO'}
- Stored Data Categories: ${ctx.dataAssets.map(a => a.category).join(', ')}
- Blocked Requests Count: ${ctx.auditLogs.filter(a => a.decision === 'BLOCK').length}

Be intelligent, concise, knowledgeable about global events, cybersecurity, math, code, and privacy laws.`;

  const contents = [
    ...history.slice(-6).map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response text received from Gemini');
  return text;
}

/**
 * Master Processor: Evaluates any user query through the Multi-Tier Intelligence Pipeline
 */
export async function processCopilotQuery(
  query: string,
  history: Array<{ role: 'user' | 'copilot'; text: string }>,
  ctx: CopilotAppContext,
  modelMode: 'local' | 'gemini',
  geminiApiKey: string
): Promise<{ text: string; isAction?: boolean }> {
  // Tier 1: Interactive App Actions (e.g. "turn on lockdown", "reset demo", "erase location")
  const actionRes = handleAppActions(query, ctx);
  if (actionRes) {
    return { text: actionRes, isAction: true };
  }

  // Tier 2: Mathematical Expressions & Formulas
  const mathRes = evaluateMath(query);
  if (mathRes) {
    return { text: mathRes };
  }

  // Tier 3: Universal Unit Conversions
  const convRes = evaluateUnitConversion(query);
  if (convRes) {
    return { text: convRes };
  }

  // Tier 4: Gemini Cloud LLM (if enabled with API key)
  if (modelMode === 'gemini' && geminiApiKey.trim()) {
    try {
      const gHistory = history.map(h => ({
        role: h.role === 'user' ? ('user' as const) : ('model' as const),
        text: h.text
      }));
      const gAnswer = await queryGemini(geminiApiKey, query, gHistory, ctx);
      return { text: `✨ ${gAnswer}` };
    } catch (err) {
      console.warn('Gemini query failed, continuing in global engine:', err);
    }
  }

  // Tier 5: Built-in Privacy, Cybersecurity, Coding, and Conversational Knowledge
  const builtInRes = queryBuiltInKnowledge(query, ctx);
  if (builtInRes) {
    return { text: builtInRes };
  }

  // Tier 6: Live Global World Knowledge Search (Wikipedia & DuckDuckGo APIs)
  const worldRes = await fetchWorldKnowledge(query);
  if (worldRes) {
    return { text: worldRes };
  }

  // Tier 7: Conversational Fallback Synthesizer
  return {
    text: `💡 **PrivacyGuard Intelligence Assistant:**\n\nI processed your inquiry: "*${query}*".\n\nI can assist you with:\n• **World Knowledge & History** (e.g. *Who is Alan Turing?*, *Capital of Brazil*, *What is quantum entanglement?*)\n• **Mathematics & Calculations** (e.g. *Calculate 15% of 850*, *Square root of 256*)\n• **Unit Conversions** (e.g. *50 miles to km*, *30 C to F*)\n• **Cybersecurity & Privacy** (e.g. *Explain Zero Knowledge Proofs*, *GDPR Article 17*, *Differential Privacy*)\n• **Live Firewall Actions** (e.g. *Activate Privacy Lockdown*, *Show my privacy score*, *Go to simulator*)`
  };
}
