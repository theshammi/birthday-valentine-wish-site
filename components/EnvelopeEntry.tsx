"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "@phosphor-icons/react";

interface EnvelopeEntryProps {
  birthdayName: string;
  envelopeTitle: string; // Not strictly needed for the gates but kept for props compatibility
  onOpen: () => void;
}

export default function EnvelopeEntry({ birthdayName, onOpen }: EnvelopeEntryProps) {
  const [isOpened, setIsOpened] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw a heart path on the canvas context
  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    // Translate so the heart is drawn centered around x,y
    ctx.translate(x, y - size / 2); 
    
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // top left curve
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    // bottom left
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 2, 0, size);
    // bottom right
    ctx.bezierCurveTo(0, (size + topCurveHeight) / 2, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    // top right curve
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    
    ctx.fill();
    ctx.restore();
  };

  const handleOpen = () => {
    setIsOpened(true);
    
    // Trigger Canvas Heart Explosion
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
          x: number;
          y: number;
          vx: number;
          vy: number;
          size: number;
          color: string;
          alpha: number;
          decay: number;
        }> = [];

        // Create 80 explosive scattering hearts
        for (let i = 0; i < 80; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 20 + 5;
          const isRed = Math.random() > 0.5;
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4, // explode outwards with a bias upwards
            size: Math.random() * 18 + 8,
            color: isRed ? `hsla(340, 100%, ${Math.random() * 20 + 50}%, 1)` : `hsla(350, 80%, ${Math.random() * 20 + 70}%, 1)`,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.008,
          });
        }

        let animationFrameId: number;

        const animateBurst = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let activeParticles = 0;

          particles.forEach((p) => {
            if (p.alpha > 0) {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.25; // Gravity
              p.vx *= 0.96; // Friction (air resistance)
              p.alpha -= p.decay;

              drawHeart(ctx, p.x, p.y, p.size, p.color, p.alpha);
              activeParticles++;
            }
          });

          if (activeParticles > 0) {
            animationFrameId = requestAnimationFrame(animateBurst);
          }
        };

        animateBurst();
      }
    }

    // Unmount and go to next page after doors fully open
    setTimeout(() => {
      onOpen();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] [perspective:1500px] overflow-hidden select-none">
      {/* Canvas Layer for heart explosion */}
      <canvas ref={canvasRef} className="absolute inset-0 z-50 pointer-events-none" />

      {/* Behind the doors: glowing portal hinting at the magic inside */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
         <div className={`transition-all duration-[2500ms] ${isOpened ? "opacity-100 scale-125" : "opacity-0 scale-50"}`}>
            <Heart weight="fill" className="w-48 h-48 text-rose-500 blur-[60px] opacity-70 animate-pulse" />
         </div>
      </div>

      {/* LEFT GATE */}
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isOpened ? -120 : 0 }}
        transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left" }}
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#0d0508] border-r border-rose-900/30 flex items-center justify-end z-20 shadow-[20px_0_60px_rgba(0,0,0,0.9)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rose-950/10" />
        
        {/* Left half text */}
        {!isOpened && (
           <div className="absolute right-12 md:right-24 text-right opacity-90 max-w-[40vw]">
             <p className="font-love text-2xl sm:text-3xl md:text-4.5xl text-rose-400/90 mb-1 md:mb-2 whitespace-nowrap drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">Invitation</p>
             <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl text-zinc-300 tracking-widest truncate">For</h1>
           </div>
        )}
      </motion.div>

      {/* RIGHT GATE */}
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isOpened ? 120 : 0 }}
        transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "right" }}
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#0d0508] border-l border-rose-900/30 flex items-center justify-start z-20 shadow-[-20px_0_60px_rgba(0,0,0,0.9)]"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-rose-950/10" />
        
        {/* Right half text */}
         {!isOpened && (
           <div className="absolute left-12 md:left-24 text-left opacity-90 max-w-[40vw]">
             <p className="font-serif text-[9px] sm:text-[10px] md:text-xs text-zinc-500 tracking-[0.2em] uppercase mb-1 md:mb-2 whitespace-nowrap">To Celebrate</p>
             <h1 className="font-love text-4xl sm:text-5xl md:text-7.5xl bg-gradient-to-r from-rose-300 via-pink-400 to-rose-200 bg-clip-text text-transparent tracking-normal drop-shadow-[0_0_20px_rgba(244,63,94,0.4)] truncate pb-1">{birthdayName}</h1>
           </div>
        )}
      </motion.div>

      {/* CENTER SEAL (Splits and fades when clicked) */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
          >
            <button
              onClick={handleOpen}
              className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-rose-800 to-[#2c050f] border-2 border-rose-400/60 shadow-[0_0_50px_rgba(244,63,94,0.5)] flex items-center justify-center cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="absolute inset-1.5 md:inset-2 rounded-full border border-dashed border-rose-300/50 flex items-center justify-center">
                <Heart weight="fill" className="w-8 h-8 md:w-12 md:h-12 text-rose-200 drop-shadow-md group-hover:scale-110 group-hover:text-white transition-all duration-300" />
              </div>
              
              {/* Glowing ring pulse */}
              <div className="absolute inset-0 rounded-full border-2 border-rose-400 opacity-0 group-hover:opacity-100 animate-ping" />
            </button>
            <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-rose-300/80 tracking-[0.4em] font-mono uppercase whitespace-nowrap pointer-events-none drop-shadow-lg">
              Unlock
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
