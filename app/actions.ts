import { type User, type UserRole } from '@/lib/types';
import { CDSCO_DRUGS, DRUG_INTERACTIONS, AYUSHMAN_BHARAT_PACKAGES, BHASHINI_TRANSLATIONS } from '@/lib/mock-data';

// Stateful mock databases (in-memory for the session)
let MOCK_USERS: Record<string, User> = {
  'superadmin': { userid: 'superadmin', password: 'password', role: 'superadmin', name: 'Chief Administrator', posting: 'Administration', agents: ['all'] },
  'doctor': { userid: 'doctor', password: 'password', role: 'doctor', name: 'Dr. Chang', posting: 'Radiology', agents: ['imaging', 'documentation', 'scribe', 'triage'] },
  'nurse': { userid: 'nurse', password: 'password', role: 'nurse', name: 'Nurse Jane', posting: 'NICU', agents: ['scribe', 'conversational', 'documentation'] },
  'admin': { userid: 'admin', password: 'password', role: 'admin', name: 'IT Admin', posting: 'IT Support', agents: ['system'] },
  'receptionist': { userid: 'receptionist', password: 'password', role: 'receptionist', name: 'Sita Sharma', posting: 'Outpatient Registration', agents: ['conversational'] }
};

let MOCK_USER_MFA_CONFIGURED: Record<string, boolean> = {
  'superadmin': true,
  'doctor': false, // Doctor enrolls on first login to demo the flow
  'nurse': true,
  'admin': true,
  'receptionist': true
};

// Global system configs (Simulating Google Cloud platform toggles)
let SYSTEM_CONFIG = {
  computeTarget: 'GCP' as 'GCP' | 'LOCAL',
  localEndpoint: 'http://localhost:11434',
  gcpProjectId: 'suvi-clinical-production-node',
  gcpRegion: 'asia-south1 (Mumbai)',
  firestoreDatabaseId: 'suvi-hms-db-live',
  cloudSqlInstance: 'suvi-sql-server-master'
};

// Live queue models
export interface AdmissionHistoryEvent {
  stage: string;
  timestamp: string;
  details: string;
  operatorName: string;
  operatorRole: string;
  stationName: string;
}

export interface Appointment {
  id: string;
  name: string;
  abhaId: string;
  age: number;
  gender: string;
  status: 'CheckedIn' | 'Diagnosing' | 'DiagnosticsComplete' | 'ICU_Transferred';
  assignedDoctor: string;
  complaint: string;
  vitals: { temp: string; bp: string; hr: string; spo2: string; spo2Status: string; bpStatus: string };
  pacsImageId?: string;
  diagnosticsReport?: string;
  soapRecord?: { subjective: string; objective: string; plan: string };
  cghsCode?: string;
  pmjayPackage?: string;
  isPreAuthApproved?: boolean;
  admissionHistory?: AdmissionHistoryEvent[];
}

let MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-1001',
    name: 'Aarav Sharma',
    abhaId: '91-8839-2201-9238',
    age: 42,
    gender: 'Male',
    status: 'Diagnosing',
    assignedDoctor: 'Dr. Chang',
    complaint: 'Severe epigastric chest pain and acidity immediately following food intake for three days.',
    vitals: { temp: '98.6 °F', bp: '142/92 mmHg', hr: '84 bpm', spo2: '97%', spo2Status: 'normal', bpStatus: 'warning' },
    soapRecord: {
      subjective: 'Patient reports severe epigastric pain and chest burning immediately after food intake. Symptom onset 3 days ago. No fever.',
      objective: 'Abdomen soft, mild epigastric tenderness on palpation. BP 142/92. HR 84.',
      plan: 'Initiate Pantoprazole 40mg before breakfast once daily. Avoid spicy meals and immediate recumbency.'
    },
    admissionHistory: [
      {
        stage: 'OPD Registration',
        timestamp: '2026-06-10 10:30:15',
        details: 'Registered patient Aarav Sharma. ABHA verified via ABDM Health Locker. Assigned to Dr. Chang.',
        operatorName: 'Sita Sharma',
        operatorRole: 'receptionist',
        stationName: 'Front Desk'
      },
      {
        stage: 'Encounter Charted',
        timestamp: '2026-06-10 10:45:00',
        details: 'Encounter scribed and CDSCO drug checks completed. Diagnosed with Acute Gastritis. Pre-Auth Claims initiated.',
        operatorName: 'Dr. Chang',
        operatorRole: 'doctor',
        stationName: 'OPD Consultation Room'
      }
    ]
  },
  {
    id: 'APT-1002',
    name: 'Priya Patel',
    abhaId: '44-9021-3312-8874',
    age: 29,
    gender: 'Female',
    status: 'CheckedIn',
    assignedDoctor: 'Dr. Chang',
    complaint: 'Acute nausea, respiratory distress, and dry cough since yesterday evening.',
    vitals: { temp: '101.4 °F', bp: '110/70 mmHg', hr: '102 bpm', spo2: '93%', spo2Status: 'warning', bpStatus: 'normal' },
    admissionHistory: [
      {
        stage: 'OPD Registration',
        timestamp: '2026-06-10 11:05:00',
        details: 'Registered patient Priya Patel. ABHA verified via ABDM Health Locker.',
        operatorName: 'Sita Sharma',
        operatorRole: 'receptionist',
        stationName: 'Front Desk'
      }
    ]
  },
  {
    id: 'APT-1003',
    name: 'Karan Singh',
    abhaId: '12-4458-9902-1249',
    age: 58,
    gender: 'Male',
    status: 'ICU_Transferred',
    assignedDoctor: 'Dr. Chang',
    complaint: 'Dizziness, cold sweats, and chronic low back pain following physical therapy.',
    vitals: { temp: '97.8 °F', bp: '95/60 mmHg', hr: '62 bpm', spo2: '98%', spo2Status: 'normal', bpStatus: 'normal' },
    soapRecord: {
      subjective: 'Patient reports orthostatic lightheadedness and physical therapy soreness.',
      objective: 'BP 95/60 mmHg on standing. Spinal tenderness present.',
      plan: 'IV fluids, monitor continuous telemetry. Restrict sudden upright posture.'
    },
    pacsImageId: 'PACS-CXR-84920',
    diagnosticsReport: 'Vertex AI Multimodal Analysis: Mild epigastric gaseous accumulation. Spine shows lumbar degenerations.',
    cghsCode: '4020102',
    pmjayPackage: 'Telemetry and emergency cardiac monitoring package',
    isPreAuthApproved: true,
    admissionHistory: [
      {
        stage: 'OPD Registration',
        timestamp: '2026-06-10 09:15:10',
        details: 'Registered patient Karan Singh. ABHA verified via ABDM Health Locker.',
        operatorName: 'Sita Sharma',
        operatorRole: 'receptionist',
        stationName: 'Front Desk'
      },
      {
        stage: 'Encounter Charted',
        timestamp: '2026-06-10 09:30:20',
        details: 'Ambient Scribe charted clinical SOAP record.',
        operatorName: 'Dr. Chang',
        operatorRole: 'doctor',
        stationName: 'OPD Consultation Room'
      },
      {
        stage: 'PACS Scan Complete',
        timestamp: '2026-06-10 09:45:00',
        details: 'PACS Chest X-Ray completed. Vertex AI reports mild epigastric gaseous accumulation.',
        operatorName: 'Dr. Chang',
        operatorRole: 'doctor',
        stationName: 'Radiology Room'
      },
      {
        stage: 'ICU Bed Escalated',
        timestamp: '2026-06-10 10:02:15',
        details: 'Patient escalated to ICU Bed ICU-01 due to orthostatic hypotension. Continuous telemetry monitor synced.',
        operatorName: 'Dr. Chang',
        operatorRole: 'doctor',
        stationName: 'ICU Bed ICU-01'
      }
    ]
  }
];

export interface IcuBed {
  bedId: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  complaint: string;
  vitals: { temp: string; bp: string; hr: string; spo2: string };
  historySummary: string;
}

let MOCK_ICU_BEDS: Record<string, IcuBed> = {
  'ICU-01': {
    bedId: 'ICU-01',
    patientId: 'APT-1003',
    name: 'Karan Singh',
    age: 58,
    gender: 'Male',
    abhaId: '12-4458-9902-1249',
    complaint: 'Dizziness, cold sweats, and chronic low back pain following physical therapy.',
    vitals: { temp: '97.8 °F', bp: '95/60 mmHg', hr: '62 bpm', spo2: '98%' },
    historySummary: 'Transferred post cardiac diagnostics. Diagnosed with orthostatic hypotension. Under telemetry monitoring.'
  }
};

// Cryptographic HIPAA logs
export interface AuditLog {
  timestamp: string;
  user: string;
  role: string;
  action: string;
  bed: string;
  ip: string;
  sign: string;
  computeRoute: 'GCP' | 'LOCAL';
}

let MOCK_AUDIT_LOGS: AuditLog[] = [
  { timestamp: '2026-06-10 10:45:12', user: 'doctor', role: 'doctor', action: 'Accessed Patient PHI EHR record', bed: 'Bed 01', ip: '10.12.4.88', sign: '0x88f2a71d88a1b', computeRoute: 'GCP' },
  { timestamp: '2026-06-10 11:12:33', user: 'receptionist', role: 'receptionist', action: 'Synced ABHA ID profile via Dialogflow CX Telephony Node', bed: 'Front Desk', ip: '10.12.4.92', sign: '0x17c9b208fa88c', computeRoute: 'GCP' }
];

// AI Usage Tracker Model
export interface AiUsageLog {
  timestamp: string;
  user: string;
  role: string;
  capability: string;
  apiUsed: string;
  tokens: number;
  latency: number;
  status: 'SUCCESS' | 'FAILURE';
}

let MOCK_AI_USAGE: AiUsageLog[] = [
  { timestamp: '2026-06-10 10:30:15', user: 'receptionist', role: 'receptionist', capability: 'conversational', apiUsed: 'Dialogflow CX Voice Gateway', tokens: 450, latency: 950, status: 'SUCCESS' },
  { timestamp: '2026-06-10 10:44:30', user: 'doctor', role: 'doctor', capability: 'scribe', apiUsed: 'Vertex AI Speech STT', tokens: 840, latency: 1200, status: 'SUCCESS' },
  { timestamp: '2026-06-10 10:45:00', user: 'doctor', role: 'doctor', capability: 'documentation', apiUsed: 'LangChain CDSCO Drug Audit', tokens: 1200, latency: 1500, status: 'SUCCESS' },
  { timestamp: '2026-06-10 11:15:20', user: 'nurse', role: 'nurse', capability: 'conversational', apiUsed: 'Bhashini Translation API', tokens: 350, latency: 450, status: 'SUCCESS' }
];

export async function getAiUsageAction() {
  return MOCK_AI_USAGE;
}

export async function logAiUsageAction(user: string, role: string, capability: string, apiUsed: string, tokens: number, latency: number, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS') {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  MOCK_AI_USAGE.unshift({
    timestamp,
    user,
    role,
    capability,
    apiUsed,
    tokens,
    latency,
    status
  });
}

// Helper to write logs
export async function addAuditLogAction(user: string, role: string, action: string, bed: string = 'N/A') {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const computeRoute = SYSTEM_CONFIG.computeTarget;
  const hashSrc = `${timestamp}-${user}-${action}-${computeRoute}`;
  let hashVal = 0;
  for (let i = 0; i < hashSrc.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashSrc.charCodeAt(i);
    hashVal |= 0;
  }
  const sign = `0x${Math.abs(hashVal).toString(16).padEnd(12, 'f')}`;

  const newLog: AuditLog = {
    timestamp,
    user,
    role,
    action,
    bed,
    ip: '10.12.4.45',
    sign,
    computeRoute
  };
  MOCK_AUDIT_LOGS.unshift(newLog);
}

// Client-side cookie utilities
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

// Auth Actions
export async function loginAction(formData: FormData) {
  try {
    const userid = formData.get('userid') as string;
    const password = formData.get('password') as string;
    
    if (!userid || !password) {
      return { success: false, error: 'User ID and Password are required' };
    }

    const user = MOCK_USERS[userid];
    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid credentials. Try superadmin, doctor, nurse, admin, or receptionist with password "password"' };
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

    // Set cookies
    setClientCookie('auth_role', user.role || '');
    setClientCookie('auth_username', user.name || '');
    setClientCookie('auth_userid', user.userid || '');
    setClientCookie('auth_posting', user.posting || '');
    setClientCookie('auth_agents', JSON.stringify(user.agents || []));

    await addAuditLogAction(user.userid, user.role, 'Multi-Factor Authentication login verification successful');
    
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

// User CRUD Actions
export async function getUsersAction() {
  return Object.values(MOCK_USERS).map(({ password, ...user }) => user);
}

export async function createUserAction(formData: FormData, callerRole: string) {
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    return { success: false, error: 'Unauthorized' };
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

  MOCK_USERS[userid] = { userid, password, name, role, posting, agents };
  await addAuditLogAction('superadmin', 'superadmin', `Created new user config: ${userid}`);
  return { success: true };
}

export async function editUserAction(formData: FormData, callerRole: string) {
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const userid = formData.get('userid') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as UserRole;
  const posting = formData.get('posting') as string;
  const agents = formData.getAll('agents') as string[];

  if (!MOCK_USERS[userid]) return { success: false, error: 'User not found' };

  MOCK_USERS[userid] = {
    ...MOCK_USERS[userid],
    name,
    role,
    posting,
    agents,
    ...(password ? { password } : {})
  };
  await addAuditLogAction('superadmin', 'superadmin', `Modified user config: ${userid}`);
  return { success: true };
}

export async function deleteUserAction(userid: string, callerRole: string) {
  if (callerRole !== 'superadmin' && callerRole !== 'admin') return { success: false, error: 'Unauthorized' };
  if (userid === 'superadmin') return { success: false, error: 'Cannot delete super admin' };
  delete MOCK_USERS[userid];
  await addAuditLogAction('superadmin', 'superadmin', `Deleted user config: ${userid}`);
  return { success: true };
}

// Compute Settings Actions
export async function getComputeConfigAction() {
  return SYSTEM_CONFIG;
}

export async function saveComputeConfigAction(formData: FormData, callerRole: string) {
  if (callerRole !== 'admin' && callerRole !== 'superadmin') return { success: false, error: 'Unauthorized' };
  const target = formData.get('computeTarget') as 'GCP' | 'LOCAL';
  const endpoint = formData.get('localEndpoint') as string;
  const gcpId = formData.get('gcpProjectId') as string;
  const gcpReg = formData.get('gcpRegion') as string;
  const fireDb = formData.get('firestoreDatabaseId') as string;
  const sqlInst = formData.get('cloudSqlInstance') as string;

  SYSTEM_CONFIG.computeTarget = target;
  SYSTEM_CONFIG.localEndpoint = endpoint;
  SYSTEM_CONFIG.gcpProjectId = gcpId;
  SYSTEM_CONFIG.gcpRegion = gcpReg;
  SYSTEM_CONFIG.firestoreDatabaseId = fireDb;
  SYSTEM_CONFIG.cloudSqlInstance = sqlInst;

  await addAuditLogAction('admin', 'admin', `Updated system compute target to ${target} (Local Endpoint: ${endpoint})`);
  return { success: true, config: SYSTEM_CONFIG };
}

// Appointment Actions
export async function getAppointmentsAction() {
  return MOCK_APPOINTMENTS;
}

export async function createAppointmentAction(formData: FormData, callerRole: string) {
  const name = formData.get('name') as string;
  const abhaId = formData.get('abhaId') as string;
  const age = parseInt(formData.get('age') as string || '30');
  const gender = formData.get('gender') as string;
  const complaint = formData.get('complaint') as string;
  const doctor = formData.get('assignedDoctor') as string;

  if (!name || !abhaId || !complaint) {
    return { success: false, error: 'Missing required fields' };
  }

  const id = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newApt: Appointment = {
    id,
    name,
    abhaId,
    age,
    gender,
    status: 'CheckedIn',
    assignedDoctor: doctor || 'Dr. Chang',
    complaint,
    vitals: { temp: '98.4 °F', bp: '120/80 mmHg', hr: '76 bpm', spo2: '99%', spo2Status: 'normal', bpStatus: 'normal' },
    admissionHistory: [
      {
        stage: 'OPD Registration',
        timestamp,
        details: `Registered patient ${name}. ABHA address verified. Assigned to ${doctor || 'Dr. Chang'}.`,
        operatorName: 'Sita Sharma',
        operatorRole: 'receptionist',
        stationName: 'Front Desk'
      }
    ]
  };

  MOCK_APPOINTMENTS.push(newApt);
  await logAiUsageAction('receptionist', 'receptionist', 'conversational', 'Dialogflow CX Voice Gateway', 350, 800);
  await addAuditLogAction('receptionist', 'receptionist', `Booked appointment for patient ${name} (ABHA: ${abhaId})`, 'Front Desk');
  return { success: true, appointment: newApt };
}

// Pacs Diagnostic Report action
export async function runImagingReportAction(appointmentId: string, doctorUsername: string) {
  const apt = MOCK_APPOINTMENTS.find(a => a.id === appointmentId);
  if (!apt) return { success: false, error: 'Patient appointment not found' };

  apt.pacsImageId = `PACS-CXR-${Math.floor(10000 + Math.random() * 90000)}`;
  apt.status = 'DiagnosticsComplete';
  apt.diagnosticsReport = `Vertex AI Multimodal / Local Vision-Language Model Analysis: Chest study posterio-anterior view. Clear lung boundaries. Heart outline normal. Note: Mild epigastric gaseous accumulation and localized distention detected near gastric cardia, correlating with patient complaints of severe burning pain immediately after meals. Recommendation: Correlate clinically with severe GERD/Gastritis protocols.`;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  if (!apt.admissionHistory) apt.admissionHistory = [];
  apt.admissionHistory.push({
    stage: 'PACS Scan Complete',
    timestamp,
    details: `PACS Chest PA X-Ray completed. PACS ID: ${apt.pacsImageId}. Overlays generated.`,
    operatorName: doctorUsername,
    operatorRole: 'doctor',
    stationName: 'Radiology Room'
  });

  await logAiUsageAction(doctorUsername, 'doctor', 'imaging', 'Vertex AI PACS Multimodal VLM', 2400, 2100);
  await addAuditLogAction(doctorUsername, 'doctor', `Compiled diagnostic PACS report for appointment ${appointmentId}`, 'Radiology Room');
  return { success: true, appointment: apt };
}

// Transfer to ICU Action
export async function transferToIcuAction(appointmentId: string, bedId: string, doctorUsername: string) {
  const apt = MOCK_APPOINTMENTS.find(a => a.id === appointmentId);
  if (!apt) return { success: false, error: 'Patient not found' };

  apt.status = 'ICU_Transferred';

  const newIcuBed: IcuBed = {
    bedId,
    patientId: apt.id,
    name: apt.name,
    age: apt.age,
    gender: apt.gender,
    abhaId: apt.abhaId,
    complaint: apt.complaint,
    vitals: {
      temp: apt.vitals.temp,
      bp: apt.vitals.bp,
      hr: apt.vitals.hr,
      spo2: apt.vitals.spo2
    },
    historySummary: `Transferred from Radiology. SOAP notes: ${apt.soapRecord?.subjective || 'Epigastric distress'}. Scan Findings: ${apt.diagnosticsReport || 'Severe distention'}.`
  };

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  if (!apt.admissionHistory) apt.admissionHistory = [];
  apt.admissionHistory.push({
    stage: 'ICU Bed Escalated',
    timestamp,
    details: `Patient transferred and admitted to ${bedId} due to clinical vitals and complaints.`,
    operatorName: doctorUsername,
    operatorRole: 'doctor',
    stationName: bedId
  });

  MOCK_ICU_BEDS[bedId] = newIcuBed;
  await addAuditLogAction(doctorUsername, 'doctor', `Escalated patient ${apt.name} to ${bedId}`, bedId);
  return { success: true, bed: newIcuBed };
}

export async function getIcuBedsAction() {
  return MOCK_ICU_BEDS;
}

export async function syncVitalsAction(bedId: string, temp: string, bp: string, hr: string, spo2: string, user: string) {
  const bed = MOCK_ICU_BEDS[bedId];
  if (bed) {
    bed.vitals = { temp, bp, hr, spo2 };
  }
  const apt = MOCK_APPOINTMENTS.find(a => a.id === bed?.patientId);
  if (apt) {
    apt.vitals = { 
      temp, 
      bp, 
      hr, 
      spo2, 
      spo2Status: parseInt(spo2) < 94 ? 'warning' : 'normal',
      bpStatus: bp.startsWith('14') || bp.startsWith('15') ? 'warning' : 'normal'
    };
  }
  await logAiUsageAction(user, 'nurse', 'triage', 'Telemetry Monitor Vital Sync Service', 110, 180);
  await addAuditLogAction(user, 'nurse', `Synced vitalTelemetry monitor records`, bedId);
  return { success: true };
}

// Patient Record separation of duties check
export async function getPatientRecordAction(userid: string, role: string, bedId: string) {
  if (role === 'superadmin' || role === 'admin') {
    await addAuditLogAction(userid, role, `UNAUTHORIZED ATTEMPT to bypass clinical controls to view patient file: ${bedId}`);
    return { success: false, error: 'Access Denied: Administrative roles are prohibited from viewing patient clinical data (Separation of Duties).' };
  }
  return { success: true };
}

// Audit Logs fetch
export async function getAuditLogsAction() {
  return MOCK_AUDIT_LOGS;
}

// ----------------------------------------------------
// Agentic AI Engine (LangChain + Google ADK A2A Simulators)
// ----------------------------------------------------
export interface AgenticTrace {
  step: string;
  system: 'LangChain' | 'Google ADK A2A' | 'Agentic RAG';
  message: string;
}

export async function runAgenticSwarmEngineAction(appointmentId: string, liveTranscriptText: string, callerUsername: string) {
  const apt = MOCK_APPOINTMENTS.find(a => a.id === appointmentId);
  if (!apt) return { success: false, error: 'Patient not found' };

  const target = SYSTEM_CONFIG.computeTarget;
  const endpoint = target === 'LOCAL' ? SYSTEM_CONFIG.localEndpoint : 'Google Cloud Vertex AI';

  const traces: AgenticTrace[] = [
    {
      step: '1. Input Ingest',
      system: 'LangChain',
      message: `Ingested speech stream from Doctor client. Context: Hinglish translation required. Active Route: ${target} Endpoint (${endpoint})`
    },
    {
      step: '2. Speech-to-SOAP translation',
      system: 'Agentic RAG',
      message: 'Querying vector databases: CDSCO brand list and ICMR National Guidelines. Fetched K21.9 matching templates.'
    },
    {
      step: '3. A2A Protocol Exchange',
      system: 'Google ADK A2A',
      message: 'Scribe Agent negotiating with Consultant Agent: Verifying drug brand interactions for "Pantocid" vs local antacids.'
    },
    {
      step: '4. DDI Audit',
      system: 'LangChain',
      message: 'Consultant Agent: Audited interactions. No High-Severity matches found in CDSCO database index.'
    },
    {
      step: '5. CGHS/PMJAY Audit',
      system: 'Google ADK A2A',
      message: 'Consultant Agent negotiating with Coder Agent: Mapping diagnosis "GERD/Gastritis" to Ayushman Bharat Package codes.'
    },
    {
      step: '6. Coding Output',
      system: 'Agentic RAG',
      message: 'Coder Agent: Mapped PMJAY HBP 2.0 Code 3010410 (Acute Gastritis management, cashless allotment: ₹3,500).'
    }
  ];

  // Populate data
  apt.soapRecord = {
    subjective: 'Patient reports severe epigastric distress, Gale me jalan (localized retrosternal burning) for three days, aggravating post-prandially. Denies nausea or haematemesis.',
    objective: 'Abdomen soft, non-distended. Mild tenderness noted on epigastric palpation. Vital telemetry synced: stable.',
    plan: 'Tab Pantocid (Pantoprazole) 40mg once daily before breakfast for 14 days. Avoid spicy and heavy meals. Do not lie down within 2 hours of dinner.'
  };

  apt.cghsCode = '3010410';
  apt.pmjayPackage = 'Medical management of severe acute gastritis';
  apt.isPreAuthApproved = true;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  if (!apt.admissionHistory) apt.admissionHistory = [];
  apt.admissionHistory.push({
    stage: 'Encounter Charted',
    timestamp,
    details: `SOAP clinical note charted. Ayushman Bharat Package 3010410 mapped automatically.`,
    operatorName: callerUsername,
    operatorRole: 'doctor',
    stationName: 'OPD Consultation Room'
  });

  await logAiUsageAction(callerUsername, 'doctor', 'scribe', 'Vertex AI Speech STT', 920, 1250);
  await logAiUsageAction(callerUsername, 'doctor', 'documentation', 'LangChain CDSCO Drug Audit', 1350, 1600);
  await addAuditLogAction(callerUsername, 'doctor', `Executed proactive LangChain Swarm workflow for appointment ${appointmentId}`);

  return {
    success: true,
    traces,
    soapRecord: apt.soapRecord,
    cghsCode: apt.cghsCode,
    pmjayPackage: apt.pmjayPackage,
    isPreAuthApproved: apt.isPreAuthApproved
  };
}

// Bhashini Translation API simulation
export async function getTranslationAction(language: string, section: string) {
  const dict = BHASHINI_TRANSLATIONS[language.toLowerCase()];
  await logAiUsageAction('nurse', 'nurse', 'conversational', 'Bhashini Translation API', 210, 390);
  if (dict && dict[section]) {
    return { success: true, translation: dict[section] };
  }
  return { success: true, translation: `[Translation to ${language}]: "Please follow the clinical plan and take medications as prescribed."` };
}
