'use client';

import React, { useState, useTransition } from 'react';
import { 
  Users, Shield, Activity, Hexagon, Plus, Trash2, LogOut, 
  Cpu, HardDrive, Server, ShieldCheck, Database, ToggleLeft, ToggleRight, ScrollText, AlertTriangle, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { logoutAction, createUserAction, deleteUserAction, editUserAction } from '../app/actions';
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

// Simulated live HIPAA/DPDP cryptographic audit logs
const INITIAL_AUDIT_LOGS = [
  { timestamp: '2026-05-25 20:45:12', user: 'doctor', role: 'doctor', action: 'Decrypted ambient audio record for Scribe transcription', bed: 'Bed 01', ip: '10.12.4.88', sign: '0x88f2a...2efb' },
  { timestamp: '2026-05-25 20:48:33', user: 'nurse', role: 'nurse', action: 'Updated inpatient blood pressure logs & vital triggers', bed: 'Bed 02', ip: '10.12.4.92', sign: '0x17c9b...44a1' },
  { timestamp: '2026-05-25 20:52:19', user: 'doctor', role: 'doctor', action: 'Requested AI differential diagnosis check via Consultant Agent', bed: 'Bed 01', ip: '10.12.4.88', sign: '0xa41e5...c78d' },
  { timestamp: '2026-05-25 20:56:04', user: 'nurse', role: 'nurse', action: 'Generated regional dialect printout for patient discharge instructions', bed: 'Bed 03', ip: '10.12.4.92', sign: '0x55d09...08eb' },
];

export default function SuperAdminClient({ username, role, users: initialUsers }: SuperAdminClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();
  
  // IT Admin infrastructure states
  const [isCloudInference, setIsCloudInference] = useState(true);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  
  const handleLogout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await logoutAction();
      router.push('/login');
    });
  };

  const handleCreateOrEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editingUser) {
        await editUserAction(formData, role);
      } else {
        await createUserAction(formData, role);
      }
      
      // Optistic update for demo purposes
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

  const handleTriggerAudit = () => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog = {
      timestamp,
      user: 'doctor',
      role: 'doctor',
      action: 'Triggered CGHS claim codes compilation via Coder Agent',
      bed: 'Bed 02',
      ip: '10.12.4.88',
      sign: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  return (
    <div className="min-h-screen bg-transparent font-body text-slate-800 p-4 md:p-6 flex relative overflow-hidden selection:bg-indigo-100 w-full">
      {/* Floating Top Navigation */}
      <header className="absolute top-6 left-0 right-0 flex justify-between items-center px-6 md:px-16 z-20 pointer-events-none w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Hexagon className="w-7 h-7 text-zinc-900 fill-zinc-900" />
          <span className="font-heading font-semibold text-xl tracking-tight text-zinc-900">SUVI AI</span>
          <span className="text-xs font-mono font-medium bg-zinc-900 text-white px-2 py-1 rounded-md ml-2 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {role === 'superadmin' ? 'Super Admin' : 'IT Admin Support'}
          </span>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <form onSubmit={handleLogout}>
            <button type="submit" className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col relative z-10 pt-24 pb-16">
        
        {/* Render Super Admin Workspace */}
        {role === 'superadmin' ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-heading text-zinc-900 mb-2">User Management</h1>
                <p className="text-sm text-slate-500">Configure roles, postings, and AI capabilities across the organization.</p>
              </div>
              <button 
                onClick={handleNewUserClick}
                className="black-button px-5 py-2.5 rounded-full flex items-center gap-2 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                {(isAdding && !editingUser) ? 'Cancel' : 'New User'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User List Panel */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {users.map(user => (
                  <div key={user.userid} className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-white flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-zinc-900">{user.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="text-xs font-mono font-medium tracking-wide uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">
                            {user.role}
                          </span>
                          {user.posting && (
                            <span className="text-xs font-mono font-medium tracking-wide bg-indigo-50 px-2 py-0.5 rounded text-indigo-600 border border-indigo-100">
                              {user.posting}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono ml-2">ID: {user.userid}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {user.agents.map(ag => (
                          <span key={ag} className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" title={ag} />
                        ))}
                        <span className="text-xs font-mono ml-1">{user.agents.length === 1 && user.agents[0] === 'all' ? 'All Agents' : `${user.agents.length} Agents`}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {user.userid !== 'superadmin' && (
                          <button 
                            onClick={() => openEditForm(user)}
                            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                        {user.userid !== 'superadmin' && (
                          <button 
                            onClick={() => handleDeleteUser(user.userid)}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New/Edit User Form Panel */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="lg:col-span-1"
                  >
                    <div className="glass-panel p-6 rounded-3xl sticky top-24">
                      <h2 className="font-heading font-medium text-xl text-zinc-900 mb-6">
                        {editingUser ? 'Edit Configuration' : 'Create Configuration'}
                      </h2>
                      <form onSubmit={handleCreateOrEditUser} className="flex flex-col gap-4">
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">Full Name</label>
                          <input type="text" name="name" defaultValue={editingUser?.name || ''} required className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-300 text-sm" placeholder="e.g. Dr. Sarah Chen" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">User ID</label>
                          <input type="text" name="userid" defaultValue={editingUser?.userid || ''} readOnly={!!editingUser} required className={`border border-white/60 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-300 text-sm ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white/50'}`} placeholder="e.g. schen_rad" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">Password {editingUser && '(Optional)'}</label>
                          <input type="password" name="password" required={!editingUser} className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-300 text-sm" placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Default password'} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">System Role</label>
                          <select name="role" defaultValue={editingUser?.role || 'doctor'} required className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-300 text-sm text-slate-700">
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wide">Posting / Dept</label>
                          <input type="text" name="posting" defaultValue={editingUser?.posting || ''} required className="bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-300 text-sm" placeholder="e.g. Radiology, NICU" />
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                          <label className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-1">Allowed Capabilities (Agents)</label>
                          {AVAILABLE_AGENTS.map(agent => (
                            <label key={agent.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                              <input type="checkbox" name="agents" value={agent.id} defaultChecked={editingUser?.agents.includes(agent.id) || editingUser?.agents.includes('all')} className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                              {agent.name}
                            </label>
                          ))}
                        </div>

                        <button type="submit" className="w-full black-button rounded-xl py-3 mt-4 text-sm font-medium">
                          {editingUser ? 'Save Changes' : 'Provision User'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Render IT Admin Infrastructure Support Workspace */
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <div>
                <h1 className="text-4xl font-heading text-zinc-900 mb-2">System Support Panel</h1>
                <p className="text-sm text-slate-500">Monitor local node parameters, configure AI model targets, and review HIPAA logs.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium max-w-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>To comply with HIPAA Separation of Duties, all Protected Health Information (PHI) is hidden from IT views.</span>
              </div>
            </div>

            {/* Config & Diagnostics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Database & Compute Toggle Card */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[180px]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-slate-800 flex items-center gap-2">
                      <Server className="w-5 h-5 text-indigo-600" /> Compute Model
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Determine where clinical AI pipelines are processed.</p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-semibold uppercase">ACTIVE</span>
                </div>

                <div className="mt-4 flex items-center justify-between bg-white/50 border border-white/60 p-3 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">{isCloudInference ? 'Gemini Cloud API' : 'On-Premise (Local Node)'}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{isCloudInference ? 'External secure gateway' : 'Hospital Intranet Sidecar'}</span>
                  </div>
                  <button 
                    onClick={() => setIsCloudInference(!isCloudInference)}
                    className="text-slate-700 hover:text-indigo-600 transition-colors p-1"
                    title="Toggle AI compute target"
                  >
                    {isCloudInference ? <ToggleRight className="w-10 h-10 text-indigo-600" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Secure Local DB Node Status */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[180px]">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-slate-800 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" /> HMS Node Database
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Local database bridge interfacing existing HMS.</p>
                </div>
                
                <div className="flex items-center gap-3 mt-4 text-xs font-mono">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">MS-SQL Server Intranet Port</span>
                    <span className="text-[10px] text-slate-400">10.12.4.45:1433 • Connected</span>
                  </div>
                </div>
              </div>

              {/* System Health Indicators */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[180px]">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-slate-800 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-600" /> Local Resources
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Status of compiled host sidecar modules.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono text-slate-600">
                  <div className="bg-white/40 p-2 rounded-xl border border-white/60 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    <span>CPU: 4.8%</span>
                  </div>
                  <div className="bg-white/40 p-2 rounded-xl border border-white/60 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                    <span>RAM: 32MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic HIPAA Audit Log Panel */}
            <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
                <div>
                  <h2 className="font-heading font-semibold text-xl text-slate-800 flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-indigo-600" /> Cryptographic HIPAA Audit Logs
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Tamper-resistant audit entries verifying PHI access sequences.</p>
                </div>
                
                <button 
                  onClick={handleTriggerAudit}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  Simulate Access Event
                </button>
              </div>

              <div className="flex-1 overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/40 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-2.5">Timestamp</th>
                      <th className="py-2.5">User Context</th>
                      <th className="py-2.5">Activity Description</th>
                      <th className="py-2.5">IP Address</th>
                      <th className="py-2.5 text-right">Encrypted Hash Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <AnimatePresence initial={false}>
                      {auditLogs.map((log, idx) => (
                        <motion.tr 
                          key={log.timestamp + idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-slate-600 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-3 pr-2 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                          <td className="py-3 pr-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/50 text-[10px] font-semibold uppercase mr-1">{log.role}</span>
                            <span className="font-semibold text-slate-800">{log.user}</span>
                          </td>
                          <td className="py-3 pr-2 font-body text-slate-700 max-w-sm truncate" title={log.action}>
                            {log.action} <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/50 ml-1">{log.bed}</span>
                          </td>
                          <td className="py-3 pr-2 text-slate-400">{log.ip}</td>
                          <td className="py-3 text-right text-indigo-500/80 font-bold whitespace-nowrap">{log.sign}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
