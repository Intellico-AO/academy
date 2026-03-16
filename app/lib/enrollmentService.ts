import {
  addDoc,
  collection,
  type DocumentData,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Enrollment } from '../types';
import { getFirebaseDb } from './firebase';

const COLLECTION = 'enrollments';

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
// INSCRIÇÕES
// ==========================================

export async function getEnrollments(
  centroFormacaoId: string
): Promise<Enrollment[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Enrollment[];
}

export async function getEnrollmentsByFormando(
  formandoId: string
): Promise<Enrollment[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('formandoId', '==', formandoId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Enrollment[];
}

export async function getEnrollmentsByCourse(
  cursoId: string
): Promise<Enrollment[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(collection(db, COLLECTION), where('cursoId', '==', cursoId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Enrollment[];
}

export async function createEnrollment(
  formandoId: string,
  cursoId: string,
  centroFormacaoId: string
): Promise<Enrollment> {
  const db = requireDb();

  const now = new Date().toISOString();
  const enrollmentData: Omit<Enrollment, 'id'> = {
    formandoId,
    cursoId,
    centroFormacaoId,
    status: 'ativo',
    dataInscricao: now,
    dataCriacao: now,
    dataAtualizacao: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION), enrollmentData);
  return { id: docRef.id, ...enrollmentData };
}

export async function updateEnrollmentStatus(
  id: string,
  status: Enrollment['status']
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function removeEnrollment(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function checkEnrollmentExists(
  formandoId: string,
  cursoId: string
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const q = query(
    collection(db, COLLECTION),
    where('formandoId', '==', formandoId),
    where('cursoId', '==', cursoId),
    where('status', '==', 'ativo')
  );
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}
