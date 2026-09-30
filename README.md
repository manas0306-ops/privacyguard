# PRIVACYGUARD
### *Your Personal Data. Your Rules.*

> **Hackathon Theme:** Cybersecurity & Privacy-Preserving Technology  
> **Classification:** Personal Data Firewall & Zero-Trust Telemetry Interception Gateway

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-success?style=for-the-badge&logo=github)](https://manas0306-ops.github.io/privacyguard/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff)](https://vitejs.dev/)

👉 **Live 24/7 Production Deployment:** [https://manas0306-ops.github.io/privacyguard/](https://manas0306-ops.github.io/privacyguard/)

---

## 1. What is PrivacyGuard?

**PrivacyGuard** is a **Personal Data Firewall** that sits conceptually between users and modern digital services (mobile apps, browser extensions, telemetry SDKs, ad networks).

Modern privacy solutions rely on passive, legalistic checkboxes that users blindly click. PrivacyGuard converts privacy into a **continuous, real-time control system** by answering four fundamental questions for every single data transaction:

1. **WHAT** data is being requested?
2. **WHY** is it being requested?
3. **DOES** the user have active consent for that specific purpose?
4. **IS** that data actually necessary, or does it exceed minimal requirements?

If a request violates user policy or over-collects data:
$$\rightarrow \mathbf{BLOCK\ IT} \quad \rightarrow \mathbf{EXPLAIN\ WHY} \quad \rightarrow \mathbf{RECORD\ IT}$$

---

## 2. Core Architecture & Privacy Story

```
[ USER IDENTITY & DEVICE ]
           │
           ▼
[ MOBILE APP / BROWSER CLIENT ]
           │
           ▼ (Inbound Telemetry Request)
╔═══════════════════════════════════════════════════════════════╗
║                   PRIVACYGUARD FIREWALL GATEWAY               ║
║                                                               ║
║  1. Intercept Payload                                         ║
║  2. Verify Active User Consent (GDPR Art. 6)                 ║
║  3. Purpose Limitation Verification (GDPR Art. 5(1)(b))       ║
║  4. Data Minimization Analysis (GDPR Art. 5(1)(c))            ║
║  5. Policy Risk Scoring & Decision Matrix                     ║
║                                                               ║
║     [ ALLOW ]    or    [ ALLOW MINIMUM DATA ]    or    [ BLOCK ] ║
╚═══════════════════════════════════════════════════════════════╝
           │                                 │
           ▼ (Permitted Egress)               ▼ (Surveillance Intercepted)
[ Legitimate APIs (e.g. Navigation) ]   [ Blocked & Logged to Audit Trail ]
```

---

## 3. The 3 Main WOW Features

### 🛡️ WOW 1 — Live Data Request Firewall
When third-party ad networks or background analytics trackers request personal data (e.g. Advertising Service requesting GPS coordinates), PrivacyGuard intercepts the transmission in real time, determines that consent only allows Location for **Navigation** (not Advertising), blocks the request, and displays a human-readable legal & technical explanation.

### ✂️ WOW 2 — Data Minimization Engine
Even when an application's purpose is approved, PrivacyGuard inspects the requested payload against standard necessity baselines. For example, when a Weather Service requests:
- `City`, `Country`, `Exact GPS`, `Contacts`, `Device ID`
PrivacyGuard determines that only `City` is necessary, flags the overcollection as a **Data Minimization Warning**, and allows the user to filter down to the safe minimum subset (`Allow Minimum Data`).

### 🚨 WOW 3 — Privacy Lockdown Mode
A single emergency toggle enables maximum defensive posture:
- All optional consents are disabled
- Non-essential third-party requests are blocked
- Live Privacy Score receives a resilience hardening bonus
- An immutable audit event is registered

---

## 4. Feature Highlights

| Feature | Description |
| :--- | :--- |
| **Privacy Dashboard** | Real-time Privacy Score (87/100), Active Consents, Data Categories, Third Parties, Blocked Threats, and Retention Warnings. |
| **Personal Data Inventory ("My Data")** | Complete catalog of data held across services (Location, Device Info, Analytics, Purchase History, Preferences, Health Metrics) with sensitivity ratings and retention trackers. |
| **Consent Management Center** | Purpose-based authorizations (Navigation, Analytics, Personalization, Marketing, Weather). Changing consent updates the firewall rules in real time. |
| **Purpose Checking Engine** | Code-level enforcement ensuring data is never used outside its explicitly authorized scope. |
| **Data Minimization Engine** | Automated detection of unnecessary attributes based on privacy-by-design principles. |
| **Live Request Simulator** | 4 preset scenarios + custom scenario builder with an animated 6-stage firewall pipeline. |
| **Interactive Data Flow Map** | Visual topological diagram showing data propagation from user to app, through PrivacyGuard, to connected services. |
| **Verifiable Audit Log** | Immutable, filterable, searchable log of all firewall interceptions, consent modifications, and erasure requests, exportable to JSON. |
| **GDPR Erasure Workflow** | "Right to be Forgotten" simulation moving through `REQUESTED` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED` with verifiable certificate issuance. |
| **Retention Alerts** | Automated warnings when records approach 30-day or 90-day retention cutoffs. |
| **Transparent Privacy Score** | Clear mathematical breakdown explaining why your score is what it is—no random numbers. |
| **Simple Privacy Copilot** | Contextual policy assistant grounded directly in current live application telemetry. |

---

## 5. Live Judge Demonstration Workflow (60 Seconds)

To run the complete hackathon presentation, click **"START DEMO"** in the top navigation bar:

1. **Step 1:** Observe baseline Privacy Score (82/100).
2. **Step 2:** Open **Data Flow** to inspect the zero-trust gateway layout.
3. **Step 3:** Open **Request Simulator** and select *Scenario 2: Ad Tracker Profiling*.
4. **Step 4:** Click **EVALUATE REQUEST** to watch the 6-stage interception pipeline.
5. **Step 5:** **REQUEST BLOCKED!**
6. **Step 6:** Inspect the transparent **"WHY?"** breakdown: *Consent allows Location for Navigation, not Advertising.*
7. **Step 7:** Open **Consent Center** and withdraw Location consent.
8. **Step 8:** Re-simulate the request—now blocked because consent is revoked.
9. **Step 9:** Open **Audit Log** to show both timestamped events recorded.
10. **Step 10:** Click **Request Erasure** and submit a GDPR deletion ticket.
11. **Step 11:** Toggle **Privacy Lockdown** to immediately secure all optional egress.
12. **Step 12:** Review the final **Privacy Under Control** summary card.

---

## 6. Getting Started Locally

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### Installation

```bash
# Clone the repository
git clone https://github.com/manas0306-ops/privacyguard.git
cd privacyguard

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will start at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run preview
```

---

## 7. Tech Stack

- **Framework:** React 18 with TypeScript 5
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS with custom cyber-grid and glassmorphism styling
- **Icons:** Lucide React
- **Architecture:** Zero-dependency standalone privacy engine with React Context state synchronization

---

## 8. Privacy & Ethics Statement

PrivacyGuard is built strictly with synthetic demonstration data. No real names, phone numbers, GPS coordinates, financial records, or medical information are collected, stored, or transmitted.
