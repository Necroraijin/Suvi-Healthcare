'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Search, Inbox, Bell, Paperclip, ArrowUp, Mic,
  PenSquare, Sidebar, Clock, Hexagon, ChevronDown, CheckCircle2,
  LogOut, Activity, Image as ImageIcon, FileText, Bot, HeartPulse, User,
  Volume2, RefreshCw, FileSpreadsheet, Sparkles, Square, Play, X, ShieldAlert,
  Sliders, Eye, Thermometer, BrainCircuit, Check, CheckSquare, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '../app/actions';

interface DashboardClientProps {
  username: string;
  role: string;
  posting: string;
  agents: string[];
}

const AGENT_META: Record<string, { title: string, desc: string, icon: React.ReactNode, color: string }> = {
  'scribe': { title: 'Scribe Agent', desc: 'Real-time encounter transcription', icon: <PenSquare className="w-5 h-5" />, color: 'text-amber-600' },
  'triage': { title: 'Triage Agent', desc: 'Patient routing & vitals AI', icon: <HeartPulse className="w-5 h-5" />, color: 'text-rose-600' },
  'conversational': { title: 'Consultant', desc: 'Diagnostic suggestions & FAQs', icon: <Bot className="w-5 h-5" />, color: 'text-indigo-600' },
  'imaging': { title: 'Imaging Agent', desc: 'Radiology analysis', icon: <ImageIcon className="w-5 h-5" />, color: 'text-sky-600' },
  'documentation': { title: 'Clinical Coder', desc: 'Automated structure & ICD-10', icon: <FileText className="w-5 h-5" />, color: 'text-emerald-600' },
  'system': { title: 'System Daemon', desc: 'Infrastructure metrics', icon: <Activity className="w-5 h-5" />, color: 'text-slate-600' },
  'all': { title: 'Master Control', desc: 'All agents active', icon: <Hexagon className="w-5 h-5" />, color: 'text-purple-600' }
};

interface PatientData {
  bed: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  complaint: string;
  consent: boolean;
  vitals: {
    temp: string;
    bp: string;
    hr: string;
    spo2: string;
    spo2Status: 'normal' | 'warning' | 'critical';
    bpStatus: 'normal' | 'warning' | 'critical';
  }
}

const MOCK_PATIENTS: Record<string, PatientData> = {
  'Bed 01': {
    bed: 'Bed 01',
    name: 'Aarav Sharma',
    age: 42,
    gender: 'Male',
    abhaId: '91-8839-2201-9238',
    complaint: 'Severe epigastric chest pain and acidity immediately following food intake for three days.',
    consent: true,
    vitals: { temp: '98.6 °F', bp: '142/92 mmHg', hr: '84 bpm', spo2: '97%', spo2Status: 'normal', bpStatus: 'warning' }
  },
  'Bed 02': {
    bed: 'Bed 02',
    name: 'Priya Patel',
    age: 29,
    gender: 'Female',
    abhaId: '44-9021-3312-8874',
    complaint: 'Acute nausea, respiratory distress, and dry cough since yesterday evening.',
    consent: true,
    vitals: { temp: '101.4 °F', bp: '110/70 mmHg', hr: '102 bpm', spo2: '93%', spo2Status: 'warning', bpStatus: 'normal' }
  },
  'Bed 03': {
    bed: 'Bed 03',
    name: 'Karan Singh',
    age: 58,
    gender: 'Male',
    abhaId: '12-4458-9902-1249',
    complaint: 'Dizziness, cold sweats, and chronic low back pain following clinical physical therapy session.',
    consent: false,
    vitals: { temp: '97.8 °F', bp: '95/60 mmHg', hr: '62 bpm', spo2: '98%', spo2Status: 'normal', bpStatus: 'warning' }
  }
};

export default function DashboardClient({ username, role, posting, agents }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'copilot'>('copilot');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Multi-Agent Swarm Simulator States
  const [swarmState, setSwarmState] = useState<'idle' | 'listening' | 'processing' | 'swarm_complete'>('idle');
  const [activeAgentProcess, setActiveAgentProcess] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // High-Fidelity Interactive Overlay States
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  const [isPacsOpen, setIsPacsOpen] = useState(false);
  const [pacsContrast, setPacsContrast] = useState(100);
  const [pacsAiHighlight, setPacsAiHighlight] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleLogout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await logoutAction();
      router.push('/login');
    });
  };

  // Live timer for Scribe Agent simulation
  useEffect(() => {
    let interval: any;
    if (swarmState === 'listening') {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [swarmState]);

  // Multilingual Hinglish conversation timeline simulation
  useEffect(() => {
    if (swarmState !== 'listening') return;

    const lines = [
      "Patient: Namaste Doctor sahib, pet me bohot tez dard ho raha hai teen din se...",
      "Doctor: Namaste, exactly kaha par pain ho raha hai? Is there any chest burning as well?",
      "Patient: Haan Ji, khaana khaane ke baad yahan gale me jalan hoti hai, bohot acidity jaisa lagta hai...",
      "Doctor: Okay. Are you feeling nauseous? Vomiting jaisa lag raha hai?",
      "Patient: Nahi, ulti toh nahi hui par khana bilkul hazam nahi hota...",
      "Doctor: Understood. I am prescribing Pantocid 40mg once daily before breakfast, and some lifestyle modifications.",
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setLiveTranscript((prev) => prev + (prev ? '\n' : '') + lines[currentLine]);
        currentLine++;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [swarmState]);

  const handleStartListening = () => {
    setLiveTranscript('');
    setSwarmState('listening');
  };

  const handleFinalizeEncounter = () => {
    setSwarmState('processing');

    // Simulate interconnected Swarm Event Loop processing across agents
    const sequence = [
      { agent: 'Scribe Agent', msg: 'Translating mixed clinical dialect & structuring SOAP format...' },
      { agent: 'Consultant Agent', msg: 'Performing diagnostic differential matches & drug brand checks...' },
      { agent: 'Coder Agent', msg: 'Compiling ICD-10 diagnostic codes & mapping PMJAY governmental rates...' },
      { agent: 'Nurse Agent', msg: 'Translating patient education sheets & final discharge instructions...' }
    ];

    let currentStep = 0;
    setActiveAgentProcess(sequence[0].agent + ': ' + sequence[0].msg);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < sequence.length) {
        setActiveAgentProcess(sequence[currentStep].agent + ': ' + sequence[currentStep].msg);
      } else {
        clearInterval(interval);
        setSwarmState('swarm_complete');
        setActiveAgentProcess('');
      }
    }, 2000);
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const allowedAgents = agents.includes('all') ? Object.keys(AGENT_META).filter(k => k !== 'all') : agents;
  const currentPatient = selectedBed ? MOCK_PATIENTS[selectedBed] : null;

  return (
    <div className="min-h-screen bg-transparent font-body text-slate-800 p-4 md:p-6 flex relative overflow-hidden selection:bg-indigo-100 w-full">

      {/* Floating Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white border border-slate-800 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold font-mono tracking-wide"
          >
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Left Sidebar */}
      <aside className="w-14 md:w-16 flex flex-col items-center gap-4 py-4 z-20 pointer-events-auto h-full absolute left-4 md:left-6">
        <button
          onClick={() => setActiveTab('copilot')}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${activeTab === 'copilot' ? 'bg-zinc-900 text-white' : 'glass-panel text-slate-400 hover:text-slate-800 hover:bg-white/50'}`}
          title="Copilot Swarm Workspace"
        >
          <Bot className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-3 mt-4 glass-panel rounded-full p-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'overview' ? 'bg-zinc-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-800 hover:bg-white/50'}`}
            title="Clinical Dashboard"
          >
            <Activity className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-white/50 transition-all" title="Search Scans">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Floating Top Navigation */}
      <header className="absolute top-6 left-0 right-0 flex justify-between items-center px-24 z-20 pointer-events-none w-full max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <Hexagon className="w-7 h-7 text-zinc-900 fill-zinc-900" />
          <span className="font-heading font-semibold text-xl tracking-tight text-zinc-900">SUVI AI</span>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs font-mono font-medium bg-slate-200/50 px-2 py-1 rounded-md text-slate-600 capitalize">
              {role}
            </span>
            <span className="text-xs font-mono font-medium bg-indigo-100/50 text-indigo-700 px-2 py-1 rounded-md hidden sm:block">
              {posting}
            </span>
          </div>
        </div>

        {/* Center Pill Toggle */}
        <div className="pointer-events-auto glass-pill p-1 flex items-center shadow-sm absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'overview' ? 'bg-zinc-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'copilot' ? 'bg-zinc-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Agentic Swarm
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-slate-600 relative">
            <Inbox className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white" />
          </button>
          <button className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-slate-600">
            <Bell className="w-4 h-4" />
          </button>

          <form onSubmit={handleLogout}>
            <button type="submit" className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </form>

          <button className="w-10 h-10 rounded-full glass-button overflow-hidden shadow-sm p-0 border border-white relative group flex items-center justify-center bg-slate-100">
            <User className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full flex flex-col relative z-10 pt-32 pb-32 pl-20 pr-6 w-full">

        <AnimatePresence mode="wait">
          {activeTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-start max-w-5xl mx-auto w-full pt-4"
            >
              {swarmState === 'idle' && (
                <div className="text-center py-10 max-w-3xl flex flex-col items-center">
                  <span className="text-xs text-indigo-600 mb-4 font-mono font-bold tracking-wider uppercase bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Connected Inter-Agent Swarm Bus
                  </span>

                  <h1 className="text-[2.2rem] md:text-[2.8rem] leading-[1.2] font-heading text-slate-400 mb-6">
                    Ready to scribe and analyze in {posting}. <span className="text-zinc-900 font-medium">Activate ambient recording to begin clinical overlay.</span>
                  </h1>

                  <p className="text-sm text-slate-500 max-w-xl leading-relaxed mb-8">
                    Ambient Scribe dynamically translates Hindi/regional clinical dialogues, Consultant audits brand compatibilities, Coder maps PMJAY brackets, and Nurse translates patient instruction sheets.
                  </p>

                  <button
                    onClick={handleStartListening}
                    className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 relative group animate-pulse"
                  >
                    <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="absolute -bottom-8 font-mono text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Start Scribing</span>
                  </button>
                </div>
              )}

              {/* Scribe Ambient Listening Screen */}
              {swarmState === 'listening' && (
                <div className="w-full flex flex-col md:flex-row gap-6 items-stretch">
                  <div className="flex-1 glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[420px]">
                    <div className="flex items-center justify-between pb-4 border-b border-white/60 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <h3 className="font-heading font-semibold text-lg text-slate-800 flex items-center gap-1">
                          Ambient Scribe <span className="text-xs text-slate-400 font-mono font-medium ml-1">Live Capture</span>
                        </h3>
                      </div>
                      <span className="font-mono text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100 font-semibold">
                        {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex-1 bg-white/50 border border-white/60 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed max-h-[280px] whitespace-pre-line">
                      {liveTranscript || <span className="text-slate-400 italic">Listening for dialogue between doctor and patient in consultation room... (Simulating conversation in Hinglish)</span>}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleFinalizeEncounter}
                        className="flex-1 bg-zinc-900 hover:bg-black text-white py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" /> Finalize Encounter (Trigger Swarm Bus)
                      </button>
                      <button
                        onClick={() => setSwarmState('idle')}
                        className="px-5 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-2xl text-xs font-semibold text-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-80 glass-panel p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-slate-800 uppercase tracking-wider mb-2">Multilingual Capture Settings</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">Translates vernacular Hinglish dialect medical symptoms directly to standard English SOAP clinical terms.</p>

                      <div className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-center bg-white/40 border border-white/60 p-2.5 rounded-xl text-xs">
                          <span className="font-semibold text-slate-700">Source Dialect</span>
                          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded font-bold">Hinglish / Hindi</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/40 border border-white/60 p-2.5 rounded-xl text-xs">
                          <span className="font-semibold text-slate-700">Target Clinical</span>
                          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded font-bold">English (SOAP)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center py-6">
                      <div className="flex gap-1 items-end h-8">
                        {[1, 2.5, 1.5, 3, 2, 4, 1.8, 3.2, 1.2, 2.8, 1.5, 3].map((val, idx) => (
                          <motion.div
                            key={idx}
                            animate={{ height: swarmState === 'listening' ? [`${val * 4}px`, `${val * 8}px`, `${val * 4}px`] : '4px' }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: idx * 0.05 }}
                            className="w-1 bg-indigo-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Wave Event Screen */}
              {swarmState === 'processing' && (
                <div className="w-full max-w-md py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 relative">
                    <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-slate-800 mb-2">Interconnected Swarm Activated</h3>
                  <p className="text-xs text-slate-400 font-mono animate-pulse uppercase tracking-wider mb-6">Processing IPC messaging event bus...</p>

                  <div className="w-full bg-white/60 border border-white/80 p-4 rounded-2xl shadow-inner font-mono text-[11px] text-indigo-700 text-center leading-relaxed">
                    {activeAgentProcess}
                  </div>
                </div>
              )}

              {/* Interconnected Multi-Agent Results Screen */}
              {swarmState === 'swarm_complete' && (
                <div className="w-full flex flex-col gap-6">

                  {/* Title & Trigger Reset */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-heading font-semibold text-zinc-900">Encounter Analysis Workspace</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Four distinct clinical AI agents have collaborated and updated details in lockstep.</p>
                    </div>
                    <button
                      onClick={() => setSwarmState('idle')}
                      className="px-5 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-black transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Start New Consultation
                    </button>
                  </div>

                  {/* Interconnected Swarm Result Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Scribe & SOAP Output (Col-Span 2) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                      {/* SOAP Summary Card */}
                      {allowedAgents.includes('scribe') && (
                        <div className="glass-panel p-6 rounded-3xl">
                          <div className="flex items-center justify-between pb-3.5 border-b border-white/60 mb-4">
                            <h3 className="font-heading font-semibold text-md text-slate-800 flex items-center gap-2">
                              <PenSquare className="w-5 h-5 text-amber-600" /> Scribe Agent: Structured SOAP Record
                            </h3>
                            <span className="text-[10px] font-mono bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-bold">SOAP COMPLETED</span>
                          </div>

                          <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-body">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Subjective (Symptoms)</span>
                              <p className="bg-white/40 border border-white/60 p-3 rounded-xl">
                                Patient reports acute epigastric abdominal pain persisting for three days. Describes localized chest burning (acidity) immediately following food intake. Denies nausea, vomiting, or fever. Food assimilation reports reveal indigestion.
                              </p>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Objective (Assessments)</span>
                              <p className="bg-white/40 border border-white/60 p-3 rounded-xl">
                                Abdominal soft, non-distended. Mild tenderness noted on epigastric palpation. Heart rate stable. Clear lung sounds.
                              </p>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Plan (Clinical Strategy)</span>
                              <p className="bg-white/40 border border-white/60 p-3 rounded-xl font-semibold">
                                Initiate Pantocid (Pantoprazole) 40mg once daily before breakfast for 14 days. Implement lifestyle alterations including avoidance of highly spicy foods, acidic citrus components, and direct post-prandial recumbency.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Coder Agent Claims Processing Box */}
                      {allowedAgents.includes('documentation') && (
                        <div className="glass-panel p-6 rounded-3xl">
                          <div className="flex items-center justify-between pb-3.5 border-b border-white/60 mb-4">
                            <h3 className="font-heading font-semibold text-md text-slate-800 flex items-center gap-2">
                              <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Coder Agent: Insurance CGHS/PMJAY Audit
                            </h3>
                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold">MAPPED</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/40 border border-white/60 p-3.5 rounded-xl flex flex-col justify-between">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Primary ICD-10 Code</span>
                              <span className="text-xl font-mono font-bold text-slate-800 mt-1">K21.9</span>
                              <span className="text-xs text-slate-500 mt-1">Gastro-esophageal reflux disease without esophagitis</span>
                            </div>

                            <div className="bg-white/40 border border-white/60 p-3.5 rounded-xl flex flex-col justify-between">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">PMJAY / CGHS Code</span>
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">100% Cashless</span>
                              </div>
                              <span className="text-xl font-mono font-bold text-slate-800 mt-1">3010410</span>
                              <span className="text-xs text-slate-500 mt-1">Medical management of severe acute gastritis</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Consultant (Doctor Copilot) & Nurse Agent Outputs (Col-Span 1) */}
                    <div className="flex flex-col gap-6">

                      {/* Consultant Decision Support Card */}
                      {allowedAgents.includes('conversational') && (
                        <div className="glass-panel p-6 rounded-3xl">
                          <div className="flex items-center justify-between pb-3.5 border-b border-white/60 mb-4">
                            <h3 className="font-heading font-semibold text-md text-slate-800 flex items-center gap-2">
                              <Bot className="w-5 h-5 text-indigo-600" /> Consultant (Doctor Copilot)
                            </h3>
                          </div>

                          <div className="space-y-4 text-xs text-slate-700">
                            <div className="bg-white/40 border border-white/60 p-3 rounded-xl">
                              <span className="font-mono text-[9px] text-slate-400 uppercase font-bold block mb-1">Differential Match</span>
                              <ul className="list-disc pl-4 space-y-1 font-medium">
                                <li>GERD (Match Confidence: 94%)</li>
                                <li>Peptic Ulcer Disease (Confidence: 68%)</li>
                              </ul>
                            </div>

                            <div className="bg-white/40 border border-white/60 p-3 rounded-xl">
                              <span className="font-mono text-[9px] text-slate-400 uppercase font-bold block mb-1">Indian Brand interaction check</span>
                              <p className="font-medium text-slate-800">Pantocid 40mg (Pantoprazole)</p>
                              <div className="flex items-center gap-1.5 text-emerald-600 mt-1 font-bold text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> No active Brand Interactions
                              </div>
                            </div>

                            <div className="bg-white/40 border border-white/60 p-3 rounded-xl">
                              <span className="font-mono text-[9px] text-slate-400 uppercase font-bold block mb-1">AYUSH Compatibility Check</span>
                              <p className="text-[11px] text-slate-500">
                                Safe to combine with standard Ayurvedic formulation (Triphala churna) as requested by patient. No adverse botanical reactions mapped.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Nurse Agent Discharge sheet */}
                      {allowedAgents.includes('triage') && (
                        <div className="glass-panel p-6 rounded-3xl">
                          <div className="flex items-center justify-between pb-3.5 border-b border-white/60 mb-4">
                            <h3 className="font-heading font-semibold text-md text-slate-800 flex items-center gap-2">
                              <HeartPulse className="w-5 h-5 text-rose-600" /> Nurse Agent: Patient Instructions
                            </h3>
                          </div>

                          <div className="space-y-4 text-xs text-slate-700">
                            <div className="bg-white/40 border border-white/60 p-3 rounded-xl">
                              <span className="font-mono text-[9px] text-slate-400 uppercase font-bold block mb-1">Hindi Discharge Translation</span>
                              <p className="font-medium text-slate-800 leading-relaxed text-[13px]">
                                "दवाइयां सुबह खाली पेट, खाना खाने से आधा घंटा पहले एक बार लेनी हैं। 3 दिनों तक मसालेदार भोजन और खट्टे फलों से सख्त परहेज करें।"
                              </p>
                            </div>

                            <div className="bg-white/40 border border-white/60 p-3 rounded-xl">
                              <span className="font-mono text-[9px] text-slate-400 uppercase font-bold block mb-1">Discharge Care Plan Summary</span>
                              <ul className="list-decimal pl-4 space-y-1 text-slate-600">
                                <li>Pantocid 40mg once daily x 14 days.</li>
                                <li>Avoid recumbency for 2 hours post-meal.</li>
                                <li>Review in clinic if pain increases.</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex-1 w-full flex flex-col items-start justify-start pt-4 w-full"
            >
              <h1 className="text-4xl font-heading text-zinc-900 mb-8 ml-6 font-semibold">
                {posting} Dashboard
              </h1>
              <div className="glass-panel w-full h-full min-h-[400px] rounded-3xl p-8 border border-white/80 shadow-[0_8px_32px_rgb(0,0,0,0.03)] flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/40">
                  <div>
                    <h2 className="text-2xl font-heading font-medium text-zinc-900 mb-1">
                      Clinical Overview Workspace
                    </h2>
                    <p className="text-sm text-slate-500">
                      {role === 'doctor' ? 'Patient records, scans, and clinical notes.' :
                        role === 'nurse' ? 'Active queue, preliminary reads, and vitals.' : 'System management tools.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {allowedAgents.map(agentId => {
                      const meta = AGENT_META[agentId];
                      if (!meta) return null;
                      return (
                        <div key={agentId} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white shadow-sm text-xs font-medium text-slate-600">
                          <span className={meta.color}>{meta.icon}</span>
                          <span className="hidden md:inline">{meta.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {/* PACS Radiology Scanner Card */}
                  {allowedAgents.includes('imaging') && (
                    <div
                      onClick={() => setIsPacsOpen(true)}
                      className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-900 text-slate-300 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-xl hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:border-slate-700 transition-all duration-300 cursor-pointer min-h-[220px]"
                    >
                      {/* Scanning green line effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 w-full h-[40px] animate-bounce pointer-events-none" />
                      <ImageIcon className="w-12 h-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-500" />
                      <p className="text-white text-md font-semibold tracking-wide flex items-center gap-1.5">
                        Radiology PACS Server <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      </p>
                      <p className="text-slate-400 text-xs mt-1 text-center max-w-sm">
                        Click to open Chest X-Ray diagnostic scanner interface.
                      </p>
                    </div>
                  )}

                  {/* Patient Vital Queue */}
                  {allowedAgents.includes('triage') && (
                    <div className="col-span-1 bg-white/40 rounded-3xl border border-white/60 p-6 flex flex-col min-h-[220px]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-medium text-zinc-900">Patient Vitals Queue</h3>
                        <span className="bg-rose-100 text-rose-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> LIVE</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        {Object.values(MOCK_PATIENTS).map(patient => (
                          <div
                            key={patient.bed}
                            onClick={() => setSelectedBed(patient.bed)}
                            className={`p-3.5 flex justify-between items-center rounded-2xl shadow-sm text-sm border hover:border-indigo-200/50 hover:bg-white transition-all cursor-pointer ${selectedBed === patient.bed ? 'bg-white border-indigo-300 shadow-md scale-[1.02]' : 'bg-white/80 border-slate-100'}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">{patient.bed} — {patient.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">ABHA ID: {patient.abhaId}</span>
                            </div>
                            <button className="text-indigo-600 bg-indigo-50 font-semibold px-3 py-1.5 rounded-xl text-xs hover:bg-indigo-100 transition-colors">View EHR</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documentation Signature Block */}
                  {allowedAgents.includes('documentation') && (
                    <div className="col-span-1 lg:col-span-3 bg-white/40 rounded-3xl border border-white/60 p-6 px-8 flex items-center justify-between min-h-[90px] mt-2">
                      <div>
                        <h3 className="font-heading font-medium text-zinc-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500" /> Outstanding Clinical Charts
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">2 diagnostic SOAP charts require final approval from Dr. Chang before closing.</p>
                      </div>
                      <button
                        onClick={() => triggerNotification('Clinical records successfully validated & signed off')}
                        className="black-button px-6 py-2.5 rounded-xl text-xs font-semibold"
                      >
                        Review & Sign Off
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* High-Fidelity Overlay: Patient vitals & EHR Details Card */}
      <AnimatePresence>
        {selectedBed && currentPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBed(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* EHR Record Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-[620px] p-6 rounded-3xl shadow-2xl relative z-10 border-white/80 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h3 className="font-heading font-bold text-lg text-slate-800">
                    Patient EHR File: {currentPatient.bed}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBed(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Patient Core Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-xs font-mono text-slate-700">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">Patient Name</span>
                  <span className="font-semibold text-slate-800 mt-0.5">{currentPatient.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">Age / Gender</span>
                  <span className="font-semibold text-slate-800 mt-0.5">{currentPatient.age} Yrs / {currentPatient.gender}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase">ABDM ABHA ID</span>
                  <span className="font-semibold text-indigo-600 mt-0.5 font-bold">{currentPatient.abhaId}</span>
                </div>
              </div>

              {/* Chief Complaints */}
              <div className="text-xs text-slate-700 leading-relaxed bg-white/50 border border-white p-4 rounded-2xl">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Chief Complaint</span>
                <p className="font-medium text-slate-800">{currentPatient.complaint}</p>
              </div>

              {/* Live Vital Sign Telemetry */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wide">Live Vital Monitor</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">

                  {/* Temp */}
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Body Temp</span>
                    <span className="text-md font-mono font-bold text-slate-800 mt-1 flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-emerald-500" /> {currentPatient.vitals.temp}
                    </span>
                  </div>

                  {/* BP */}
                  <div className={`bg-white border p-3 rounded-2xl shadow-sm flex flex-col items-center ${currentPatient.vitals.bpStatus === 'warning' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Blood Pres.</span>
                    <span className="text-md font-mono font-bold mt-1 text-slate-800">
                      {currentPatient.vitals.bp}
                    </span>
                    <span className={`text-[9px] font-semibold mt-1 px-1.5 rounded uppercase ${currentPatient.vitals.bpStatus === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {currentPatient.vitals.bpStatus === 'warning' ? 'Elevated' : 'Optimal'}
                    </span>
                  </div>

                  {/* HR */}
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Heart Rate</span>
                    <span className="text-md font-mono font-bold text-slate-800 mt-1">
                      {currentPatient.vitals.hr}
                    </span>
                  </div>

                  {/* SpO2 */}
                  <div className={`bg-white border p-3 rounded-2xl shadow-sm flex flex-col items-center ${currentPatient.vitals.spo2Status === 'warning' ? 'border-rose-200 bg-rose-50/20 animate-pulse' : 'border-slate-100'}`}>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">SPO2 (Pulse Ox)</span>
                    <span className="text-md font-mono font-bold mt-1 text-slate-800">
                      {currentPatient.vitals.spo2}
                    </span>
                    <span className={`text-[9px] font-semibold mt-1 px-1.5 rounded uppercase ${currentPatient.vitals.spo2Status === 'warning' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {currentPatient.vitals.spo2Status === 'warning' ? 'Borderline' : 'Normal'}
                    </span>
                  </div>

                </div>
              </div>

              {/* ABDM Consent Info Card */}
              <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">ABDM Digital Health Record Sync</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{currentPatient.consent ? 'Patient consent logged & active' : 'Consent authorization pending'}</span>
                  </div>
                </div>
                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${currentPatient.consent ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                  {currentPatient.consent ? 'AUTH OK' : 'PENDING'}
                </span>
              </div>

              {/* Interactive Vitals Escalation */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setSelectedBed(null);
                    triggerNotification(`Vitals for ${currentPatient.name} successfully synced to local HMS`);
                  }}
                  className="flex-1 bg-zinc-900 hover:bg-black text-white text-xs font-semibold py-3 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Sync Vitals to EHR
                </button>
                {currentPatient.vitals.spo2Status === 'warning' || currentPatient.vitals.bpStatus === 'warning' ? (
                  <button
                    onClick={() => {
                      setSelectedBed(null);
                      triggerNotification(`CRITICAL ALERT: Vitals for ${currentPatient.name} escalated to attending physician`);
                    }}
                    className="px-5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-xs font-semibold py-3 rounded-2xl transition-colors flex items-center gap-1 animate-bounce"
                  >
                    <ShieldAlert className="w-4 h-4" /> Escalate Vitals
                  </button>
                ) : null}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Overlay: Radiology PACS Chest X-Ray Simulator */}
      <AnimatePresence>
        {isPacsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPacsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg"
            />

            {/* Dark Mode PACS UI Shell */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-[800px] p-6 shadow-2xl relative z-10 flex flex-col gap-6 text-slate-300"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-900">
                <div className="flex items-center gap-2 text-indigo-400">
                  <ImageIcon className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <h3 className="font-heading font-bold text-lg text-white">
                    Radiology PACS Server — Chest X-Ray Diagnostic Unit
                  </h3>
                </div>
                <button
                  onClick={() => setIsPacsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scans Control & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">

                {/* Simulated Chest X-Ray Viewer Frame */}
                <div className="sm:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center p-4 min-h-[320px] relative overflow-hidden flex-col gap-4">

                  {/* Glowing Scanning Line */}
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 w-full h-[60px] animate-bounce pointer-events-none z-10" />

                  {/* High Fidelity CSS-Designed Chest X-Ray Skeleton */}
                  <div
                    className="w-56 h-56 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center relative flex-col shadow-inner transition-all duration-300"
                    style={{ filter: `contrast(${pacsContrast}%) brightness(95%)` }}
                  >
                    {/* Simulated Spine Column */}
                    <div className="w-2.5 h-full bg-slate-900 absolute left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center py-2 opacity-80">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="w-4 h-3 bg-slate-700/80 rounded" />
                      ))}
                    </div>

                    {/* Ribcage Outline Arcs */}
                    <div className="absolute inset-0 flex justify-between px-3 py-6 opacity-60">
                      <div className="flex flex-col gap-3 items-start h-full w-20">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-full h-2 bg-slate-700 rounded-r-full" style={{ transform: `rotate(${i * 12}deg)` }} />
                        ))}
                      </div>
                      <div className="flex flex-col gap-3 items-end h-full w-20">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-full h-2 bg-slate-700 rounded-l-full" style={{ transform: `rotate(${-i * 12}deg)` }} />
                        ))}
                      </div>
                    </div>

                    {/* Lung Lobe Outlines */}
                    <div className="absolute inset-x-6 top-6 bottom-6 flex justify-between gap-12 pointer-events-none opacity-40">
                      <div className="w-20 bg-gradient-to-br from-slate-900 to-slate-950 border-r border-t border-slate-800 rounded-tl-[40px] rounded-br-[60px]" />
                      <div className="w-20 bg-gradient-to-bl from-slate-900 to-slate-950 border-l border-t border-slate-800 rounded-tr-[40px] rounded-bl-[60px]" />
                    </div>

                    {/* AI Highlighting Overlay */}
                    <AnimatePresence>
                      {pacsAiHighlight && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute right-10 top-12 border-2 border-dashed border-rose-500 p-2.5 rounded-xl bg-rose-500/10 flex flex-col gap-0.5 z-20 pointer-events-none shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
                        >
                          <span className="text-[7.5px] font-mono text-rose-400 font-extrabold uppercase tracking-widest">Epigastric Gaseous</span>
                          <span className="text-[9px] font-body text-white font-semibold">Localized Distention</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">Modality: CXR (Posterior-Anterior view) • ID: PACS-88390-CXR</span>
                </div>

                {/* Scans Control Sliders & Details */}
                <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-2xl flex flex-col justify-between">
                  <div className="flex flex-col gap-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wide">Scanner Adjustment</span>

                    {/* Contrast Slider */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 flex justify-between font-mono">
                        <span>Contrast</span> <span>{pacsContrast}%</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={pacsContrast}
                        onChange={(e) => setPacsContrast(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* AI Feature Toggle */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl mt-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <BrainCircuit className="w-4 h-4 text-indigo-500" />
                        <span>AI Highlights</span>
                      </div>
                      <button
                        onClick={() => setPacsAiHighlight(!pacsAiHighlight)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        {pacsAiHighlight ? <ToggleRight className="w-8 h-8 text-indigo-500" /> : <ToggleLeft className="w-8 h-8 text-slate-700" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsPacsOpen(false);
                        triggerNotification('Imaging report successfully generated & routed to Scribe');
                        setSwarmState('processing');

                        // Auto-simulate Swarm Event Cycle triggered from Imaging Agent PACS
                        const sequence = [
                          { agent: 'Imaging Agent', msg: 'Analyzing chest study & noting gastro distention...' },
                          { agent: 'Scribe Agent', msg: 'Appending radiology finding parameters to SOAP Assessments...' },
                          { agent: 'Consultant Agent', msg: 'Re-evaluating differential matches...' }
                        ];

                        let currentStep = 0;
                        setActiveAgentProcess(sequence[0].agent + ': ' + sequence[0].msg);

                        const interval = setInterval(() => {
                          currentStep++;
                          if (currentStep < sequence.length) {
                            setActiveAgentProcess(sequence[currentStep].agent + ': ' + sequence[currentStep].msg);
                          } else {
                            clearInterval(interval);
                            setSwarmState('swarm_complete');
                            setActiveAgentProcess('');
                          }
                        }, 2000);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/10"
                    >
                      <Sparkles className="w-4 h-4" /> Run Imaging AI Report
                    </button>
                    <button
                      onClick={() => {
                        setPacsContrast(100);
                        setPacsAiHighlight(false);
                      }}
                      className="w-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold py-2.5 rounded-2xl border border-slate-800 transition-colors"
                    >
                      Reset View
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Input Area & Quick Commands Container */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none z-30 px-6">
        <div className="w-full max-w-[1200px] flex justify-between items-end relative">

          {/* Spacer for flex alignment */}
          <div className="w-[200px] hidden lg:block" />

          {/* Center Input (Copilot only) */}
          <AnimatePresence>
            {activeTab === 'copilot' && swarmState === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col items-center gap-4 flex-1 pointer-events-auto"
              >
                <div className="flex items-center gap-3 w-full max-w-2xl relative">
                  <div className="flex-1 glass-panel rounded-full flex items-center px-4 py-3 shadow-[0_8px_32px_rgb(0,0,0,0.05)] border-white/80 transition-all focus-within:shadow-[0_8px_32px_rgb(79,70,229,0.1)] focus-within:border-indigo-200/50">
                    <Paperclip className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      placeholder={role === 'doctor' ? "Retrieve latest scan for bed 4..." : "Draft a quick note about patient vitals..."}
                      className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 text-[15px]"
                    />
                    <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-900 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors shrink-0">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleStartListening}
                    className="w-12 h-12 rounded-full black-button flex items-center justify-center shrink-0"
                    title="Start Ambient Scribe"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">
                  Connected to {posting} Node • Direct HMS Integration
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Quick Commands */}
          <div className="w-[200px] flex flex-col items-end gap-2 pointer-events-auto hidden md:flex pb-4">
            <button className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-2 hover:text-slate-600 transition-colors">
              Quick Command <ChevronDown className="w-3 h-3" />
            </button>
            {allowedAgents.includes('documentation') && (
              <button className="px-4 py-2 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-sm">
                Generate Discharge Summary
              </button>
            )}
            {allowedAgents.includes('imaging') && (
              <button className="px-4 py-2 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-sm">
                Compare latest X-Rays
              </button>
            )}
            {allowedAgents.includes('triage') && (
              <button className="px-4 py-2 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-sm">
                Escalate critical vitals
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple simulated toggle icons for UI controls
function ToggleLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="5" width="22" height="14" rx="7" fill="none" />
      <circle cx="8" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

function ToggleRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="5" width="22" height="14" rx="7" fill="none" />
      <circle cx="16" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}
