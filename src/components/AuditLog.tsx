import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  FileDown,
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  /**
   * Direct PDF Download Function
   * Generates a real .pdf binary file and downloads it directly to the user's Downloads folder
   */
  const downloadAsPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Header Banner
    doc.setFillColor(11, 17, 32); // Dark Navy background
    doc.rect(0, 0, 595.28, 85, 'F');

    doc.setTextColor(2, 132, 199); // Cyan
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PRIVACYGUARD', 36, 36);

    doc.setTextColor(241, 245, 249); // White
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('PERSONAL DATA FIREWALL — VERIFIABLE AUDIT COMPLIANCE REPORT', 36, 52);

    doc.setTextColor(148, 163, 184); // Slate
    doc.setFontSize(8);
    doc.text(`Generated: ${dateStr} ${timeStr}  |  ISO/IEC 27701 & GDPR Article 30 Compliant  |  Ref: PG-AUD-${Date.now().toString(36).toUpperCase()}`, 36, 68);

    // 2. Summary Statistics Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(36, 100, 523, 46, 4, 4, 'FD');

    const totalEvents = auditLogs.length;
    const blockedCount = auditLogs.filter(a => a.decision === 'BLOCK').length;
    const minimizedCount = auditLogs.filter(a => a.decision === 'ALLOW_MINIMUM').length;
    const allowedCount = auditLogs.filter(a => a.decision === 'ALLOW').length;

    const colWidth = 523 / 4;
    const stats = [
      { label: 'TOTAL EVENTS EVALUATED', value: `${totalEvents}`, color: [15, 23, 42] },
      { label: 'SURVEILLANCE BLOCKED', value: `${blockedCount}`, color: [220, 38, 38] },
      { label: 'OVERCOLLECTION MINIMIZED', value: `${minimizedCount}`, color: [217, 119, 6] },
      { label: 'AUTHORIZED DISPATCHES', value: `${allowedCount}`, color: [22, 163, 74] }
    ];

    stats.forEach((s, idx) => {
      const x = 36 + (idx * colWidth);
      doc.setTextColor(s.color[0], s.color[1], s.color[2]);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(s.value, x + colWidth / 2, 122, { align: 'center' });

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(s.label, x + colWidth / 2, 136, { align: 'center' });
    });

    // 3. Table of Events
    const tableData = auditLogs.map(log => [
      log.timeFormatted || log.timestamp.slice(11, 19),
      log.actor,
      log.data.join(', '),
      log.purpose,
      log.decision === 'ALLOW_MINIMUM' ? 'MINIMIZED' : log.decision,
      log.reason
    ]);

    autoTable(doc, {
      startY: 160,
      head: [['Time', 'Actor / Endpoint', 'Requested Data', 'Purpose', 'Verdict', 'Firewall Policy & Legal Rationale']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [248, 250, 252],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 80, fontStyle: 'bold' },
        2: { cellWidth: 95 },
        3: { cellWidth: 60 },
        4: { cellWidth: 60, fontStyle: 'bold' },
        5: { cellWidth: 'auto' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'BLOCK') {
            data.cell.styles.textColor = [220, 38, 38];
          } else if (val === 'MINIMIZED') {
            data.cell.styles.textColor = [217, 119, 6];
          } else if (val === 'ALLOW') {
            data.cell.styles.textColor = [22, 163, 74];
          } else {
            data.cell.styles.textColor = [2, 132, 199];
          }
        }
      }
    });

    // 4. Save and trigger physical PDF file download
    const filename = `PrivacyGuard_Audit_Report_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `privacyguard-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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

        {/* Action Buttons: Direct PDF Download & JSON Export */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            onClick={downloadAsPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-glow-sm text-xs font-bold transition-all cursor-pointer border border-cyan-400/40"
            title="Download audit report as a genuine .PDF document"
          >
            <FileDown className="w-4 h-4 text-cyan-200" />
            <span>Download PDF Report (.pdf)</span>
          </button>

          <button
            onClick={exportAsJSON}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Download raw JSON data"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export JSON (.json)</span>
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
