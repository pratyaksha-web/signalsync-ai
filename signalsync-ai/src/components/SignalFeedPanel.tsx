import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Linkedin, Slack, Globe, FileText, Code, CheckCircle, 
  Search, SlidersHorizontal, ArrowRight, Zap, Target, Box, Sparkles, Filter,
  RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { Signal, Lead } from '../types';

const getSparklineData = (seed: string, baseScore: number): number[] => {
  const points: number[] = [];
  
  // Create 6 points ending with baseScore
  for (let i = 0; i < 5; i++) {
    // Generate pseudo-random value based on seed string and index
    let hash = 0;
    const combinedSeed = seed + i;
    for (let charIndex = 0; charIndex < combinedSeed.length; charIndex++) {
      hash = combinedSeed.charCodeAt(charIndex) + ((hash << 5) - hash);
    }
    const change = (Math.abs(hash) % 15) - 8; // -8 to +6 fluctuation
    const val = Math.max(50, Math.min(100, baseScore + change));
    points.push(val);
  }
  points.push(baseScore);
  return points;
};

function Sparkline({ seed, baseScore, width = 48, height = 16 }: { seed: string; baseScore: number; width?: number; height?: number }) {
  const points = getSparklineData(seed, baseScore);
  
  const padding = 1.5;
  
  const minVal = Math.min(...points) - 1;
  const maxVal = Math.max(...points) + 1;
  const valRange = maxVal - minVal || 1;
  
  const svgPoints = points.map((val, index) => {
    const x = padding + (index / (points.length - 1)) * (width - padding * 2);
    // Invert Y so higher score is at the top
    const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const gradId = `sparkline-grad-${seed.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <div className="flex flex-col items-end opacity-85 hover:opacity-100 transition" title="Confidence rating past hour history">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <polyline
          fill={`url(#${gradId})`}
          stroke="none"
          points={`${padding},${height} ${svgPoints} ${width - padding},${height}`}
        />
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={svgPoints}
        />
        
        {/* Active final node dot */}
        <circle
          cx={padding + (points.length - 1) / (points.length - 1) * (width - padding * 2)}
          cy={height - padding - ((baseScore - minVal) / valRange) * (height - padding * 2)}
          r="1.5"
          fill="#34d399"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

interface SignalFeedPanelProps {
  signals: Signal[];
  selectedSignal: Signal | null;
  onSelectSignal: (sig: Signal) => void;
  onSimulateSignal: (sigData: Partial<Signal>) => void;
  isSimulating: boolean;
  onUpgradeSignal: (sig: Signal) => void;
  leads?: Lead[];
}

const getSignalOpportunityDetails = (sig: Signal, leadsList: Lead[] = []) => {
  const associatedLead = leadsList.find(l => l.signalId === sig.id);

  let decisionMaker = 'Elena Rostova';
  let signalType: string = sig.intentCategory;
  let buyingIntent = 'High';
  let confidence = `${sig.confidenceScore}%`;
  let recommendedAction = 'Send personalized outreach within 24 hours.';
  let keywords = 'pipeline sync, Apollo contacts, CRM workflow';

  if (sig.intentCategory === 'Buying Intent') {
    signalType = 'CRM Tool Interest';
    buyingIntent = 'High';
    recommendedAction = 'Send personalized outreach within 24 hours.';
  } else if (sig.intentCategory === 'Hiring Boom') {
    signalType = 'Sales Team Expansion';
    buyingIntent = 'Medium';
    recommendedAction = 'Reach out to Solutions Architect to highlight Next.js edge proxies and outbound tech scaling.';
  } else if (sig.intentCategory === 'Funding Round') {
    signalType = 'Capital Allocation Shift';
    buyingIntent = 'High';
    recommendedAction = 'Engage the executive founders team with automated CRM integration blueprints.';
  } else if (sig.intentCategory === 'Tech Stack Drop') {
    signalType = 'Legacy Vendor Substitution';
    buyingIntent = 'High';
    recommendedAction = 'Coordinate direct calendar booking proposing database partner migration frameworks.';
  } else {
    signalType = sig.intentCategory || 'Commercial Buying Intent';
    buyingIntent = 'Medium';
    recommendedAction = 'Draft custom social pitch proposing integration stack consultation.';
  }

  if (sig.company.toLowerCase().includes('linear')) {
    decisionMaker = 'Elena Rostova';
    recommendedAction = 'Send personalized outreach within 24 hours.';
    keywords = 'pipeline sync, Apollo contacts, CRM workflow';
  } else if (sig.company.toLowerCase().includes('pinecone')) {
    decisionMaker = 'Avery Chen';
    keywords = 'Next.js, Edge Runtime, AWS Architect';
  } else if (sig.company.toLowerCase().includes('stripe')) {
    decisionMaker = 'Marcus Dhar';
    keywords = 'merchant API, scale growth, database compliance';
  } else if (sig.company.toLowerCase().includes('notion')) {
    decisionMaker = 'Rebecca Nixon';
    keywords = 'Hubspot drop, API automation, custom connector';
  } else if (sig.company.toLowerCase().includes('supatech')) {
    decisionMaker = 'Alexander Chao';
    keywords = 'postgres signup drops, high relevance email templates';
  } else if (associatedLead) {
    decisionMaker = associatedLead.contactName;
  } else {
    const firstNames = ['Marcus', 'Sophia', 'Chloe', 'Alex', 'Amanda', 'Elena', 'Avery', 'Rebecca', 'Devon', 'Jonathan'];
    const lastNames = ['Sterling', 'Wong', 'Guerrero', 'Kowalski', 'Chen', 'Rostova', 'Nixon', 'Dhar', 'Chao', 'Barrett'];
    let hash = 0;
    const combined = sig.id + sig.company;
    for (let charIdx = 0; charIdx < combined.length; charIdx++) {
      hash = combined.charCodeAt(charIdx) + ((hash << 5) - hash);
    }
    const idx1 = Math.abs(hash) % firstNames.length;
    const idx2 = (Math.abs(hash) >> 2) % lastNames.length;
    decisionMaker = `${firstNames[idx1]} ${lastNames[idx2]}`;
  }

  if (associatedLead) {
    decisionMaker = associatedLead.contactName;
    buyingIntent = associatedLead.intentStrength || 'High';
  }

  if (sig.rawPayload) {
    const rawKeys = Object.keys(sig.rawPayload);
    const kwKey = rawKeys.find(k => k.toLowerCase().includes('keyword') || k.toLowerCase().includes('phrase') || k.toLowerCase().includes('skill') || k.toLowerCase().includes('match'));
    if (kwKey && sig.rawPayload[kwKey]) {
      keywords = sig.rawPayload[kwKey];
    } else {
      const nonUrlKeys = rawKeys.filter(k => !k.toLowerCase().includes('url'));
      if (nonUrlKeys.length > 0) {
        keywords = nonUrlKeys.map(k => sig.rawPayload[k]).join(', ');
      }
    }
  }

  return {
    company: sig.company,
    signalType,
    decisionMaker,
    buyingIntent,
    confidence,
    recommendedAction,
    keywords
  };
};

export default function SignalFeedPanel({
  signals,
  selectedSignal,
  onSelectSignal,
  onSimulateSignal,
  isSimulating,
  onUpgradeSignal,
  leads = []
}: SignalFeedPanelProps) {
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confidenceMin, setConfidenceMin] = useState<number>(50);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState<boolean>(false);

  useEffect(() => {
    setIsAnalysisExpanded(false);
  }, [selectedSignal]);

  const handleManualRefresh = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  // Custom Simulator Form States
  const [simCompany, setSimCompany] = useState('');
  const [simTitle, setSimTitle] = useState('');
  const [simCategory, setSimCategory] = useState<'Buying Intent' | 'Hiring Boom' | 'Leadership Change' | 'Expansion' | 'Funding Round'>('Buying Intent');
  const [showSimPanel, setShowSimPanel] = useState(false);

  const sources = ['all', 'LinkedIn', 'JobBoard', 'Crunchbase', 'News', 'Slack'];
  const categories = ['all', 'Buying Intent', 'Hiring Boom', 'Leadership Change', 'Expansion', 'Funding Round', 'Tech Stack Drop'];

  // Handle auto-simulating presets
  const triggerSimulationPreset = (presetType: string) => {
    let mockData: Partial<Signal> = {};
    if (presetType === 'job') {
      mockData = {
        company: 'Vercel Inc.',
        domain: 'vercel.com',
        title: 'Vercel recruits Enterprise Solutions Director',
        description: 'Vercel posted a confidential high-prio open position for an Enterprise Solutions Director in San Francisco, citing goals to scale infrastructure integration.',
        source: 'JobBoard',
        intentCategory: 'Hiring Boom',
        confidenceScore: 89,
        rawPayload: {
          jobUrl: 'https://vercel.com/careers/solutions-dir',
          salaryRange: '$180k - $240k',
          skillsMandated: 'Next.js, Edge Runtime, AWS Solutions Architect'
        }
      };
    } else if (presetType === 'funding') {
      mockData = {
        company: 'Pinecone Systems',
        domain: 'pinecone.io',
        title: 'Pinecone secures $120M Series C round',
        description: 'Secured Series C leadership backed by major VCs for vectors search database optimizations and sales engineering expansion.',
        source: 'Crunchbase',
        intentCategory: 'Funding Round',
        confidenceScore: 97,
        rawPayload: {
          fundingValuation: '$1.4B Post-Money',
          leadInvestors: 'Andreessen Horowitz, Tiger Global',
          plannedHires: 'VPs of Enterprise Sales, Sales Engineers, Account Executives'
        }
      };
    } else {
      mockData = {
        company: 'Scale AI',
        domain: 'scale.com',
        title: 'VP of Product signals intent change on Twitter/LinkedIn',
        description: 'New VP of Product mentions Scale AI is modernizing customer portal onboarding and dropping legacy API layers for better LLM speed.',
        source: 'LinkedIn',
        intentCategory: 'Buying Intent',
        confidenceScore: 92,
        rawPayload: {
          postText: 'Optimizing internal models context. Excited to build scalable APIs with native Next.js tooling.',
          reachCount: '4,200 post impressions',
          contactMatch: 'Meredith Vance (VP of Product Product Ops)'
        }
      };
    }
    onSimulateSignal(mockData);
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!simCompany) return;
    onSimulateSignal({
      company: simCompany,
      domain: simCompany.toLowerCase().replace(/\s+/g, '') + '.io',
      title: simTitle || `${simCompany} announces new platform transition`,
      description: `Harvested custom raw stream coordinates indicating active target growth in ${simCategory} parameters.`,
      source: 'LinkedIn',
      intentCategory: simCategory,
      confidenceScore: Math.floor(Math.random() * 20) + 75,
      rawPayload: {
        manuallyAdded: 'True via Simulator Console',
        notes: 'Simulated realtime trigger.'
      }
    });
    setSimCompany('');
    setSimTitle('');
    setShowSimPanel(false);
  };

  // Filter signals
  const filteredSignals = signals.filter(sig => {
    const matchesSource = filterSource === 'all' || sig.source === filterSource;
    const matchesCategory = filterCategory === 'all' || sig.intentCategory === filterCategory;
    const matchesQuery = sig.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sig.industry.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sig.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConfidence = sig.confidenceScore >= confidenceMin;
    return matchesSource && matchesCategory && matchesQuery && matchesConfidence;
  });

  const getSourceIcon = (source: Signal['source']) => {
    switch (source) {
      case 'LinkedIn': return <Linkedin className="w-4 h-4 text-sky-400" />;
      case 'Slack': return <Slack className="w-4 h-4 text-purple-400" />;
      case 'JobBoard': return <Briefcase className="w-4 h-4 text-teal-400" />;
      case 'Crunchbase': return <Target className="w-4 h-4 text-pink-400" />;
      case 'News': return <Globe className="w-4 h-4 text-emerald-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryBadgeClass = (category: Signal['intentCategory']) => {
    switch (category) {
      case 'Buying Intent': return 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20';
      case 'Hiring Boom': return 'bg-blue-950/40 text-blue-300 border-blue-500/20';
      case 'Leadership Change': return 'bg-purple-950/40 text-purple-300 border-purple-500/20';
      case 'Funding Round': return 'bg-pink-950/40 text-pink-300 border-pink-500/20';
      default: return 'bg-neutral-900 text-emerald-400 border-emerald-500/10';
    }
  };

  return (
    <div id="signal-feed-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
      {/* LEFT: Feed List & Controls (7 Cols) */}
      <div id="feed-column" className="lg:col-span-7 flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/10">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <h2 className="text-xl font-bold font-sans text-white tracking-tight flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-950 border border-emerald-500/30">
                <Filter className="w-4 h-4 text-emerald-400" />
              </span>
              Signal Feed
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                {filteredSignals.length} Active
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={isScanning}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/15 hover:border-emerald-500/35 text-emerald-400 disabled:opacity-50 transition cursor-pointer flex items-center gap-1 text-xs font-mono"
                title="Re-scan data sources"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Re-Scan'}</span>
              </button>
            </h2>

            {/* Simulated Signal Hub CTA & Header Search */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch sm:items-center">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-emerald-500/50" />
                <input
                  type="text"
                  placeholder="Filter company or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950/60 border border-emerald-500/10 hover:border-emerald-500/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono transition-all"
                />
              </div>
              <button 
                id="presets-trigger"
                onClick={() => setShowSimPanel(!showSimPanel)}
                className="text-xs font-mono bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-emerald-400 cursor-pointer justify-center md:w-auto shrink-0 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Harvest Simulator {showSimPanel ? 'Close' : 'Open'}
              </button>
            </div>
          </div>

          {/* SIMULATOR QUICK DRAWER */}
          <AnimatePresence>
            {showSimPanel && (
              <motion.div
                id="simulator-drawer"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 border-t border-emerald-500/15 pt-4 overflow-hidden"
              >
                <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">Simulate real-world signal ingestion:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => triggerSimulationPreset('buying')}
                    className="p-2 rounded-lg bg-neutral-900 border border-emerald-500/10 hover:border-emerald-500/30 text-left hover:bg-neutral-800/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                      Scale AI (LinkedIn)
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1 block">VP Buying Intent LinkedIn Pulse</span>
                  </button>

                  <button
                    onClick={() => triggerSimulationPreset('job')}
                    className="p-2 rounded-lg bg-neutral-900 border border-emerald-500/10 hover:border-emerald-500/30 text-left hover:bg-neutral-800/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                      Vercel Inc (JobBoard)
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1 block">VP Enterprise Hiring Postings</span>
                  </button>

                  <button
                    onClick={() => triggerSimulationPreset('funding')}
                    className="p-2 rounded-lg bg-neutral-900 border border-emerald-500/10 hover:border-emerald-500/30 text-left hover:bg-neutral-800/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Target className="w-3.5 h-3.5 text-pink-400" />
                      Pinecone (Crunchbase)
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1 block">Series C Invest Funding Stream</span>
                  </button>
                </div>

                <form onSubmit={handleCustomSubmit} className="bg-emerald-950/10 border border-emerald-500/10 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-semibold text-emerald-400">Or Synthesize Custom Entity:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Company Name (e.g. OpenAI)"
                      value={simCompany}
                      onChange={(e) => setSimCompany(e.target.value)}
                      className="bg-neutral-900 border border-emerald-500/20 text-xs px-2.5 py-1.5 rounded text-white focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Event Header / Title"
                      value={simTitle}
                      onChange={(e) => setSimTitle(e.target.value)}
                      className="bg-neutral-900 border border-emerald-500/20 text-xs px-2.5 py-1.5 rounded text-white focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value as any)}
                      className="bg-neutral-900 border border-emerald-500/20 text-xs px-2.5 py-1.5 rounded text-white focus:outline-none focus:border-emerald-500 pointer-events-auto"
                    >
                      <option value="Buying Intent">Buying Intent</option>
                      <option value="Hiring Boom">Hiring Boom</option>
                      <option value="Leadership Change">Leadership Change</option>
                      <option value="Expansion">Expansion</option>
                      <option value="Funding Round">Funding Round</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSimulating || !simCompany}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold uppercase font-mono tracking-wider text-xs py-1.5 rounded cursor-pointer transition"
                  >
                    {isSimulating ? 'Harvesting Pipeline...' : 'Synthesize Real-time Vector Ingest'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FILTERS */}
          <div className="mt-4 flex flex-col gap-3">
            {/* Search + Confidence */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Query company, keyterm, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900/60 border border-emerald-500/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Confidence slider */}
              <div className="md:col-span-7 flex items-center justify-between bg-neutral-900/40 border border-emerald-500/10 px-3 py-1.5 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono text-neutral-400">Min Rating: {confidenceMin}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={confidenceMin}
                  onChange={(e) => setConfidenceMin(parseInt(e.target.value))}
                  className="w-1/2 accent-emerald-400 h-1 bg-neutral-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Quick Filter Caps */}
            <div className="flex flex-wrap gap-1.5 border-t border-emerald-500/10 pt-3">
              <span className="text-[10px] font-mono uppercase text-neutral-400 mr-1.5 flex items-center">Sources:</span>
              {sources.map(src => (
                <button
                  key={src}
                  onClick={() => setFilterSource(src)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer transition ${
                    filterSource === src 
                      ? 'bg-emerald-400 text-black font-semibold' 
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-emerald-500/10'
                  }`}
                >
                  {src === 'all' ? 'Show All' : src}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 mr-2 flex items-center text-nowrap">Categories:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer transition ${
                    filterCategory === cat 
                      ? 'bg-emerald-400 text-black font-semibold' 
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-emerald-500/10'
                  }`}
                >
                  {cat === 'all' ? 'All Intents' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FEED SCROLL CONTAINER */}
        <div 
          id="feed-list-scroll" 
          className="max-h-[580px] overflow-y-auto pr-1 flex flex-col gap-2"
        >
          <AnimatePresence initial={false}>
            {isScanning ? (
              <div className="flex flex-col gap-2 py-1">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-3.5 rounded-xl border border-emerald-500/5 bg-neutral-900/40 select-none animate-pulse flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-neutral-950 border border-emerald-500/5" />
                        <div className="h-3 w-28 bg-neutral-950/80 rounded" />
                      </div>
                      <div className="h-4 w-12 bg-emerald-950/40 rounded-full" />
                    </div>
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="h-4 w-3/4 bg-neutral-950/60 rounded" />
                      <div className="h-3 w-5/6 bg-neutral-950/40 rounded" />
                    </div>
                  </div>
                ))}
                <div className="text-center py-4 text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5 bg-neutral-950/20 border border-emerald-500/5 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Simulating real-time signal stream re-scan...
                </div>
              </div>
            ) : filteredSignals.length === 0 ? (
              <div className="text-center py-12 bg-neutral-950/40 border border-dashed border-emerald-500/10 rounded-xl">
                <p className="text-sm text-neutral-400">No signals match your filter parameters.</p>
                <button
                  onClick={() => {
                    setFilterSource('all');
                    setFilterCategory('all');
                    setSearchQuery('');
                    setConfidenceMin(50);
                  }}
                  className="mt-2 text-xs font-mono text-emerald-400 hover:underline"
                >
                  Reset all criteria
                </button>
              </div>
            ) : (
              filteredSignals.map((sig, index) => {
                const isSelected = selectedSignal?.id === sig.id;
                return (
                  <motion.div
                    key={sig.id}
                    id={`sig-item-${sig.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => onSelectSignal(sig)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left relative overflow-hidden flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-emerald-950/20 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                        : 'bg-neutral-900/60 border-emerald-500/10 hover:border-emerald-500/25 hover:bg-neutral-900/90'
                    }`}
                  >
                    {/* Left small neon glow line on selection */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-400" />
                    )}

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-1.5 rounded bg-neutral-950 border border-emerald-500/20">
                          {getSourceIcon(sig.source)}
                        </span>
                        <div>
                          <h4 className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                            {sig.company}
                            <span className="text-[10px] text-neutral-600">•</span>
                            <span className="text-[10px] lowercase text-neutral-500">{sig.domain}</span>
                          </h4>
                        </div>
                      </div>

                      {/* Confidence Score Ring / Badge with Sparkline */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Sparkline seed={sig.id} baseScore={sig.confidenceScore} width={34} height={12} />
                        <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                          <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          {sig.confidenceScore}% Acc
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight leading-tight">
                        {sig.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                        {sig.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-emerald-500/5">
                      <div className="flex gap-1 flex-wrap items-center">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getCategoryBadgeClass(sig.intentCategory)}`}>
                          {sig.intentCategory}
                        </span>
                        
                        {/* Status tracker */}
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          sig.status === 'qualified' 
                            ? 'bg-emerald-400 text-black font-semibold' 
                            : sig.status === 'analyzing'
                            ? 'bg-neutral-900 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-950 text-neutral-400'
                        }`}>
                          {sig.status}
                        </span>

                        {/* Custom Data Provenance label */}
                        {sig.id.includes('live') ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 font-bold tracking-tight">
                            ⚡ Live Processing
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-500 border border-amber-500/10 font-bold tracking-tight">
                            📂 Sample Data
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                        <span>{sig.timestamp}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: Detail Inspector (5 Cols) */}
      <div id="inspector-column" className="lg:col-span-5">
        <AnimatePresence mode="wait">
          {selectedSignal ? (() => {
            const opp = getSignalOpportunityDetails(selectedSignal, leads);
            return (
              <motion.div
                key={selectedSignal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-panel p-5 rounded-xl border border-emerald-400/20 text-left relative flex flex-col h-full overflow-hidden"
              >
                {/* Top ambient glowing mesh inside inspector */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-bl-full filter blur-xl" />

                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4 mb-4">
                  <div>
                    <div className="flex gap-1.5 items-center flex-wrap">
                      <span className="text-[10px] font-mono uppercase bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
                        Opportunity Analyzer
                      </span>
                      {selectedSignal.id.includes('live') ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 font-bold tracking-tight">
                          ⚡ Live Processing
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-500 border border-amber-500/10 font-bold tracking-tight">
                          📂 Sample Data
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-sans mt-1">Status: Ready to Pitch</p>
                  </div>
                  <div id="inspector-confidence-score" className="flex items-center gap-3">
                    <Sparkline seed={selectedSignal.id} baseScore={selectedSignal.confidenceScore} width={54} height={20} />
                    <div className="text-right font-mono">
                      <span className="text-lg font-bold text-emerald-400">{selectedSignal.confidenceScore}%</span>
                      <p className="text-[10px] text-neutral-500">Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Core Entity Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-neutral-900 rounded-lg border border-emerald-500/20 text-emerald-400">
                    {getSourceIcon(selectedSignal.source)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{selectedSignal.company}</h3>
                    <a 
                      href={`https://${selectedSignal.domain}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {selectedSignal.domain}
                      <ArrowRight className="w-3 h-3 -rotate-45" />
                    </a>
                  </div>
                </div>

                {/* Opportunity Summary Element Container */}
                <div className="bg-neutral-950/60 border border-emerald-500/10 p-4 rounded-xl text-xs flex flex-col gap-3 mb-4">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-500/5">
                    <span className="text-sm font-semibold text-white tracking-tight">Opportunity Summary</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">Priority Match</span>
                  </div>

                  <div className="grid grid-cols-3 gap-y-2.5 gap-x-2">
                    <span className="text-neutral-500 font-mono uppercase text-[10px] tracking-wider">Company:</span>
                    <span className="col-span-2 text-white font-medium">{opp.company}</span>

                    <span className="text-neutral-500 font-mono uppercase text-[10px] tracking-wider">Signal Type:</span>
                    <span className="col-span-2 text-white font-medium">{opp.signalType}</span>

                    <span className="text-neutral-500 font-mono uppercase text-[10px] tracking-wider">Decision Maker:</span>
                    <span className="col-span-2 text-white font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
                      {opp.decisionMaker}
                    </span>

                    <span className="text-neutral-500 font-mono uppercase text-[10px] tracking-wider">Buying Intent:</span>
                    <span className="col-span-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        opp.buyingIntent === 'High' 
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30' 
                          : 'bg-blue-950/50 text-blue-400 border-blue-500/30'
                      }`}>
                        {opp.buyingIntent}
                      </span>
                    </span>

                    <span className="text-neutral-500 font-mono uppercase text-[10px] tracking-wider">Confidence Score:</span>
                    <span className="col-span-2 text-emerald-400 font-bold font-mono">{opp.confidence}</span>

                    <span className="text-neutral-500 font-mono uppercase text-[10px] tracking-wider self-start mt-0.5">Recommended Action:</span>
                    <span className="col-span-2 text-neutral-300 leading-normal bg-neutral-900/60 border border-emerald-500/5 p-2 rounded-lg">
                      {opp.recommendedAction}
                    </span>
                  </div>
                </div>

                {/* Collapsible View AI Analysis Section */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-950/40 border border-emerald-500/10 hover:border-emerald-500/25 hover:bg-neutral-950/80 transition text-xs font-mono text-neutral-400 hover:text-emerald-400 cursor-pointer animate-none"
                  >
                    <span className="flex items-center gap-1">
                      {isAnalysisExpanded ? <ChevronUp className="w-3.5 h-3.5 animate-none" /> : <ChevronDown className="w-3.5 h-3.5 animate-none" />}
                      <span>View AI Analysis</span>
                    </span>
                    <span className="text-[10px] opacity-60">
                      {isAnalysisExpanded ? 'Hide' : 'Expand'}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isAnalysisExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 rounded-lg bg-neutral-950/90 border border-emerald-500/5 text-xs font-mono grid grid-cols-3 gap-y-2 text-neutral-400">
                          <span>Source:</span>
                          <span className="col-span-2 text-white capitalize flex items-center gap-1">
                            {getSourceIcon(selectedSignal.source)}
                            {selectedSignal.source}
                          </span>

                          <span>Keywords:</span>
                          <span className="col-span-2 text-white text-[11px] leading-relaxed break-words">{opp.keywords}</span>

                          <span>Confidence:</span>
                          <span className="col-span-2 text-emerald-400 font-bold">{opp.confidence} Rate Score</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simplified Extraction Steps Progress */}
                <div className="mb-4 pt-3 border-t border-emerald-500/10">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Extraction Steps</h4>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Signal detected</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Intent analyzed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Opportunity created</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                {selectedSignal.status !== 'qualified' && (
                  <button
                    onClick={() => onUpgradeSignal(selectedSignal)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold uppercase font-mono tracking-wider text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                  >
                    <Target className="w-4 h-4" />
                    Upgrade to Lead Board Opportunity
                  </button>
                )}
                {selectedSignal.status === 'qualified' && (
                  <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg text-xs font-mono text-emerald-400 justify-center">
                    <CheckCircle className="w-4 h-4 animate-bounce" />
                    <span>Leads board profile database created successfully!</span>
                  </div>
                )}
              </motion.div>
            );
          })() : (
            <div className="glass-panel p-12 rounded-xl border border-dashed border-emerald-500/10 text-center flex flex-col justify-center items-center h-full min-h-[400px]">
              <Box className="w-12 h-12 text-emerald-500/40 animate-pulse mb-3" />
              <h3 className="text-white font-sans font-semibold">Opportunity Inspector</h3>
              <p className="text-neutral-400 text-xs mt-1 max-w-[280px]">
                Click on any verified signal stream element to view rich business intelligence and actions.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
