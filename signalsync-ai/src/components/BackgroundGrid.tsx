import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function BackgroundGrid() {
  const [dots, setDots] = useState<{ x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate some random neon pulses on mount
    const newDots = Array.from({ length: 15 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 4,
    }));
    setDots(newDots);
  }, []);

  return (
    <div id="grid-bg" className="fixed inset-0 overflow-hidden bg-neutral-950 pointer-events-none z-0">
      {/* Grid Pattern */}
      <div 
        id="tech-grid" 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial ambient glow orbs */}
      <div 
        id="radial-glow-green" 
        className="absolute top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-emerald-500/5 blur-[120px]" 
      />
      <div 
        id="radial-glow-cyan" 
        className="absolute -bottom-1/4 -right-1/4 w-[80vw] h-[80vw] rounded-full bg-cyan-500/5 blur-[140px]" 
      />

      {/* Custom fading neon data indicators */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          id={`data-pulse-${i}`}
          className="absolute rounded-full bg-emerald-400/40"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            boxShadow: '0 0 10px 2px rgba(16, 185, 129, 0.3)',
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Futuristic cyber panel frame (top line) */}
      <div id="top-frame" className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </div>
  );
}
