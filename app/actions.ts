import { type User, type UserRole } from '@/lib/types';

// In-memory data store for preview purposes
let MOCK_USERS: Record<string, User> = {
  'superadmin': { userid: 'superadmin', password: 'password', role: 'superadmin', name: 'Chief Administrator', posting: 'Administration', agents: ['all'] },
  'doctor': { userid: 'doctor', password: 'password', role: 'doctor', name: 'Dr. Chang', posting: 'Radiology', agents: ['imaging', 'documentation', 'scribe', 'triage'] },
  'nurse': { userid: 'nurse', password: 'password', role: 'nurse', name: 'Nurse Jane', posting: 'NICU', agents: ['scribe', 'conversational', 'documentation'] },
  'admin': { userid: 'admin', password: 'password', role: 'admin', name: 'IT Admin', posting: 'IT Support', agents: ['system'] }
};

let MOCK_USER_MFA_CONFIGURED: Record<string, boolean> = {
  'superadmin': true,
  'doctor': false, // Doctor will enroll on first login to demo the flow
  'nurse': true,
  'admin': true
};

// Client-side cookie utilities to bypass server-only Next.js headers for static exports
function setClientCookie(name: string, value: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400`;
  }
}

function deleteClientCookie(name: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export async function loginAction(formData: FormData) {
  try {
    const userid = formData.get('userid') as string;
    const password = formData.get('password') as string;
    
    if (!userid || !password) {
      return { success: false, error: 'User ID and Password are required' };
    }

    const user = MOCK_USERS[userid];
    
    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid credentials. Try superadmin, doctor, or nurse with password "password"' };
    }

    const isMfaConfigured = MOCK_USER_MFA_CONFIGURED[userid] ?? false;

    return { 
      success: true, 
      requiresMfa: true, 
      isConfigured: isMfaConfigured,
      userid: user.userid,
      secret: isMfaConfigured ? null : `SUVI-OTP-${user.userid.toUpperCase()}-SECRET`
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server Action Failed' };
  }
}

export async function verifyMfaAction(userid: string, code: string, isEnrolling: boolean) {
  try {
    if (!userid || !code) {
      return { success: false, error: 'Verification code is required' };
    }

    const user = MOCK_USERS[userid];
    if (!user) {
      return { success: false, error: 'Invalid session' };
    }

    const isCodeValid = /^\d{6}$/.test(code);
    if (!isCodeValid) {
      return { success: false, error: 'Invalid verification code. Please enter 6 numeric digits.' };
    }

    if (isEnrolling) {
      MOCK_USER_MFA_CONFIGURED[userid] = true;
    }

    // Set client-side cookies
    setClientCookie('auth_role', user.role || '');
    setClientCookie('auth_username', user.name || '');
    setClientCookie('auth_userid', user.userid || '');
    setClientCookie('auth_posting', user.posting || '');
    setClientCookie('auth_agents', JSON.stringify(user.agents || []));
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Verification Failed' };
  }
}

export async function logoutAction() {
  deleteClientCookie('auth_role');
  deleteClientCookie('auth_username');
  deleteClientCookie('auth_userid');
  deleteClientCookie('auth_posting');
  deleteClientCookie('auth_agents');
  
  return { success: true };
}

export async function getUsersAction() {
  return Object.values(MOCK_USERS).map(({ password, ...user }) => user);
}

export async function getPatientRecordAction(userid: string, role: string, bedId: string) {
  if (role === 'superadmin' || role === 'admin') {
    console.warn(`[SECURITY ALERT] - Unauthorized role (${role}) attempted to bypass client view to access PHI for ${bedId}! Request terminated.`);
    return { success: false, error: 'Access Denied: Administrative roles are prohibited from viewing patient clinical data (Separation of Duties).' };
  }
  
  return { 
    success: true, 
    data: {
      bedId,
      name: bedId === 'Bed 01' ? 'Aarav Sharma' : bedId === 'Bed 02' ? 'Priya Patel' : 'Karan Singh',
      age: 42,
      gender: 'Male',
      vitals: { temp: '98.6 F', bp: '120/80 mmHg', hr: '72 bpm', spo2: '98%' }
    } 
  };
}

export async function createUserAction(formData: FormData, callerRole: string) {
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Only admins can create users' };
  }

  const userid = formData.get('userid') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as UserRole;
  const posting = formData.get('posting') as string;
  const agents = formData.getAll('agents') as string[];

  if (!userid || !password || !name || !role) {
    return { success: false, error: 'Missing required fields' };
  }

  if (MOCK_USERS[userid]) {
    return { success: false, error: 'User ID already exists' };
  }

  MOCK_USERS[userid] = {
    userid,
    password,
    name,
    role,
    posting,
    agents
  };

  return { success: true };
}

export async function editUserAction(formData: FormData, callerRole: string) {
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Only admins can edit users' };
  }

  const userid = formData.get('userid') as string; // hidden input for ID
  const password = formData.get('password') as string; // Optional update
  const name = formData.get('name') as string;
  const role = formData.get('role') as UserRole;
  const posting = formData.get('posting') as string;
  const agents = formData.getAll('agents') as string[];

  if (!userid || !name || !role) {
    return { success: false, error: 'Missing required fields' };
  }

  if (!MOCK_USERS[userid]) {
    return { success: false, error: 'User not found' };
  }

  MOCK_USERS[userid] = {
    ...MOCK_USERS[userid],
    name,
    role,
    posting,
    agents,
    ...(password ? { password } : {}) // Update password only if provided
  };

  return { success: true };
}

export async function deleteUserAction(userid: string, callerRole: string) {
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Only admins can delete users' };
  }
  if (userid === 'superadmin') return { success: false, error: 'Cannot delete super admin' };
  
  delete MOCK_USERS[userid];
  return { success: true };
}
