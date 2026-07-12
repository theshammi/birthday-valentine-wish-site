"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import { Heart } from "@phosphor-icons/react";

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollWrapperProps {
  children: React.ReactNode;
  onProgress?: (progress: number) => void;
}

export default function HorizontalScrollWrapper({ children, onProgress }: HorizontalScrollWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Gracefully handle user's preferences for reduced motion
    if (reduceMotion || !wrapperRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const pinDistance = trackRef.current!.scrollWidth - window.innerWidth;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: () => `+=${pinDistance}`,
          pin: true,
          scrub: 1.1, // Smooth scrolling inertia
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (onProgress) onProgress(self.progress);
          }
        }
      });

      // Move the main content track
      tl.to(trackRef.current, {
        x: -pinDistance,
        ease: "none",
      }, 0);

      // Move the hearts at 20% speed for a beautiful slow parallax effect
      if (parallaxRef.current) {
        tl.to(parallaxRef.current, {
          x: -pinDistance * 0.2,
          ease: "none",
        }, 0);
      }

    }, wrapperRef);

    return () => ctx.revert();
  }, [reduceMotion, onProgress]);

  if (reduceMotion) {
    return (
      <div className="flex flex-col w-full bg-[#030514]">
        {children}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative overflow-hidden w-full">
      
      {/* Smooth Parallax Floating Hearts */}
      <div ref={parallaxRef} className="absolute inset-0 z-0 pointer-events-none w-[150vw] h-[100svh]">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
            className="absolute opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 150}%`, // Spread across the wider parallax container
              scale: 0.4 + Math.random() * 1.5,
            }}
          >
            <Heart weight="fill" className="text-rose-500 blur-[2px]" />
          </motion.div>
        ))}
      </div>

      <div ref={trackRef} className="flex h-[100svh] w-max items-center flex-nowrap relative z-10">
        {children}
      </div>
    </div>
  );
}
