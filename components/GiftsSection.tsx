"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "@phosphor-icons/react";
import BlurRevealText from "./BlurRevealText";

interface GiftsSectionProps {
  finalVideoUrl?: string;
  onVideoPlay?: (hasAudio: boolean) => void;
  onVideoEnd?: () => void;
  endScreenTitle?: string;
  endScreenBody?: string;
  enableTextReveal?: boolean;
  textRevealSpeed?: number;
  afterVideoPhrases?: string;
}

const getOptimizedVideoUrl = (url?: string) => {
  if (!url) return "";
  if (url.includes("imagekit.io")) {
    if (url.includes("?")) {
      return `${url}&tr=f-mp4`;
    }
    return `${url}?tr=f-mp4`;
  }
  return url;
};

export default function GiftsSection({ finalVideoUrl, onVideoPlay, onVideoEnd, endScreenTitle, endScreenBody, enableTextReveal, textRevealSpeed, afterVideoPhrases }: GiftsSectionProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [shouldPreload, setShouldPreload] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [textStage, setTextStage] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setShouldPreload(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const phrases = [
    "",
    ...(afterVideoPhrases
      ? afterVideoPhrases.split("\n").map(l => l.trim()).filter(l => l !== "")
      : [
          "I didn't just build this to say Happy Birthday...",
          "I built this to remind you...",
          "That in a universe of infinite possibilities...",
          "You are my absolute favorite one.",
          "I love you, forever."
        ]
    )
  ];

  const handleStart = () => {
    if (hasStarted) return;
    setHasStarted(true);
  };

  const startTextSequence = async () => {
    for (let i = 1; i < phrases.length; i++) {
      setTextStage(i);
      const wordCount = phrases[i].split(" ").length;
      // Stagger base typing time: ~0.35s per word + 2.5s base visibility time
      const delay = Math.max(3500, Math.min(6500, wordCount * 350 + 2500));
      await new Promise(r => setTimeout(r, delay));
    }
    setShowEndScreen(true);
  };

  const portalContent = mounted ? createPortal(
    <>
      {/* Cinematic Theater Overlay */}
      <AnimatePresence>
        {hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 bg-[#030001] z-[100]" // Deepest black-red void
          >
            {/* Cinematic Video Background */}
            <AnimatePresence>
              {!showEndScreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3 }}
                  className="absolute inset-0 z-0 pointer-events-none"
                >
                  <video
                    src={getOptimizedVideoUrl(finalVideoUrl) || "https://assets.mixkit.co/videos/preview/mixkit-holding-hands-and-walking-in-a-field-42456-large.mp4"}
                    autoPlay
                    playsInline
                    onEnded={() => {
                      setVideoEnded(true);
                      onVideoEnd?.();
                      startTextSequence();
                    }}
                    onLoadedData={(e) => {
                      const video = e.currentTarget;
                      let hasAudio = true;
                      if ((video as any).audioTracks !== undefined) {
                        hasAudio = (video as any).audioTracks.length > 0;
                      } else if ((video as any).mozHasAudio !== undefined) {
                        hasAudio = (video as any).mozHasAudio;
                      }
                      onVideoPlay?.(hasAudio);
                    }}
                    className="relative w-full h-full object-contain filter brightness-95 contrast-100 z-0"
                    onError={(e) => {
                      console.error("Final video load error:", e);
                      // Fallback if video fails to load
                      setVideoEnded(true);
                      onVideoEnd?.();
                      startTextSequence();
                    }}
                  />
                  {/* Dark overlay fades in WHEN video ends to make text readable over the frozen final frame */}
                  <AnimatePresence>
                    {videoEnded && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-black/60 z-10" 
                      />
                    )}
                  </AnimatePresence>
                  {/* Subtle vignette */}
                  <div 
                    className="absolute inset-0 z-20" 
                    style={{
                      backgroundImage: "radial-gradient(circle at center, transparent 40%, rgba(3, 0, 1, 1) 100%)"
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typography Container */}
      {!showEndScreen && textStage > 0 && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none p-6">
          <AnimatePresence mode="wait">
            <motion.h2
              key={textStage}
              initial={{ opacity: 0, y: 15, filter: "blur(12px)", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -15, filter: "blur(12px)", scale: 1.05 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className={`text-center leading-relaxed max-w-5xl mx-auto drop-shadow-2xl ${textStage === 5
                  ? "font-love text-5xl md:text-8xl text-rose-300 drop-shadow-[0_0_40px_rgba(244,63,94,0.6)] leading-tight py-4"
                  : "font-love text-4xl md:text-6xl text-rose-200 tracking-wide py-4"
                }`}
            >
              <BlurRevealText 
                text={phrases[textStage]} 
                staggerDelay={textRevealSpeed}
                enabled={enableTextReveal}
              />
            </motion.h2>
          </AnimatePresence>
        </div>
      )}

      {/* After Video End Screen */}
      <AnimatePresence>
        {showEndScreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#090204]"
          >
            {/* Fireworks Finale Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <h1 className="font-love text-5xl md:text-8xl text-rose-200 tracking-wide mb-6 drop-shadow-[0_0_40px_rgba(244,63,94,0.6)]">
                {endScreenTitle || "Forever."}
              </h1>
              <p className="font-serif italic text-zinc-400 text-sm md:text-base max-w-md text-center mb-12 px-4 whitespace-pre-wrap drop-shadow-md">
                {endScreenBody || "Every moment with you is a gift.\nHere's to all the memories we've made, and all the ones still waiting for us."}
              </p>
              
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-full border border-rose-900/50 bg-rose-950/20 text-rose-300 text-xs font-mono uppercase tracking-[0.2em] backdrop-blur-md transition-colors hover:bg-rose-900/40 hover:border-rose-500/50 cursor-pointer pointer-events-auto shadow-[0_0_20px_rgba(244,63,94,0.1)]"
              >
                Relive the Magic
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  ) : null;

  return (
    <div className="relative w-full h-dvh flex items-center justify-center select-none overflow-hidden">

      {/* Hidden preloader for the final video (starts loading chunks after initial load) */}
      {shouldPreload && !hasStarted && (
        <video 
          src={getOptimizedVideoUrl(finalVideoUrl) || "https://assets.mixkit.co/videos/preview/mixkit-holding-hands-and-walking-in-a-field-42456-large.mp4"} 
          preload="auto" 
          muted 
          style={{ display: "none" }} 
        />
      )}

      {/* Idle State: The elegant start button */}
      <AnimatePresence>
        {!hasStarted && (
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
              onClick={handleStart}
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

      {/* Portal Content Rendered Outside GSAP Transform */}
      {portalContent}
    </div>
  );
}
