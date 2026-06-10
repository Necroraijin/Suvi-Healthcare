'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Search, Inbox, Bell, Paperclip, ArrowUp, Mic,
  PenSquare, Sidebar, Clock, Hexagon, ChevronDown, CheckCircle2,
  LogOut, Activity, Image as ImageIcon, FileText, Bot, HeartPulse, User,
  Volume2, RefreshCw, FileSpreadsheet, Sparkles, Square, Play, X, ShieldAlert,
  Sliders, Eye, Thermometer, BrainCircuit, Check, CheckSquare, ShieldCheck,
  PhoneCall, AlertTriangle, Globe, Wifi, Heart, Trash2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  logoutAction, 
  getAppointmentsAction, 
  createAppointmentAction, 
  runImagingReportAction, 
  transferToIcuAction, 
  getIcuBedsAction, 
  syncVitalsAction, 
  getComputeConfigAction, 
  runAgenticSwarmEngineAction, 
  getTranslationAction,
  Appointment,
  IcuBed,
  AgenticTrace
} from '../app/actions';
import { ABDM_LOCKER_RECORDS } from '@/lib/mock-data';
import ReceptionistDesk from './receptionist/receptionist-desk';
import PatientsDesk from './doctor/patients-desk';
import AmbientScribe from './doctor/ambient-scribe';
import PacsScanner from './doctor/pacs-scanner';
import IcuMonitor from './nurse/icu-monitor';
import PreAuthClaims from './doctor/pre-auth-claims';

interface DashboardClientProps {
  username: string;
  role: string;
  posting: string;
  agents: string[];
}

export default function DashboardClient({ username, role, posting, agents }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'receptionist' | 'patients' | 'doctor' | 'pacs' | 'icu' | 'billing'>(() => {
    if (role === 'receptionist') return 'receptionist';
    return 'patients';
  });

  // Compute config
  const [computeConfig, setComputeConfig] = useState({
    computeTarget: 'GCP',
    localEndpoint: 'http://localhost:11434',
    gcpProjectId: 'suvi-clinical-production-node'
  });

  // State caches
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [icuBeds, setIcuBeds] = useState<Record<string, IcuBed>>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Receptionist States
  const [abhaQuery, setAbhaQuery] = useState('');
  const [matchedLocker, setMatchedLocker] = useState<any>(null);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [telephonyStatus, setTelephonyStatus] = useState<'idle' | 'inbound' | 'connected'>('idle');

  // Doctor / Scribe States
  const [swarmState, setSwarmState] = useState<'idle' | 'listening' | 'processing' | 'complete'>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [agentTraces, setAgentTraces] = useState<AgenticTrace[]>([]);
  const [activeTraceIndex, setActiveTraceIndex] = useState(-1);
  const [prescribedDrug, setPrescribedDrug] = useState('');
  // drugInteractionWarning is calculated dynamically during render

  // PACS X-Ray States
  const [pacsContrast, setPacsContrast] = useState(100);
  const [pacsAiHighlight, setPacsAiHighlight] = useState(false);
  const [pacsActiveAppointmentId, setPacsActiveAppointmentId] = useState<string | null>(null);

  // ICU States
  const [activeIcuBedId, setActiveIcuBedId] = useState<string>('ICU-01');
  const [icuHeartRate, setIcuHeartRate] = useState(72);
  const [icuSpo2, setIcuSpo2] = useState(98);
  const [translatedInstructions, setTranslatedInstructions] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'Hindi' | 'Tamil' | 'Telugu'>('Hindi');

  // Billing Outbox
  const [billingQueue, setBillingQueue] = useState<string[]>([]);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-redirect or set tab based on default role is handled via lazy state initializer above

  // Load backend states
  const refreshData = React.useCallback(() => {
    getAppointmentsAction().then(res => {
      setAppointments(res);
    });
    getIcuBedsAction().then(res => {
      setIcuBeds(res);
    });
    getComputeConfigAction().then(res => {
      setComputeConfig(res);
    });
  }, []);

  // selectedAppointmentId default is calculated during render to prevent synchronous effects

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Telemetry loop for ICU beds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'icu' && icuBeds[activeIcuBedId]) {
        // Vary vitals slightly
        const hrDelta = Math.floor(Math.random() * 5) - 2;
        const spo2Delta = Math.random() > 0.85 ? -1 : 0;
        
        setIcuHeartRate(prev => Math.min(Math.max(prev + hrDelta, 60), 120));
        setIcuSpo2(prev => Math.min(Math.max(prev + spo2Delta, 91), 100));
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [activeTab, activeIcuBedId, icuBeds]);

  // Sync vitals to action engine
  useEffect(() => {
    if (icuBeds[activeIcuBedId]) {
      syncVitalsAction(
        activeIcuBedId,
        '98.6 °F',
        icuHeartRate > 100 ? '142/92 mmHg' : '120/80 mmHg',
        `${icuHeartRate} bpm`,
        `${icuSpo2}%`,
        username
      );
    }
  }, [icuHeartRate, icuSpo2, activeIcuBedId, icuBeds, username]);

  // Live timer for ASR
  useEffect(() => {
    let interval: any;
    if (swarmState === 'listening') {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [swarmState]);

  // Hinglish speech inputs simulation
  useEffect(() => {
    if (swarmState !== 'listening') return;
    const lines = [
      "Patient: Namaste Doctor sahib, pet me bohot tez dard ho raha hai teen din se...",
      "Doctor: Namaste, exactly kaha par pain ho raha hai? Is there any chest burning as well?",
      "Patient: Haan Ji, gale me jalan hoti hai immediately after food intake, bohot acidity jaisa lagta hai...",
      "Doctor: Understood. I am prescribing Pantocid 40mg once daily before breakfast.",
      "Patient: Thik hai, and check standard AYUSH parameters too, what lifestyle shifts should I make?",
      "Doctor: Avoid recumbency post meal, take light diet. Generating the SOAP claims record now."
    ];
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setLiveTranscript(prev => prev + (prev ? '\n' : '') + lines[currentLine]);
        currentLine++;
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [swarmState]);

  // Drug interaction is calculated dynamically during render
  let drugInteractionWarning: string | null = null;
  if (prescribedDrug) {
    if (prescribedDrug.toLowerCase().includes('aspirin') || prescribedDrug.toLowerCase().includes('ecosprin')) {
      drugInteractionWarning = "WARNING: Severe DDI Risk with Ibuprofen. Concurrent use increases gastrointestinal bleeding risks.";
    } else if (prescribedDrug.toLowerCase().includes('ketoconazole')) {
      drugInteractionWarning = "NOTICE: Moderate DDI. Pantoprazole raises gastric pH levels, reducing absorption.";
    }
  }

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await logoutAction();
      router.push('/login');
    });
  };

  // ABHA ID query
  const handleAbhaSearch = () => {
    const match = ABDM_LOCKER_RECORDS.find(r => r.abhaId === abhaQuery);
    if (match) {
      setMatchedLocker(match);
      triggerNotification("ABDM Locker successfully unlocked & synced");
    } else {
      setMatchedLocker(null);
      triggerNotification("Error: ABHA ID not verified in ABDM Registry");
    }
  };

  // Telephony Simulator triggers
  const triggerSimulatedInboundCall = () => {
    setTelephonyStatus('inbound');
    triggerNotification("INBOUND TELEPHONY: Incoming Dialogflow CX voice channel...");
  };

  const connectSimulatedCall = () => {
    setTelephonyStatus('connected');
    setAbhaQuery('91-8839-2201-9238');
    handleAbhaSearch();
    triggerNotification("Dialogflow Telephony Connected. ABHA pulled automatically.");
  };

  // Receptionist Booking Action
  const handleBookAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAppointmentAction(formData, role);
      if (res.success && res.appointment) {
        setAppointments(prev => [...prev, res.appointment!]);
        setShowBookingSuccess(true);
        triggerNotification(`OPD Ticket created successfully: ${res.appointment.id}`);
        e.currentTarget.reset();
        setMatchedLocker(null);
        setTelephonyStatus('idle');
      }
    });
  };

  // Run LangChain + ADK Swarm Bus
  const handleTriggerSwarmAnalysis = () => {
    if (!activeAppointmentId) return;
    setSwarmState('processing');
    setAgentTraces([]);
    setActiveTraceIndex(-1);

    runAgenticSwarmEngineAction(activeAppointmentId, liveTranscript, username).then(res => {
      if (res.success && res.traces) {
        // Sequentially display traces
        let step = 0;
        const traceInterval = setInterval(() => {
          if (step < res.traces!.length) {
            setAgentTraces(prev => [...prev, res.traces![step]]);
            setActiveTraceIndex(step);
            step++;
          } else {
            clearInterval(traceInterval);
            setSwarmState('complete');
            refreshData();
            triggerNotification("Swarm Event Loop completed. Record pushed to HMS.");
          }
        }, 1200);
      }
    });
  };

  // Launch PACS scan simulator
  const handleRunPACSScan = (appointmentId: string) => {
    setPacsActiveAppointmentId(appointmentId);
    setActiveTab('pacs');
  };

  const finalizePACSScan = () => {
    const targetId = pacsActiveAppointmentId || activeAppointmentId;
    if (!targetId) return;
    startTransition(async () => {
      const res = await runImagingReportAction(targetId, username);
      if (res.success) {
        triggerNotification("Vertex AI Multimodal report drafted & signed");
        setActiveTab('patients');
        refreshData();
      }
    });
  };

  // ICU transfers
  const handleEscalateToICU = (appointmentId: string, bedId: string) => {
    startTransition(async () => {
      const res = await transferToIcuAction(appointmentId, bedId, username);
      if (res.success) {
        triggerNotification(`Emergency: Escalated to ${bedId}`);
        setActiveIcuBedId(bedId);
        setActiveTab('icu');
        refreshData();
      }
    });
  };

  // Bhashini translated instructions
  useEffect(() => {
    if (activeTab === 'icu' && icuBeds[activeIcuBedId]) {
      getTranslationAction(selectedLanguage, 'instructions').then(res => {
        if (res.success) {
          setTranslatedInstructions(res.translation || '');
        }
      });
    }
  }, [selectedLanguage, activeIcuBedId, activeTab, icuBeds]);

  // Billing Pre-Auth outbox simulator
  const triggerPreAuthSync = (appointmentId: string) => {
    setBillingQueue(prev => [...prev, appointmentId]);
    triggerNotification("NHA TMS Gateway: Submitting pre-auth claim package...");
    
    // Simulate gateway background workers
    setTimeout(() => {
      setBillingQueue(prev => prev.filter(id => id !== appointmentId));
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, isPreAuthApproved: true } : a));
      triggerNotification("NHA TMS Gateway: Pre-auth cashless clearance APPROVED (₹3,500 allocated)");
    }, 4500);
  };

  // Current Patient context in doctor's view
  const allowedAgents = agents.includes('all') ? ['scribe', 'triage', 'conversational', 'imaging', 'documentation'] : agents;
  const activeAppointmentId = selectedAppointmentId || (appointments.length > 0 ? appointments[0].id : null);
  const currentAppointment = appointments.find(a => a.id === activeAppointmentId);
  const isGcp = computeConfig.computeTarget === 'GCP';

  return (
    <div className="min-h-screen bg-transparent font-body text-slate-800 flex relative overflow-hidden selection:bg-indigo-100 w-full animate-fade-in">

      {/* Floating Alerts */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white border border-slate-800 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold font-mono tracking-wide"
          >
            <CheckSquare className="w-4 h-4 text-emerald-500 animate-bounce" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dynamic Swarm Bus pulsator */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-1000 z-50 ${
          isGcp ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 animate-pulse' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 animate-pulse'
        }`} 
      />

      {/* 1. Sidebar Navigation - White & Black Frosted Glass Theme */}
      <aside className="w-64 bg-white/40 backdrop-blur-xl text-slate-600 flex flex-col justify-between p-6 z-20 border-r border-white/60 shadow-lg shrink-0 h-screen sticky top-0">
        <div className="flex flex-col gap-8">
          
          {/* Sidebar Brand Logo */}
          <div className="flex items-center gap-3 border-b border-slate-200/60 pb-5">
            <Hexagon className="w-8 h-8 text-zinc-900 fill-zinc-900/10 animate-spin-slow" />
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-lg tracking-tight text-zinc-900">SUVI AI</span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase font-bold">Clinical Workspace</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 text-sm">
            {/* Receptionist OPD Desk (only for receptionist role or conversational agent) */}
            {(role === 'receptionist' || allowedAgents.includes('conversational')) && (
              <button
                onClick={() => setActiveTab('receptionist')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === 'receptionist' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                OPD Reception Desk
              </button>
            )}

            {/* Patients Desk (only for clinical staff doctor/nurse) */}
            {role !== 'receptionist' && (
              <button
                onClick={() => setActiveTab('patients')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === 'patients' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
                }`}
              >
                <User className="w-4 h-4" />
                Patients Desk
              </button>
            )}

            {/* Scribe AI (clinical staff) */}
            {role !== 'receptionist' && (
              <button
                onClick={() => setActiveTab('doctor')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === 'doctor' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
                } ${!allowedAgents.includes('scribe') ? 'opacity-50' : ''}`}
              >
                <PenSquare className="w-4 h-4" />
                <span className="flex-1">Ambient Scribe AI</span>
                {!allowedAgents.includes('scribe') && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
              </button>
            )}

            {/* AI Diagnostics & PACS (clinical staff) */}
            {role !== 'receptionist' && (
              <button
                onClick={() => setActiveTab('pacs')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === 'pacs' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
                } ${!allowedAgents.includes('imaging') ? 'opacity-50' : ''}`}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="flex-1">AI Diagnostics & PACS</span>
                {!allowedAgents.includes('imaging') && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
              </button>
            )}

            {/* ICU Bed Monitor (clinical staff) */}
            {role !== 'receptionist' && (
              <button
                onClick={() => setActiveTab('icu')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === 'icu' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
                } ${!allowedAgents.includes('triage') ? 'opacity-50' : ''}`}
              >
                <HeartPulse className="w-4 h-4" />
                <span className="flex-1">ICU Bed Monitor</span>
                {!allowedAgents.includes('triage') && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
              </button>
            )}

            {/* Pre-Auth Claims (clinical staff) */}
            {role !== 'receptionist' && (
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === 'billing' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
                } ${!allowedAgents.includes('documentation') ? 'opacity-50' : ''}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="flex-1">Pre-Auth Claims</span>
                {!allowedAgents.includes('documentation') && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200/60 pt-4 flex flex-col gap-3">
          {/* User profile details in sidebar */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase">
              {username.substring(0,2)}
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-slate-800 truncate max-w-[120px]">{username}</span>
              <span className="text-[10px] text-slate-400 capitalize">{role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Clinical Node Live</span>
          </div>

          <form onSubmit={handleLogout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 py-2.5 rounded-xl text-xs transition-colors border border-slate-200/60 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* 2. Main Work Dashboard Frame */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10 relative z-10 flex flex-col">
        
        {/* Dynamic header summary */}
        <header className="flex justify-between items-center pb-6 border-b border-slate-200/50 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-slate-900 capitalize">
              {activeTab === 'receptionist' ? 'OPD Receptionist Desk' :
               activeTab === 'patients' ? 'Patients Desk & Journey' :
               activeTab === 'doctor' ? 'Ambient SOAP Scribe' :
               activeTab === 'pacs' ? 'PACS Chest X-Ray AI' :
               activeTab === 'icu' ? 'ICU Bed Telemetry' :
               'Pre-Auth Claims & Insurance'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'receptionist' ? 'Manage outpatient registrations, Dialogflow telephony, and ABHA verifications.' :
               activeTab === 'patients' ? 'Trace patient timelines, clinical history, and diagnostic reports.' :
               activeTab === 'doctor' ? 'Ambient clinical scribe with real-time speech processing and CDSCO alerts.' :
               activeTab === 'pacs' ? 'Analyze Chest X-Ray scans using Google Cloud Vertex AI.' :
               activeTab === 'icu' ? 'Critical telemetry vitals monitoring and Bhashini clinical translations.' :
               'Submit PMJAY CGHS pre-auth requests and manage PubSub outbox queues.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border ${
              isGcp ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-purple-50 text-purple-700 border-purple-100'
            }`}>
              <Wifi className="w-3.5 h-3.5" />
              {isGcp ? `Vertex AI Cloud (${computeConfig.gcpProjectId})` : `Local AI Server (${computeConfig.localEndpoint})`}
            </span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          
          {/* ========================================================
              RECEPTIONIST WORKSPACE
             ======================================================== */}
          {activeTab === 'receptionist' && (
            <ReceptionistDesk
              telephonyStatus={telephonyStatus}
              setTelephonyStatus={setTelephonyStatus}
              triggerSimulatedInboundCall={triggerSimulatedInboundCall}
              connectSimulatedCall={connectSimulatedCall}
              abhaQuery={abhaQuery}
              setAbhaQuery={setAbhaQuery}
              handleAbhaSearch={handleAbhaSearch}
              matchedLocker={matchedLocker}
              handleBookAppointment={handleBookAppointment}
              isPending={isPending}
              allowedAgents={allowedAgents}
              role={role}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsDesk
              appointments={appointments}
              activeAppointmentId={activeAppointmentId}
              setSelectedAppointmentId={setSelectedAppointmentId}
              currentAppointment={currentAppointment}
              setActiveTab={setActiveTab}
              setPacsActiveAppointmentId={setPacsActiveAppointmentId}
            />
          )}

          {activeTab === 'doctor' && (
            <AmbientScribe
              appointments={appointments}
              activeAppointmentId={activeAppointmentId}
              setSelectedAppointmentId={setSelectedAppointmentId}
              currentAppointment={currentAppointment}
              swarmState={swarmState}
              setSwarmState={setSwarmState}
              recordingSeconds={recordingSeconds}
              setRecordingSeconds={setRecordingSeconds}
              liveTranscript={liveTranscript}
              setLiveTranscript={setLiveTranscript}
              agentTraces={agentTraces}
              prescribedDrug={prescribedDrug}
              setPrescribedDrug={setPrescribedDrug}
              drugInteractionWarning={drugInteractionWarning}
              handleTriggerSwarmAnalysis={handleTriggerSwarmAnalysis}
              triggerPreAuthSync={triggerPreAuthSync}
              allowedAgents={allowedAgents}
              setActiveTab={setActiveTab}
              setPacsActiveAppointmentId={setPacsActiveAppointmentId}
              handleEscalateToICU={handleEscalateToICU}
            />
          )}

          {activeTab === 'pacs' && (
            <PacsScanner
              appointments={appointments}
              pacsActiveAppointmentId={pacsActiveAppointmentId}
              setPacsActiveAppointmentId={setPacsActiveAppointmentId}
              activeAppointmentId={activeAppointmentId}
              pacsContrast={pacsContrast}
              setPacsContrast={setPacsContrast}
              pacsAiHighlight={pacsAiHighlight}
              setPacsAiHighlight={setPacsAiHighlight}
              finalizePACSScan={finalizePACSScan}
              allowedAgents={allowedAgents}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'icu' && (
            <IcuMonitor
              activeIcuBedId={activeIcuBedId}
              setActiveIcuBedId={setActiveIcuBedId}
              icuBeds={icuBeds}
              icuHeartRate={icuHeartRate}
              icuSpo2={icuSpo2}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              translatedInstructions={translatedInstructions}
              triggerNotification={triggerNotification}
              allowedAgents={allowedAgents}
              username={username}
            />
          )}

          {activeTab === 'billing' && (
            <PreAuthClaims
              appointments={appointments}
              billingQueue={billingQueue}
              triggerPreAuthSync={triggerPreAuthSync}
              allowedAgents={allowedAgents}
            />
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
