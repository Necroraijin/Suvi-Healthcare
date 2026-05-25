'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          x: ["0%", "20%", "-20%", "0%"],
          y: ["0%", "-20%", "20%", "0%"],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/30 blur-[100px] mix-blend-multiply"
      />
      <motion.div
        animate={{
          x: ["0%", "-20%", "20%", "0%"],
          y: ["0%", "20%", "-20%", "0%"],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-sky-300/30 blur-[120px] mix-blend-multiply"
      />
      <motion.div
        animate={{
          x: ["0%", "30%", "-10%", "0%"],
          y: ["0%", "-10%", "30%", "0%"],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-blue-300/20 blur-[130px] mix-blend-multiply"
      />
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[50px]" />
    </div>
  );
}
