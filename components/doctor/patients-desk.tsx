'use client';

import React from 'react';
import { Activity, CheckCircle2, Check, Heart, Mic, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { type Appointment } from '@/app/actions';

export interface PatientsDeskProps {
  appointments: Appointment[];
  activeAppointmentId: string | null;
  setSelectedAppointmentId: (id: string | null) => void;
  currentAppointment?: Appointment;
  setActiveTab: (tab: any) => void;
  setPacsActiveAppointmentId: (id: string | null) => void;
}

export default function PatientsDesk({
  appointments,
  activeAppointmentId,
  setSelectedAppointmentId,
  currentAppointment,
  setActiveTab,
  setPacsActiveAppointmentId
}: PatientsDeskProps) {
  return (
    <motion.div
      key="patients"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full relative"
    >
      {/* OPD Queue & Treated Queue (Col 1) */}
      <div className="flex flex-col gap-4 max-h-[750px]">
        
        {/* Active OPD Queue */}
        <div className="glass-panel p-5 rounded-3xl flex-1 flex flex-col min-h-[250px]">
          <h3 className="font-heading font-semibold text-xs uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
            Active OPD Queue
          </h3>
          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {appointments.filter(a => !a.soapRecord).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No active patients in queue.</p>
            ) : (
              appointments.filter(a => !a.soapRecord).map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAppointmentId(a.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    activeAppointmentId === a.id ? 'bg-white border-zinc-900 shadow-sm scale-[1.01]' : 'bg-white/40 border-slate-100/60 hover:bg-white/60'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-800 text-xs">{a.id} — {a.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{a.complaint.substring(0, 35)}...</span>
                  </div>
                  <span className="text-[8px] font-mono bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded uppercase font-bold">
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seen / Treated Patients */}
        <div className="glass-panel p-5 rounded-3xl flex-1 flex flex-col min-h-[250px]">
          <h3 className="font-heading font-semibold text-xs uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Treated / Seen Patients
          </h3>
          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {appointments.filter(a => a.soapRecord).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No patients treated today.</p>
            ) : (
              appointments.filter(a => a.soapRecord).map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAppointmentId(a.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    activeAppointmentId === a.id ? 'bg-white border-zinc-900 shadow-sm scale-[1.01]' : 'bg-white/40 border-slate-100/60 hover:bg-white/60'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-800 text-xs">{a.id} — {a.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{a.complaint.substring(0, 35)}...</span>
                  </div>
                  <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded uppercase font-bold ${
                    a.status === 'ICU_Transferred' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {a.status === 'ICU_Transferred' ? 'Admitted ICU' : 'Treated'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Patient Detail Panel (Col 2 & 3) */}
      <div className="lg:col-span-2 flex flex-col gap-6 max-h-[750px] overflow-y-auto pr-1">
        {currentAppointment ? (
          <>
            {/* Patient Context & ABDM Locker */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex justify-between items-start border-b border-slate-200/50 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider block mb-1">ABDM Health Locker Profile</span>
                  <h3 className="font-heading font-bold text-lg text-slate-800">{currentAppointment.name}</h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-lg">
                  ABHA address: {currentAppointment.abhaId}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 font-mono mb-4">
                <div className="bg-white/50 border border-white/60 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Age / Gender</span>
                  <span className="font-bold text-slate-800">{currentAppointment.age} Yrs / {currentAppointment.gender}</span>
                </div>
                <div className="bg-white/50 border border-white/60 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Vitals Pulse</span>
                  <span className="font-bold text-slate-800">{currentAppointment.vitals.hr}</span>
                </div>
                <div className="bg-white/50 border border-white/60 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Blood Pressure</span>
                  <span className={`font-bold ${currentAppointment.vitals.bpStatus === 'warning' ? 'text-amber-600' : 'text-slate-800'}`}>
                    {currentAppointment.vitals.bp}
                  </span>
                </div>
                <div className="bg-white/50 border border-white/60 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Oxygen (SpO2)</span>
                  <span className="font-bold text-slate-800">{currentAppointment.vitals.spo2}</span>
                </div>
              </div>

              <div className="bg-white/50 border border-white/60 p-4 rounded-2xl text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-1.5">Chief Complaints / Symptom Intake</span>
                <p className="text-slate-700 leading-relaxed font-medium">{currentAppointment.complaint}</p>
              </div>
            </div>

            {/* Care Journey & Timeline */}
            <div className="glass-panel p-6 rounded-3xl">
              <h4 className="font-heading font-semibold text-xs uppercase text-slate-400 tracking-wider mb-5">Admissions &amp; Care Journey Track</h4>
              
              <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-6">
                {/* Timeline Events */}
                {currentAppointment.admissionHistory && currentAppointment.admissionHistory.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 text-xs font-heading">{event.stage}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{event.timestamp}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Operator: <span className="font-semibold text-slate-600">{event.operatorName}</span> ({event.operatorRole}) at <span className="font-semibold text-slate-600">{event.stationName}</span>
                      </span>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-white/30 border border-white/40 p-2.5 rounded-xl mt-1">
                        {event.details}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Fallbacks if history empty */}
                {(!currentAppointment.admissionHistory || currentAppointment.admissionHistory.length === 0) && (
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-white flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 text-xs font-heading">OPD Admission</span>
                        <span className="text-[9px] text-slate-400 font-mono">Synced live</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-white/30 border border-white/40 p-2.5 rounded-xl mt-1">
                        Patient checked in via front desk. Initial intake completed. Routed to consulting queue.
                      </p>
                    </div>
                  </div>
                )}

                {/* Dynamic Future Steps based on current status */}
                {currentAppointment.status === 'ICU_Transferred' && (
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white animate-pulse flex items-center justify-center shadow-sm">
                      <Heart className="w-2 h-2 text-white" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-600 text-xs font-heading">ICU Critical Triage</span>
                        <span className="text-[9px] text-rose-500 font-mono font-bold animate-pulse">ACTIVE MONITORING</span>
                      </div>
                      <p className="text-[11px] text-rose-700 bg-rose-50/40 border border-rose-100/50 p-2.5 rounded-xl mt-1 font-medium">
                        Patient transferred to critical care ward. Vital telemetry monitor actively streaming. Bhashini vernacular patient sheet enabled.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic Reports & Clinical Outputs */}
            <div className="glass-panel p-6 rounded-3xl">
              <h4 className="font-heading font-semibold text-xs uppercase text-slate-400 tracking-wider mb-4">Clinical Reports &amp; AI Output Artifacts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SOAP Scribe Report */}
                <div className="bg-white/40 border border-white/60 p-4.5 rounded-2xl flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-heading font-bold text-xs text-slate-800">Ambient SOAP Chart</span>
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold border ${
                        currentAppointment.soapRecord ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {currentAppointment.soapRecord ? 'GENERATED' : 'NOT FOUND'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {currentAppointment.soapRecord 
                        ? `Primary Diagnosis: Gastritis. Treated with Pantocid.` 
                        : `Generate a clinical chart of patient complaints via ambient voice transcription.`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAppointmentId(currentAppointment.id);
                      setActiveTab('doctor');
                    }}
                    className="w-full mt-3 bg-zinc-900 text-white hover:bg-black text-[10px] py-2 rounded-xl transition-colors font-semibold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Mic className="w-3 h-3" /> {currentAppointment.soapRecord ? 'View Chart' : 'Launch Ambient Scribe'}
                  </button>
                </div>

                {/* Chest X-Ray Imaging Report */}
                <div className="bg-white/40 border border-white/60 p-4.5 rounded-2xl flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-heading font-bold text-xs text-slate-800">X-Ray Radiology Report</span>
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold border ${
                        currentAppointment.diagnosticsReport ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {currentAppointment.diagnosticsReport ? 'COMPLETED' : 'AWAITING SCAN'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {currentAppointment.diagnosticsReport 
                        ? `AI Findings: Gaseous accumulation, gastric distention.` 
                        : `Verify anatomy structures and run diagnostic scans through the PACS server.`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPacsActiveAppointmentId(currentAppointment.id);
                      setActiveTab('pacs');
                    }}
                    className="w-full mt-3 bg-zinc-900 text-white hover:bg-black text-[10px] py-2 rounded-xl transition-colors font-semibold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <ImageIcon className="w-3 h-3" /> {currentAppointment.diagnosticsReport ? 'View Scan / AI Findings' : 'Launch PACS Scan'}
                  </button>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center min-h-[300px]">
            <Activity className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800">Select a patient from the queue</h3>
            <p className="text-xs text-slate-400 mt-1">Select any OPD patient in the sidebar lists to load clinical profiles, admission history, and diagnostic logs.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
