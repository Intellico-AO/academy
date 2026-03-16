import {
  collection,
  type DocumentData,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { UserAccount } from '../types';
import { getFirebaseDb } from './firebase';

// Formandos são UserAccounts com role='formando'
// Reutilizamos a coleção 'users' do Firestore

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
// FORMANDOS
// ==========================================

export async function getFormandos(
  centroFormacaoId: string
): Promise<UserAccount[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, 'users'),
    where('centroFormacaoId', '==', centroFormacaoId),
    where('role', '==', 'formando')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as UserAccount[];
}

export async function getFormando(id: string): Promise<UserAccount | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = {
      id: docSnap.id,
      ...convertTimestamps(docSnap.data()),
    } as UserAccount;
    if (data.role === 'formando') return data;
  }

  return null;
}

export async function updateFormando(
  id: string,
  data: { nome?: string; dataNascimento?: string }
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'users', id), data as DocumentData);
}

export async function archiveFormando(id: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'users', id), { ativo: false });
}

export async function activateFormando(id: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'users', id), { ativo: true });
}

export async function checkFormandoEmailExists(
  centroFormacaoId: string,
  email: string
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const q = query(
    collection(db, 'users'),
    where('centroFormacaoId', '==', centroFormacaoId),
    where('role', '==', 'formando'),
    where('email', '==', email)
  );
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}
