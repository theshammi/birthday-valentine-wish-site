"use client";

import { useState, useRef } from "react";
import { Wish, Memory, AppConfig } from "../lib/db";
import WebGLBackground from "./WebGLBackground";
import EnvelopeEntry from "./EnvelopeEntry";
import HorizontalScrollWrapper from "./HorizontalScrollWrapper";
import GiftsSection from "./GiftsSection";
import BlurRevealText from "./BlurRevealText";
import { Sparkle, Calendar, Heart, Camera, ArrowRight, MapPin, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

interface CelebrationPageProps {
  initialWishes: Wish[];
  initialMemories: Memory[];
  config: AppConfig;
}

export default function CelebrationPage({ initialWishes, initialMemories, config }: CelebrationPageProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleOpen = () => {
    setIsOpened(true);
    if (config.isMusicEnabled !== false) {
      if (!audioRef.current) {
        audioRef.current = new Audio(config.backgroundMusicUrl || "/indila-love.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
      }
      audioRef.current.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFinalVideoPlay = (hasAudio: boolean) => {
    const setting = config.muteBgmDuringVideo || "auto";
    if (setting === "yes" || (setting === "auto" && hasAudio)) {
      if (audioRef.current && !isMuted) {
        audioRef.current.pause();
      }
    }
  };

  const handleFinalVideoEnd = () => {
    if (config.isMusicEnabled !== false && !isMuted && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  if (!isOpened) {
    return (
      <EnvelopeEntry
        birthdayName={config.birthdayName}
        envelopeTitle={config.envelopeTitle}
        onOpen={handleOpen}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090204] text-zinc-100 relative selection:bg-amber-400/30 select-none">
      <style>{`
        @keyframes dashFlow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .animate-timeline {
          animation: dashFlow 1s linear infinite;
        }
      `}</style>

      {/* upgraded WebGL particles with Attraction Hearts */}
      <WebGLBackground />

      {/* Visual glow gradients */}
      <div className="fixed top-0 left-0 w-screen h-[100svh] bg-radial-[circle_at_top,_rgba(244,63,94,0.04)_0%,_transparent_60%] pointer-events-none z-5" />
      <div className="fixed top-0 left-0 w-screen h-[100svh] bg-radial-[circle_at_bottom,_rgba(218,165,32,0.03)_0%,_transparent_60%] pointer-events-none z-5" />



      {/* Persistence overlay header */}
      <header className="fixed top-0 left-0 right-0 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center z-40 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400/80 animate-pulse" />
          <span className="font-love text-2xl tracking-widest text-rose-300 drop-shadow-md">
            For {config.birthdayName}
          </span>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-zinc-950/60 backdrop-blur-md border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors"
          >
            {isMuted ? <SpeakerSlash className="w-4 h-4" /> : <SpeakerHigh className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md text-[10px] md:text-xs text-zinc-400 font-mono">
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
            <span className="hidden sm:inline">
              {new Date(config.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="sm:hidden">
              {new Date(config.birthDate).toLocaleDateString(undefined, { year: '2-digit', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* Persistence Scroll indicator */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40 bg-zinc-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-900/60 font-mono text-[10px] text-zinc-500 uppercase tracking-widest transition-opacity duration-500 ${scrollProgress > 0.95 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <span>Scroll to explore</span>
        <ArrowRight className="w-3.5 h-3.5 text-rose-400 animate-bounce-horizontal" />
      </div>

      <HorizontalScrollWrapper onProgress={setScrollProgress}>
        {/* PANEL 1: Dedicated Romantic Hero */}
        <section className="w-screen h-screen flex-shrink-0 flex items-center justify-center relative p-8 md:p-16 z-10">

          {/* Animated Background Orbs just for Hero */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-rose-600/20 rounded-full blur-[100px] pointer-events-none"
          />

          <div className="max-w-4xl text-center space-y-8 flex flex-col items-center relative z-10">

            {/* Floating Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(244,63,94,0.1)]"
            >
              <Sparkle className="w-4 h-4 animate-spin-slow text-amber-300" />
              <span>A Celebration of You</span>
              <Sparkle className="w-4 h-4 animate-spin-slow text-amber-300" />
            </motion.div>

            {/* Main Title with Staggered Entrance */}
            <div className="space-y-4">
              <h2 className="font-love text-4xl md:text-6xl text-rose-400/90 tracking-wide">
                <BlurRevealText 
                  text={config.heroGreeting || "Love of my life,"} 
                  delay={0.8} 
                  staggerDelay={config.textRevealSpeed}
                  enabled={config.enableTextReveal}
                />
              </h2>

              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 1.2, type: "spring" }}
                className="font-love font-bold tracking-widest text-6xl sm:text-7xl md:text-[8rem] bg-gradient-to-r from-rose-300 via-pink-400 to-rose-200 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.4)] leading-tight py-6"
              >
                <BlurRevealText 
                  text={config.birthdayName} 
                  delay={1.2} 
                  staggerDelay={config.textRevealSpeed}
                  enabled={config.enableTextReveal}
                />
              </motion.h1>
            </div>

            {/* Breathing Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 2 }}
              className="relative pt-6 w-full max-w-lg mx-auto"
            >
              <Heart weight="fill" className="w-6 h-6 text-rose-500/30 absolute -top-2 left-1/2 -translate-x-1/2" />
              <div className="text-zinc-300 text-base md:text-lg leading-relaxed font-serif italic drop-shadow-md text-center">
                <BlurRevealText 
                  text={config.heroQuote || "In all the world, there is no heart for me like yours.\nIn all the world, there is no love for you like mine."} 
                  delay={2.5} 
                  staggerDelay={config.textRevealSpeed}
                  enabled={config.enableTextReveal}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* PANEL 2: Horizontal Polaroid Memories (Timeline) */}
        <section className="h-screen flex-shrink-0 flex items-center relative px-8 md:px-32 z-10 w-max">

          <div className="flex gap-12 md:gap-20 items-center h-dvh">
            {/* Gallery Intro card */}
            <div className="max-w-xs space-y-4 pr-6 md:pr-12 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest">
                <Camera className="w-3.5 h-3.5" />
                Snapshot Timeline
              </div>
              <h2 className="font-love text-4xl md:text-5.5xl text-rose-300 leading-none drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                {config.memoriesTitle || "Our Memories"}
              </h2>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                {config.memoriesDescription || "A timeline of our favorite moments. Each polaroid is a beautiful memory, a quiet smile, and a story we shared together."}
              </p>

              {/* Wavy line connecting intro to the first item */}
              <svg
                className="absolute top-1/2 left-full w-[176px] md:w-[220px] h-16 md:h-20 -translate-y-1/2 pointer-events-none z-0"
                viewBox="0 0 100 100" preserveAspectRatio="none"
              >
                <path d="M 0 50 C 50 50, 50 25, 100 25" fill="none" className="stroke-rose-500/40 animate-timeline" strokeWidth="2" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>

            {/* Polaroid cards mapped along the timeline */}
            {initialMemories.map((memory, idx) => {
              const rotate = idx % 3 === 0 ? "rotate-2" : idx % 3 === 1 ? "-rotate-2" : "rotate-1";
              const isTop = idx % 2 === 0;
              const hasNext = idx < initialMemories.length - 1;

              return (
                <div key={memory.id} className="relative w-64 md:w-[280px] h-dvh flex flex-col justify-center flex-shrink-0">

                  {/* Responsive Wavy Timeline Segment to NEXT item */}
                  {hasNext && (
                    <svg
                      className="absolute top-1/2 left-1/2 w-[calc(100%+3rem)] md:w-[calc(100%+5rem)] h-16 md:h-20 -translate-y-1/2 pointer-events-none z-0"
                      viewBox="0 0 100 100" preserveAspectRatio="none"
                    >
                      <path
                        d={isTop ? "M 0 25 C 50 25, 50 75, 100 75" : "M 0 75 C 50 75, 50 25, 100 25"}
                        fill="none"
                        className="stroke-rose-500/40 animate-timeline"
                        strokeWidth="2"
                        strokeDasharray="4 6"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}

                  {/* Timeline MapPin Node */}
                  <div className={`absolute left-1/2 -translate-x-1/2 ${isTop ? 'top-[calc(50%-16px)] md:top-[calc(50%-20px)]' : 'top-[calc(50%+16px)] md:top-[calc(50%+20px)]'} -translate-y-1/2 z-20 flex flex-col items-center justify-center`}>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-8 h-8 md:w-12 md:h-12 bg-rose-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                      <div className="absolute w-6 h-6 md:w-8 md:h-8 bg-rose-500/30 rounded-full animate-pulse" />
                      <MapPin weight="fill" className="relative text-rose-400 w-6 h-6 md:w-8 md:h-8 drop-shadow-[0_0_12px_rgba(244,63,94,1)] z-10" />
                    </div>
                  </div>

                  {/* Card wrapper */}
                  <motion.div
                    layoutId={`memory-${memory.id}`}
                    onClick={() => setActiveMemory(memory)}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                    className={`absolute left-1/2 -translate-x-1/2 ${isTop ? 'bottom-[calc(50%+16px+1rem)] md:bottom-[calc(50%+20px+1.5rem)]' : 'top-[calc(50%+16px+1rem)] md:top-[calc(50%+20px+1.5rem)]'
                      } bg-[#fbfbf9] p-3 pb-5 md:p-4 md:pb-6 rounded-sm shadow-2xl transition-transform duration-300 text-zinc-800 ${rotate} w-full border border-zinc-200/50 z-30 cursor-pointer`}
                  >
                    <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden border border-zinc-200">
                      {memory.videoUrl ? (
                        <video
                          src={memory.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="object-contain w-full h-full filter saturate-90 brightness-95 bg-zinc-900"
                        />
                      ) : (
                        <img
                          src={memory.imageUrl}
                          alt={memory.caption}
                          className="object-contain w-full h-full filter saturate-90 brightness-95 bg-zinc-900"
                        />
                      )}
                    </div>

                    <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2 text-left">
                      <div className="text-rose-700 text-[9px] md:text-[10px] font-mono font-bold uppercase">{memory.date}</div>
                      <p className="font-serif text-[11px] md:text-xs italic text-zinc-700 leading-relaxed font-medium line-clamp-3">
                        "{memory.caption}"
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PANEL 3: Gifts, Sandbox and Footer */}
        <section className="w-screen h-screen flex-shrink-0 flex items-center justify-center relative p-8 md:p-16 z-10">
          <div className="w-full max-w-5xl h-dvh flex flex-col justify-between pt-16">
            <div className="flex-1 flex items-center justify-center">
              <GiftsSection 
                finalVideoUrl={config.finalVideoUrl} 
                onVideoPlay={handleFinalVideoPlay} 
                onVideoEnd={handleFinalVideoEnd}
                endScreenTitle={config.endScreenTitle}
                endScreenBody={config.endScreenBody}
                enableTextReveal={config.enableTextReveal}
                textRevealSpeed={config.textRevealSpeed}
                afterVideoPhrases={config.afterVideoPhrases}
              />
            </div>

            <footer className="border-t border-zinc-900/60 pt-6 flex flex-col sm:flex-row justify-between items-center text-zinc-600 text-[10px] font-mono w-full">
              <p>© {new Date().getFullYear()} Dedicated to {config.birthdayName}.</p>
              <p className="flex items-center gap-1.5 mt-2 sm:mt-0">
                Created with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for a lifetime together.
              </p>
            </footer>
          </div>
        </section>
      </HorizontalScrollWrapper>

      {/* Expanded Memory Modal */}
      <AnimatePresence>
        {activeMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveMemory(null)}
          >
            {/* Floating Hearts BACKGROUND Layer (Behind Polaroid) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {Array.from({ length: 12 }).map((_, i) => {
                const randomX = Math.random() * 100;
                const randomDuration = Math.random() * 5 + 5;
                const randomDelay = Math.random() * 3;
                const randomScale = Math.random() * 0.4 + 0.4;
                const colors = ["#fb7185", "#fbbf24", "#f472b6", "#c084fc", "#f87171", "#38bdf8"];
                const color = colors[Math.floor(Math.random() * colors.length)];

                return (
                  <motion.div
                    key={`bg-${i}`}
                    initial={{ opacity: 0, top: "110%", left: `${randomX}%`, scale: randomScale }}
                    animate={{ opacity: [0, 0.6, 0.6, 0], top: "-20%" }}
                    transition={{ duration: randomDuration, repeat: Infinity, delay: randomDelay, ease: "linear" }}
                    className="absolute"
                    style={{ color, filter: `drop-shadow(0 0 12px ${color})` }}
                  >
                    <Heart weight="fill" className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
                  </motion.div>
                );
              })}
            </div>

            {/* Expanded Card */}
            <motion.div
              layoutId={`memory-${activeMemory.id}`}
              className="relative max-w-2xl w-full bg-[#fbfbf9] p-4 pb-6 md:p-6 md:pb-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden border border-zinc-200">
                {activeMemory.videoUrl ? (
                  <video
                    src={activeMemory.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-contain w-full h-full bg-zinc-900"
                  />
                ) : (
                  <img
                    src={activeMemory.imageUrl}
                    alt={activeMemory.caption}
                    className="object-contain w-full h-full bg-zinc-900"
                  />
                )}
              </div>
              <div className="mt-4 md:mt-6 space-y-2">
                <div className="text-rose-700 text-xs md:text-sm font-mono font-bold uppercase">{activeMemory.date}</div>
                <p className="font-serif text-sm md:text-lg italic text-zinc-700 leading-relaxed font-medium">
                  "{activeMemory.caption}"
                </p>
              </div>
            </motion.div>

            {/* Floating Hearts FOREGROUND Layer (In Front of Polaroid) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {Array.from({ length: 6 }).map((_, i) => {
                const randomX = Math.random() * 100;
                const randomDuration = Math.random() * 4 + 4; // Slightly faster for foreground (parallax)
                const randomDelay = Math.random() * 2;
                const randomScale = Math.random() * 0.6 + 0.8; // Larger for foreground
                const colors = ["#fb7185", "#fbbf24", "#f472b6", "#c084fc", "#f87171", "#38bdf8"];
                const color = colors[Math.floor(Math.random() * colors.length)];

                return (
                  <motion.div
                    key={`fg-${i}`}
                    initial={{ opacity: 0, top: "110%", left: `${randomX}%`, scale: randomScale }}
                    animate={{ opacity: [0, 0.9, 0.9, 0], top: "-20%" }}
                    transition={{ duration: randomDuration, repeat: Infinity, delay: randomDelay, ease: "linear" }}
                    className="absolute"
                    style={{ color, filter: `drop-shadow(0 0 15px ${color})` }}
                  >
                    <Heart weight="fill" className="w-10 h-10 md:w-16 md:h-16 opacity-90" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

