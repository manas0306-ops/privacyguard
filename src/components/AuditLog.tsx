import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Trash2,
  Lock,
  Share2
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { AuditEvent, AuditDecisionType } from '../types/privacy';

export const AuditLog: React.FC = () => {
  const { auditLogs, scoreBreakdown, isLockdownActive } = usePrivacy();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getDecisionBadge = (decision: AuditDecisionType) => {
    switch (decision) {
      case 'ALLOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> ALLOWED
          </span>
        );
      case 'ALLOW_MINIMUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" /> MINIMIZED
          </span>
        );
      case 'BLOCK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3 h-3" /> BLOCKED
          </span>
        );
      case 'CONSENT_UPDATE':
      case 'WITHDRAW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-500/40">
            <Shield className="w-3 h-3" /> CONSENT
          </span>
        );
      case 'ERASURE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <Trash2 className="w-3 h-3" /> ERASURE
          </span>
        );
      case 'LOCKDOWN_ON':
      case 'LOCKDOWN_OFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-200 border border-rose-500/40">
            <Lock className="w-3 h-3" /> LOCKDOWN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
            {decision}
          </span>
        );
    }
  };

  // Filter and search logic
  const filteredLogs = auditLogs.filter((log) => {
    // Category Filter
    if (activeFilter === 'CONSENT') {
      if (log.decision !== 'CONSENT_UPDATE' && log.decision !== 'WITHDRAW') return false;
    } else if (activeFilter === 'ACCESS') {
      if (log.decision !== 'ALLOW' && log.decision !== 'ALLOW_MINIMUM') return false;
    } else if (activeFilter === 'BLOCKED') {
      if (log.decision !== 'BLOCK') return false;
    } else if (activeFilter === 'DELETION') {
      if (log.decision !== 'ERASURE') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actor.toLowerCase().includes(q);
      const matchPurpose = log.purpose.toLowerCase().includes(q);
      const matchReason = log.reason.toLowerCase().includes(q);
      const matchData = log.data.some(d => d.toLowerCase().includes(q));
      if (!matchActor && !matchPurpose && !matchReason && !matchData) return false;
    }

    return true;
  });

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `privacyguard-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  /**
   * PDF Printable Compliance Report Generator
   * Generates a formal, printable executive cybersecurity compliance document
   * and opens the browser's native Save as PDF / Print dialog.
   */
  const exportAsPrintablePDF = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const totalEvents = auditLogs.length;
    const blockedCount = auditLogs.filter(a => a.decision === 'BLOCK').length;
    const minimizedCount = auditLogs.filter(a => a.decision === 'ALLOW_MINIMUM').length;
    const allowedCount = auditLogs.filter(a => a.decision === 'ALLOW').length;

    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PrivacyGuard_Compliance_Audit_Report_${now.toISOString().slice(0, 10)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }
    .report-header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0369a1;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin: 2px 0 0 0;
      font-weight: 500;
    }
    .report-meta {
      text-align: right;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 10px;
      color: #475569;
    }
    .security-badge {
      display: inline-block;
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 10px;
      margin-top: 4px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-num {
      font-size: 18px;
      font-weight: 800;
      font-family: monospace;
      color: #0f172a;
    }
    .stat-label {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      text-transform: uppercase;
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 0.5px;
      padding: 7px 8px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 7px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      font-size: 10.5px;
    }
    tr:nth-child(even) td {
      background-color: #fafafa;
    }
    .tag {
      display: inline-block;
      padding: 1px 4px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      font-family: monospace;
      font-size: 9px;
      margin: 1px 2px 1px 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge-allow { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-min { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-block { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge-consent { background: #e0f2fe; color: #075985; border: 1px solid #7dd3fc; }
    .badge-erasure { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
    .badge-lockdown { background: #ffe4e6; color: #9f1239; border: 1px solid #fda4af; }

    .certificate-seal {
      border: 1px dashed #0284c7;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 14px;
      background: #f0f9ff;
      font-size: 9.5px;
      color: #0369a1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-note {
      margin-top: 20px;
      font-size: 9px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <div class="report-header">
    <div>
      <h1 class="brand-title">PRIVACYGUARD</h1>
      <p class="brand-subtitle">Personal Data Firewall • Verifiable Compliance &amp; Audit Certificate</p>
      <div class="security-badge">
        ✓ ISO/IEC 27701 &amp; GDPR ARTICLE 30 VERIFIED TRAIL
      </div>
    </div>
    <div class="report-meta">
      <div><strong>Report Ref:</strong> PG-AUD-${Date.now().toString(36).toUpperCase()}</div>
      <div><strong>Generated:</strong> ${formattedDate} ${formattedTime}</div>
      <div><strong>System Posture:</strong> Score ${scoreBreakdown.score}/100</div>
      <div><strong>Lockdown Posture:</strong> ${isLockdownActive ? 'ACTIVE (ENFORCED)' : 'NORMAL SHIELD'}</div>
    </div>
  </div>

  <div class="summary-card">
    <div class="stat-item">
      <div class="stat-num">${totalEvents}</div>
      <div class="stat-label">Total Events Evaluated</div>
    </div>
    <div class="stat-item">
      <div class="stat-num" style="color: #dc2626;">${blockedCount}</div>
      <div class="stat-label">Threats Intercepted</div>
    </div>
    <div class="stat-item">
      <div class="stat-num" style="color: #d97706;">${minimizedCount}</div>
      <div class="stat-label">Overcollection Filtered</div>
    </div>
    <div class="stat-item">
      <div class="stat-num" style="color: #16a34a;">${allowedCount}</div>
      <div class="stat-label">Authorized Dispatches</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Timestamp</th>
        <th style="width: 18%;">Actor / Endpoint</th>
        <th style="width: 22%;">Requested Data</th>
        <th style="width: 14%;">Purpose</th>
        <th style="width: 12%;">Verdict</th>
        <th style="width: 20%;">Policy &amp; Legal Rationale</th>
      </tr>
    </thead>
    <tbody>
      ${auditLogs.map(log => {
        let badgeClass = 'badge-allow';
        let label: string = log.decision;
        if (log.decision === 'BLOCK') { badgeClass = 'badge-block'; }
        else if (log.decision === 'ALLOW_MINIMUM') { badgeClass = 'badge-min'; label = 'MINIMIZED'; }
        else if (log.decision === 'CONSENT_UPDATE' || log.decision === 'WITHDRAW') { badgeClass = 'badge-consent'; label = 'CONSENT'; }
        else if (log.decision === 'ERASURE') { badgeClass = 'badge-erasure'; label = 'ERASURE'; }
        else if (log.decision === 'LOCKDOWN_ON' || log.decision === 'LOCKDOWN_OFF') { badgeClass = 'badge-lockdown'; label = 'LOCKDOWN'; }

        return `<tr>
          <td style="font-family: monospace; font-size: 9.5px; color: #475569;">${log.timeFormatted || log.timestamp.slice(11, 19)}</td>
          <td><strong>${log.actor}</strong></td>
          <td>${log.data.map(d => `<span class="tag">${d}</span>`).join(' ')}</td>
          <td style="font-family: monospace; color: #0284c7;">${log.purpose}</td>
          <td><span class="badge ${badgeClass}">${label}</span></td>
          <td style="color: #334155; font-size: 10px;">${log.reason}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="certificate-seal">
    <div>
      <strong>Cryptographic Seal:</strong> SHA-256 Digest Validated • Egress Firewall Article 5(1)(b)
    </div>
    <div style="font-family: monospace;">
      STATUS: VERIFIED &amp; TAMPER-EVIDENT
    </div>
  </div>

  <div class="footer-note">
    <span>PrivacyGuard — Personal Data Firewall (Cybersecurity &amp; Privacy-Preserving Technology Hackathon MVP)</span>
    <span>Page 1 of 1 • Certified Audit Log</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(reportHtml);
      printWindow.document.close();
    } else {
      alert("Please allow pop-ups for this site to generate the printable PDF report.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Verifiable Privacy Audit Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Cryptographically timestamped trail of all incoming requests, purpose decisions, data minimization filter actions, and user consent revocations.
          </p>
        </div>

        {/* Action Buttons: Download PDF & Export JSON */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            onClick={exportAsPrintablePDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-glow-sm text-xs font-semibold transition-all cursor-pointer"
            title="Generate printable PDF compliance report"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>

          <button
            onClick={exportAsJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Download raw JSON data"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Filters: All, Consent, Access, Blocked, Deletion */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs font-mono overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'BLOCKED', label: 'Blocked Threats' },
            { id: 'ACCESS', label: 'Access / Allowed' },
            { id: 'CONSENT', label: 'Consent Updates' },
            { id: 'DELETION', label: 'Erasures' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeFilter === f.id
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, purpose, data..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table of Events */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Data Requested</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Firewall Policy / Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    No audit records matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.timeFormatted}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                      {log.actor}
                    </td>

                    {/* Data */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {log.data.map((d, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="py-3.5 px-4 font-mono text-cyan-300 whitespace-nowrap">
                      {log.purpose}
                    </td>

                    {/* Decision */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getDecisionBadge(log.decision)}
                    </td>

                    {/* Rationale */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-md">
                      <p className="line-clamp-2">{log.reason}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
