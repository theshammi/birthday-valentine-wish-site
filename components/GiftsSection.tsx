"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "@phosphor-icons/react";

export default function GiftsSection({ finalVideoUrl }: { finalVideoUrl?: string }) {
  const [stage, setStage] = useState(0);

  const phrases = [
    "",
    "I didn't just build this to say Happy Birthday...",
    "I built this to remind you...",
    "That in a universe of infinite possibilities...",
    "You are my absolute favorite one.",
    "I love you, forever."
  ];

  const startSequence = async () => {
    if (stage > 0) return;

    setStage(1);
    await new Promise(r => setTimeout(r, 4500));
    setStage(2);
    await new Promise(r => setTimeout(r, 4500));
    setStage(3);
    await new Promise(r => setTimeout(r, 5000));
    setStage(4);
    await new Promise(r => setTimeout(r, 5000));
    setStage(5);
  };

  return (
    <div className="relative w-full h-dvh flex items-center justify-center select-none overflow-hidden">

      {/* Idle State: The elegant start button */}
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-6 z-20"
          >
            <p className="font-love text-3xl md:text-4xl text-rose-300/80 drop-shadow-md">
              I have one last thing to tell you...
            </p>
            <button
              onClick={startSequence}
              className="px-8 py-3.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono uppercase tracking-widest text-xs hover:bg-rose-500/20 hover:scale-105 transition-all shadow-[0_0_25px_rgba(244,63,94,0.15)] hover:shadow-[0_0_35px_rgba(244,63,94,0.3)] group cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4 fill-current group-hover:animate-pulse" />
                Reveal my heart
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Theater Overlay */}
      <AnimatePresence>
        {stage > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 bg-[#030001] z-40" // Deepest black-red void
          >
            {/* Cinematic Video Background (Mixkit Romantic Sunset) */}
            <AnimatePresence>
              {stage > 0 && stage < 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3 }}
                  className="absolute inset-0 z-0 pointer-events-none"
                >
                  <video
                    src={finalVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-holding-hands-and-walking-in-a-field-42456-large.mp4"}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-dvh object-cover filter brightness-75 contrast-125 sepia-[0.3]"
                    onError={(e) => {
                      // Fallback if video fails to load or format is unsupported
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-rose-950', 'to-[#030001]');
                    }}
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_40%,_rgba(3,0,1,1)_100%]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fireworks Finale Background */}
            <AnimatePresence>
              {stage === 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 3 }}
                  className="absolute inset-0 overflow-hidden"
                >
                  {/* Spawn massive dense hearts bursting radially from center */}
                  {Array.from({ length: 45 }).map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = Math.random() * 45 + 15; // viewport distance
                    const duration = Math.random() * 4 + 3; // Slow-motion explosion
                    const size = Math.random() * 1.5 + 0.5;
                    const colors = ["#fb7185", "#f43f5e", "#e11d48", "#be123c", "#f87171"];
                    const color = colors[Math.floor(Math.random() * colors.length)];

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, left: "50%", top: "50%" }}
                        animate={{
                          opacity: [0, 1, 0],
                          left: `calc(50% + ${Math.cos(angle) * velocity}vw)`,
                          top: `calc(50% + ${Math.sin(angle) * velocity}vh)`,
                          scale: size,
                          rotate: Math.random() * 360
                        }}
                        transition={{
                          duration,
                          repeat: Infinity,
                          delay: Math.random() * 3, // Stagger explosions
                          ease: "easeOut"
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ color, filter: `drop-shadow(0 0 20px ${color})` }}
                      >
                        <Heart weight="fill" className="w-8 h-8 opacity-80" />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typography Container */}
      {stage > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-6">
          <AnimatePresence mode="wait">
            <motion.h2
              key={stage}
              initial={{ opacity: 0, y: 15, filter: "blur(12px)", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -15, filter: "blur(12px)", scale: 1.05 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className={`text-center leading-relaxed max-w-5xl mx-auto drop-shadow-2xl ${stage === 5
                  ? "font-love text-5xl md:text-8xl text-rose-300 drop-shadow-[0_0_40px_rgba(244,63,94,0.6)] leading-tight py-4"
                  : "font-love text-4xl md:text-6xl text-rose-200 tracking-wide py-4"
                }`}
            >
              {phrases[stage]}
            </motion.h2>
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
