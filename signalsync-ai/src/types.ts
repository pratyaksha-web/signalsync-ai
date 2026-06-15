export interface Signal {
  id: string;
  source: 'LinkedIn' | 'JobBoard' | 'Crunchbase' | 'GitHub' | 'News' | 'Slack';
  company: string;
  industry: string;
  domain: string;
  timestamp: string;
  title: string;
  description: string;
  rawPayload: Record<string, string>;
  intentCategory: 'Buying Intent' | 'Hiring Boom' | 'Leadership Change' | 'Expansion' | 'Tech Stack Drop' | 'Funding Round';
  confidenceScore: number; // 0 - 100
  status: 'harvested' | 'analyzing' | 'qualified' | 'disregarded';
}

export interface Lead {
  id: string;
  signalId: string;
  company: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactAvatar: string;
  leadScore: number; // 0 - 100
  intentStrength: 'High' | 'Medium' | 'Low';
  estimatedValue: string; // e.g. "$45k/yr"
  suggestedPitch: string;
  status: 'new' | 'contacted' | 'booked' | 'lost';
}

export interface Agent {
  id: string;
  name: string;
  version: string;
  type: 'crawler' | 'analyzer' | 'pitcher';
  status: 'idle' | 'harvesting' | 'processing' | 'generating';
  efficiency: number; // e.g. 98.4
  signalsProcessed: number;
  intensity: 'stealth' | 'balanced' | 'overdrive';
  activityLogs: string[];
}

export interface ActionLog {
  id: string;
  timestamp: string;
  type: 'signal_harvested' | 'lead_qualified' | 'pitch_sent' | 'agent_alert' | 'agent_idle';
  title: string;
  description: string;
  severity: 'info' | 'success' | 'warning';
}

export interface Stats {
  totalSignals: number;
  signalsRate: number; // signals per min
  qualifiedLeads: number;
  conversionRate: number; // %
  pipelineValue: number; // total estimated ARR
  activeAgentsCount: number;
}
