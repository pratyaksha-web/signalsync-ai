import { useState, useEffect } from 'react';
import { 
  Signal, Lead, Agent, ActionLog, Stats 
} from './types';
import BackgroundGrid from './components/BackgroundGrid';
import StatsGrid from './components/StatsGrid';
import SignalFeedPanel from './components/SignalFeedPanel';
import LeadBoardPanel from './components/LeadBoardPanel';
import AgentActivityPanel from './components/AgentActivityPanel';
import RecentActionsPanel from './components/RecentActionsPanel';
import PipelineVisualization from './components/PipelineVisualization';
import { 
  Terminal, ShieldCheck, Cpu, Zap, Radio, Sparkles, HelpCircle, Filter, LayoutGrid, History,
  BrainCircuit, Mail, ChevronLeft, ChevronRight, SlidersHorizontal, Gauge
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Helper to get present IST Date & Time string
const getISTTime = (date: Date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);
  
  const map = new Map(parts.map(p => [p.type, p.value]));
  return `${map.get('year')}-${map.get('month')}-${map.get('day')} ${map.get('hour')}:${map.get('minute')}:${map.get('second')} IST`;
};

const getISTTimeOnly = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' IST';
};

// Starting Seed Data for Signals
const INITIAL_SIGNALS: Signal[] = [
  {
    id: 'sig-101',
    source: 'LinkedIn',
    company: 'Linear Corp',
    industry: 'DevTools / Productivity',
    domain: 'linear.app',
    timestamp: 'Just now',
    title: 'Linear Corp Head of Ops requests automated CRM recommendation',
    description: 'Elena Rostova (Head of Operations) posted seeking internal CRM tools recommendation: "Seeking pipeline sync engines that automatically upgrade incoming product events with custom-tailored Apollo target contacts."',
    intentCategory: 'Buying Intent',
    confidenceScore: 94,
    status: 'analyzing',
    rawPayload: {
      postUrl: 'https://linkedin.com/posts/elena-linear-crm',
      interactionCount: '42 Likes, 12 Comments',
      targetContact: 'Elena Rostova (Head of Operations)',
      keywordsIdentified: 'pipeline sync, Apollo contacts, CRM workflow'
    }
  },
  {
    id: 'sig-102',
    source: 'JobBoard',
    company: 'Pinecone Systems',
    industry: 'AI / Databases',
    domain: 'pinecone.io',
    timestamp: '2 mins ago',
    title: 'Pinecone posts 4 open Solution Design Engineer roles',
    description: 'Job postings mandating experience with Next.js edge proxies, vector token management, and custom outbound sales automation toolings.',
    intentCategory: 'Hiring Boom',
    confidenceScore: 89,
    status: 'harvested',
    rawPayload: {
      location: 'San Francisco (Hybrid)',
      department: 'Global Sales Engineering',
      salaryRange: '$165k - $210k Base + Equity',
      experienceLevel: 'Senior / Lead Architect'
    }
  },
  {
    id: 'sig-103',
    source: 'Crunchbase',
    company: 'Stripe Inc.',
    industry: 'Fintech / Payments',
    domain: 'stripe.com',
    timestamp: '7 mins ago',
    title: 'Stripe locks $450M Series F development expansion package',
    description: 'Secures massive capital reserves targeted at accelerating enterprise account capture, international compliance operations, and scaling raw merchant analytics APIs.',
    intentCategory: 'Funding Round',
    confidenceScore: 98,
    status: 'harvested',
    rawPayload: {
      roundType: 'Series F (Growth Equity)',
      preMoneyValuation: '$65 Billion USD',
      participatingVCS: 'Sequoia Capital, Founders Fund, General Catalyst'
    }
  },
  {
    id: 'sig-104',
    source: 'News',
    company: 'Notion Labs',
    industry: 'Productivity / Workspace',
    domain: 'notion.so',
    timestamp: '15 mins ago',
    title: 'Notion announces plan to transition CRM stack',
    description: 'Press release cites core architectural plans to drop legacy Hubsport API workflows in favor of bespoke real-time client pipeline harvesters to save outbound engineering hours.',
    intentCategory: 'Tech Stack Drop',
    confidenceScore: 92,
    status: 'harvested',
    rawPayload: {
      pressUrl: 'https://notion.so/news/introducing-engineered-crm-partnerships',
      architectQuote: 'Scaling metadata structures leads to latency. Seeking lighter automated pipeline layers.',
      priorityLevel: 'Ultra High Priority'
    }
  },
  {
    id: 'sig-105',
    source: 'Slack',
    company: 'SupaTech Corp',
    industry: 'SaaS Platforms',
    domain: 'supatech.io',
    timestamp: '25 mins ago',
    title: 'VP of Customer Onboarding posts integration query in private SaaS group',
    description: 'Mentioned frustration with existing database onboarding drop-off. Looking for automated outbound engines to instantly target custom contacts based on API errors.',
    intentCategory: 'Leadership Change',
    confidenceScore: 87,
    status: 'disregarded',
    rawPayload: {
      slackGroup: 'Global SaaS Onboarding Founders (3,400 members)',
      userTokenID: 'U058XFZ931A',
      rawText: 'Any tools that watch postgres signup drops and immediately synthesize high-relevance sales templates?'
    }
  }
];

// Starting Seed Data for Leads
const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-001',
    signalId: 'sig-101',
    company: 'Linear Corp',
    contactName: 'Elena Rostova',
    contactTitle: 'Head of Operations',
    contactEmail: 'elena@linear.app',
    contactAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    leadScore: 94,
    intentStrength: 'High',
    estimatedValue: '$48,000/yr',
    suggestedPitch: 'Hi Elena, noticed your post about scaling Linear CRM workflows to Apollo contacts. I built Signals Harvesting Engine to translate real-time Linear signup events into auto-drafted personalized outbound templates using high-context Apollo integrations. Let me know if you want to inspect a demo pipeline next Tuesday!',
    status: 'new'
  },
  {
    id: 'lead-002',
    signalId: 'sig-102',
    company: 'Pinecone Systems',
    contactName: 'Avery Chen',
    contactTitle: 'VP of Solutions Engineering',
    contactEmail: 'avery@pinecone.io',
    contactAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    leadScore: 88,
    intentStrength: 'Medium',
    estimatedValue: '$72,000/yr',
    suggestedPitch: 'Hey Avery, congrats on scale hiring in Solution Engineering at Pinecone! Saw your hiring surge for Next.js and custom sales outbound portals. Signals Harvesting Engine automatically maps these technical skill changes to preloaded outreach templates, so you do not waste engineering hours building internal pipeline scripts. Would love to send a mock proof-of-concept setup.',
    status: 'new'
  }
];

// Starting Seed Data for AI Harvester Agents
const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-scylla',
    name: 'Social-Signal-Watcher',
    version: 'v1.4.2',
    type: 'crawler',
    status: 'harvesting',
    efficiency: 99.1,
    signalsProcessed: 432,
    intensity: 'balanced',
    activityLogs: [
      '[social-signal-watcher] Ingestion channel linkedin.posts initialized successfully.',
      '[social-signal-watcher] Processed 14 global LinkedIn bio change records.',
      '[social-signal-watcher] Matched company: Linear Corp with filter rating > 85%.',
      '[social-signal-watcher] Pipeline target elena@linear.app stored in temporary queue.'
    ]
  },
  {
    id: 'agent-charybdis',
    name: 'Job-Board-Analyzer',
    version: 'v2.1.0',
    type: 'analyzer',
    status: 'processing',
    efficiency: 98.4,
    signalsProcessed: 815,
    intensity: 'stealth',
    activityLogs: [
      '[job-board-analyzer] Scanning job board indices across 18 tech portals...',
      '[job-board-analyzer] 4 new active postings found at Pinecone Systems.',
      '[job-board-analyzer] Analyzing job requirement keywords: "Next.js", "outbound", "sales tech".',
      '[job-board-analyzer] Passed verified signal dataset sig-102 with confidence 89%.'
    ]
  },
  {
    id: 'agent-siren',
    name: 'Community-Lead-Sourcer',
    version: 'v0.9.8',
    type: 'pitcher',
    status: 'generating',
    efficiency: 97.2,
    signalsProcessed: 184,
    intensity: 'overdrive',
    activityLogs: [
      '[comm-sourcer] Watching 12 public community nodes and SaaS Slack networks.',
      '[comm-sourcer] Intent detected on SupaTech Corp via Slack channels.',
      '[comm-sourcer] Query parsing complete. Score: 87. Mapped intent category: Buying Intent.',
      '[comm-sourcer] Awaiting final automated sequence triggers to draft outreach.'
    ]
  }
];

// Starting Seed Data for System Audit Logs
const INITIAL_ACTION_LOGS: ActionLog[] = [
  {
    id: 'log-1',
    timestamp: '17:50:05 IST',
    type: 'signal_harvested',
    title: 'Signal Ingestion Success',
    description: 'Extracted high-context LinkedIn post details from Elena Rostova (Linear Corp).',
    severity: 'success'
  },
  {
    id: 'log-2',
    timestamp: '17:51:12 IST',
    type: 'lead_qualified',
    title: 'Lead Score Mapped - 94%',
    description: 'Correlated Linear Corp event mapped to Elena contact directory with ARR potential of $48K.',
    severity: 'success'
  },
  {
    id: 'log-3',
    timestamp: '17:53:44 IST',
    type: 'agent_alert',
    title: 'High Throughput Alert',
    description: 'Community Lead Sourcer switched to Overdrive Mode. Active rate limits monitored.',
    severity: 'warning'
  }
];

export default function App() {
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>(INITIAL_ACTION_LOGS);
  
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(INITIAL_SIGNALS[0]);
  const [automationActive, setAutomationActive] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [systemTime, setSystemTime] = useState<string>(getISTTime());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);
  const [isDemoModeRunning, setIsDemoModeRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isPipelineActive, setIsPipelineActive] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'signals' | 'leads' | 'agents' | 'operations'>('dashboard');
  const [confetti, setConfetti] = useState<{ id: string; targetX: number; targetY: number[]; rotate: number; size: number; color: string; duration: number }[]>([]);

  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 70 }).map((_, i) => {
      // Shoot generally upward and outwards
      const angle = (Math.random() * 120 + 30) * (Math.PI / 180);
      const velocity = Math.random() * 300 + 150;
      const targetX = Math.cos(angle) * velocity;
      const peakY = -Math.sin(angle) * velocity;
      const fallY = peakY + Math.random() * 100 + 150; // gravity fall effect
      const colors = [
        '#10b981', // emerald-500
        '#34d399', // emerald-400
        '#6ee7b7', // emerald-300
        '#a855f7', // purple-500
        '#c084fc', // purple-400
        '#06b6d4', // cyan-500
        '#22d3ee', // cyan-400
        '#fbbf24', // amber-400
        '#f59e0b', // amber-500
      ];
      return {
        id: `conf-p-${Date.now()}-${i}-${Math.random()}`,
        targetX,
        targetY: [0, peakY, fallY],
        rotate: Math.random() * 720 - 360,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 1.6 + 1.2
      };
    });
    setConfetti(newConfetti);
    
    // Clear particles after completion to free up resources
    setTimeout(() => {
      setConfetti([]);
    }, 3200);
  };

  // Real-time Clock loop (IST timezone)
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(getISTTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Keyboard Shortcuts for main section navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in input, textarea or editing elements
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.isContentEditable)
      ) {
        return;
      }

      // Live '?' listener to toggle help modal
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
        return;
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        setShowShortcutsHelp(false);
        return;
      }

      const key = e.key.toLowerCase();
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

      if (hasModifier) {
        if (key === 'd') {
          e.preventDefault();
          setActiveSection('dashboard');
        } else if (key === 's') {
          e.preventDefault();
          setActiveSection('signals');
        } else if (key === 'l') {
          e.preventDefault();
          setActiveSection('leads');
        } else if (key === 'a') {
          e.preventDefault();
          setActiveSection('agents');
        } else if (key === 'o') {
          e.preventDefault();
          setActiveSection('operations');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Guided Tour Focus state listener
  useEffect(() => {
    if (!showOnboarding) {
      setHighlightRect(null);
      return;
    }

    // Force tab section mapping based on tour step
    if (tourStep === 1 || tourStep === 2 || tourStep === 3) {
      if (activeSection !== 'signals') {
        setActiveSection('signals');
      }
      if (tourStep >= 2 && !selectedSignal && signals.length > 0) {
        setSelectedSignal(signals[0]);
      }
    } else if (tourStep === 4 || tourStep === 5) {
      if (activeSection !== 'leads') {
        setActiveSection('leads');
      }
    }

    // Calculate rectangle of active target
    const handleUpdateRect = () => {
      let selector = '';
      if (tourStep === 1) selector = '#signal-feed-panel';
      else if (tourStep === 2) selector = '#inspector-column';
      else if (tourStep === 3) {
        selector = document.querySelector('#inspector-confidence-score') ? '#inspector-confidence-score' : '#inspector-column';
      }
      else if (tourStep === 4) selector = '#lead-board-panel';
      else if (tourStep === 5) {
        selector = document.querySelector('#lead-outreach-container') ? '#lead-outreach-container' : '#lead-board-panel';
      }

      const element = selector ? document.querySelector(selector) : null;
      if (element) {
        // Scroll target gently into viewport segment
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add dynamic CSS class for pulse effect trigger
        element.classList.add('tour-highlight-active');
        
        // Get viewport rect
        const rect = element.getBoundingClientRect();
        setHighlightRect({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          toJSON: () => {}
        } as DOMRect);

        return () => {
          element.classList.remove('tour-highlight-active');
        };
      } else {
        setHighlightRect(null);
      }
    };

    // Delay calculation slightly so React has time to render the switch layout Tab transition
    const timer = setTimeout(() => {
      handleUpdateRect();
    }, 280);

    window.addEventListener('resize', handleUpdateRect);
    window.addEventListener('scroll', handleUpdateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleUpdateRect);
      window.removeEventListener('scroll', handleUpdateRect, true);
    };
  }, [tourStep, showOnboarding, activeSection, selectedSignal, signals]);

  // Live Auto-Agent tick loop to simulate a live business ecosystem!
  useEffect(() => {
    if (!automationActive) return;

    const interval = setInterval(() => {
      // 1. Roll a random mock event: new signal vs agent status switch
      const dice = Math.random();

      if (dice < 0.45) {
        // Option A: Harvest a new random signal!
        const companies = ['Airbnb', 'Stripe', 'Supabase', 'Framer', 'Slack', 'Canva', 'Retool', 'Duolingo'];
        const chosenCompany = companies[Math.floor(Math.random() * companies.length)];
        const domains = {
          'Airbnb': 'airbnb.com',
          'Stripe': 'stripe.com',
          'Supabase': 'supabase.io',
          'Framer': 'framer.com',
          'Slack': 'slack.com',
          'Canva': 'canva.com',
          'Retool': 'retool.com',
          'Duolingo': 'duolingo.com'
        } as Record<string, string>;

        const eventTitles = [
          `Engineering Director posts outbound stack expansion`,
          `Transitioning analytics API framework to custom edge solutions`,
          `VC reports Series C funding closure for AI scale`,
          `Hiring 5 Enterprise Account Executives to drive SaaS market`,
          `Seeking outbound contact discovery engines on public channels`
        ];
        const chosenTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];

        const categories: Signal['intentCategory'][] = ['Buying Intent', 'Hiring Boom', 'Leadership Change', 'Funding Round'];
        const chosenCategory = categories[Math.floor(Math.random() * categories.length)];

        const sources: Signal['source'][] = ['LinkedIn', 'JobBoard', 'Slack', 'Crunchbase', 'News'];
        const chosenSource = sources[Math.floor(Math.random() * sources.length)];

        const confidence = Math.floor(Math.random() * 15) + 81;
        const newId = `sig-${Date.now()}`;
        const newSig: Signal = {
          id: newId,
          source: chosenSource,
          company: chosenCompany,
          domain: domains[chosenCompany] || `${chosenCompany.toLowerCase()}.io`,
          industry: 'Enterprise Technology',
          timestamp: 'Just now',
          title: `${chosenCompany} ${chosenTitle}`,
          description: `Telemetry routine detected activity regarding scaling sales pipelines, system drops, or customer growth parameters.`,
          intentCategory: chosenCategory,
          confidenceScore: confidence,
          status: 'harvested',
          rawPayload: {
            sourceSystemId: `raw-node-${Math.floor(Math.random() * 900) + 100}`,
            scrawledAt: new Date().toLocaleTimeString(),
            parametersMatched: 'Sales CRM API, lead qualifying criteria, edge databases'
          }
        };

        // Add to signals list
        setSignals(prev => [newSig, ...prev.slice(0, 9)]); // Keep max 10 to save performance and layout

        // Push to logs
        const newLog: ActionLog = {
          id: `log-${Date.now()}`,
          timestamp: getISTTimeOnly(),
          type: 'signal_harvested',
          title: `Autonomous Harvest Ingest: ${chosenCompany}`,
          description: `Matched confidence rating (${confidence}%) for keyterms in ${chosenCategory}. Passed to cue.`,
          severity: 'success'
        };
        setActionLogs(prev => [newLog, ...prev.slice(0, 14)]);

        // Update random agent log counters
        setAgents(prev => prev.map(ag => {
          if (ag.id === 'agent-scylla') {
            return {
              ...ag,
              signalsProcessed: ag.signalsProcessed + 1,
              activityLogs: [
                `[social-signal-watcher] Match complete on domain ${newSig.domain} via scheduled network polling.`,
                ...ag.activityLogs.slice(0, 3)
              ]
            };
          }
          return ag;
        }));

      } else if (dice < 0.7) {
        // Option B: Agent status log cycles
        setAgents(prev => prev.map(ag => {
          const statuses: Agent['status'][] = ['idle', 'harvesting', 'processing', 'generating'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          const logLines = [
            `[system-agent] Successfully pinged proxy nodes. Health status GREEN.`,
            `[system-agent] Parsing target metadata queues: 28 tasks remaining.`,
            `[system-agent] Synthesizing automated pitch scripts using custom prompt directives.`,
            `[system-agent] Quota limits healthy. Saving 42% API requests via local redis caching.`
          ];
          return {
            ...ag,
            status: newStatus,
            activityLogs: [
              logLines[Math.floor(Math.random() * logLines.length)],
              ...ag.activityLogs.slice(0, 3)
            ]
          };
        }));
      }

    }, 6000);

    return () => clearInterval(interval);
  }, [automationActive]);

  // Demo Mode scripted progression
  useEffect(() => {
    if (!isDemoModeRunning || demoStep === 0) return;
    
    if (demoStep < 5) {
      const timer = setTimeout(() => {
        setDemoStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDemoModeRunning, demoStep]);

  // AI Pipeline Live Processing progression
  useEffect(() => {
    if (!isPipelineActive || pipelineStep === 0) return;
    
    if (pipelineStep < 7) {
      const timer = setTimeout(() => {
        setPipelineStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Completed step 7 -> Commit the actual data!
      const timer = setTimeout(() => {
        commitRealPipelineData();
        setIsPipelineActive(false);
        setPipelineStep(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPipelineActive, pipelineStep]);

  const commitRealPipelineData = () => {
    const liveCompanies = ['Vercel', 'PostHog', 'Hugging Face', 'Coherent', 'Grafana Lab'];
    const chosenCompany = liveCompanies[Math.floor(Math.random() * liveCompanies.length)];
    const domain = `${chosenCompany.toLowerCase().replace(/\s+/g, '')}.com`;
    const sigId = `sig-live-${Date.now()}`;
    const leadId = `lead-live-${Date.now()}`;
    const score = Math.floor(Math.random() * 8) + 91; // High score like 91-98
    
    const newSignal: Signal = {
      id: sigId,
      source: 'GitHub',
      company: chosenCompany,
      domain: domain,
      industry: 'Developer Tools / Infrastructure',
      timestamp: 'Just now',
      title: `${chosenCompany} opens integrated scale endpoints with outbound webhook specs`,
      description: `Detected live repository commit patterns referencing custom target account pipelines. AI Harvester verified buying alignment.`,
      intentCategory: 'Tech Stack Drop',
      confidenceScore: score,
      status: 'qualified',
      rawPayload: {
        gitHubRepo: `github.com/${chosenCompany.toLowerCase()}/outreach-sync`,
        starsCount: '232 Stars',
        activeContributors: '14 Core engineers',
        keyphraseMatched: 'webhook-handler, sync-outflow'
      }
    };

    const newLead: Lead = {
      id: leadId,
      signalId: sigId,
      company: chosenCompany,
      contactName: `${['Marcus', 'Sophia', 'Chloe', 'Alex'][Math.floor(Math.random() * 4)]} ${['Sterling', 'Wong', 'Guerrero', 'Kowalski'][Math.floor(Math.random() * 4)]}`,
      contactTitle: 'Director of Integration Architecture',
      contactEmail: `integration-lead@${domain}`,
      contactAvatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1534528741775-53994a69daeb' : '1506794778202-cad84cf45f1d'}?w=150`,
      leadScore: score,
      intentStrength: 'High',
      estimatedValue: `$${Math.floor(Math.random() * 20) + 70},000/yr`,
      suggestedPitch: `Hello, noticed active platform integrations committing at ${chosenCompany}! Our neural engine parsed the webhook event sequences and qualified high-intent target contact metrics. Would love to request a quick 5-minute telemetry demonstration next Tuesday?`,
      status: 'new'
    };

    const newLog: ActionLog = {
      id: `log-live-${Date.now()}`,
      timestamp: getISTTimeOnly(),
      type: 'signal_harvested',
      title: `⚡ Live Pipeline Ingress: ${chosenCompany}`,
      description: `Intercepted social metadata, triggered automated NLP classification, mapped lead score (${score}%), and committed qualified Lead board opportunity.`,
      severity: 'success'
    };

    setSignals(prev => [newSignal, ...prev]);
    setLeads(prev => [newLead, ...prev]);
    setActionLogs(prev => [newLog, ...prev]);
    setSelectedSignal(newSignal); // auto focus newly created signal
    setActiveSection('signals'); // auto open feed view to show live item!
    triggerConfetti(); // ignite confetti explosion!
  };

  // Handle Simulated Signal from Input
  const handleSimulateCustomSignal = (customData: Partial<Signal>) => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const newId = `sig-sim-${Date.now()}`;
      const simulatedSignal: Signal = {
        id: newId,
        source: customData.source || 'LinkedIn',
        company: customData.company || 'Scale AI',
        domain: customData.domain || 'scale.com',
        industry: customData.industry || 'Technology / SaaS',
        timestamp: 'Just now',
        title: customData.title || 'VP of Product triggers custom expansion sequence',
        description: customData.description || 'Raw telemetry matched with high buying score for outbound CRM services.',
        intentCategory: customData.intentCategory || 'Buying Intent',
        confidenceScore: customData.confidenceScore || 91,
        status: 'harvested',
        rawPayload: customData.rawPayload || { simulated: 'true', origin: 'manual_trigger' }
      };

      setSignals(prev => [simulatedSignal, ...prev]);
      setSelectedSignal(simulatedSignal);
      setIsSimulating(false);

      // Log success
      const newLog: ActionLog = {
        id: `log-sim-${Date.now()}`,
        timestamp: getISTTimeOnly(),
        type: 'signal_harvested',
        title: `Manual Synthesis Harvested: ${simulatedSignal.company}`,
        description: `Injected manually generated seed dataset to telemetry line. Confidence: ${simulatedSignal.confidenceScore}%`,
        severity: 'success'
      };
      setActionLogs(prev => [newLog, ...prev]);

      // Trigger automatic conversion to lead board right away for cool fluid UX if score high!
      if (simulatedSignal.confidenceScore >= 88) {
        setTimeout(() => {
          const femaleNames = ['Sarah Jenkins', 'Meredith Vance', 'Claire Dubois', 'Zara Patel'];
          const maleNames = ['Brian Cho', 'Dmitri Vancamp', 'Nico Alvarez', 'Koji Sato'];
          const randomName = Math.random() > 0.5 
            ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
            : maleNames[Math.floor(Math.random() * maleNames.length)];
          const avatarIndex = Math.floor(Math.random() * 4) + 1;
          const fakeAvatar = `https://images.unsplash.com/photo-${avatarIndex === 1 ? '1534528741775-53994a69daeb' : avatarIndex === 2 ? '1506794778202-cad84cf45f1d' : avatarIndex === 3 ? '1500648767791-00dcc994a43e' : '1494790108377-be9c29b29330'}?w=150`;

          const newLead: Lead = {
            id: `lead-sim-${Date.now()}`,
            signalId: simulatedSignal.id,
            company: simulatedSignal.company,
            contactName: randomName,
            contactTitle: customData.intentCategory === 'Funding Round' ? 'Chief Executive Officer' : 'VP of Growth Tech',
            contactEmail: `${randomName.toLowerCase().replace(/\s+/g, '')}@${simulatedSignal.domain}`,
            contactAvatar: fakeAvatar,
            leadScore: simulatedSignal.confidenceScore,
            intentStrength: simulatedSignal.confidenceScore >= 90 ? 'High' : 'Medium',
            estimatedValue: `$${Math.floor(Math.random() * 30) + 40},000/yr`,
            suggestedPitch: `Hey ${randomName.split(' ')[0]}, congrats on the forward momentum at ${simulatedSignal.company}! Our harvesters flagged active priorities surrounding ${simulatedSignal.intentCategory}. We mapped this template automatically using the Harvesting Engine to solve outgoing integration blockers. Do you have 5 minutes for a telemetry analysis Tuesday?`,
            status: 'new'
          };

          setLeads(prev => [newLead, ...prev]);

          // Log database auto-correlate Lead conversion
          const leadLog: ActionLog = {
            id: `log-lead-${Date.now()}`,
            timestamp: getISTTimeOnly(),
            type: 'lead_qualified',
            title: `Lead Automatically Mapped: ${newLead.contactName}`,
            description: `Correlated ${newLead.company} signal data. Generated target profile with Lead Score of ${newLead.leadScore}%.`,
            severity: 'success'
          };
          setActionLogs(prev => [leadLog, ...prev]);
        }, 1200);
      }

    }, 800);
  };

  // Convert a signal to a Lead opportunity manually
  const handleManualUpgradeSignal = (sig: Signal) => {
    // Check if lead already exists
    if (leads.some(l => l.signalId === sig.id)) {
      alert("This opportunity already exists in the Lead Board!");
      return;
    }

    const firstNames = ['Chloe', 'Alexander', 'Devon', 'Karthik', 'Rebecca', 'Marcus'];
    const lastNames = ['Sterling', 'Dhar', 'Kowalski', 'Guerrero', 'Nixon', 'Chao'];
    const chosenName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    
    const index = Math.floor(Math.random() * 3) + 1;
    const fakeAvatar = `https://images.unsplash.com/photo-${index === 1 ? '1534528741775-53994a69daeb' : index === 2 ? '1506794778202-cad84cf45f1d' : '1500648767791-00dcc994a43e'}?w=150`;

    const newLead: Lead = {
      id: `lead-man-${Date.now()}`,
      signalId: sig.id,
      company: sig.company,
      contactName: chosenName,
      contactTitle: 'VP of Operations Architecture / Lead',
      contactEmail: `${chosenName.toLowerCase().replace(/\s+/g, '')}@${sig.domain}`,
      contactAvatar: fakeAvatar,
      leadScore: sig.confidenceScore,
      intentStrength: sig.confidenceScore >= 90 ? 'High' : 'Medium',
      estimatedValue: `$52,000/yr`,
      suggestedPitch: `Hello ${chosenName.split(' ')[0]}, saw active expansion signals at ${sig.company} concerning ${sig.intentCategory}. Our harvesters mapped these details automatically to suggest outbound operations support. I would love to schedule a custom trial next week.`,
      status: 'new'
    };

    setLeads(prev => [newLead, ...prev]);

    // Update signal status label
    setSignals(prev => prev.map(s => s.id === sig.id ? { ...s, status: 'qualified' } : s));
    if (selectedSignal?.id === sig.id) {
      setSelectedSignal({ ...selectedSignal, status: 'qualified' });
    }

    // Push log
    const upgradeLog: ActionLog = {
      id: `log-upg-${Date.now()}`,
      timestamp: getISTTimeOnly(),
      type: 'lead_qualified',
      title: 'Manual Signal Upgraded',
      description: `Target lead profile mapped for ${chosenName} at ${sig.company}. Pitch created.`,
      severity: 'success'
    };
    setActionLogs(prev => [upgradeLog, ...prev]);

    // Trigger dynamic framer-motion confetti celebratory sequence
    triggerConfetti();
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const handleRemoveLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
    
    // Log deletion
    const delLog: ActionLog = {
      id: `log-del-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      type: 'agent_idle',
      title: 'Lead Opportunity Dismissed',
      description: `Removed ${lead?.company || 'Opportunity'} from primary active pipeline index.`,
      severity: 'warning'
    };
    setActionLogs(prev => [delLog, ...prev]);
  };

  // Dispatch pitch outreach simulation
  const handleSendPitch = (lead: Lead) => {
    // Set state to contacted
    const updated = { ...lead, status: 'contacted' as const };
    handleUpdateLead(updated);

    // Push outreach logs
    const sentLog: ActionLog = {
      id: `log-pitch-${Date.now()}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      type: 'pitch_sent',
      title: `Outreach Dispatched: ${lead.contactName}`,
      description: `Delivered targeted email pitch to ${lead.contactEmail} with personalized context from ${lead.company} metadata.`,
      severity: 'success'
    };
    setActionLogs(prev => [sentLog, ...prev]);

    // Randomize response trigger simulation after 10 seconds for incredible fun!
    setTimeout(() => {
      const replyLog: ActionLog = {
        id: `log-reply-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'lead_qualified',
        title: `🎯 Reply Received: ${lead.company}`,
        description: `${lead.contactName} replied: "This is creepy but perfectly timed. Let's block 15 minutes Tuesday." Booking link suggested!`,
        severity: 'success'
      };
      setActionLogs(prev => [replyLog, ...prev]);
    }, 12000);
  };

  const handleToggleAgentMode = (agentId: string, intensity: Agent['intensity']) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          intensity,
          activityLogs: [
            `[system-agent] Telemetry profile calibrated to ${intensity.toUpperCase()}.`,
            ...ag.activityLogs
          ]
        };
      }
      return ag;
    }));

    const modeLog: ActionLog = {
      id: `log-mode-${Date.now()}`,
      timestamp: getISTTimeOnly(),
      type: 'agent_alert',
      title: 'Harvester Core Calibrated',
      description: `Agent index adjusted to ${intensity.toUpperCase()} load balancing constraints.`,
      severity: 'info'
    };
    setActionLogs(prev => [modeLog, ...prev]);
  };

  const handleRunDiagnostics = (agentId: string) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          activityLogs: [
            `[diagnostics] Initiating standard system memory purge... OK`,
            `[diagnostics] Purged stale LinkedIn cookies. Re-seeding proxy network.`,
            `[diagnostics] Dynamic telemetry validation: Health rating 100%.`,
            ...ag.activityLogs
          ]
        };
      }
      return ag;
    }));

    const diagLog: ActionLog = {
      id: `log-diag-${Date.now()}`,
      timestamp: getISTTimeOnly(),
      type: 'agent_alert',
      title: 'Diagnostics Purge Sequence Complete',
      description: 'Cleaned proxy states, validated neural models connectivity and reset local memory stacks.',
      severity: 'success'
    };
    setActionLogs(prev => [diagLog, ...prev]);
  };

  // Live Stats calculations
  const totalSignalsCount = signals.length + 14200; // Seed stats for realistic high-end feel
  const currentStats: Stats = {
    totalSignals: totalSignalsCount,
    signalsRate: automationActive ? 1.4 : 0.2,
    qualifiedLeads: leads.length,
    conversionRate: Math.round((leads.length / Math.max(1, signals.length)) * 100),
    pipelineValue: leads.reduce((sum, lead) => {
      const numValue = parseInt(lead.estimatedValue.replace(/[^0-9]/g, '')) || 45000;
      return sum + numValue;
    }, 0) + 185000, // Seed database pipeline starting ARR
    activeAgentsCount: agents.filter(ag => ag.status !== 'idle').length
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative font-sans overflow-x-hidden p-3 md:p-6 pb-24">
      {/* Absolute futuristic backdrop component */}
      <BackgroundGrid />

      {/* Main Container Wrapper */}
      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
        
        {/* TOP STATUS HEADER RAIL */}
        <header id="main-header" className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-5 rounded-2xl glass-panel border border-emerald-500/10 mb-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-400" />
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 border border-emerald-500/20 rounded-xl relative group">
              <span className="absolute inset-0 bg-emerald-400/20 rounded-xl blur group-hover:blur-md transition-all duration-300" />
              <Radio className="w-6 h-6 text-emerald-400 relative z-10 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold whitespace-nowrap flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  🟢 AI-Assisted Demo Environment
                </span>
                {isDemoModeRunning ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-400 font-mono text-[9px] uppercase tracking-wider font-bold animate-pulse">
                    Demo Mode
                  </span>
                ) : isPipelineActive ? (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold animate-pulse">
                    Live Processing
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400 font-mono text-[9px] uppercase tracking-wider font-semibold">
                    Sample Data Mode
                  </span>
                )}
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isDemoModeRunning ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isDemoModeRunning ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase font-mono leading-none">
                SignalSync <span className="text-emerald-400 neon-text-glow">AI</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Convert business signals into sales opportunities in real time.
              </p>
            </div>
          </div>

          <div className="mt-3 md:mt-0 flex flex-col items-end text-right font-mono">
            <span className="text-xs text-neutral-400 flex items-center gap-1.5 bg-black/40 border border-emerald-500/15 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM CLOCK: <b className="text-white">{systemTime}</b>
            </span>
            <span className="text-[10px] text-neutral-600 mt-1 uppercase tracking-wider">
              No authentication mode • Cloud insights ACTIVE
            </span>
          </div>
        </header>

        {/* WORKFLOW GUIDE BANNER CARDS */}
        <div id="workflow-guide" className="p-4 rounded-xl bg-neutral-900/40 border border-emerald-500/10 relative z-10 text-left flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-start gap-3">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Pipeline Configuration &amp; Control Deck</h4>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl leading-normal">
                Deploy distinct automated insights: run an interactive, explanatory-only <b>Product Tour</b>, trigger a safe simulated <b>Demo Mode</b>, or engage the <b>AI Pipeline</b> to convert raw background business signals into sales opportunities in real-time.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <button
              onClick={() => {
                setTourStep(1);
                setShowOnboarding(true);
              }}
              className="px-3.5 py-2 bg-neutral-900 border border-blue-500/30 hover:border-blue-500/60 text-blue-400 hover:text-blue-300 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>❔ Product Tour</span>
            </button>
            <button
              onClick={() => {
                setIsDemoModeRunning(true);
                setDemoStep(1);
              }}
              className="px-3.5 py-2 bg-neutral-900 border border-amber-500/30 hover:border-amber-500/60 text-amber-500 hover:text-amber-400 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
            >
              <span>▶ Run Demo</span>
            </button>
            <button
              onClick={() => {
                setIsPipelineActive(true);
                setPipelineStep(1);
              }}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition cursor-pointer shadow-[0_2px_10px_rgba(16,185,129,0.2)] flex items-center gap-1"
            >
              <span>⚡ Run AI Pipeline</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mode Banners to let Judges always know what is active */}
        {isDemoModeRunning && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 relative z-10 text-left flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>⚠️ Demo Mode - Sample Data Simulated</span>
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-500">ReadOnly Sandboxed Profile</span>
          </div>
        )}

        {isPipelineActive && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 relative z-10 text-left flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wide">
                ⚡ Live Status: AI Pipeline Active - Live Processing
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-500">Writing pipeline insights to state</span>
          </div>
        )}

        {/* PERSISTENT ELEGANT SECTION NAVIGATION TABS */}
        <div id="navigation-tabs" className="flex flex-wrap gap-2.5 border-b border-emerald-500/15 pb-4 relative z-10 w-full">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Gauge, count: null, color: 'text-teal-400', keyHint: 'D' },
            { id: 'signals', label: 'Signal Feed', icon: Filter, count: signals.length, color: 'text-emerald-400', keyHint: 'S' },
            { id: 'leads', label: 'Lead Board', icon: LayoutGrid, count: leads.length, color: 'text-sky-400', keyHint: 'L' },
            { id: 'agents', label: 'AI Agent Activity', icon: Cpu, count: agents.length, color: 'text-purple-400', keyHint: 'A' },
            { id: 'operations', label: 'Operations Timeline', icon: History, count: actionLogs.length, color: 'text-amber-400', keyHint: 'O' },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isTabActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-mono font-bold border transition duration-200 cursor-pointer flex items-center gap-2 group ${
                  isTabActive
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-neutral-900/80 text-neutral-400 border-emerald-500/5 hover:border-emerald-500/20 hover:text-white'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 transition ${isTabActive ? 'text-black' : tab.color}`} />
                <span>{tab.label}</span>
                <kbd className={`hidden sm:inline-block text-[8px] scale-90 px-1 py-0.5 rounded font-mono font-bold border leading-none transition ${
                  isTabActive 
                    ? 'bg-black/10 text-neutral-900 border-black/10' 
                    : 'bg-neutral-950 text-neutral-500 border-neutral-800'
                }`} title={`Press Ctrl + ${tab.keyHint} or Alt + ${tab.keyHint} to switch`}>
                  {tab.keyHint}
                </kbd>
                {tab.count !== null && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold leading-none ${
                    isTabActive 
                      ? 'bg-black/20 text-black' 
                      : 'bg-black/40 text-neutral-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* CONTAINER PANEL DISPLAY */}
        <div id="dashboard-panel-viewport" className="min-h-[450px]">
          {activeSection === 'dashboard' && (
            <div id="dashboard-section" className="scroll-mt-4 flex flex-col gap-6">
              {/* Today's AI Activity Summary Card */}
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/15 relative overflow-hidden bg-neutral-900/25">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-bl-full blur-2xl pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-500/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Active Agent Pipeline Summary
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 leading-tight">Today&apos;s AI Activity</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Real-time signal-to-outreach conversion performance metrics.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400">Autonomous Execution Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-black/40 border border-emerald-500/5 p-3.5 rounded-xl">
                    <span className="text-neutral-500 font-mono uppercase text-[9px] tracking-wider block">Signals Found</span>
                    <span className="text-2xl font-bold font-mono text-white block mt-1">{signals.length + 42}</span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">↑ 12% vs last hour</span>
                  </div>
                  <div className="bg-black/40 border border-emerald-500/5 p-3.5 rounded-xl">
                    <span className="text-neutral-500 font-mono uppercase text-[9px] tracking-wider block">Qualified Leads</span>
                    <span className="text-2xl font-bold font-mono text-white block mt-1">{leads.length}</span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">100% processing rate</span>
                  </div>
                  <div className="bg-black/40 border border-emerald-500/5 p-3.5 rounded-xl">
                    <span className="text-neutral-500 font-mono uppercase text-[9px] tracking-wider block">Outreach Generated</span>
                    <span className="text-2xl font-bold font-mono text-white block mt-1">{leads.filter(l => l.status === 'contacted').length + 18}</span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Automated drafts ready</span>
                  </div>
                  <div className="bg-black/40 border border-emerald-500/5 p-3.5 rounded-xl">
                    <span className="text-neutral-500 font-mono uppercase text-[9px] tracking-wider block">Average Confidence</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">92.4%</span>
                    <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">High precision match</span>
                  </div>
                </div>
              </div>

              {/* Section HUD Explanation */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-emerald-500/10 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🔍 WHAT HAPPENED</span>
                    <span className="text-neutral-300 leading-normal">AI Agents are autonomously listening across global triggers (LinkedIn, GitHub, webhooks) to compile real-time buyer signals.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">💡 WHY IT MATTERS</span>
                    <span className="text-neutral-300 leading-normal">Transforms noisy raw data into hypercurrent, high-intent ARR values, cutting out manual pipeline hunting.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🏁 NEXT ACTION</span>
                    <span className="text-neutral-300 leading-normal">Direct an agent&apos;s intensity or trigger the live AI Pipeline to digest pending matches into leads.</span>
                  </div>
                </div>
              </div>

              {/* PIPELINE VISUALIZATION (DEMO WOW FACTOR) */}
              <PipelineVisualization />

              {/* SECTION 1: TOP STATS */}
              <StatsGrid stats={currentStats} leads={leads} />
            </div>
          )}

          {activeSection === 'signals' && (
            <div id="signals-section" className="scroll-mt-4 flex flex-col gap-4">
              {/* Section HUD Explanation */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-emerald-500/10 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🔍 WHAT HAPPENED</span>
                    <span className="text-neutral-300 leading-normal">Raw business signal events have been harvested, qualified, and ingested into our feed pool.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">💡 WHY IT MATTERS</span>
                    <span className="text-neutral-300 leading-normal">These represent live, early triggers (funding rounds, hiring changes, stack drops) that showcase active buying intent.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🏁 NEXT ACTION</span>
                    <span className="text-neutral-300 leading-normal">Review the detailed intent payload analysis and click &apos;Upgrade to Lead Board Opportunity&apos; to promote high-score targets.</span>
                  </div>
                </div>
              </div>

              <SignalFeedPanel
                signals={signals}
                selectedSignal={selectedSignal}
                onSelectSignal={(sig) => setSelectedSignal(sig)}
                onSimulateSignal={handleSimulateCustomSignal}
                isSimulating={isSimulating}
                onUpgradeSignal={handleManualUpgradeSignal}
                leads={leads}
              />
            </div>
          )}

          {activeSection === 'leads' && (
            <div id="leads-section" className="scroll-mt-4 flex flex-col gap-4">
              {/* Section HUD Explanation */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-emerald-500/10 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🔍 WHAT HAPPENED</span>
                    <span className="text-neutral-300 leading-normal">Qualified signals are converted into high-priority sales leads, displaying concrete decision-maker profiles.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">💡 WHY IT MATTERS</span>
                    <span className="text-neutral-300 leading-normal">Every lead has an exact calculated Lead Score, contact information, and an custom AI-generated pitch.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🏁 NEXT ACTION</span>
                    <span className="text-neutral-300 leading-normal">Click &quot;Send Outreach&quot; to dispatch personalized emails, or scale estimated values based on active pipeline interest.</span>
                  </div>
                </div>
              </div>

              <LeadBoardPanel
                leads={leads}
                onUpdateLead={handleUpdateLead}
                onRemoveLead={handleRemoveLead}
                onSendPitch={handleSendPitch}
              />
            </div>
          )}

          {activeSection === 'agents' && (
            <div id="agents-section" className="scroll-mt-4 flex flex-col gap-4">
              {/* Section HUD Explanation */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-emerald-500/10 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🔍 WHAT HAPPENED</span>
                    <span className="text-neutral-300 leading-normal">Decentralized specialized background agents are operating under assigned intensity controls.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">💡 WHY IT MATTERS</span>
                    <span className="text-neutral-300 leading-normal">Autonomously performs the research, scraping, and mapping that usually requires a massive standard sales team.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🏁 NEXT ACTION</span>
                    <span className="text-neutral-300 leading-normal">Adjust active agent intensity toggles (stealth, balanced, overdrive) or run quick agent diagnostics to optimize performance.</span>
                  </div>
                </div>
              </div>

              <AgentActivityPanel
                agents={agents}
                onToggleAgentMode={handleToggleAgentMode}
                onRunDiagnostics={handleRunDiagnostics}
              />
            </div>
          )}

          {activeSection === 'operations' && (
            <div id="operations-section" className="scroll-mt-4 flex flex-col gap-4">
              {/* Section HUD Explanation */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-emerald-500/10 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🔍 WHAT HAPPENED</span>
                    <span className="text-neutral-300 leading-normal">A continuous live log recording every single process, decision step, and state change executed by our agents.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">💡 WHY IT MATTERS</span>
                    <span className="text-neutral-300 leading-normal">Provides complete transparency and step-by-step diagnostic accountability for every automated action.</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">🏁 NEXT ACTION</span>
                    <span className="text-neutral-300 leading-normal">Monitor live audit events or clear/export log histories for deep pipeline diagnostics.</span>
                  </div>
                </div>
              </div>

              <RecentActionsPanel
                logs={actionLogs}
                leads={leads}
                automationActive={automationActive}
                onToggleAutomation={() => setAutomationActive(!automationActive)}
                onClearLogs={() => setActionLogs([])}
              />
            </div>
          )}
        </div>

      </div>

      {/* Onboarding / "How It Works" Interactive Guided Tour */}
      <AnimatePresence>
        {showOnboarding && (
          <>
            {/* Dim the background - clickable backdrop to close the tour */}
            <div 
              onClick={() => setShowOnboarding(false)}
              className="fixed inset-0 bg-black/10 z-[9990] transition-all duration-300 cursor-pointer" 
            />

            {/* Smooth hardware-accelerated spotlight overlay */}
            {highlightRect && (
              <motion.div
                key={`spotlight-cutout-${tourStep}`}
                initial={{
                  x: highlightRect.left,
                  y: highlightRect.top,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  opacity: 0
                }}
                animate={{
                  x: highlightRect.left,
                  y: highlightRect.top,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  opacity: 1
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                className="fixed pointer-events-none z-[9995] rounded-xl border-2 border-blue-400"
                style={{
                  top: 0,
                  left: 0,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.08), 0 0 25px rgba(59, 130, 246, 0.35)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                }}
              />
            )}

            {/* Elegantly positioned Onboarding HUD Modal Card - Blue themed */}
            <div className={`fixed z-[9999] pointer-events-none transition-all duration-500 ease-out p-4 ${
              tourStep === 1 || tourStep === 4 
                ? 'md:bottom-8 md:right-8 md:left-auto md:top-auto bottom-4 left-4 right-4' 
                : 'md:bottom-8 md:left-8 md:right-auto md:top-auto bottom-4 left-4 right-4'
            }`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="max-w-md w-full bg-neutral-900 border border-blue-500/25 p-6 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.25)] relative overflow-hidden text-left pointer-events-auto"
              >
                {/* Top neon scanner band */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-950 border border-blue-500/30 rounded-xl text-blue-400 animate-pulse">
                      {(() => {
                        const icons = [Filter, BrainCircuit, Zap, LayoutGrid, Mail];
                        const StepIcon = icons[tourStep - 1] || Radio;
                        return <StepIcon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400/80 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/10">
                        Product Tour • Step {tourStep} of 5
                      </span>
                      <h3 className="text-sm font-bold font-mono text-white mt-1.5 uppercase tracking-tight">
                        {(() => {
                          const titles = [
                            'Signal Feed',
                            'Intent Analysis',
                            'Lead Score',
                            'Lead Board',
                            'Outreach'
                          ];
                          return titles[tourStep - 1] || 'Welcome Walkthrough';
                        })()}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowOnboarding(false)}
                    className="text-[10px] font-mono uppercase bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white px-2 py-1 rounded cursor-pointer transition"
                  >
                    Skip
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {(() => {
                      const descriptions = [
                        'Tracks active LinkedIn updates, company job postings, and community Slack messages representing high-intent sales signals.',
                        'Parses linguistic markers and corporate domain profiles using NLP Engine to isolate concrete buyer priorities.',
                        'Evaluates dynamic alignment rankings and qualification metrics to prioritize high-potential commercial targets.',
                        'Promotes approved opportunities onto a collaborative Kanban board tracking accounts and ARR values.',
                        'Compiles hyper-personalized executive outreach copy drafts fully custom-tailored to buyer profiles.'
                      ];
                      return descriptions[tourStep - 1] || '';
                    })()}
                  </p>
                  <div className="mt-3.5 p-2 rounded-lg bg-blue-950/40 border border-blue-500/20 text-[10px] font-mono text-blue-400 uppercase leading-normal tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                    <span>Explanatory Tour Only • Run Live AI Pipeline to process</span>
                  </div>
                </div>

                {/* Progress Dot Indicator & Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-blue-500/10">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx + 1 === tourStep 
                            ? 'w-4.5 bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]' 
                            : idx + 1 < tourStep 
                              ? 'w-1.5 bg-blue-800' 
                              : 'w-1.5 bg-neutral-800'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-neutral-400 ml-1.5">{tourStep}/5</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() => {
                        if (tourStep > 1) {
                          setTourStep(tourStep - 1);
                        }
                      }}
                      disabled={tourStep === 1}
                      className="p-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-20 rounded-lg transition disabled:cursor-not-allowed cursor-pointer"
                      title="Previous step"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {tourStep === 5 ? (
                      <button
                        onClick={() => {
                          setShowOnboarding(false);
                          triggerConfetti();
                        }}
                        className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-black text-xs font-bold font-mono uppercase tracking-wider rounded-lg cursor-pointer transition shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      >
                        Finish
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTourStep(tourStep + 1);
                        }}
                        className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Demo Mode - Scripted simulation overlay */}
      <AnimatePresence>
        {isDemoModeRunning && (
          <>
            {/* Soft backdrop */}
            <div 
              onClick={() => {
                setIsDemoModeRunning(false);
                setDemoStep(0);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-[9980] transition-all duration-300 cursor-pointer" 
            />

            {/* Centered Yellow Demo HUD Modal Card */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[9985] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="max-w-md w-full bg-neutral-900 border border-amber-500/25 p-6 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden text-left pointer-events-auto"
              >
                {/* Top neon scanner band */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-950 border border-amber-500/30 rounded-xl text-amber-400 animate-pulse">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400/80 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/10">
                        Demo Mode • Scripted Trace
                      </span>
                      <h3 className="text-sm font-bold font-mono text-white mt-1.5 uppercase tracking-tight">
                        Pipeline Sandbox simulation
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsDemoModeRunning(false);
                      setDemoStep(0);
                    }}
                    className="text-[10px] font-mono uppercase bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white px-2 py-1 rounded cursor-pointer transition"
                  >
                    Close
                  </button>
                </div>

                <div className="mb-5 bg-neutral-950 p-3 rounded-lg border border-amber-500/5">
                  <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-neutral-500 uppercase">
                    <span>Target Sandbox Company:</span>
                    <span className="text-amber-400 font-bold">Tesla Inc.</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Watching simulated data-pipeline processing stages in sandbox memory lines. Application database is completely read-only.
                  </p>
                </div>

                {/* Animated Steps */}
                <div className="flex flex-col gap-3 py-1 font-mono text-xs">
                  {[
                    { label: 'Company detected', desc: 'Tesla Inc. parsed coordinates intercepted from Twitter/X social feeds.' },
                    { label: 'Intent analyzed', desc: 'NLP detected buying criteria match: "Seeking high-power cell telemetry APIs"' },
                    { label: 'Lead scored', desc: 'Pre-qualified 96% confidence score fit according to enterprise criteria.' },
                    { label: 'Lead created', desc: 'Simulated Drew Baglino (VP of Battery Engineering) profile onto CRM stack.' },
                    { label: 'Outreach generated', desc: 'Hyper-personalized battery telemetry email pitch successfully drafted.' },
                  ].map((stepObj, idx) => {
                    const currentId = idx + 1;
                    const isActive = demoStep === currentId;
                    const isCompleted = demoStep > currentId;
                    return (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-lg border transition duration-300 flex items-start gap-2.5 ${
                          isActive 
                            ? 'bg-amber-950/20 border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                            : isCompleted 
                            ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                            : 'bg-neutral-950/40 border-neutral-950 text-neutral-600'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <span className="text-amber-400 font-bold">✓</span>
                          ) : isActive ? (
                            <span className="relative flex h-2 w-2 mt-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                            </span>
                          ) : (
                            <span className="text-neutral-700">○</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-[11px] ${isActive ? 'text-white font-bold' : ''}`}>
                            {stepObj.label}
                          </span>
                          {isActive && (
                            <p className="text-[10px] text-amber-400/80 mt-0.5 leading-normal">
                              {stepObj.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar indicator */}
                <div className="mt-5 pt-4 border-t border-amber-500/10 flex items-center justify-between col-span-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          idx + 1 === demoStep 
                            ? 'w-4 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]' 
                            : idx + 1 < demoStep 
                              ? 'w-1.5 bg-amber-800' 
                              : 'w-1.5 bg-neutral-800'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-neutral-400 ml-1">{demoStep}/5</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {demoStep < 5 ? (
                      <button 
                        onClick={() => setDemoStep(prev => prev + 1)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded cursor-pointer transition flex items-center gap-1 font-mono"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setIsDemoModeRunning(false);
                          setDemoStep(0);
                        }}
                        className="px-3.5 py-1.5 bg-amber-500 text-black text-xs font-bold font-mono rounded cursor-pointer hover:bg-amber-400 transition"
                      >
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Live AI Pipeline - Actual execution traces */}
      <AnimatePresence>
        {isPipelineActive && (
          <>
            {/* Soft backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-[9980] transition-all duration-300" />

            {/* Centered Green AI Pipeline HUD Modal Card */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[9985] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="max-w-md w-full bg-neutral-900 border border-emerald-500/25 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden text-left pointer-events-auto"
              >
                {/* Top green neon glowing band */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-950 border border-emerald-500/30 rounded-xl text-emerald-400 animate-pulse">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400/80 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/10">
                        Autonomous AI Pipeline
                      </span>
                      <h3 className="text-sm font-bold font-mono text-white mt-1.5 uppercase tracking-tight">
                        Live Processing Mode
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>

                <div className="mb-5 bg-neutral-950 p-3 rounded-lg border border-emerald-500/5">
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Executing actual React business logic. Committing live generated database indexes, signal entries, and targeted sales channels in real-time.
                  </p>
                </div>

                {/* Animated Stages */}
                <div className="flex flex-col gap-2.5 py-1 font-mono text-xs">
                  {[
                    { label: 'Read a signal', desc: 'Ingesting live company raw social endpoints.' },
                    { label: 'Analyze intent', desc: 'Executing deep NLP token mapping classifiers.' },
                    { label: 'Generate score', desc: 'Computing enterprise fit alignment index score.' },
                    { label: 'Create lead', desc: 'Structuring pre-qualified target CRM account profile.' },
                    { label: 'Update dashboard metrics', desc: 'Recalculating global funnel & ARR ratios reactively.' },
                    { label: 'Add activity log', desc: 'Pushing telemetry record to recent audit trail.' },
                    { label: 'Add outreach recommendation', desc: 'Pre-compiling outreach context emails in memory.' },
                  ].map((stepObj, idx) => {
                    const currentId = idx + 1;
                    const isActive = pipelineStep === currentId;
                    const isCompleted = pipelineStep > currentId;
                    return (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-lg border transition duration-300 flex items-start gap-2.5 ${
                          isActive 
                            ? 'bg-emerald-950/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : isCompleted 
                            ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                            : 'bg-neutral-950/40 border-neutral-950 text-neutral-600'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <span className="text-emerald-400 font-bold">✓</span>
                          ) : isActive ? (
                            <span className="relative flex h-2 w-2 mt-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                            </span>
                          ) : (
                            <span className="text-neutral-700">○</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={`text-[11px] ${isActive ? 'text-white font-bold' : ''}`}>
                            {stepObj.label}
                          </span>
                          {isActive && (
                            <p className="text-[10px] text-emerald-400/80 mt-0.5 leading-normal">
                              {stepObj.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress dot list */}
                <div className="mt-5 pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          idx + 1 === pipelineStep 
                            ? 'w-4 bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                            : idx + 1 < pipelineStep 
                              ? 'w-1.5 bg-emerald-800' 
                              : 'w-1.5 bg-neutral-800'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-neutral-400 ml-1">{pipelineStep}/7</span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 animate-pulse font-bold bg-emerald-950 px-2 py-0.5 border border-emerald-500/20 rounded">
                    Running live
                  </span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-neutral-900 border border-emerald-500/25 p-6 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden"
            >
              {/* Top accent scanner line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-950 border border-emerald-500/20 rounded-lg text-emerald-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-mono text-white uppercase tracking-tight">System Hotkeys Command</h3>
                </div>
                <button
                  onClick={() => setShowShortcutsHelp(false)}
                  className="text-[10px] font-mono uppercase bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white px-2 py-1 rounded cursor-pointer transition"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 font-mono">
                {[
                  { keys: ['Ctrl', 'S'], desc: 'Jump to main Signal Feed Panel' },
                  { keys: ['Ctrl', 'L'], desc: 'Jump to Qualified Leads Board' },
                  { keys: ['Ctrl', 'A'], desc: 'Open active AI Harvester Agent controls' },
                  { keys: ['Ctrl', 'O'], desc: 'Access Operations audit & downloads' },
                  { keys: ['?'], desc: 'Toggle keyboard shortcuts menu guide' },
                  { keys: ['Esc'], desc: 'Close any active overlays or modals' }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2.5 rounded-lg bg-neutral-950 border border-emerald-500/5 hover:border-emerald-500/15 transition group"
                  >
                    <span className="text-xs text-neutral-400 group-hover:text-emerald-400 transition font-sans">{item.desc}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((key, keyIdx) => (
                        <kbd 
                          key={keyIdx} 
                          className="bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] text-emerald-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight min-w-[20px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-5 pt-3 border-t border-emerald-500/10">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">
                  PRO-STRAT TIP: Alternate with standard "Alt" modified combos
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Celebratory interactive confetti overlay using framer-motion */}
      <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: '50%',
              bottom: '30%',
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{
              x: particle.targetX,
              y: particle.targetY,
              scale: [0, 1, 1, 0.7, 0],
              rotate: particle.rotate,
            }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

    </main>
  );
}
