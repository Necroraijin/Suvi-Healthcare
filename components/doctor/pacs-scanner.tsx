'use client';

import React from 'react';
import { ShieldAlert, Image as ImageIcon, X, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type Appointment } from '@/app/actions';

export interface PacsScannerProps {
  appointments: Appointment[];
  pacsActiveAppointmentId: string | null;
  setPacsActiveAppointmentId: (id: string | null) => void;
  activeAppointmentId: string | null;
  pacsContrast: number;
  setPacsContrast: (contrast: number) => void;
  pacsAiHighlight: boolean;
  setPacsAiHighlight: (highlight: boolean) => void;
  finalizePACSScan: () => void;
  allowedAgents: string[];
  setActiveTab: (tab: any) => void;
}

export default function PacsScanner({
  appointments,
  pacsActiveAppointmentId,
  setPacsActiveAppointmentId,
  activeAppointmentId,
  pacsContrast,
  setPacsContrast,
  pacsAiHighlight,
  setPacsAiHighlight,
  finalizePACSScan,
  allowedAgents,
  setActiveTab
}: PacsScannerProps) {
  if (!allowedAgents.includes('imaging')) {
    return (
      <motion.div
        key="pacs"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="flex-1 glass-panel max-w-4xl mx-auto w-full p-6 rounded-3xl bg-slate-950 text-slate-300 border-slate-900 shadow-2xl flex flex-col justify-between min-h-[460px] relative overflow-hidden"
      >
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 rounded-2xl min-h-[350px]">
          <ShieldAlert className="w-12 h-12 text-rose-600 mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-white">Access Denied: PACS Imaging Locked</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-md">Your user account has not been allotted the PACS Imaging Agent capability. Contact your hospital super administrator to enable this permission.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="pacs"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 glass-panel max-w-4xl mx-auto w-full p-6 rounded-3xl bg-slate-950 text-slate-300 border-slate-900 shadow-2xl flex flex-col justify-between min-h-[460px] relative overflow-hidden"
    >
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-900 mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <ImageIcon className="w-5 h-5 text-indigo-500 animate-pulse" />
          <h3 className="font-heading font-bold text-md text-white">
            PACS Radiology Server — Chest X-Ray AI Scan
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">Select Patient:</span>
          <select
            value={pacsActiveAppointmentId || activeAppointmentId || ''}
            onChange={e => setPacsActiveAppointmentId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono"
          >
            <option value="" disabled>Choose Patient</option>
            {appointments.map(a => (
              <option key={a.id} value={a.id}>{a.id} — {a.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setActiveTab('patients')}
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Back to Patients Desk"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch flex-1">
        
        {/* Skeleton chest display frame */}
        <div className="sm:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center p-4 min-h-[280px] relative overflow-hidden flex-col gap-4">
          
          {/* Glowing scan line indicator */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 w-full h-[60px] animate-bounce pointer-events-none z-10" />

          <div
            className="w-48 h-48 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center relative flex-col shadow-inner transition-all duration-300"
            style={{ filter: `contrast(${pacsContrast}%) brightness(95%)` }}
          >
            {/* Spine Column */}
            <div className="w-2 h-full bg-slate-900 absolute left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center py-2 opacity-80">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="w-3.5 h-2.5 bg-slate-700/80 rounded" />
              ))}
            </div>

            {/* Ribcage */}
            <div className="absolute inset-0 flex justify-between px-3 py-6 opacity-60">
              <div className="flex flex-col gap-3 items-start h-full w-16">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-full h-1.5 bg-slate-700 rounded-r-full" style={{ transform: `rotate(${i * 12}deg)` }} />
                ))}
              </div>
              <div className="flex flex-col gap-3 items-end h-full w-16">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-full h-1.5 bg-slate-700 rounded-l-full" style={{ transform: `rotate(${-i * 12}deg)` }} />
                ))}
              </div>
            </div>

            {/* Lungs */}
            <div className="absolute inset-x-5 top-5 bottom-5 flex justify-between gap-10 pointer-events-none opacity-40">
              <div className="w-16 bg-gradient-to-br from-slate-900 to-slate-950 border-r border-t border-slate-800 rounded-tl-[30px] rounded-br-[50px]" />
              <div className="w-16 bg-gradient-to-bl from-slate-900 to-slate-950 border-l border-t border-slate-800 rounded-tr-[30px] rounded-bl-[50px]" />
            </div>

            {/* AI Overlays */}
            <AnimatePresence>
              {pacsAiHighlight && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-6 top-8 border-2 border-dashed border-rose-500 p-2 rounded-xl bg-rose-500/10 flex flex-col gap-0.5 z-20 pointer-events-none shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
                >
                  <span className="text-[7px] font-mono text-rose-400 font-extrabold uppercase tracking-widest">Epigastric Distention</span>
                  <span className="text-[8.5px] font-body text-white font-semibold">Gaseous Accumulation</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Modality: CXR (PA view) • Patient: {appointments.find(a => a.id === (pacsActiveAppointmentId || activeAppointmentId))?.name || 'Unknown'} • ID: PACS-88390-CXR</span>
        </div>

        {/* PACS Controls */}
        <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wide">Scanner Adjustment</span>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 flex justify-between font-mono">
                <span>Contrast</span> <span>{pacsContrast}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="180"
                value={pacsContrast}
                onChange={e => setPacsContrast(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl mt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <BrainCircuit className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>AI Diagnostics</span>
              </div>
              <button
                onClick={() => setPacsAiHighlight(!pacsAiHighlight)}
                className="px-2 py-1 bg-slate-900 rounded border border-slate-800 hover:bg-slate-800 text-xs font-mono font-semibold"
              >
                {pacsAiHighlight ? "Disable" : "Analyze"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <button
              onClick={finalizePACSScan}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1 transition-colors shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Run Vertex AI Report
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
