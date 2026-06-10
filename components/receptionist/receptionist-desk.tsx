'use client';

import React from 'react';
import { PhoneCall, Check, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ReceptionistDeskProps {
  telephonyStatus: 'idle' | 'inbound' | 'connected';
  setTelephonyStatus: (status: 'idle' | 'inbound' | 'connected') => void;
  triggerSimulatedInboundCall: () => void;
  connectSimulatedCall: () => void;
  abhaQuery: string;
  setAbhaQuery: (q: string) => void;
  handleAbhaSearch: () => void;
  matchedLocker: any;
  handleBookAppointment: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  allowedAgents: string[];
  role: string;
}

export default function ReceptionistDesk({
  telephonyStatus,
  setTelephonyStatus,
  triggerSimulatedInboundCall,
  connectSimulatedCall,
  abhaQuery,
  setAbhaQuery,
  handleAbhaSearch,
  matchedLocker,
  handleBookAppointment,
  isPending,
  allowedAgents,
  role
}: ReceptionistDeskProps) {
  if (!allowedAgents.includes('conversational')) {
    return (
      <div className="lg:col-span-3 glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center min-h-[300px]">
        <ShieldAlert className="w-12 h-12 text-rose-600 mb-3 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied: Conversational Telephony Locked</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md">Your user account has not been allotted the Conversational Voicebot &amp; OPD Telephony capability. Contact your hospital super administrator to enable this permission.</p>
      </div>
    );
  }

  return (
    <>
      {/* Telephony Simulator & ABHA Verifier (Col-1) */}
      <div className="flex flex-col gap-6">
        
        {/* Phone Panel */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm uppercase text-slate-500 tracking-wider">GCP CCAI Telephony Simulator</h3>
            <span className={`w-2.5 h-2.5 rounded-full ${telephonyStatus === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
          </div>

          {telephonyStatus === 'idle' && (
            <div className="text-center py-6">
              <PhoneCall className="w-8 h-8 text-indigo-500 mx-auto mb-3 animate-bounce" />
              <p className="text-xs text-slate-600 font-medium">Awaiting voice dial-ins from Dialogflow CX gateway</p>
              <button
                onClick={triggerSimulatedInboundCall}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                Simulate Patient Call
              </button>
            </div>
          )}

          {telephonyStatus === 'inbound' && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-mono text-amber-600 font-bold uppercase tracking-wider block mb-1">INCOMING DIALOGFLOW LINE</span>
              <p className="text-sm font-semibold text-slate-700 mb-3">Incoming: +91 98839 XXXXX (Aarav Sharma)</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={connectSimulatedCall}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Accept & Sync ABHA
                </button>
                <button
                  onClick={() => setTelephonyStatus('idle')}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs hover:bg-slate-200 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {telephonyStatus === 'connected' && (
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider block mb-1">CONNECTED & VERIFIED</span>
              <p className="text-xs text-slate-600">Speech-to-Text synced. ABDM Locker registry unlocked.</p>
              <button
                onClick={() => setTelephonyStatus('idle')}
                className="mt-3 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors"
              >
                Hang Up Call
              </button>
            </div>
          )}
        </div>

        {/* ABHA Gateways */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="font-heading font-semibold text-sm uppercase text-slate-500 tracking-wider mb-4">ABDM Registry Registry</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 91-8839-2201-9238"
              value={abhaQuery}
              onChange={e => setAbhaQuery(e.target.value)}
              className="flex-1 bg-white/50 border border-white/60 rounded-xl px-3.5 py-2 outline-none text-xs"
            />
            <button
              onClick={handleAbhaSearch}
              className="px-4 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
            >
              Verify
            </button>
          </div>

          <AnimatePresence>
            {matchedLocker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white/40 border border-white/60 p-4 rounded-2xl text-xs overflow-hidden"
              >
                <span className="font-mono text-[10px] text-indigo-600 font-semibold block mb-2">ABDM HEALTH LOCKER RECORD PULL</span>
                <div className="space-y-1.5 text-slate-700">
                  <div><span className="font-semibold text-slate-500">Name:</span> {matchedLocker.name}</div>
                  <div><span className="font-semibold text-slate-500">Age/Gender:</span> {matchedLocker.age} / {matchedLocker.gender}</div>
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <span className="font-bold text-[9px] uppercase text-slate-400">Clinical History:</span>
                    {matchedLocker.history.map((h: any, idx: number) => (
                      <div key={idx} className="mt-1.5 p-2 bg-white/60 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-700">{h.diagnosis} ({h.date})</div>
                        <div className="text-[10px] text-slate-400">{h.facility}</div>
                        <div className="text-slate-600 mt-0.5">{h.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* OPD Ticket Form (Col-2) */}
      <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
        <div>
          <h3 className="font-heading font-semibold text-md text-slate-800 border-b border-white/60 pb-3 mb-6">OPD Appointment Intake Ticket</h3>
          <form onSubmit={handleBookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Patient Name</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={matchedLocker?.name || ''}
                className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none text-xs"
                placeholder="Aarav Sharma"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">ABHA Address ID</label>
              <input
                type="text"
                name="abhaId"
                required
                defaultValue={matchedLocker?.abhaId || ''}
                className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none text-xs"
                placeholder="91-8839-2201-9238"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Age</label>
              <input
                type="number"
                name="age"
                required
                defaultValue={matchedLocker?.age || ''}
                className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none text-xs"
                placeholder="42"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Gender</label>
              <select
                name="gender"
                required
                defaultValue={matchedLocker?.gender || 'Male'}
                className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none text-xs text-slate-700"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Chief Complaints</label>
              <textarea
                name="complaint"
                required
                rows={3}
                className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none text-xs"
                placeholder="Describe medical complaints (Hinglish supported)..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Assigned Clinical Desk</label>
              <select
                name="assignedDoctor"
                className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none text-xs text-slate-700"
              >
                <option value="Dr. Chang">Dr. Chang (Radiology / Epigastric Diagnostic)</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg transition-colors"
              >
                <Check className="w-4 h-4" /> Book Appointment & Route to Doctor Desk
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 p-4 border border-indigo-100 bg-indigo-50/20 rounded-2xl flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">ABDM Registry Sync status: Verified and active</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">GCP FHIR BRIDGE OK</span>
        </div>
      </div>
    </>
  );
}
