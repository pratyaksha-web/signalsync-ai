import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Cpu, Power, Settings, ShieldAlert, Wifi, Play, Pause, Terminal, Compass } from 'lucide-react';
import { Agent } from '../types';

interface MetricDimension {
  label: string;
  key: string;
  description: string;
}

const METRIC_DIMENSIONS: MetricDimension[] = [
  { label: 'EFF', key: 'efficiency', description: 'Overall task execution accuracy' },
  { label: 'SPD', key: 'speed', description: 'Cycle throughput and frequency rate' },
  { label: 'SAF', key: 'safety', description: 'IP safety and request throttling strength' },
  { label: 'ING', key: 'ingenuity', description: 'NLP pitch generation depth and customization' },
  { label: 'THR', key: 'thoroughness', description: 'Breadth of active scraping and node scanning' }
];

const getAgentValue = (agent: Agent, dimensionKey: string): number => {
  switch (dimensionKey) {
    case 'efficiency':
      // Map efficiency from 0-100%
      return agent.efficiency; 
    case 'speed':
      if (agent.intensity === 'overdrive') return 95;
      if (agent.intensity === 'balanced') return 70;
      return 40; // stealth
    case 'safety':
      if (agent.intensity === 'stealth') return 95;
      if (agent.intensity === 'balanced') return 70;
      return 30; // overdrive
    case 'ingenuity':
      if (agent.type === 'pitcher') return 92;
      if (agent.type === 'analyzer') return 78;
      return 55; // crawler
    case 'thoroughness':
      if (agent.id === 'agent-charybdis') return 90;
      if (agent.id === 'agent-scylla') return 80;
      return 68; // siren
    default:
      return 50;
  }
};

interface AgentActivityPanelProps {
  agents: Agent[];
  onToggleAgentMode: (agentId: string, intensity: Agent['intensity']) => void;
  onRunDiagnostics: (agentId: string) => void;
}

export default function AgentActivityPanel({
  agents,
  onToggleAgentMode,
  onRunDiagnostics
}: AgentActivityPanelProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [activeLogIndex, setActiveLogIndex] = useState<number>(0);
  const selectedAgent = agents.find(ag => ag.id === selectedAgentId);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Radar geometry
  const cx = 100;
  const cy = 95;
  const maxRadius = 65;

  const getCoordinates = (index: number, val: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + maxRadius * (val / 100) * Math.cos(angle);
    const y = cy + maxRadius * (val / 100) * Math.sin(angle);
    return { x, y };
  };

  // Cycle logs indicator slightly for realism
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLogIndex(prev => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Update scroll height of the local terminal only, leaving the page scroll position untouched
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [selectedAgent?.activityLogs, selectedAgentId]);

  const getIntensityBadgeColor = (intensity: Agent['intensity']) => {
    switch (intensity) {
      case 'overdrive': return 'bg-rose-950/40 text-rose-300 border-rose-500/30';
      case 'stealth': return 'bg-blue-950/40 text-blue-300 border-blue-500/20';
      default: return 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20';
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'harvesting': return 'bg-emerald-400 text-emerald-400';
      case 'processing': return 'bg-amber-400 text-amber-400';
      case 'generating': return 'bg-purple-400 text-purple-400';
      default: return 'bg-neutral-600 text-neutral-600';
    }
  };

  return (
    <div id="agent-activity-panel" className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Agents Selection Grid (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="p-1 rounded bg-neutral-900 border border-emerald-500/25">
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            </span>
            AI Agent Activity
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure and track status profiles for automated pipeline processing.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-4 rounded-xl border transition cursor-pointer text-left relative overflow-hidden flex flex-col gap-3 ${
                  isSelected 
                    ? 'bg-neutral-900/90 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]' 
                    : 'bg-neutral-905/70 bg-neutral-900/40 border-emerald-500/10 hover:border-emerald-500/25'
                }`}
              >
                {/* Visual Selection Indicator */}
                {isSelected && (
                  <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-emerald-400" />
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`animate-heartbeat-ripple absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusColor(agent.status).split(' ')[0]}`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 animate-heartbeat ${getStatusColor(agent.status).split(' ')[0]}`} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5 leading-none">
                        {agent.name}
                        <span className="text-[10px] font-mono text-neutral-500">{agent.version}</span>
                      </h3>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase ${getIntensityBadgeColor(agent.intensity)}`}>
                    {agent.intensity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-black/60 p-2.5 rounded-lg border border-emerald-500/5">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Activity State</span>
                    <span className={`font-semibold uppercase tracking-wide flex items-center gap-1 mt-0.5 text-[11px] ${getStatusColor(agent.status).split(' ')[1]}`}>
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className={`animate-heartbeat-ripple absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusColor(agent.status).split(' ')[0]}`} />
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 animate-heartbeat ${getStatusColor(agent.status).split(' ')[0]}`} />
                      </span>
                      {agent.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase">Signals Found</span>
                    <span className="text-white font-semibold flex items-center h-5">{agent.signalsProcessed} units</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Live Activity Logs (7 Cols) */}
      <div className="lg:col-span-7">
        {selectedAgent ? (
          <div className="glass-panel p-5 rounded-xl border border-emerald-500/10 text-left h-full flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full z-0 pointer-events-none" />

            {/* Header Area */}
            <div className="flex justify-between items-start border-b border-emerald-500/10 pb-4 mb-4 relative z-10">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ACTIVE OPPORTUNITY LINK • ONLINE
                  <span className="inline-flex items-center gap-1 ml-1 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-heartbeat-ripple absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusColor(selectedAgent.status).split(' ')[0]}`} />
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 animate-heartbeat ${getStatusColor(selectedAgent.status).split(' ')[0]}`} />
                    </span>
                    <span className={`text-[8px] font-semibold uppercase tracking-wider ${getStatusColor(selectedAgent.status).split(' ')[1]}`}>{selectedAgent.status}</span>
                  </span>
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedAgent.name} Activity Log</h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-emerald-400">{selectedAgent.efficiency}%</span>
                <p className="text-[9px] text-neutral-500">Efficiency rating</p>
              </div>
            </div>

            {/* Operations Control Panel */}
            <div className="mb-4 relative z-10">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-emerald-400" />
                Configure Signal Processing Mode
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {(['stealth', 'balanced', 'overdrive'] as Agent['intensity'][]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onToggleAgentMode(selectedAgent.id, mode)}
                    className={`p-2.5 rounded-lg border text-xs font-mono capitalize transition cursor-pointer text-center ${
                      selectedAgent.intensity === mode
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                        : 'bg-neutral-900 border-emerald-500/10 hover:border-emerald-500/25 text-neutral-400'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-mono mt-2 text-neutral-500">
                {selectedAgent.intensity === 'overdrive' 
                  ? '⚠️ Overdrive maximizes processing cycle speed but increases platform API credit usage by 2.4x.'
                  : selectedAgent.intensity === 'stealth'
                  ? '🔒 Stealth rate throttles requests to match secure, gradual platform API compliance limits.'
                  : '🟢 Balanced optimized profile provides standard structured signal streams.'
                }
              </p>
            </div>

            {/* Terminal Live Output logs and Radar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 relative z-10 min-h-[220px]">
              {/* Left Side: Terminal (7 cols) */}
              <div className="md:col-span-7 flex flex-col gap-2 h-full justify-between">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 leading-none">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Live Signal Processing
                  </h4>
                  <button
                    onClick={() => onRunDiagnostics(selectedAgent.id)}
                    className="text-[10px] font-mono text-emerald-400 hover:underline cursor-pointer"
                  >
                    Force diagnostics reset
                  </button>
                </div>

                <div ref={terminalRef} className="bg-black/90 rounded-lg p-3 border border-emerald-500/10 font-mono text-xs text-emerald-400 h-full max-h-[180px] overflow-y-auto flex flex-col gap-1">
                  {[...selectedAgent.activityLogs].reverse().map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-emerald-600 shrink-0">[$]</span>
                      <span className="text-emerald-300 leading-relaxed">{log}</span>
                    </div>
                  ))}
                  {/* Dynamically simulated live terminal feed indicator */}
                  <div className="flex gap-2 text-[11px] text-neutral-500 animate-pulse mt-1">
                    <span className="shrink-0">[~]</span>
                    <span>Awaiting next real-time business signal payload... {selectedAgent.intensity === 'overdrive' ? '(high speed mode)' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Radar Chart (5 cols) */}
              <div className="md:col-span-5 bg-black/60 rounded-lg border border-emerald-500/10 p-3 flex flex-col justify-between items-center relative overflow-hidden min-h-[220px]">
                <div className="w-full flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Opportunity Analysis
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-500/60 leading-none">Comparative</span>
                </div>

                {/* SVG Radar Chart Canvas */}
                <div className="w-full max-w-[150px] aspect-square flex items-center justify-center relative my-1">
                  <svg viewBox="0 0 200 190" className="w-full h-full">
                    {/* Concentric grid rings */}
                    {[20, 40, 60, 80, 100].map((level) => {
                      const points = Array.from({ length: 5 })
                        .map((_, i) => {
                          const { x, y } = getCoordinates(i, level);
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return (
                        <polygon
                          key={level}
                          points={points}
                          fill="none"
                          stroke="rgba(16, 185, 129, 0.08)"
                          strokeWidth="1"
                          strokeDasharray={level === 100 ? "0" : "2 2"}
                        />
                      );
                    })}

                    {/* Axis lines */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const { x, y } = getCoordinates(i, 100);
                      return (
                        <line
                          key={i}
                          x1={cx}
                          y1={cy}
                          x2={x}
                          y2={y}
                          stroke="rgba(16, 185, 129, 0.12)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Dimension labels */}
                    {METRIC_DIMENSIONS.map((dim, i) => {
                      const { x, y } = getCoordinates(i, 114);
                      let textAnchor = "middle";
                      let dy = "0.3em";
                      let dx = "0";

                      if (i === 0) {
                        textAnchor = "middle";
                        dy = "-0.4em";
                      } else if (i === 1) {
                        textAnchor = "start";
                        dx = "3px";
                        dy = "0em";
                      } else if (i === 2) {
                        textAnchor = "start";
                        dx = "3px";
                        dy = "0.6em";
                      } else if (i === 3) {
                        textAnchor = "end";
                        dx = "-3px";
                        dy = "0.6em";
                      } else if (i === 4) {
                        textAnchor = "end";
                        dx = "-3px";
                        dy = "0em";
                      }

                      return (
                        <g key={dim.key} className="cursor-help group/label">
                          <text
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            dx={dx}
                            dy={dy}
                            className="text-[9px] font-mono fill-neutral-400 group-hover/label:fill-emerald-400 transition"
                          >
                            {dim.label}
                          </text>
                          <title>{dim.description}</title>
                        </g>
                      );
                    })}

                    {/* Render the shapes */}
                    {agents.map((agent) => {
                      const isSelected = selectedAgentId === agent.id;
                      const points = METRIC_DIMENSIONS.map((dim, i) => {
                        const val = getAgentValue(agent, dim.key);
                        const { x, y } = getCoordinates(i, val);
                        return `${x},${y}`;
                      }).join(' ');

                      let strokeColor = '';
                      let fillColor = '';
                      let dotColor = '';

                      if (agent.id === 'agent-scylla') {
                        strokeColor = isSelected ? 'rgba(16, 185, 129, 0.95)' : 'rgba(16, 185, 129, 0.25)';
                        fillColor = isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.02)';
                        dotColor = 'rgb(16, 185, 129)';
                      } else if (agent.id === 'agent-charybdis') {
                        strokeColor = isSelected ? 'rgba(56, 189, 248, 0.95)' : 'rgba(56, 189, 248, 0.25)';
                        fillColor = isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.02)';
                        dotColor = 'rgb(56, 189, 248)';
                      } else {
                        strokeColor = isSelected ? 'rgba(192, 132, 252, 0.95)' : 'rgba(192, 132, 252, 0.25)';
                        fillColor = isSelected ? 'rgba(192, 132, 252, 0.15)' : 'rgba(192, 132, 252, 0.02)';
                        dotColor = 'rgb(192, 132, 252)';
                      }

                      return (
                        <g key={agent.id} className="transition-all duration-300">
                          {/* Polygon */}
                          <polygon
                            points={points}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={isSelected ? "1.5" : "0.75"}
                            className="transition-all duration-500"
                          />
                          
                          {/* Glowing layer for selected */}
                          {isSelected && (
                            <polygon
                              points={points}
                              fill="none"
                              stroke={strokeColor}
                              strokeWidth="3"
                              opacity="0.3"
                              className="blur-[1px] transition-all duration-500"
                            />
                          )}

                          {/* Vertex Dots */}
                          {isSelected && METRIC_DIMENSIONS.map((dim, idx) => {
                            const val = getAgentValue(agent, dim.key);
                            const { x, y } = getCoordinates(idx, val);
                            return (
                              <circle
                                key={dim.key}
                                cx={x}
                                cy={y}
                                r="2"
                                fill="#ffffff"
                                stroke={dotColor}
                                strokeWidth="1"
                                className="cursor-crosshair transition-all duration-500"
                              >
                                <title>{`${agent.name} ${dim.label}: ${val}%`}</title>
                              </circle>
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Small legends */}
                <div className="flex gap-2 items-center justify-center flex-wrap text-[8px] font-mono mt-1">
                  {agents.map((agent) => {
                    const isSelected = selectedAgentId === agent.id;
                    let dotBg = 'bg-neutral-600';
                    let textClass = isSelected ? 'text-white font-bold' : 'text-neutral-500';

                    if (agent.id === 'agent-scylla') dotBg = 'bg-emerald-500';
                    else if (agent.id === 'agent-charybdis') dotBg = 'bg-sky-400';
                    else dotBg = 'bg-purple-400';

                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`flex items-center gap-1 cursor-pointer hover:text-white transition px-1 py-0.5 rounded ${
                          isSelected ? 'bg-neutral-900 border border-emerald-500/10' : ''
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`} />
                        <span className={textClass}>{agent.name.split('-')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-xl border border-dashed border-emerald-500/10 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
            <ShieldAlert className="w-12 h-12 text-emerald-500/40 mb-3" />
            <p className="text-neutral-400 text-xs">No micro-agents detected on core server stack.</p>
          </div>
        )}
      </div>
    </div>
  );
}
