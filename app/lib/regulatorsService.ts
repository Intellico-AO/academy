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
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Regulator, RegulatorFormData } from '../types';

const COLLECTION = 'regulators';

function requireDb() {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore não está inicializado');
  }
  return db;
}

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
// REGULADORES
// ==========================================

export async function getRegulators(
  centroFormacaoId: string
): Promise<Regulator[]> {
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
  })) as Regulator[];
}

export async function getRegulator(id: string): Promise<Regulator | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...convertTimestamps(docSnap.data()),
    } as Regulator;
  }

  return null;
}

export async function createRegulator(
  centroFormacaoId: string,
  data: RegulatorFormData
): Promise<Regulator> {
  const db = requireDb();
  const now = new Date().toISOString();

  const regulatorData: Omit<Regulator, 'id'> = {
    ...data,
    centroFormacaoId,
    status: 'ativo',
    dataCriacao: now,
    dataAtualizacao: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION), regulatorData);

  return { id: docRef.id, ...regulatorData };
}

export async function updateRegulator(
  id: string,
  data: Partial<RegulatorFormData>
): Promise<void> {
  const db = requireDb();

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    dataAtualizacao: new Date().toISOString(),
  } as DocumentData);
}

export async function deleteRegulator(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function archiveRegulator(id: string): Promise<void> {
  const db = requireDb();

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: 'arquivado',
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function activateRegulator(id: string): Promise<void> {
  const db = requireDb();

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: 'ativo',
    dataAtualizacao: new Date().toISOString(),
  });
}

