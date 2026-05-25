'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClient from '@/components/dashboard-client';
import SuperAdminClient from '@/components/super-admin-client';
import { getUsersAction } from '@/app/actions';
import { type User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

function getCookie(name: string): string {
  if (typeof window === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ role: string; username: string; posting: string; agents: string[] } | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const role = getCookie('auth_role');
    const username = getCookie('auth_username');
    const posting = getCookie('auth_posting');
    const agentsStr = getCookie('auth_agents') || '[]';

    if (!role || !username) {
      router.push('/login');
      return;
    }

    let agents = [];
    try {
      agents = JSON.parse(agentsStr);
    } catch (e) {
      agents = [];
    }

    setSession({ role, username, posting, agents });

    if (role === 'superadmin' || role === 'admin') {
      getUsersAction().then((res) => {
        setUsers(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center relative z-10">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-3 border-white/80">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading clinical workspace...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (session.role === 'superadmin' || session.role === 'admin') {
    return <SuperAdminClient username={session.username} role={session.role} users={users} />;
  }

  return <DashboardClient username={session.username} role={session.role} posting={session.posting} agents={session.agents} />;
}
