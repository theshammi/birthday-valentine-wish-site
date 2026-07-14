"use client";

import { motion } from "motion/react";

interface BlurRevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  enabled?: boolean;
}

export default function BlurRevealText({ 
  text, 
  className = "", 
  delay = 0,
  staggerDelay = 0.03,
  enabled = true 
}: BlurRevealTextProps) {
  if (!enabled) {
    const lines = text.split("\n");
    return (
      <span className={className}>
        {lines.map((line, idx) => (
          <span key={idx} className="block">
            {line}
          </span>
        ))}
      </span>
    );
  }

  const lines = text.split("\n");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      filter: "blur(8px)",
      y: 4,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline ${className}`}
    >
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.split(" ").map((word, wordIdx, wordsArr) => (
            <span key={wordIdx} className="inline whitespace-nowrap">
              {word.split("").map((char, charIdx) => (
                <motion.span
                  key={charIdx}
                  variants={letterVariants}
                  className="inline"
                >
                  {char}
                </motion.span>
              ))}
              {wordIdx < wordsArr.length - 1 && <span className="inline">&nbsp;</span>}
            </span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
