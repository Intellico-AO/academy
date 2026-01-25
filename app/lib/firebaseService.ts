import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import {
  Course,
  Program,
  Session,
  SessionPlan,
  DemonstrationPlan,
  Worksheet,
  AuditLog,
} from '../types';

// Collection names
const COLLECTIONS = {
  COURSES: 'courses',
  PROGRAMS: 'programs',
  SESSIONS: 'sessions',
  SESSION_PLANS: 'sessionPlans',
  DEMONSTRATION_PLANS: 'demonstrationPlans',
  WORKSHEETS: 'worksheets',
  AUDIT_LOGS: 'auditLogs',
} as const;

// Helper to get db with error handling
function requireDb() {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore não está inicializado');
  }
  return db;
}

// Helper to convert Firestore timestamps
function convertTimestamps<T extends DocumentData>(data: T): T {
  const converted = { ...data } as Record<string, unknown>;
  for (const key in converted) {
    const val = converted[key];
    if (val instanceof Timestamp) {
      converted[key] = val.toDate().toISOString();
    }
  }
  return converted as T;
}

// ==========================================
// CURSOS
// ==========================================

export async function getCourses(): Promise<Course[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Course[];
}

export async function getCourse(id: string): Promise<Course | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const docRef = doc(db, COLLECTIONS.COURSES, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Course;
  }
  return null;
}

export async function createCourse(course: Omit<Course, 'id'>): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), course);
  return docRef.id;
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<void> {
  const db = requireDb();
  const docRef = doc(db, COLLECTIONS.COURSES, id);
  await updateDoc(docRef, data as DocumentData);
}

export async function deleteCourse(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTIONS.COURSES, id));
}

// ==========================================
// PROGRAMAS
// ==========================================

export async function getPrograms(): Promise<Program[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.PROGRAMS));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Program[];
}

export async function getProgram(id: string): Promise<Program | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const docRef = doc(db, COLLECTIONS.PROGRAMS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Program;
  }
  return null;
}

export async function createProgram(program: Omit<Program, 'id'>): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.PROGRAMS), program);
  return docRef.id;
}

export async function updateProgram(id: string, data: Partial<Program>): Promise<void> {
  const db = requireDb();
  const docRef = doc(db, COLLECTIONS.PROGRAMS, id);
  await updateDoc(docRef, data as DocumentData);
}

export async function deleteProgram(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTIONS.PROGRAMS, id));
}

// ==========================================
// SESSÕES
// ==========================================

export async function getSessions(): Promise<Session[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.SESSIONS));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Session[];
}

export async function getSession(id: string): Promise<Session | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const docRef = doc(db, COLLECTIONS.SESSIONS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Session;
  }
  return null;
}

export async function createSession(session: Omit<Session, 'id'>): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), session);
  return docRef.id;
}

export async function updateSession(id: string, data: Partial<Session>): Promise<void> {
  const db = requireDb();
  const docRef = doc(db, COLLECTIONS.SESSIONS, id);
  await updateDoc(docRef, data as DocumentData);
}

export async function deleteSession(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTIONS.SESSIONS, id));
}

// ==========================================
// PLANOS DE SESSÃO
// ==========================================

export async function getSessionPlans(): Promise<SessionPlan[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.SESSION_PLANS));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as SessionPlan[];
}

export async function getSessionPlan(id: string): Promise<SessionPlan | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const docRef = doc(db, COLLECTIONS.SESSION_PLANS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as SessionPlan;
  }
  return null;
}

export async function getSessionPlanBySessionId(sessaoId: string): Promise<SessionPlan | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.SESSION_PLANS),
    where('sessaoId', '==', sessaoId)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as SessionPlan;
  }
  return null;
}

export async function createSessionPlan(plan: Omit<SessionPlan, 'id'>): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.SESSION_PLANS), plan);
  return docRef.id;
}

export async function updateSessionPlan(id: string, data: Partial<SessionPlan>): Promise<void> {
  const db = requireDb();
  const docRef = doc(db, COLLECTIONS.SESSION_PLANS, id);
  await updateDoc(docRef, data as DocumentData);
}

export async function deleteSessionPlan(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTIONS.SESSION_PLANS, id));
}

// ==========================================
// PLANOS DE DEMONSTRAÇÃO
// ==========================================

export async function getDemonstrationPlans(): Promise<DemonstrationPlan[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.DEMONSTRATION_PLANS));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as DemonstrationPlan[];
}

export async function getDemonstrationPlan(id: string): Promise<DemonstrationPlan | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const docRef = doc(db, COLLECTIONS.DEMONSTRATION_PLANS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as DemonstrationPlan;
  }
  return null;
}

export async function getDemonstrationPlanBySessionId(sessaoId: string): Promise<DemonstrationPlan | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.DEMONSTRATION_PLANS),
    where('sessaoId', '==', sessaoId)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as DemonstrationPlan;
  }
  return null;
}

export async function createDemonstrationPlan(plan: Omit<DemonstrationPlan, 'id'>): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.DEMONSTRATION_PLANS), plan);
  return docRef.id;
}

export async function updateDemonstrationPlan(id: string, data: Partial<DemonstrationPlan>): Promise<void> {
  const db = requireDb();
  const docRef = doc(db, COLLECTIONS.DEMONSTRATION_PLANS, id);
  await updateDoc(docRef, data as DocumentData);
}

export async function deleteDemonstrationPlan(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTIONS.DEMONSTRATION_PLANS, id));
}

// ==========================================
// FICHAS DE TRABALHO
// ==========================================

export async function getWorksheets(): Promise<Worksheet[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.WORKSHEETS));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Worksheet[];
}

export async function getWorksheet(id: string): Promise<Worksheet | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const docRef = doc(db, COLLECTIONS.WORKSHEETS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Worksheet;
  }
  return null;
}

export async function getWorksheetsBySessionId(sessaoId: string): Promise<Worksheet[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.WORKSHEETS),
    where('sessaoId', '==', sessaoId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Worksheet[];
}

export async function createWorksheet(worksheet: Omit<Worksheet, 'id'>): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.WORKSHEETS), worksheet);
  return docRef.id;
}

export async function updateWorksheet(id: string, data: Partial<Worksheet>): Promise<void> {
  const db = requireDb();
  const docRef = doc(db, COLLECTIONS.WORKSHEETS, id);
  await updateDoc(docRef, data as DocumentData);
}

export async function deleteWorksheet(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTIONS.WORKSHEETS, id));
}

// ==========================================
// AUDIT LOGS
// ==========================================

export async function getAuditLogs(filters?: { entidadeTipo?: string; entidadeId?: string }): Promise<AuditLog[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  
  const constraints: QueryConstraint[] = [orderBy('dataHora', 'desc')];
  
  if (filters?.entidadeTipo) {
    constraints.unshift(where('entidadeTipo', '==', filters.entidadeTipo));
  }
  if (filters?.entidadeId) {
    constraints.unshift(where('entidadeId', '==', filters.entidadeId));
  }
  
  const q = query(collection(db, COLLECTIONS.AUDIT_LOGS), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as AuditLog[];
}

export async function createAuditLog(log: Omit<AuditLog, 'id'>): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), log);
  return docRef.id;
}

// ==========================================
// CARREGAR TODOS OS DADOS
// ==========================================

export async function loadAllData() {
  const [courses, programs, sessions, sessionPlans, demonstrationPlans, worksheets, auditLogs] = await Promise.all([
    getCourses(),
    getPrograms(),
    getSessions(),
    getSessionPlans(),
    getDemonstrationPlans(),
    getWorksheets(),
    getAuditLogs(),
  ]);

  return {
    cursos: courses,
    programas: programs,
    sessoes: sessions,
    planosSessao: sessionPlans,
    planosDemonstracao: demonstrationPlans,
    fichasTrabalho: worksheets,
    auditLogs,
  };
}
