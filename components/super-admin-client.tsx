'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Users, Shield, Activity, Hexagon, Plus, Trash2, LogOut, 
  Cpu, HardDrive, Server, ShieldCheck, Database, ScrollText, 
  AlertTriangle, Edit, Check, BarChart2, History, Settings, RefreshCw, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  logoutAction, 
  createUserAction, 
  deleteUserAction, 
  editUserAction, 
  getComputeConfigAction, 
  saveComputeConfigAction, 
  getAuditLogsAction,
  addAuditLogAction,
  getAppointmentsAction,
  getAiUsageAction,
  AuditLog,
  Appointment,
  AiUsageLog
} from '../app/actions';
import { type User } from '@/lib/types';

interface SuperAdminClientProps {
  username: string;
  role: string;
  users: User[];
}

const AVAILABLE_AGENTS = [
  { id: 'scribe', name: 'Scribe Agent' },
  { id: 'triage', name: 'Triage Agent' },
  { id: 'conversational', name: 'Conversational Agent' },
  { id: 'imaging', name: 'Imaging Agent' },
  { id: 'documentation', name: 'Documentation Agent' },
];

export default function SuperAdminClient({ username, role, users: initialUsers }: SuperAdminClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sidebar navigation selection
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'patients' | 'ai-reports' | 'logs' | 'config'>('overview');
  
  // IT Settings States
  const [computeTarget, setComputeTarget] = useState<'GCP' | 'LOCAL'>('GCP');
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434');
  const [gcpProjectId, setGcpProjectId] = useState('suvi-clinical-production-node');
  const [gcpRegion, setGcpRegion] = useState('asia-south1 (Mumbai)');
  const [firestoreDatabaseId, setFirestoreDatabaseId] = useState('suvi-hms-db-live');
  const [cloudSqlInstance, setCloudSqlInstance] = useState('suvi-sql-server-master');

  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // AI Usage & Filters states
  const [aiUsageLogs, setAiUsageLogs] = useState<AiUsageLog[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'doctor' | 'nurse' | 'receptionist' | 'admin'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('all');
  const [auditRouteFilter, setAuditRouteFilter] = useState('all');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Load backend states
  const refreshConfigAndLogs = React.useCallback(() => {
    getComputeConfigAction().then(res => {
      setComputeTarget(res.computeTarget);
      setLocalEndpoint(res.localEndpoint);
      setGcpProjectId(res.gcpProjectId);
      setGcpRegion(res.gcpRegion);
      setFirestoreDatabaseId(res.firestoreDatabaseId);
      setCloudSqlInstance(res.cloudSqlInstance);
    });
    getAuditLogsAction().then(res => {
      setAuditLogs(res);
    });
    getAppointmentsAction().then(res => {
      setAppointments(res);
      if (res.length > 0 && !selectedPatientId) {
        setSelectedPatientId(res[0].id);
      }
    });
    getAiUsageAction().then(res => {
      setAiUsageLogs(res);
    });
  }, [selectedPatientId]);

  useEffect(() => {
    refreshConfigAndLogs();
  }, [refreshConfigAndLogs]);

  const handleLogout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await logoutAction();
      router.push('/login');
    });
  };

  // User CRUD handlers
  const handleCreateOrEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editingUser) {
        await editUserAction(formData, role);
      } else {
        await createUserAction(formData, role);
      }
      
      const userid = formData.get('userid') as string;
      const name = formData.get('name') as string;
      const userRole = formData.get('role') as any;
      const posting = formData.get('posting') as string;
      const agents = formData.getAll('agents') as string[];
      
      if (editingUser) {
        setUsers(users.map(u => u.userid === userid ? { ...u, name, role: userRole, posting, agents } : u));
      } else {
        setUsers([...users, { userid, name, role: userRole, posting, agents }]);
      }

      setIsAdding(false);
      setEditingUser(null);
    });
  };

  const handleDeleteUser = (userid: string) => {
    if (confirm(`Are you sure you want to delete user ${userid}?`)) {
      startTransition(async () => {
        await deleteUserAction(userid, role);
        setUsers(users.filter(u => u.userid !== userid));
      });
    }
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setIsAdding(true);
  };

  const handleNewUserClick = () => {
    if (isAdding && !editingUser) {
      setIsAdding(false);
    } else {
      setEditingUser(null);
      setIsAdding(true);
    }
  };

  // IT Config Submit
  const handleSaveComputeConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveComputeConfigAction(formData, role);
      if (res.success && res.config) {
        setComputeTarget(res.config.computeTarget);
        setLocalEndpoint(res.config.localEndpoint);
        setGcpProjectId(res.config.gcpProjectId);
        setGcpRegion(res.config.gcpRegion);
        setFirestoreDatabaseId(res.config.firestoreDatabaseId);
        setCloudSqlInstance(res.config.cloudSqlInstance);
        
        getAuditLogsAction().then(logs => setAuditLogs(logs));
        alert("IT Support system configs updated successfully.");
      }
    });
  };

  const runPingTest = () => {
    setPingStatus('testing');
    setTimeout(() => {
      setPingStatus('success');
      setTimeout(() => setPingStatus('idle'), 2000);
    }, 1500);
  };

  const handleTriggerAudit = () => {
    addAuditLogAction('admin', 'admin', 'Triggered CGHS claim audit simulation').then(() => {
      getAuditLogsAction().then(res => setAuditLogs(res));
    });
  };

  const currentPatient = appointments.find(p => p.id === selectedPatientId);

  return (
    <div className="min-h-screen bg-transparent font-body text-slate-800 flex relative overflow-hidden selection:bg-indigo-100 w-full">
      
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 bg-white/40 backdrop-blur-xl text-slate-600 flex flex-col justify-between p-6 z-20 border-r border-white/60 shadow-lg shrink-0 h-screen sticky top-0">
        <div className="flex flex-col gap-8">
          
          {/* Sidebar Brand Logo */}
          <div className="flex items-center gap-3 border-b border-slate-200/60 pb-5">
            <Hexagon className="w-8 h-8 text-zinc-900 fill-zinc-900/10 animate-spin-slow" />
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-lg tracking-tight text-zinc-900">SUVI AI</span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase font-bold">Main Control Panel</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 text-sm">
            <button
              onClick={() => setActiveSection('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'overview' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Overview Metrics
            </button>

            <button
              onClick={() => setActiveSection('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'users' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              User Allotment
            </button>

            <button
              onClick={() => setActiveSection('patients')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'patients' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
              }`}
            >
              <History className="w-4 h-4" />
              Patient Flow Track
            </button>

            <button
              onClick={() => setActiveSection('ai-reports')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'ai-reports' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Status & Usage
            </button>

            <button
              onClick={() => setActiveSection('logs')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'logs' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              Security Audit Logs
            </button>

            <button
              onClick={() => setActiveSection('config')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'config' ? 'bg-zinc-900 text-white shadow-md font-semibold' : 'text-slate-500 hover:bg-white/60 hover:text-zinc-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Intranet Node Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200/60 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Clinical Node Live</span>
          </div>
          <form onSubmit={handleLogout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 py-2.5 rounded-xl text-xs transition-colors border border-slate-200/60"
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
              {activeSection === 'overview' ? 'AI Workspace Metrics' :
               activeSection === 'users' ? 'Clinical Capability Allocator' :
               activeSection === 'patients' ? 'Patient Flow Tracker' :
               activeSection === 'ai-reports' ? 'AI Swarm & Usage Reports' :
               activeSection === 'logs' ? 'HIPAA Cryptographic Auditing' : 'Intranet Sidecar Settings'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Logged in as {username} • Control panel authorized.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border shadow-sm ${
              computeTarget === 'GCP' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-purple-50 text-purple-700 border-purple-100'
            }`}>
              {computeTarget === 'GCP' ? 'ACTIVE MODEL: Vertex AI (GCP)' : `ACTIVE MODEL: Local AI Server (${localEndpoint})`}
            </span>
          </div>
        </header>

        <AnimatePresence mode="wait">
                   {/* ========================================================
              OVERVIEW / METRICS SECTION
             ======================================================== */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Analytics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Total Active Channels</span>
                    <span className="text-2xl font-bold text-slate-800 block mt-1">5 Nodes Online</span>
                  </div>
                  <Bot className="w-10 h-10 text-indigo-500 bg-indigo-50 p-2.5 rounded-full" />
                </div>

                <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Patients Routed today</span>
                    <span className="text-2xl font-bold text-slate-800 block mt-1">{appointments.length} Tickets</span>
                  </div>
                  <History className="w-10 h-10 text-cyan-500 bg-cyan-50 p-2.5 rounded-full" />
                </div>

                <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Cryptographic Signatures</span>
                    <span className="text-2xl font-bold text-slate-800 block mt-1">{auditLogs.length} Records</span>
                  </div>
                  <ShieldCheck className="w-10 h-10 text-emerald-500 bg-emerald-50 p-2.5 rounded-full" />
                </div>

                <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Avg Gateway Latency</span>
                    <span className="text-2xl font-bold text-slate-800 block mt-1">12ms</span>
                  </div>
                  <Activity className="w-10 h-10 text-rose-500 bg-rose-50 p-2.5 rounded-full animate-pulse" />
                </div>

              </div>

              {/* Status report logs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Active compute load chart */}
                <div className="glass-panel p-6 rounded-3xl md:col-span-2 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h3 className="font-heading font-semibold text-slate-800 text-sm uppercase tracking-wider mb-2">Live IT Node System Load</h3>
                    <p className="text-xs text-slate-400 mb-4">Host metrics tracked dynamically across local sidecar bridges.</p>
                  </div>
                  
                  {/* Graph simulator bars */}
                  <div className="flex justify-between items-end h-36 gap-3 pt-6 px-4">
                    {[18, 32, 28, 49, 64, 45, 52, 58, 42, 35, 29, 14].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-indigo-600/10 rounded-t-lg relative group flex items-end animate-fade-in" style={{ height: `${h}%` }}>
                          <div className="absolute inset-0 bg-indigo-600 rounded-t-lg scale-y-0 group-hover:scale-y-100 origin-bottom transition-all duration-300" />
                        </div>
                        <span className="text-[8px] font-mono text-slate-400">T{i*5}m</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compute resources status */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-slate-800 text-sm tracking-wider uppercase mb-4">Clinical Host Diagnostics</h3>
                    <div className="space-y-4 text-xs font-mono">
                      <div className="flex justify-between items-center bg-white/40 border border-white/60 p-3 rounded-xl shadow-sm">
                        <span>CPU Limit:</span>
                        <span className="font-bold text-slate-800">4.8%</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/40 border border-white/60 p-3 rounded-xl shadow-sm">
                        <span>Sidecar Buffer:</span>
                        <span className="font-bold text-slate-800">32 MB</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/40 border border-white/60 p-3 rounded-xl shadow-sm">
                        <span>HMS Firestore:</span>
                        <span className="text-emerald-500 font-bold">CONNECTED</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/50 flex gap-2">
                    <button
                      onClick={runPingTest}
                      className="w-full bg-zinc-950 hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Verify Host Ping
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ========================================================
              USER MANAGEMENT & CAPABILITIES ALLOCATION
             ======================================================== */}
          {activeSection === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* User allocation listing */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {/* Role selection filters */}
                <div className="flex gap-2 mb-2 bg-slate-100/50 p-1 rounded-xl w-fit border border-slate-200/30">
                  {(['all', 'doctor', 'nurse', 'receptionist', 'admin'] as const).map(roleBtn => (
                    <button
                      key={roleBtn}
                      onClick={() => setUserRoleFilter(roleBtn)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        userRoleFilter === roleBtn ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {roleBtn}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[550px] pr-1">
                  {users
                    .filter(u => userRoleFilter === 'all' ? true : u.role === userRoleFilter)
                    .map(user => (
                      <div key={user.userid} className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200/60 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-100 to-slate-50 border border-white flex items-center justify-center shrink-0 shadow-inner">
                            <Users className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-lg text-zinc-900">{user.name}</h3>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              <span className="text-[10px] font-mono font-bold tracking-wide uppercase bg-slate-200 px-2 py-0.5 rounded text-slate-600 border border-slate-300/40">
                                {user.role}
                              </span>
                              {user.posting && (
                                <span className="text-[10px] font-mono font-semibold tracking-wide bg-indigo-50 px-2 py-0.5 rounded text-indigo-600 border border-indigo-100">
                                  Station: {user.posting}
                                </span>
                              )}
                              <span className="text-xs text-slate-400 font-mono ml-2">ID: {user.userid}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {user.agents.map(ag => (
                              <span key={ag} className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider" title={ag}>
                                {ag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {user.userid !== 'superadmin' && (
                              <button 
                                onClick={() => openEditForm(user)}
                                className="text-xs text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                            )}
                            {user.userid !== 'superadmin' && (
                              <button 
                                onClick={() => handleDeleteUser(user.userid)}
                                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Edit allocation form */}
              <div className="lg:col-span-1">
                <div className="glass-panel p-6 rounded-3xl border-slate-200/50 shadow-lg bg-white/70">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                    <h2 className="font-heading font-bold text-lg text-zinc-950">
                      {editingUser ? 'Edit Capabilities' : 'Allot New Capabilities'}
                    </h2>
                    {editingUser && (
                      <button onClick={handleNewUserClick} className="text-xs text-indigo-600 hover:underline font-semibold">Cancel</button>
                    )}
                  </div>
                  
                  <form onSubmit={handleCreateOrEditUser} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                      <input type="text" name="name" defaultValue={editingUser?.name || ''} required className="bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 text-xs" placeholder="e.g. Dr. Chang" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">User ID</label>
                      <input type="text" name="userid" defaultValue={editingUser?.userid || ''} readOnly={!!editingUser} required className={`border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 text-xs ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white/50'}`} placeholder="e.g. doctor" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Password {editingUser && '(Optional)'}</label>
                      <input type="password" name="password" required={!editingUser} className="bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 text-xs" placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Password'} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">System Role</label>
                      <select name="role" defaultValue={editingUser?.role || 'doctor'} required className="bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 text-xs text-slate-700">
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="admin">IT Admin</option>
                        <option value="receptionist">Receptionist</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Station / Posting (Department)</label>
                      <input type="text" name="posting" defaultValue={editingUser?.posting || ''} required className="bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 text-xs" placeholder="e.g. Radiology, NICU, Front Desk" />
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide mb-1">Allocate Swarm Agents</label>
                      {[
                        { id: 'scribe', name: 'Scribe Agent', desc: 'Consultation Hinglish ambient SOAP charting' },
                        { id: 'triage', name: 'Triage Agent', desc: 'Bed telemetry vital signal logs sync' },
                        { id: 'conversational', name: 'Conversational Agent', desc: 'ABHA sync & Dialogflow voice call verification' },
                        { id: 'imaging', name: 'Imaging Agent', desc: 'PACS Chest PA analysis via Vertex VLM' },
                        { id: 'documentation', name: 'Documentation Agent', desc: 'CDSCO drug checks & PMJAY CGHS pre-auth mapping' }
                      ].map(agent => (
                        <label key={agent.id} className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer p-1.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                          <input 
                            type="checkbox" 
                            name="agents" 
                            value={agent.id} 
                            defaultChecked={editingUser?.agents.includes(agent.id) || editingUser?.agents.includes('all')} 
                            className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-400 mt-0.5" 
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{agent.name}</span>
                            <span className="text-[9px] text-slate-400">{agent.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button type="submit" disabled={isPending} className="w-full black-button rounded-xl py-3 mt-4 text-xs font-semibold shadow-md">
                      {editingUser ? 'Apply User Allotment' : 'Provision User Capabilities'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              PATIENT FLOW TRACKER (OPD -> X-RAY -> ICU TIMELINE)
             ======================================================== */}
          {activeSection === 'patients' && (
            <motion.div
              key="patients"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Directory list */}
              <div className="lg:col-span-1 flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
                <h3 className="font-heading font-semibold text-xs uppercase text-slate-400 tracking-wider mb-2">Patients Registered</h3>
                {appointments.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      selectedPatientId === p.id ? 'bg-white border-indigo-300 shadow-md scale-[1.01]' : 'bg-white/60 border-slate-100'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-xs">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">ABHA: {p.abhaId}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      p.status === 'ICU_Transferred' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      p.status === 'DiagnosticsComplete' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      p.status === 'Diagnosing' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Journey Timeline & Details */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-3xl min-h-[420px] flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-md text-slate-800 border-b border-slate-100 pb-3 mb-6 flex justify-between items-center">
                    <span>Clinical Admissions Journey Tracker</span>
                    {currentPatient && (
                      <span className="font-mono text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded border border-indigo-100 font-semibold">{currentPatient.id}</span>
                    )}
                  </h3>

                  {currentPatient ? (
                    <div className="flex flex-col md:flex-row gap-8">
                      
                      {/* Left side: Timeline events */}
                      <div className="flex-1 relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {currentPatient.admissionHistory && currentPatient.admissionHistory.length > 0 ? (
                          currentPatient.admissionHistory.map((history, idx) => (
                            <div key={idx} className="relative animate-fade-in">
                              <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 bg-white flex items-center justify-center ${
                                history.stage.toLowerCase().includes('opd') ? 'border-slate-900' :
                                history.stage.toLowerCase().includes('scribe') || history.stage.toLowerCase().includes('encounter') ? 'border-indigo-500' :
                                history.stage.toLowerCase().includes('pacs') || history.stage.toLowerCase().includes('image') ? 'border-cyan-500' : 'border-rose-500'
                              }`} />
                              <div className="flex flex-col">
                                <div className="flex justify-between items-start flex-wrap gap-1">
                                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                                    {history.stage}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">{history.timestamp}</span>
                                </div>
                                <span className="font-bold text-slate-800 text-xs mt-0.5">
                                  {history.stationName} • {history.operatorName} ({history.operatorRole})
                                </span>
                                <p className="text-xs text-slate-500 mt-1 bg-white/40 border border-slate-200/40 p-2.5 rounded-xl">
                                  {history.details}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No admission events logged for this patient.</p>
                        )}
                      </div>

                      {/* Right side: Clinical & Logistics summary */}
                      <div className="w-full md:w-80 bg-white/50 border border-slate-100 p-5 rounded-2xl flex flex-col gap-4 text-xs shadow-inner shrink-0 self-start">
                        <div className="border-b border-slate-100 pb-2">
                          <h4 className="font-bold text-slate-800">PHI & Claims Registry</h4>
                        </div>
                        <div className="space-y-3.5 font-mono text-[10px] text-slate-700">
                          <div>
                            <span className="text-slate-400 block mb-0.5">CURRENT BED / ROOM:</span>
                            <span className="font-sans font-bold px-2 py-0.5 rounded bg-slate-100 border text-slate-800 font-mono">
                              {currentPatient.status === 'ICU_Transferred' ? 'ICU-01 Bed Ward' : 'OPD Desk Consultation'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">ABHA ADDRESS:</span>
                            <span className="font-bold text-indigo-600 select-all">{currentPatient.abhaId}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">PATIENT AGE / GENDER:</span>
                            <span className="font-bold text-slate-900">{currentPatient.age} Yrs / {currentPatient.gender}</span>
                          </div>
                          {currentPatient.cghsCode && (
                            <div>
                              <span className="text-slate-400 block mb-0.5">CGHS PACKAGE CODE:</span>
                              <span className="font-bold text-slate-800">{currentPatient.cghsCode}</span>
                            </div>
                          )}
                          {currentPatient.pmjayPackage && (
                            <div>
                              <span className="text-slate-400 block mb-0.5">AB-PMJAY DISCHARGE:</span>
                              <span className="font-bold text-slate-800 font-sans leading-tight block">{currentPatient.pmjayPackage}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-400 block mb-0.5">CASHLESS INSURANCE:</span>
                            <span className={`font-sans font-bold text-[9px] px-2 py-0.5 rounded border inline-block ${
                              currentPatient.isPreAuthApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {currentPatient.isPreAuthApproved ? 'PRE-AUTH APPROVED' : 'PENDING GATEWAY SUBMIT'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Please select a patient from the directory to review history.</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 flex gap-2 justify-end text-xs">
                  <span className="text-slate-400 font-semibold font-mono">Tauri HMS SQL Engine Synced • verified</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              AI USAGE & STATUS REPORTS SECTION
             ======================================================== */}
          {activeSection === 'ai-reports' && (
            <motion.div
              key="ai-reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 w-full"
            >
              {/* AI Agent Nodes Status grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: 'ASR Scribe Agent', cap: 'scribe', api: 'Vertex Speech STT / Chirp', desc: 'Hinglish audio to SOAP transcriber' },
                  { name: 'Triage ICU Agent', cap: 'triage', api: 'Continuous Telemetry Monitor', desc: 'Bed telemetry vital signal parsing' },
                  { name: 'PACS Multimodal VLM', cap: 'imaging', api: 'Vertex Multimodal VLM Node', desc: 'PA Chest X-Ray studies diagnostic' },
                  { name: 'Bhashini Translator', cap: 'conversational', api: 'GCP Translation / Bhashini', desc: '22 vernacular Indian translations' },
                  { name: 'Dialogflow voicebot', cap: 'conversational', api: 'Dialogflow CX Telephony Node', desc: 'ABHA voice registry call verification' }
                ].map((node, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-2xl flex flex-col justify-between min-h-[140px] border-slate-200/50">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800 leading-tight">{node.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{node.desc}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-slate-500 truncate">Node: {node.api}</span>
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 w-fit">
                        {node.cap}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Token usages metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Stats */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between border-slate-200/50">
                  <h3 className="font-heading font-semibold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Swarm Telemetry Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/40 border border-white/60 p-3 rounded-xl shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">AI Agent Triggers:</span>
                      <span className="text-sm font-bold font-mono text-slate-800">{aiUsageLogs.length} Executions</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/40 border border-white/60 p-3 rounded-xl shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">Accumulated Tokens:</span>
                      <span className="text-sm font-bold font-mono text-slate-800">
                        {aiUsageLogs.reduce((acc, curr) => acc + curr.tokens, 0).toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/40 border border-white/60 p-3 rounded-xl shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">Avg Compute Latency:</span>
                      <span className="text-sm font-bold font-mono text-indigo-600">
                        {aiUsageLogs.length > 0 ? Math.round(aiUsageLogs.reduce((acc, curr) => acc + curr.latency, 0) / aiUsageLogs.length) : 0}ms
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 mt-4 text-center">GCP API Endpoint Gateway Online</div>
                </div>

                {/* Token Chart */}
                <div className="glass-panel p-6 rounded-3xl md:col-span-2 flex flex-col justify-between border-slate-200/50">
                  <div>
                    <h3 className="font-heading font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">Live Token Consumption Logs</h3>
                    <p className="text-[10px] text-slate-400 mb-4">Token usage volume across the last 10 transactions.</p>
                  </div>
                  
                  <div className="flex justify-between items-end h-32 gap-3.5 px-2">
                    {aiUsageLogs.slice(0, 10).map((log, idx) => {
                      const maxTokens = 2500;
                      const pct = Math.min((log.tokens / maxTokens) * 100, 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[8px] font-mono text-slate-400 font-bold">{log.tokens}</span>
                          <div className="w-full bg-slate-100 rounded-t-lg relative group flex items-end h-24">
                            <div 
                              className={`w-full rounded-t-lg transition-all duration-300 ${
                                log.capability === 'scribe' ? 'bg-indigo-500' :
                                log.capability === 'imaging' ? 'bg-cyan-500' :
                                log.capability === 'triage' ? 'bg-rose-500' :
                                log.capability === 'documentation' ? 'bg-amber-500' : 'bg-purple-500'
                              }`} 
                              style={{ height: `${pct}%` }} 
                            />
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-950 text-white text-[8px] font-mono p-1 rounded whitespace-nowrap z-30 shadow-md">
                              {log.user} ({log.capability})
                            </div>
                          </div>
                          <span className="text-[7px] font-mono text-slate-500 uppercase">{log.capability.substring(0, 3)}</span>
                        </div>
                      );
                    })}
                    {aiUsageLogs.length === 0 && (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">No AI transactions recorded.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Transactions log registry */}
              <div className="glass-panel p-6 rounded-3xl border-slate-200/50">
                <h3 className="font-heading font-semibold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">AI Transactions Audit Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/40 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                        <th className="py-2">Timestamp</th>
                        <th className="py-2">User Context</th>
                        <th className="py-2">Capability</th>
                        <th className="py-2">API Endpoint / Model</th>
                        <th className="py-2">Tokens</th>
                        <th className="py-2">Latency</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {aiUsageLogs.map((log, idx) => (
                        <tr key={idx} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 pr-2 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                          <td className="py-2.5 pr-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/50 text-[10px] font-semibold uppercase mr-1">{log.role}</span>
                            <span className="font-semibold text-slate-800">{log.user}</span>
                          </td>
                          <td className="py-2.5 pr-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              log.capability === 'scribe' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              log.capability === 'imaging' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                              log.capability === 'triage' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              log.capability === 'documentation' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                            }`}>{log.capability}</span>
                          </td>
                          <td className="py-2.5 pr-2 text-slate-500 font-sans">{log.apiUsed}</td>
                          <td className="py-2.5 pr-2 text-slate-700 font-bold">{log.tokens}</td>
                          <td className="py-2.5 pr-2 text-slate-600">{log.latency}ms</td>
                          <td className="py-2.5 text-right font-bold text-emerald-500">{log.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              SECURITY AUDIT SECTION
             ======================================================== */}
          {activeSection === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6 rounded-3xl flex-1 flex flex-col border-slate-200/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
                <div>
                  <h2 className="font-heading font-semibold text-lg text-slate-800">Tamper-Resistant HIPAA Logs</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Cryptographic signature verification tracking PHI interactions.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleTriggerAudit}
                    className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    Simulate Access Event
                  </button>
                </div>
              </div>

              {/* Filters & Search bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-mono font-bold text-slate-400 uppercase">Search logs</label>
                  <input
                    type="text"
                    placeholder="Search by User, Action, Sign..."
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    className="bg-white border rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-mono font-bold text-slate-400 uppercase">Filter by user role</label>
                  <select
                    value={auditRoleFilter}
                    onChange={e => setAuditRoleFilter(e.target.value)}
                    className="bg-white border rounded-xl px-2 py-1.5 text-xs outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">IT Admin</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-mono font-bold text-slate-400 uppercase">Filter by compute target</label>
                  <select
                    value={auditRouteFilter}
                    onChange={e => setAuditRouteFilter(e.target.value)}
                    className="bg-white border rounded-xl px-2 py-1.5 text-xs outline-none"
                  >
                    <option value="all">All Routes</option>
                    <option value="GCP">GCP Vertex AI</option>
                    <option value="LOCAL">Local On-Prem Node</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px] flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/40 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="py-2.5">Timestamp</th>
                      <th className="py-2.5">User Context</th>
                      <th className="py-2.5">Activity Description</th>
                      <th className="py-2.5">Route</th>
                      <th className="py-2.5 text-right">Encrypted Hash Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {auditLogs
                      .filter(log => {
                        const matchesSearch = log.user.toLowerCase().includes(auditSearch.toLowerCase()) || 
                                              log.action.toLowerCase().includes(auditSearch.toLowerCase()) || 
                                              log.sign.toLowerCase().includes(auditSearch.toLowerCase());
                        const matchesRole = auditRoleFilter === 'all' ? true : log.role === auditRoleFilter;
                        const matchesRoute = auditRouteFilter === 'all' ? true : log.computeRoute === auditRouteFilter;
                        return matchesSearch && matchesRole && matchesRoute;
                      })
                      .map((log, idx) => (
                        <tr 
                          key={log.timestamp + idx} 
                          onClick={() => setSelectedAuditLog(selectedAuditLog?.sign === log.sign ? null : log)}
                          className="text-slate-600 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 pr-2 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                          <td className="py-3 pr-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/50 text-[10px] font-semibold uppercase mr-1">{log.role}</span>
                            <span className="font-semibold text-slate-800">{log.user}</span>
                          </td>
                          <td className="py-3 pr-2 font-body text-slate-700 max-w-sm truncate" title={log.action}>{log.action}</td>
                          <td className="py-3 pr-2 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              log.computeRoute === 'GCP' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                            }`}>{log.computeRoute}</span>
                          </td>
                          <td className="py-3 text-right text-indigo-500/80 font-bold whitespace-nowrap flex items-center gap-1.5 justify-end">
                            <span className="text-[8px] text-emerald-500 font-bold px-1 rounded bg-emerald-50 border border-emerald-100">VERIFIED</span>
                            <span>{log.sign}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Audit details expansion dialog */}
                <AnimatePresence>
                  {selectedAuditLog && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 p-4 border border-indigo-100 bg-indigo-50/20 rounded-2xl text-[10px] font-mono text-slate-700"
                    >
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2 mb-2">
                        <span className="font-bold text-indigo-600 uppercase">HIPAA AUDIT COMPLIANCE RECORD</span>
                        <button onClick={() => setSelectedAuditLog(null)} className="text-slate-400 hover:text-slate-600">Close</button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div><span className="text-slate-400 block">ACCESS TIMESTAMP:</span> {selectedAuditLog.timestamp}</div>
                        <div><span className="text-slate-400 block">AUTHORIZATION ROLE:</span> {selectedAuditLog.role.toUpperCase()}</div>
                        <div><span className="text-slate-400 block">CLIENT HOST ADDRESS:</span> {selectedAuditLog.ip}</div>
                        <div><span className="text-slate-400 block">COMPUTE SUITE TARGET:</span> {selectedAuditLog.computeRoute}</div>
                        <div className="col-span-2"><span className="text-slate-400 block">ACTIVITY DESCRIPTION:</span> {selectedAuditLog.action}</div>
                        <div className="col-span-2"><span className="text-slate-400 block">SHA-256 INTEGRITY SIGNATURE:</span> {selectedAuditLog.sign}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              INTRANET NODE CONFIGS SECTION
             ======================================================== */}
          {activeSection === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <form onSubmit={handleSaveComputeConfig} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                {/* Database & Compute Toggle Card */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[200px] border-slate-200/50">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-slate-800 flex items-center gap-2">
                      <Server className="w-5 h-5 text-indigo-600 animate-pulse" /> Compute Model Target
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Determine where clinical AI pipelines are processed.</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <select
                      name="computeTarget"
                      value={computeTarget}
                      onChange={e => setComputeTarget(e.target.value as any)}
                      className="bg-white border p-2.5 rounded-xl text-xs font-semibold outline-none text-slate-700 font-mono"
                    >
                      <option value="GCP">GCP Cloud Services (Vertex AI)</option>
                      <option value="LOCAL">On-Premise Local AI Server</option>
                    </select>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">Local AI Server Endpoint</label>
                      <input
                        type="text"
                        name="localEndpoint"
                        value={localEndpoint}
                        onChange={e => setLocalEndpoint(e.target.value)}
                        className="bg-white border p-2 rounded-xl text-xs outline-none font-mono"
                        placeholder="http://localhost:11434"
                      />
                    </div>
                  </div>
                </div>

                {/* Secure Local DB Node Status */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[200px] border-slate-200/50">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-slate-800 flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" /> Cloud SQL & Firestore Configuration
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">GCP instance linkages for clinic tables.</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4 text-xs font-mono text-slate-700">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">GCP Project ID</label>
                      <input type="text" name="gcpProjectId" value={gcpProjectId} onChange={e => setGcpProjectId(e.target.value)} className="bg-white border p-1.5 rounded-xl text-xs font-mono outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">GCP Region</label>
                      <input type="text" name="gcpRegion" value={gcpRegion} onChange={e => setGcpRegion(e.target.value)} className="bg-white border p-1.5 rounded-xl text-xs font-mono outline-none" />
                    </div>
                  </div>
                </div>

                {/* System Health Indicators & Action Submit */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[200px] border-slate-200/50">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-slate-800 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-indigo-600" /> Gateway Diagnostics
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Status of compiled host sidecar modules.</p>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex justify-between items-center bg-white/40 p-2.5 rounded-xl border border-white/60 text-xs font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                        <span>Host Latency:</span>
                      </div>
                      {pingStatus === 'idle' && (
                        <button type="button" onClick={runPingTest} className="text-indigo-600 hover:underline">Run Ping</button>
                      )}
                      {pingStatus === 'testing' && <span className="animate-pulse text-amber-500 font-semibold">Testing...</span>}
                      {pingStatus === 'success' && <span className="text-emerald-500 font-bold flex items-center gap-0.5"><Check className="w-3.5 h-3.5" /> 12ms (OK)</span>}
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-zinc-900 text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-black transition-colors"
                    >
                      Save & Apply Settings
                    </button>
                  </div>
                </div>

                {/* Hidden fields */}
                <input type="hidden" name="firestoreDatabaseId" value={firestoreDatabaseId} />
                <input type="hidden" name="cloudSqlInstance" value={cloudSqlInstance} />
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
