"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Camera, Calendar } from "@phosphor-icons/react";
import { Memory } from "../lib/db";

interface MemoryTimelineProps {
  memories: Memory[];
}

export default function MemoryTimeline({ memories }: MemoryTimelineProps) {
  return (
    <section className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto z-10 w-full overflow-hidden">
      {/* Visual Header */}
      <div className="text-center space-y-4 mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest">
          <Camera className="w-3.5 h-3.5" />
          Polaroids & Stories
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-zinc-100 font-bold leading-tight">
          Captured Memories
        </h2>
        <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
          Strolls down memory lane. Reminiscing on the wonderful moments shared throughout the years.
        </p>
      </div>

      {/* Asymmetric Polaroid Grid */}
      <div className="relative space-y-24 md:space-y-36">
        {/* Background connector line */}
        <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-amber-500/0 via-amber-500/10 to-amber-500/0 hidden md:block" />

        {memories.map((memory, idx) => {
          const isEven = idx % 2 === 0;
          // Alternate rotation angles for polaroid feel
          const rotationAngle = idx % 3 === 0 ? "rotate-2" : idx % 3 === 1 ? "-rotate-2" : "rotate-1";

          return (
            <div
              key={memory.id}
              className={`flex flex-col md:flex-row items-center w-full ${isEven ? "md:flex-row-reverse" : ""
                }`}
            >
              {/* Left/Right empty gap spacer */}
              <div className="w-full md:w-1/2" />

              {/* Central node timeline dot */}
              <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-zinc-950 border-2 border-amber-500/40 hidden md:flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>

              {/* Content Panel */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? 50 : -50, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full md:w-1/2 px-4 md:px-12 flex justify-center ${isEven ? "md:justify-end" : "md:justify-start"
                  }`}
              >
                {/* Polaroid Frame */}
                <div
                  className={`bg-[#fbfbf9] p-4 pb-6 rounded-sm shadow-2xl transition-transform duration-300 hover:rotate-0 hover:scale-105 select-none text-zinc-800 ${rotationAngle} max-w-md w-full border border-zinc-200/50`}
                >
                  <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden border border-zinc-200">
                    <Image
                      src={memory.imageUrl}
                      alt={memory.caption}
                      fill
                      className="object-cover filter saturate-90 brightness-95"
                      unoptimized
                    />
                  </div>

                  {/* Polaroid caption & Metadata */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-amber-700 text-xs font-mono font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {memory.date}
                    </div>
                    <p className="font-serif text-sm italic text-zinc-700 leading-relaxed font-medium">
                      {memory.caption}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
