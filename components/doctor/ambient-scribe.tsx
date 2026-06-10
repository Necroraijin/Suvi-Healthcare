'use client';

import React from 'react';
import { ShieldAlert, Mic, Square, RefreshCw, AlertTriangle, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type Appointment, type AgenticTrace } from '@/app/actions';

export interface AmbientScribeProps {
  appointments: Appointment[];
  activeAppointmentId: string | null;
  setSelectedAppointmentId: (id: string | null) => void;
  currentAppointment?: Appointment;
  swarmState: 'idle' | 'listening' | 'processing' | 'complete';
  setSwarmState: (state: 'idle' | 'listening' | 'processing' | 'complete') => void;
  recordingSeconds: number;
  setRecordingSeconds: React.Dispatch<React.SetStateAction<number>>;
  liveTranscript: string;
  setLiveTranscript: (text: string) => void;
  agentTraces: AgenticTrace[];
  prescribedDrug: string;
  setPrescribedDrug: (drug: string) => void;
  drugInteractionWarning: string | null;
  handleTriggerSwarmAnalysis: () => void;
  triggerPreAuthSync: (id: string) => void;
  allowedAgents: string[];
  setActiveTab: (tab: any) => void;
  setPacsActiveAppointmentId: (id: string | null) => void;
  handleEscalateToICU: (id: string, bedId: string) => void;
}

export default function AmbientScribe({
  appointments,
  activeAppointmentId,
  setSelectedAppointmentId,
  currentAppointment,
  swarmState,
  setSwarmState,
  recordingSeconds,
  setRecordingSeconds,
  liveTranscript,
  setLiveTranscript,
  agentTraces,
  prescribedDrug,
  setPrescribedDrug,
  drugInteractionWarning,
  handleTriggerSwarmAnalysis,
  triggerPreAuthSync,
  allowedAgents,
  setActiveTab,
  setPacsActiveAppointmentId,
  handleEscalateToICU
}: AmbientScribeProps) {
  return (
    <motion.div
      key="doctor"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full"
    >
      {/* Doctor Patient Queue (Col-1) */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-5 rounded-3xl flex-1 flex flex-col justify-between max-h-[520px]">
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase text-slate-500 tracking-wider mb-4">Patient OPD Queue</h3>
            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {appointments.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAppointmentId(a.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    activeAppointmentId === a.id ? 'bg-white border-indigo-300 shadow-md scale-[1.01]' : 'bg-white/60 border-slate-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-xs">{a.id} — {a.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{a.complaint.substring(0, 45)}...</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    a.status === 'CheckedIn' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                    a.status === 'DiagnosticsComplete' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {currentAppointment && (
            <div className="pt-4 border-t border-slate-200 flex justify-between gap-2">
              {allowedAgents.includes('imaging') ? (
                <button
                  onClick={() => {
                    setPacsActiveAppointmentId(currentAppointment.id);
                    setActiveTab('pacs');
                  }}
                  className="flex-1 bg-zinc-900 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                >
                  Launch X-Ray
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                  title="PACS Scan Capability Locked by Admin"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> X-Ray Locked
                </button>
              )}
              {allowedAgents.includes('triage') ? (
                <button
                  onClick={() => handleEscalateToICU(currentAppointment.id, 'ICU-01')}
                  className="px-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors"
                  title="Escalate directly to ICU bed"
                >
                  Escalate ICU
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
                  title="ICU Bed Escalation Locked by Admin"
                >
                  ICU Locked
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scribe Ambient Capture Panel (Col-2) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Speech Capture card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[300px] relative overflow-hidden">
          {!allowedAgents.includes('scribe') && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] rounded-3xl z-30 flex flex-col items-center justify-center text-center p-4">
              <ShieldAlert className="w-8 h-8 text-rose-600 mb-2 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Scribe AI Capability Prohibited</span>
              <span className="text-[10px] text-slate-500 mt-1">Ambient SOAP Scribing has not been allotted by the Super Admin.</span>
            </div>
          )}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/60 mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${swarmState === 'listening' ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
              <h3 className="font-heading font-semibold text-sm text-slate-800 flex items-center gap-1">
                Ambient SOAP Scribe <span className="text-xs text-slate-400 font-mono font-medium ml-1">Vertex Speech STT</span>
              </h3>
            </div>
            {swarmState === 'listening' && (
              <span className="font-mono text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100 font-semibold animate-pulse">
                {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>

          <div className="flex-1 bg-white/50 border border-white/60 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed max-h-[160px] whitespace-pre-line shadow-inner">
            {liveTranscript || <span className="text-slate-400 italic">Press &quot;Start Scribe&quot; to capture Indian Hinglish clinical dialogue. Standard transcriptions route dynamically.</span>}
          </div>

          {/* Sound Wave Graph */}
          {swarmState === 'listening' && (
            <div className="flex justify-center gap-1 items-end h-6 py-2">
              {[1.2, 2.8, 1.5, 3.5, 2.2, 4.2, 1.8, 3, 1.4, 2.8, 1.6, 3.2].map((val, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: [`${val * 3}px`, `${val * 6}px`, `${val * 3}px`] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: idx * 0.04 }}
                  className="w-1 bg-indigo-500 rounded-full"
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {swarmState === 'idle' && (
              <button
                onClick={() => { setLiveTranscript(''); setRecordingSeconds(0); setSwarmState('listening'); }}
                className="flex-1 bg-indigo-600 text-white text-xs font-semibold py-3 rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Mic className="w-4 h-4" /> Start Ambient Scribe (Hinglish Input)
              </button>
            )}

            {swarmState === 'listening' && (
              <button
                onClick={handleTriggerSwarmAnalysis}
                className="flex-1 bg-zinc-900 text-white text-xs font-semibold py-3 rounded-2xl shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-white" /> Finalize Encounter & Run Swarm Bus
              </button>
            )}

            {swarmState === 'processing' && (
              <div className="flex-1 bg-slate-50 border border-slate-100 py-3 rounded-2xl text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>LangChain Agentic Swarm resolving dependencies...</span>
              </div>
            )}

            {swarmState === 'complete' && (
              <button
                onClick={() => { setRecordingSeconds(0); setSwarmState('idle'); }}
                className="flex-1 bg-emerald-600 text-white text-xs font-semibold py-3 rounded-2xl shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Start New Consultation
              </button>
            )}
          </div>
        </div>

        {/* Scribe Event log outputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LangChain Traces */}
          <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between min-h-[220px]">
            <h4 className="font-heading font-semibold text-xs uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
              <span>Google ADK / LangChain Traces</span>
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-bold">A2A PROTOCOL</span>
            </h4>
            
            <div className="flex-1 bg-slate-900 text-slate-300 font-mono text-[9px] p-3.5 rounded-2xl space-y-2 overflow-y-auto max-h-[160px]">
              {agentTraces.length === 0 ? (
                <span className="text-slate-500 italic">No swarm bus trace logs. Run scribe finalization to inspect ADK protocol exchanges.</span>
              ) : (
                agentTraces.map((t, idx) => (
                  <div key={idx} className={`border-l-2 pl-2 ${
                    t.system === 'Google ADK A2A' ? 'border-amber-500' :
                    t.system === 'Agentic RAG' ? 'border-emerald-500' : 'border-indigo-500'
                  }`}>
                    <span className="text-slate-400 font-bold">[{t.system}]:</span> {t.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SOAP Summary / CDSCO Checks */}
          <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            {!allowedAgents.includes('documentation') && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] rounded-3xl z-30 flex flex-col items-center justify-center text-center p-4">
                <ShieldAlert className="w-6 h-6 text-rose-600 mb-1 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-800">CDSCO Audits Locked</span>
                <span className="text-[9px] text-slate-500 mt-0.5">Requires Documentation capability.</span>
              </div>
            )}
            <div>
              <h4 className="font-heading font-semibold text-xs uppercase text-slate-400 tracking-wider mb-3">CDSCO Drug &amp; DDI Audits</h4>
              
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Input Drug Generic/Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Aspirin (Try ecoprin for alert)"
                  value={prescribedDrug}
                  onChange={e => setPrescribedDrug(e.target.value)}
                  className="bg-white/50 border border-white/60 rounded-xl px-3 py-1.5 outline-none text-xs"
                />
              </div>

              <AnimatePresence>
                {drugInteractionWarning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] font-medium flex items-start gap-1.5 shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500 animate-bounce" />
                    <span>{drugInteractionWarning}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {currentAppointment?.soapRecord && (
              <div className="pt-3 border-t border-slate-200 mt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">SOAP chart successfully written</span>
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              </div>
            )}
          </div>
        </div>

        {/* Patient Chart view summary */}
        {currentAppointment?.soapRecord && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-3xl text-xs text-slate-700 leading-relaxed"
          >
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 mb-4">
              <h4 className="font-heading font-bold text-sm text-slate-800">Generated clinical chart: {currentAppointment.name}</h4>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold text-[9px]">FHIR R4 FORMATTED</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px]">
              <div className="bg-white/40 border border-white p-3 rounded-xl">
                <span className="font-bold text-slate-400 block mb-1">SUBJECTIVE</span>
                <p>{currentAppointment.soapRecord.subjective}</p>
              </div>
              <div className="bg-white/40 border border-white p-3 rounded-xl">
                <span className="font-bold text-slate-400 block mb-1">OBJECTIVE</span>
                <p>{currentAppointment.soapRecord.objective}</p>
              </div>
              <div className="bg-white/40 border border-white p-3 rounded-xl font-bold text-indigo-700">
                <span className="font-bold text-slate-400 block mb-1">PLAN / TREATMENT</span>
                <p>{currentAppointment.soapRecord.plan}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              {allowedAgents.includes('documentation') ? (
                <button
                  onClick={() => triggerPreAuthSync(currentAppointment.id)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-black text-white text-[10px] font-bold rounded-xl shadow-md transition-colors"
                >
                  Submit pre-auth claims
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-slate-100 border text-slate-400 text-[10px] font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Claims Submit Locked
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
