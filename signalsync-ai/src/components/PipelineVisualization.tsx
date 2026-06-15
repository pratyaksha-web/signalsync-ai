import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Brain, Award, Mail, ArrowRight, HelpCircle } from 'lucide-react';

export default function PipelineVisualization() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    position: 'top' | 'bottom' | 'left' | 'right';
    step: any;
  } | null>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect mobile / tablet or touch devices to adjust triggers
  useEffect(() => {
    const checkDevice = () => {
      setIsTouchDevice(window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const steps = [
    {
      id: 'signal',
      label: '1. Ingest Signal',
      desc: 'Real-time business events matching buying intent',
      definition: 'Categorizes social activity, profile shifts, or hiring trends matching our target ICP triggers.',
      icon: Radio,
      color: 'text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      bg: 'bg-emerald-950/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      id: 'intent',
      label: '2. Intent Analysis',
      desc: 'AI parses posts & lists for custom priorities',
      definition: 'Parses linguistic context using custom NLP models to identify exact-match buyer pain points and immediate budget needs.',
      icon: Brain,
      color: 'text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
      bg: 'bg-purple-950/20',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'score',
      label: '3. Lead Score Generated',
      desc: 'Calculates deal qualification & estimated ARR',
      definition: 'Grades buying readiness (0-100) based on executive title seniority, brand scale, hiring velocity, and estimated ARR value.',
      icon: Award,
      color: 'text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      bg: 'bg-cyan-950/20',
      borderColor: 'border-cyan-500/30'
    },
    {
      id: 'pitch',
      label: '4. Outreach Generated',
      desc: 'Drafts customized email pitch to decision maker',
      definition: 'Synthesizes context with Gemini to output high-impact, custom outreach copy tailored perfectly to the target leader.',
      icon: Mail,
      color: 'text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      bg: 'bg-amber-950/20',
      borderColor: 'border-amber-500/30'
    }
  ];

  // Helper to dynamically calculate viewport space and positioning coordinates
  const updateTooltipPosition = (stepId: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const tooltipWidth = 256;
    const tooltipHeight = 125; // standard estimate for boundary calculations
    const margin = 16;

    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;

    let bestPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

    // Prioritize vertical positioning (top or bottom) for inline pipeline steps
    if (spaceAbove >= tooltipHeight + margin) {
      bestPosition = 'top';
    } else if (spaceBelow >= tooltipHeight + margin) {
      bestPosition = 'bottom';
    } else if (spaceRight >= tooltipWidth + margin) {
      bestPosition = 'right';
    } else if (spaceLeft >= tooltipWidth + margin) {
      bestPosition = 'left';
    } else {
      // Default to either which has most vertical space
      bestPosition = spaceBelow > spaceAbove ? 'bottom' : 'top';
    }

    let finalTop = 0;
    let finalLeft = 0;

    if (bestPosition === 'top') {
      finalTop = rect.top + scrollTop - tooltipHeight - 8;
      finalLeft = rect.left + rect.width / 2 + scrollLeft - tooltipWidth / 2;
    } else if (bestPosition === 'bottom') {
      finalTop = rect.bottom + scrollTop + 8;
      finalLeft = rect.left + rect.width / 2 + scrollLeft - tooltipWidth / 2;
    } else if (bestPosition === 'right') {
      finalTop = rect.top + rect.height / 2 + scrollTop - tooltipHeight / 2;
      finalLeft = rect.right + scrollLeft + 8;
    } else {
      finalTop = rect.top + rect.height / 2 + scrollTop - tooltipHeight / 2;
      finalLeft = rect.left + scrollLeft - tooltipWidth - 8;
    }

    // Force clamp horizontally to remain within viewport
    if (finalLeft < margin) {
      finalLeft = margin;
    } else if (finalLeft + tooltipWidth > viewportWidth - margin) {
      finalLeft = viewportWidth - tooltipWidth - margin;
    }

    // Force clamp vertically to avoid negative top values
    if (finalTop < margin) {
      finalTop = margin;
    }

    setTooltipPos({
      top: finalTop,
      left: finalLeft,
      position: bestPosition,
      step
    });
  };

  // Recalculate position dynamically during viewport scrolling or resizing
  useEffect(() => {
    if (!activeStep) return;
    const handleScrollResize = () => {
      const el = document.getElementById(`step-trigger-${activeStep}`);
      if (el) {
        updateTooltipPosition(activeStep, el);
      }
    };
    window.addEventListener('scroll', handleScrollResize, { passive: true });
    window.addEventListener('resize', handleScrollResize);
    return () => {
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [activeStep]);

  // Click outside to close tooltip on mobile/tablet devices
  useEffect(() => {
    if (!activeStep) return;
    const handleOutsideClick = () => {
      setActiveStep(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [activeStep]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/10 relative overflow-hidden w-full">
      {/* Background visual detail */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-500/5 relative z-10">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Lead Generation Pipeline
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Flow of intent stream into active opportunities</p>
        </div>
        <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
          <span>{isTouchDevice ? 'Tap steps for info' : 'Hover steps for info'}</span>
        </div>
      </div>

      {/* Grid container for steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative z-10 px-2 py-1">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              id={`step-trigger-${step.id}`}
              className="relative flex flex-col items-center text-center group cursor-pointer"
              onMouseEnter={(e) => {
                if (isTouchDevice) return;
                setActiveStep(step.id);
                updateTooltipPosition(step.id, e.currentTarget);
              }}
              onMouseLeave={() => {
                if (isTouchDevice) return;
                setActiveStep(null);
              }}
              onClick={(e) => {
                if (!isTouchDevice) return;
                e.stopPropagation();
                if (activeStep === step.id) {
                  setActiveStep(null);
                } else {
                  setActiveStep(step.id);
                  updateTooltipPosition(step.id, e.currentTarget);
                }
              }}
            >
              {/* Outer Pulsing Connector Line (only on desktop/tablet) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] h-0.5 bg-neutral-800 z-0 overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="h-full w-12 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" 
                  />
                </div>
              )}

              {/* Node wrapper */}
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center relative z-10 cursor-help ${step.bg} ${step.color} border-neutral-800 transition duration-300 group-hover:scale-110 mb-2.5 shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Title & Desc */}
              <div className="flex flex-col gap-0.5 cursor-help">
                <span className="text-xs font-semibold text-white font-mono tracking-tight group-hover:text-emerald-400 transition">{step.label}</span>
                <span className="text-[10px] text-neutral-400 max-w-[180px] leading-relaxed">{step.desc}</span>
              </div>

              {/* Arrow Indicator for Mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex items-center justify-center my-1.5 text-neutral-700">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Render tooltip in document.body to prevent parent overflow/clipping */}
      {createPortal(
        <AnimatePresence>
          {activeStep && tooltipPos && (
            <motion.div
              key={activeStep}
              className="absolute p-3.5 rounded-xl border bg-black/95 text-left shadow-[0_10px_30px_rgba(0,0,0,0.85)] z-[10000] w-64 pointer-events-none"
              style={{
                top: tooltipPos.top,
                left: tooltipPos.left,
                borderColor: tooltipPos.step.borderColor,
              }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="p-1 rounded bg-neutral-900 border" style={{ borderColor: tooltipPos.step.borderColor }}>
                  {(() => {
                    const TargetIcon = tooltipPos.step.icon;
                    return <TargetIcon className={`w-3.5 h-3.5 ${tooltipPos.step.color}`} />;
                  })()}
                </div>
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">{tooltipPos.step.label}</span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{tooltipPos.step.definition}</p>
              
              {/* Tooltip Chevron */}
              {(() => {
                const chevronBorderClass = 
                  tooltipPos.position === 'top' ? 'border-r border-b' :
                  tooltipPos.position === 'bottom' ? 'border-l border-t' :
                  tooltipPos.position === 'left' ? 'border-r border-t' :
                  'border-l border-b';

                const chevronPosClass = 
                  tooltipPos.position === 'top' ? 'top-[calc(100%-5px)] left-1/2 -translate-x-1/2' :
                  tooltipPos.position === 'bottom' ? 'bottom-[calc(100%-5px)] left-1/2 -translate-x-1/2' :
                  tooltipPos.position === 'left' ? 'left-[calc(100%-5px)] top-1/2 -translate-y-1/2' :
                  'right-[calc(100%-5px)] top-1/2 -translate-y-1/2';

                return (
                  <div 
                    className={`absolute w-2.5 h-2.5 bg-black rotate-45 ${chevronBorderClass} ${chevronPosClass}`} 
                    style={{ borderColor: tooltipPos.step.borderColor }}
                  />
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
