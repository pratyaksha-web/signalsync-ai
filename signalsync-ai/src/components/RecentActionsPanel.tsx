import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Play, Pause, Download, AlertTriangle, Info, Zap, 
  Trash2, ShieldCheck, Mail, Database, BrainCircuit, FileText
} from 'lucide-react';
import { ActionLog, Lead } from '../types';
import { jsPDF } from 'jspdf';

interface RecentActionsPanelProps {
  logs: ActionLog[];
  leads: Lead[];
  onClearLogs: () => void;
  automationActive: boolean;
  onToggleAutomation: () => void;
}

export default function RecentActionsPanel({
  logs,
  leads = [],
  onClearLogs,
  automationActive,
  onToggleAutomation
}: RecentActionsPanelProps) {

  const generateReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Header Band
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, 210, 18, 'F');

    // Title text inside header band
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('SIGNALSYNC AI  //  DAILY LEADS & PIPELINE AUDIT', 14, 11);

    // Document timestamp in header band
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(209, 250, 229); // emerald-100
    const nowStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    doc.text(`Generated: ${nowStr} (Local)`, 146, 11);

    let y = 30;

    // 2. Report Overview Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Operations Revenue & Opportunity Report', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('A comprehensive summary of real-time intent matches, qualified buyer leads, and daily projected pipeline value.', 14, y);
    y += 12;

    // Helper to calculate total value
    const parseValue = (valStr: string): number => {
      if (!valStr) return 0;
      const cleanStr = valStr.replace(/[^0-9]/g, '');
      const parsed = parseInt(cleanStr, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    const totalValueNum = leads.reduce((sum, lead) => sum + parseValue(lead.estimatedValue), 0);
    const formattedTotalValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(totalValueNum);

    // 3. Stats Blocks
    // Box 1: Total Leads
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.rect(14, y, 54, 22, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`${leads.length} Accounts`, 19, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('QUALIFIED OPPORTUNITIES', 19, y + 15);

    // Box 2: Total Revenue/ARR
    doc.setFillColor(248, 250, 252);
    doc.rect(73, y, 65, 22, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(`${formattedTotalValue}/yr`, 78, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL PROJECTED CONTRACT ARR', 78, y + 15);

    // Box 3: Engine State
    doc.setFillColor(248, 250, 252);
    doc.rect(143, y, 53, 22, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(147, 51, 234); // purple-600
    doc.text(automationActive ? 'ACTIVE RUNNING' : 'PAUSED SCAN', 148, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('HARVESTER WORKFLOW STATE', 148, y + 15);

    y += 32;

    // 4. Detailed Section Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Captured Opportunity Ledger', 14, y);

    y += 4;
    // draw dividing line
    doc.setDrawColor(16, 185, 129); 
    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);

    y += 5;

    // Table Headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Company', 15, y);
    doc.text('Contact & Decision Maker', 55, y);
    doc.text('Email Address', 105, y);
    doc.text('Score', 148, y);
    doc.text('Strength', 162, y);
    doc.text('Proj. ARR', 178, y);

    y += 3;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.25);
    doc.line(14, y, 196, y);
    y += 5;

    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85); // slate-700

    leads.forEach((lead) => {
      if (y > 270) {
        doc.addPage();
        y = 20;

        // Page repeat header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('Company', 15, y);
        doc.text('Contact & Decision Maker', 55, y);
        doc.text('Email Address', 105, y);
        doc.text('Score', 148, y);
        doc.text('Strength', 162, y);
        doc.text('Proj. ARR', 178, y);

        y += 3;
        doc.setDrawColor(203, 213, 225);
        doc.line(14, y, 196, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
      }

      // Draw active row details
      doc.setFont('helvetica', 'bold');
      doc.text(lead.company || 'N/A', 15, y);

      doc.setFont('helvetica', 'normal');
      const contactDesc = `${lead.contactName || 'N/A'} - ${lead.contactTitle || 'N/A'}`;
      const clampedContact = contactDesc.length > 32 ? contactDesc.substring(0, 30) + '...' : contactDesc;
      doc.text(clampedContact, 55, y);

      doc.text(lead.contactEmail || 'N/A', 105, y);

      // Score Highlight
      const score = lead.leadScore || 0;
      if (score >= 90) {
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(`${score}%`, 148, y);

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(lead.intentStrength || 'Normal', 162, y);

      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.text(lead.estimatedValue || 'N/A', 178, y);

      y += 7.5;

      // Draw subtle row dividing border
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.setLineWidth(0.15);
      doc.line(14, y - 3.5, 196, y - 3.5);

      // Restore defaults
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
    });

    // 5. Disclaimer & Verification Footer block
    y = Math.max(y + 4, 215);
    if (y > 270) {
      doc.addPage();
      y = 30;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);

    y += 5;
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('SECURITY NOTICE: CLASSIFIED COMMERCIAL BUSINESS LEAD INTELLIGENCE REPORT', 14, y);
    doc.setFont('helvetica', 'italic');
    doc.text('This is an auto-generated audit ledger containing processed proprietary intent triggers, verified client information, and outreach configurations.', 14, y + 4);
    doc.text('Unauthorized circulation is strictly prohibited. Verified compiled transaction protocol reference: SHE-SECURE-990.', 14, y + 8);

    // Save
    const dateFormatted = new Date().toISOString().split('T')[0];
    doc.save(`SignalSync-Opportunities-Audit-Report-${dateFormatted}.pdf`);
  };

  const getLogIcon = (type: ActionLog['type']) => {
    switch (type) {
      case 'signal_harvested':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'lead_qualified':
        return <BrainCircuit className="w-4 h-4 text-cyan-400" />;
      case 'pitch_sent':
        return <Mail className="w-4 h-4 text-purple-400" />;
      case 'agent_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getSeverityStyle = (severity: ActionLog['severity']) => {
    switch (severity) {
      case 'success': return 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400';
      case 'warning': return 'border-amber-500/20 bg-amber-950/10 text-amber-400';
      default: return 'border-neutral-800 bg-neutral-900/40 text-neutral-300';
    }
  };

  return (
    <div id="recent-actions-panel" className="glass-panel p-5 rounded-xl border border-emerald-500/10 text-left relative z-10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

      {/* Header controls layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-500/10 pb-4 mb-4 gap-3 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="p-1 rounded bg-neutral-900 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </span>
            Recent Engine Operations log
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Realtime audit log tracking automated background events, outreach workflows, and semantic parsing scores.
          </p>
        </div>

        {/* Global controller buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onToggleAutomation}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
              automationActive 
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:bg-emerald-400' 
                : 'bg-neutral-900 text-neutral-400 border border-emerald-500/20 hover:border-emerald-500/35'
            }`}
          >
            {automationActive ? (
              <>
                <Pause className="w-3.5 h-3.5 text-black" />
                <span>Automated Workflow: Active</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Workflow: Paused</span>
              </>
            )}
          </button>

          <button
            onClick={generateReport}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg cursor-pointer transition text-xs font-mono font-semibold relative"
            title="Download Daily PDF summary report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg border border-emerald-500/10 cursor-pointer transition"
            title="Clear all system logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live System Automated Workflow banner */}
      {automationActive && (
        <motion.div
          id="automation-active-banner"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-emerald-950/20 border border-emerald-400/20 rounded-lg p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>SYSTEM CONFIGURED TO AUTO-PROCESS TARGETS</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-neutral-500 text-right">processing pipeline signals every 5s</span>
        </motion.div>
      )}

      {/* Logs Table Layout Container */}
      <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-neutral-950/40 border border-dashed border-emerald-500/10 rounded-xl">
              <p className="text-xs text-neutral-400">No recent transactions recorded. Active stream waiting for inputs.</p>
            </div>
          ) : (
            logs.map((log) => (
              <motion.div
                key={log.id}
                id={`log-item-${log.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className={`p-3 rounded-lg border text-xs flex justify-between items-start gap-4 ${getSeverityStyle(log.severity)}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-md bg-neutral-950 border border-emerald-500/10 shrink-0">
                    {getLogIcon(log.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white leading-tight flex items-center gap-2">
                      {log.title}
                    </h3>
                    <p className="text-neutral-400 mt-1 leading-normal text-[11px]">{log.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-neutral-500">{log.timestamp}</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Diagnostic check details footer */}
      <div className="mt-4 pt-3 border-t border-emerald-500/10 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500">
          <span>Engine opportunity:</span>
          <span className="bg-emerald-950 px-1 py-0.5 rounded text-emerald-400 font-semibold border border-emerald-500/20 hover:animate-pulse">SHE-V1-FAST</span>
        </div>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'signals_harvesting_engine_logs.json';
            a.click();
          }}
          className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export JSON Dump
        </button>
      </div>
    </div>
  );
}
