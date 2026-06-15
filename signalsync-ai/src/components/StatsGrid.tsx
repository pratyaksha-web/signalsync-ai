import { motion } from 'motion/react';
import { Signal, Database, Target, Cpu, TrendingUp, Zap, Download } from 'lucide-react';
import { Stats, Lead } from '../types';

interface StatsGridProps {
  stats: Stats;
  leads: Lead[];
}

export default function StatsGrid({ stats, leads }: StatsGridProps) {
  // Format currency
  const formatARR = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      alert("No leads available to export.");
      return;
    }

    // Define CSV headers
    const headers = [
      'Lead ID',
      'Signal ID',
      'Company',
      'Contact Name',
      'Contact Title',
      'Contact Email',
      'Lead Score (%)',
      'Intent Strength',
      'Estimated Value',
      'Status',
      'Suggested Pitch'
    ];

    // Helper to safely escape characters for CSV
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Form CSV rows
    const rows = leads.map(lead => [
      lead.id,
      lead.signalId,
      lead.company,
      lead.contactName,
      lead.contactTitle,
      lead.contactEmail,
      lead.leadScore,
      lead.intentStrength,
      lead.estimatedValue,
      lead.status,
      lead.suggestedPitch
    ].map(escapeCSV));

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and trigger local download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_pipeline_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 relative z-10">
      {/* Stats Section Header with Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="p-1 rounded bg-neutral-900 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </span>
          Global Metrics <span className="text-xs font-mono font-normal text-emerald-500/60">// Real-time Insights</span>
        </h2>
        <button
          id="export-leads-csv"
          onClick={handleExportCSV}
          className="text-xs font-mono bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-emerald-400 transition cursor-pointer justify-center w-full sm:w-auto shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export Pipeline CSV
        </button>
      </div>

      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Top Stat Card: Total Signals */}
      <motion.div
        id="stat-signals"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
        className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group border border-emerald-500/10"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full z-0 pointer-events-none transition-all duration-300 group-hover:bg-emerald-500/10" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">Harvested Signals</p>
            <h3 className="text-3xl font-bold font-sans tracking-tight text-white mt-1 group-hover:text-emerald-300 transition-colors">
              {stats.totalSignals.toLocaleString()}
            </h3>
          </div>
          <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Signal className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        
        {/* Sparkline (Static beautiful mock SVG trend to keep zero configuration clean styling) */}
        <div className="mt-4 flex items-end justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/25 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +{stats.signalsRate}/min
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Live ingest</span>
          </div>
          <div className="w-24 h-8">
            <svg viewBox="0 0 100 30" width="100%" height="100%">
              <path
                d="M0 25 Q15 22, 30 15 T60 12 T80 8 T100 2"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <path
                d="M0 25 Q15 22, 30 15 T60 12 T80 8 T100 2 L100 30 L0 30 Z"
                fill="url(#spark-grad-1)"
                className="opacity-15"
              />
              <defs>
                <linearGradient id="spark-grad-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Top Stat Card: SQL Qualified Leads */}
      <motion.div
        id="stat-qualified"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group border border-emerald-500/10"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full z-0 pointer-events-none transition-all duration-300 group-hover:bg-cyan-500/10" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">Qualified Leads Score</p>
            <h3 className="text-3xl font-bold font-sans tracking-tight text-white mt-1 group-hover:text-emerald-300 transition-colors">
              {stats.qualifiedLeads}
            </h3>
          </div>
          <div className="p-2 bg-neutral-900/60 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Leadboard stats */}
        <div className="mt-4 flex items-end justify-between relative z-10">
          <div className="flex items-center gap-1.5 animate-pulse">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              {stats.conversionRate}% Conv
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Avg Score: 87</span>
          </div>
          <div className="w-24 h-8">
            <svg viewBox="0 0 100 30" width="100%" height="100%">
              <path
                d="M0 20 Q10 25, 25 15 T50 18 T75 10 T100 4"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <path
                d="M0 20 Q10 25, 25 15 T50 18 T75 10 T100 4 L100 30 L0 30 Z"
                fill="url(#spark-grad-2)"
                className="opacity-15"
              />
              <defs>
                <linearGradient id="spark-grad-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Top Stat Card: Pipeline Value */}
      <motion.div
        id="stat-pipeline"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group border border-emerald-500/10"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full z-0 pointer-events-none transition-all duration-300 group-hover:bg-emerald-500/10" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">Signals Est ARR</p>
            <h3 className="text-3xl font-bold font-sans tracking-tight text-emerald-400 mt-1">
              {formatARR(stats.pipelineValue)}
            </h3>
          </div>
          <div className="p-2 bg-neutral-900/60 rounded-lg border border-emerald-400/20 text-emerald-400">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Value details */}
        <div className="mt-4 flex items-end justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-white/85 bg-neutral-900 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              ARR Qualified
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Avg LTV $45k</span>
          </div>
          <div className="w-24 h-8">
            <svg viewBox="0 0 100 30" width="100%" height="100%">
              <path
                d="M0 28 L15 25 L35 15 L55 10 L75 8 L100 2"
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <path
                d="M0 28 L15 25 L35 15 L55 10 L75 8 L100 2 L100 30 L0 30 Z"
                fill="url(#spark-grad-3)"
                className="opacity-15"
              />
              <defs>
                <linearGradient id="spark-grad-3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Top Stat Card: AI Harvester Status */}
      <motion.div
        id="stat-agents"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-panel glass-panel-hover p-4 rounded-xl relative overflow-hidden group border border-emerald-500/10"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full z-0 pointer-events-none transition-all duration-300 group-hover:bg-emerald-500/10" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">Active AI Agents</p>
            <h3 className="text-3xl font-bold font-sans tracking-tight text-white mt-1">
              {stats.activeAgentsCount} <span className="text-xs font-mono text-emerald-400 font-normal">Active</span>
            </h3>
          </div>
          <div className="p-2 bg-neutral-900/60 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* AI Metrics */}
        <div className="mt-4 flex items-end justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              99.2% Accuracy
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Zero-lag latency</span>
          </div>
          <div className="flex gap-0.5 h-6 items-end">
            {/* Elegant visual frequency bars */}
            <div className="w-1 bg-emerald-400/30 h-2 rounded-t group-hover:h-3 transition-all duration-300" />
            <div className="w-1 bg-emerald-400/50 h-4 rounded-t group-hover:h-5 transition-all duration-300 animate-pulse" />
            <div className="w-1 bg-emerald-400/80 h-3 rounded-t group-hover:h-4 transition-all duration-300" />
            <div className="w-1 bg-emerald-400/20 h-1 rounded-t group-hover:h-2 transition-all duration-300" />
            <div className="w-1 bg-emerald-400/90 h-5 rounded-t group-hover:h-6 transition-all duration-300 animate-bounce" />
          </div>
        </div>
      </motion.div>
    </div>
    </div>
  );
}
