import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Flame, DollarSign, Check, Copy, Edit2, 
  Trash2, User, Send, Building, LayoutGrid, CheckCircle2, X
} from 'lucide-react';
import { Lead } from '../types';

interface LeadBoardPanelProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
  onRemoveLead: (leadId: string) => void;
  onSendPitch: (lead: Lead) => void;
}

export default function LeadBoardPanel({
  leads,
  onUpdateLead,
  onRemoveLead,
  onSendPitch
}: LeadBoardPanelProps) {
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Email Preview Modal States
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewBody, setPreviewBody] = useState('');
  const [copiedPreview, setCopiedPreview] = useState(false);

  const handleOpenPreview = (lead: Lead) => {
    setPreviewLead(lead);
    setPreviewSubject(`Elevating sales efficiency at ${lead.company} // LeadHarvester AI`);
    setPreviewBody(lead.suggestedPitch);
    setCopiedPreview(false);
  };

  const handleCopyPreviewBody = () => {
    navigator.clipboard.writeText(previewBody);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  const handleDispatchPitch = () => {
    if (!previewLead) return;
    
    // Create updated lead payload
    const updatedLead = {
      ...previewLead,
      suggestedPitch: previewBody
    };

    // First update the lead so it reflects the edited body in the UI
    onUpdateLead(updatedLead);

    // Call onSendPitch to dispatch the actual outreach transition
    onSendPitch(updatedLead);

    // Close preview modal
    setPreviewLead(null);
  };

  const startEditing = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setPitchText(lead.suggestedPitch);
  };

  const savePitch = (lead: Lead) => {
    onUpdateLead({
      ...lead,
      suggestedPitch: pitchText
    });
    setEditingLeadId(null);
  };

  const copyPitch = (lead: Lead) => {
    navigator.clipboard.writeText(lead.suggestedPitch);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIntentStrengthColor = (strength: Lead['intentStrength']) => {
    switch (strength) {
      case 'High': return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
      case 'Medium': return 'text-amber-400 bg-amber-950/40 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20';
    }
  };

  return (
    <div id="lead-board-panel" className="relative z-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="p-1 rounded bg-neutral-900 border border-emerald-500/20">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
            </span>
            Active Opportunity Leads
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Raw signals correlated into target accounts with verified decision makers and hyper-targeted sales scripts.
          </p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="p-12 text-center glass-panel border border-dashed border-emerald-500/10 rounded-xl">
          <p className="text-sm text-neutral-400">No active leads registered. Upgrade a harvested signal to create a prospect!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {leads.map((lead) => (
              <motion.div
                key={lead.id}
                id={`lead-card-${lead.id}`}
                layout
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.16, 1, 0.3, 1],
                  layout: { type: 'spring', stiffness: 350, damping: 35 }
                }}
                className="glass-panel p-5 rounded-xl border border-emerald-500/10 flex flex-col gap-4 relative overflow-hidden group"
              >
                {/* Score badge absolute right */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-400">{lead.leadScore}</span>
                    <p className="text-[9px] font-mono text-neutral-500">Lead Score</p>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-emerald-500/20 bg-neutral-950 flex items-center justify-center">
                    <Flame className={`w-4 h-4 ${lead.leadScore >= 85 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                  </div>
                </div>

                {/* Left side Metadata */}
                <div className="flex gap-3">
                  <img
                    src={lead.contactAvatar}
                    alt={lead.contactName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg border border-emerald-500/20 object-cover bg-neutral-900"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 leading-tight flex-wrap">
                      <span>{lead.contactName}</span>
                      {lead.id.includes('live') ? (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/20 font-bold tracking-tight">
                          ⚡ LIVE
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-950/50 text-amber-500 border border-amber-500/10 font-bold tracking-tight">
                          📂 SAMPLE
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-neutral-400">{lead.contactTitle}</p>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono mt-0.5">
                      <Building className="w-3 h-3 text-neutral-500" />
                      <span>{lead.company}</span>
                    </div>
                  </div>
                </div>

                {/* Sub Metadata Row */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-neutral-950/80 border border-emerald-500/5 rounded-lg text-xs font-mono">
                  <div>
                    <p className="text-neutral-500 text-[10px]">INTENT LEVEL</p>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold mt-0.5 border ${getIntentStrengthColor(lead.intentStrength)}`}>
                      {lead.intentStrength}
                    </span>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-[10px]">CONTRACT ARR</p>
                    <span className="text-white font-bold mt-0.5 block flex items-center text-emerald-400">
                      <DollarSign className="w-3 h-3 text-emerald-500 inline" />
                      {lead.estimatedValue}
                    </span>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-[10px]">EMAIL CHANNEL</p>
                    <span className="text-neutral-400 truncate mt-0.5 block hover:text-white" title={lead.contactEmail}>
                      {lead.contactEmail}
                    </span>
                  </div>
                </div>

                {/* Suggested Pitch Container */}
                <div id="lead-outreach-container" className="flex-1 flex flex-col gap-1 bg-black/40 border border-emerald-500/5 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      Target Outreach Pitch
                    </span>
                    <div className="flex gap-1.5">
                      {editingLeadId === lead.id ? (
                        <button
                          onClick={() => savePitch(lead)}
                          className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(lead)}
                          className="text-[10px] font-mono text-neutral-400 hover:text-emerald-400 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => copyPitch(lead)}
                        className="text-[10px] font-mono text-neutral-400 hover:text-emerald-400 flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedId === lead.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedId === lead.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {editingLeadId === lead.id ? (
                    <textarea
                      value={pitchText}
                      onChange={(e) => setPitchText(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-900 border border-emerald-500/20 text-xs px-2 py-1.5 rounded text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />
                  ) : (
                    <div className="text-xs text-neutral-300 leading-relaxed font-sans italic line-clamp-3">
                      &ldquo;{lead.suggestedPitch}&rdquo;
                    </div>
                  )}
                </div>

                {/* Operations Footer */}
                <div className="flex justify-between items-center pt-2 border-t border-emerald-500/5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      lead.status === 'contacted' ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'
                    }`} />
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      Prospect Status: <b className="text-white">{lead.status}</b>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onRemoveLead(lead.id)}
                      className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg cursor-pointer transition"
                      title="Decline lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {lead.status !== 'contacted' ? (
                      <button
                        onClick={() => handleOpenPreview(lead)}
                        className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold uppercase font-mono tracking-wider text-[11px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                      >
                        <Send className="w-3 h-3 text-black" />
                        Send Outreach
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Outreach Dispatched
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Email Preview Modal */}
      <AnimatePresence>
        {previewLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewLead(null)}
              className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="relative w-full max-w-2xl bg-neutral-900 border border-emerald-500/20 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col z-10 font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/10 bg-neutral-950/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">AI Outreach Dispatcher</h3>
                    <p className="text-[10px] font-mono text-emerald-500/60">SANDBOX // CUSTOMIZE LEAD EMAIL OUTREACH</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewLead(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email Envelope Header Fields */}
              <div className="px-6 py-4 bg-neutral-950/20 border-b border-emerald-500/10 flex flex-col gap-3 font-mono text-xs">
                {/* Sender */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-neutral-500 text-right uppercase text-[10px] tracking-wider shrink-0">Sender:</span>
                  <div className="w-full bg-neutral-950/50 border border-emerald-500/5 px-3 py-1.5 rounded text-emerald-400 text-[11px] truncate flex items-center justify-between">
                    <span>agent.harvester@platform.ai [A.I. Sales Autopilot]</span>
                    <span className="text-[9px] bg-emerald-950/50 text-emerald-500 px-1.5 py-0.2 rounded border border-emerald-500/10">REALTIME DISPATCH</span>
                  </div>
                </div>

                {/* Recipient */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-neutral-500 text-right uppercase text-[10px] tracking-wider shrink-0">Recipient:</span>
                  <div className="w-full bg-neutral-950/50 border border-emerald-500/5 px-3 py-1.5 rounded text-white flex items-center justify-between gap-2 overflow-hidden">
                    <span className="truncate">
                      <b>{previewLead.contactName}</b> &lt;{previewLead.contactEmail}&gt;
                    </span>
                    <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.2 rounded shrink-0">
                      {previewLead.company}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-neutral-500 text-right uppercase text-[10px] tracking-wider shrink-0">Subject:</span>
                  <input
                    type="text"
                    value={previewSubject}
                    onChange={(e) => setPreviewSubject(e.target.value)}
                    className="w-full bg-neutral-950 border border-emerald-500/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none px-3 py-1.5 rounded text-white font-mono text-xs"
                    placeholder="Enter email subject line..."
                  />
                </div>
              </div>

              {/* Email Text Area Body */}
              <div className="p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                    Custom outreach body (Markdown or plain text supported)
                  </label>
                  <span className="text-[9px] text-emerald-500 font-mono bg-emerald-950/30 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                    AI Suggested Grounding: OK
                  </span>
                </div>
                <textarea
                  value={previewBody}
                  onChange={(e) => setPreviewBody(e.target.value)}
                  rows={8}
                  className="w-full bg-neutral-950 border border-emerald-500/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none px-4 py-3 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 font-sans leading-relaxed resize-none transition"
                  placeholder="Enter email pitch content..."
                />
                
                {/* Stats row */}
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mt-1">
                  <span>Words: {previewBody.split(/\s+/).filter(Boolean).length} // Chars: {previewBody.length}</span>
                  <span>Press Dispatch below to trigger automated proxy webhook.</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-emerald-500/10 bg-neutral-950/50 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>PRE-DISPATCH STAGE</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyPreviewBody}
                    className="bg-neutral-900 border border-emerald-500/10 hover:border-emerald-500/30 text-xs font-mono px-4 py-2 rounded-lg text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPreview ? 'Copied' : 'Copy to Clipboard'}</span>
                  </button>
                  <button
                    onClick={() => setPreviewLead(null)}
                    className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-mono px-4 py-2 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatchPitch}
                    className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold uppercase font-mono tracking-wider text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition shadow-[0_2px_12px_rgba(16,185,129,0.2)]"
                  >
                    <Send className="w-3.5 h-3.5 text-black" />
                    Dispatch Outreach
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
