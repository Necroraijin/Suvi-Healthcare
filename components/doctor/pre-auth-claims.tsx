'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { type Appointment } from '@/app/actions';

export interface PreAuthClaimsProps {
  appointments: Appointment[];
  billingQueue: string[];
  triggerPreAuthSync: (id: string) => void;
  allowedAgents: string[];
}

export default function PreAuthClaims({
  appointments,
  billingQueue,
  triggerPreAuthSync,
  allowedAgents
}: PreAuthClaimsProps) {
  if (!allowedAgents.includes('documentation')) {
    return (
      <motion.div
        key="billing"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl min-h-[350px]"
      >
        <ShieldAlert className="w-12 h-12 text-rose-600 mb-3 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied: Claims &amp; Documentation Locked</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md">Your user account has not been allotted the Claims &amp; Documentation Agent capability. Contact your hospital super administrator to enable this permission.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="billing"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-1 glass-panel max-w-4xl mx-auto w-full p-6 rounded-3xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-3 mb-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-slate-800">Ayushman Bharat Claim Submissions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Mock CGHS rate audits &amp; pre-authorizations mapped via Vertex AI</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold font-mono">HBP 2.0 VERIFIED</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-6">
        
        {/* Active claims mapping queue */}
        <div className="md:col-span-2 space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {appointments.filter(a => a.soapRecord).map(a => (
            <div
              key={a.id}
              className="bg-white/50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm text-xs"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800">{a.id} — {a.name}</span>
                <div><span className="font-semibold text-slate-400">ICD-10 Code:</span> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">K21.9</span></div>
                <div><span className="font-semibold text-slate-400">PMJAY Package:</span> <span className="font-mono font-bold text-slate-700">{a.pmjayPackage || 'Pending mapping'}</span></div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {a.isPreAuthApproved ? (
                  <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[9px] tracking-wide">
                    PRE-AUTH APPROVED
                  </span>
                ) : (
                  <button
                    onClick={() => triggerPreAuthSync(a.id)}
                    className="bg-zinc-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-semibold hover:bg-black transition-colors font-sans"
                  >
                    Submit Pre-Auth
                  </button>
                )}
                <span className="font-bold text-slate-800 text-[13px] font-mono">₹3,500</span>
              </div>
            </div>
          ))}

          {appointments.filter(a => a.soapRecord).length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-8">No finalized medical charts found. Complete consultation in Doctor Scribe Workspace first.</p>
          )}
        </div>

        {/* Cloud PubSub Outbox queue simulator */}
        <div className="bg-slate-900 text-slate-300 font-mono text-[9px] p-4 rounded-2xl flex flex-col justify-between min-h-[200px]">
          <div>
            <h4 className="font-heading font-semibold text-xs text-white uppercase tracking-wider mb-3">Cloud Pub/Sub Claims Outbox</h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {billingQueue.length === 0 ? (
                <span className="text-slate-500 italic">Pre-auth outbox queue is idle.</span>
              ) : (
                billingQueue.map(id => (
                  <div key={id} className="border-l border-amber-500 pl-2 text-slate-400 animate-pulse">
                    <div>[Pub/Sub Publish]: Claim payload for {id} created</div>
                    <div className="text-[8px] text-amber-500">Transmitting to NHA gateway...</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-3 flex justify-between items-center text-[8px] text-slate-500">
            <span>Broker state: Active</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
