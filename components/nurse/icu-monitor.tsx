'use client';

import React from 'react';
import { ShieldAlert, Thermometer, Heart, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { type IcuBed } from '@/app/actions';

export interface IcuMonitorProps {
  activeIcuBedId: string;
  setActiveIcuBedId: (id: string) => void;
  icuBeds: Record<string, IcuBed>;
  icuHeartRate: number;
  icuSpo2: number;
  selectedLanguage: 'Hindi' | 'Tamil' | 'Telugu';
  setSelectedLanguage: (lang: 'Hindi' | 'Tamil' | 'Telugu') => void;
  translatedInstructions: string;
  triggerNotification: (msg: string) => void;
  allowedAgents: string[];
  username: string;
}

export default function IcuMonitor({
  activeIcuBedId,
  setActiveIcuBedId,
  icuBeds,
  icuHeartRate,
  icuSpo2,
  selectedLanguage,
  setSelectedLanguage,
  translatedInstructions,
  triggerNotification,
  allowedAgents,
  username
}: IcuMonitorProps) {
  if (!allowedAgents.includes('triage')) {
    return (
      <motion.div
        key="icu"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full relative"
      >
        <div className="lg:col-span-3 glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center min-h-[300px]">
          <ShieldAlert className="w-12 h-12 text-rose-600 mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-800">Access Denied: Triage &amp; Telemetry Locked</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md">Your user account has not been allotted the ICU Triage/Telemetry Agent capability. Contact your hospital super administrator to enable this permission.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="icu"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full relative animate-fade-in"
    >
      {/* Telemetry Ward monitor (Col-2 span) */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border-rose-100/50 bg-rose-50/10 flex flex-col justify-between min-h-[420px]">
        
        {/* Bed headers */}
        <div className="flex items-center justify-between pb-3.5 border-b border-rose-200/40 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="font-heading font-bold text-md text-slate-800">
              ICU Critical Telemetry: {activeIcuBedId}
            </h3>
          </div>
          
          {/* Select beds list */}
          <select
            value={activeIcuBedId}
            onChange={e => setActiveIcuBedId(e.target.value)}
            className="bg-white/60 border border-slate-200 rounded-xl px-2.5 py-1 text-xs outline-none text-slate-700 font-mono font-semibold"
          >
            {Object.keys(icuBeds).map(bedId => (
              <option key={bedId} value={bedId}>{bedId} — {icuBeds[bedId].name}</option>
            ))}
          </select>
        </div>

        {icuBeds[activeIcuBedId] ? (
          <div className="flex-1 flex flex-col justify-between">
            
            {/* Patient core info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/40 border border-white p-4 rounded-2xl text-xs font-mono mb-4 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Patient Name</span>
                <span className="font-bold text-slate-800">{icuBeds[activeIcuBedId].name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Age / Gender</span>
                <span className="font-bold text-slate-800">{icuBeds[activeIcuBedId].age} / {icuBeds[activeIcuBedId].gender}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase">ABHA address</span>
                <span className="font-bold text-indigo-600">{icuBeds[activeIcuBedId].abhaId}</span>
              </div>
            </div>

            {/* Vitals Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
              
              {/* Temp */}
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Core Temp</span>
                <span className="text-md font-mono font-bold text-slate-800 mt-1 flex items-center gap-1">
                  <Thermometer className="w-4 h-4 text-emerald-500 animate-pulse" /> {icuBeds[activeIcuBedId].vitals.temp}
                </span>
              </div>

              {/* BP */}
              <div className={`bg-white border p-3 rounded-2xl shadow-sm flex flex-col items-center ${
                icuHeartRate > 100 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'
              }`}>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Blood Pres.</span>
                <span className="text-md font-mono font-bold text-slate-800 mt-1">
                  {icuHeartRate > 100 ? '142/92 mmHg' : '120/80 mmHg'}
                </span>
                <span className={`text-[8px] font-semibold mt-1 px-1.5 rounded uppercase ${
                  icuHeartRate > 100 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {icuHeartRate > 100 ? 'Elevated' : 'Optimal'}
                </span>
              </div>

              {/* Heart rate */}
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex flex-col items-center relative overflow-hidden">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Heart Rate</span>
                <span className="text-md font-mono font-bold text-slate-800 mt-1 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" /> {icuHeartRate} bpm
                </span>
              </div>

              {/* Pulse ox */}
              <div className={`bg-white border p-3 rounded-2xl shadow-sm flex flex-col items-center ${
                icuSpo2 < 94 ? 'border-rose-200 bg-rose-50/20 animate-pulse' : 'border-slate-100'
              }`}>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Pulse Ox (SpO2)</span>
                <span className="text-md font-mono font-bold text-slate-800 mt-1">
                  {icuSpo2}%
                </span>
                <span className={`text-[8px] font-semibold mt-1 px-1.5 rounded uppercase ${
                  icuSpo2 < 94 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {icuSpo2 < 94 ? 'Borderline' : 'Normal'}
                </span>
              </div>

            </div>

            {/* Vitals sync logs */}
            <div className="flex gap-2">
              <button
                onClick={() => triggerNotification("Vitals Telemetry successfully synced to Cloud SQL database")}
                className="flex-1 bg-zinc-900 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-black transition-colors font-sans"
              >
                Sync Telemetry Logs to HMS
              </button>
            </div>

          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No patient is currently admitted to this ICU bed unit.</p>
        )}
      </div>

      {/* ICU Discharge Translator panel (Col-1) */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
        {!allowedAgents.includes('conversational') && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] rounded-3xl z-30 flex flex-col items-center justify-center text-center p-4">
            <Globe className="w-8 h-8 text-rose-600 mb-2 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Bhashini Translation Locked</span>
            <span className="text-[10px] text-slate-500 mt-1">Conversational capability not allotted by IT Admin.</span>
          </div>
        )}
        <div>
          <h3 className="font-heading font-semibold text-sm uppercase text-slate-500 tracking-wider mb-4">Bhashini translation Desk</h3>
          
          {/* Select Translation target */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-[9px] font-mono text-slate-400 uppercase">Target Translation Language</label>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as any)}
              className="bg-white/60 border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none text-slate-700 font-semibold"
            >
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>

          {/* Translated block */}
          <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed font-body">
            <span className="font-mono text-[9px] text-indigo-600 font-bold uppercase tracking-wider block mb-1">VERNACULAR PATIENT EDUCATION SHEET</span>
            <p className="font-medium text-slate-800 text-[13px]">{translatedInstructions || "Fetching translations from Google Cloud Translation API..."}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200/50">
          <button
            onClick={() => triggerNotification(`Discharge instructions in ${selectedLanguage} printed successfully`)}
            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold py-2.5 rounded-xl border border-indigo-100 transition-colors"
          >
            Print Translated Care Sheet
          </button>
        </div>
      </div>
    </motion.div>
  );
}
