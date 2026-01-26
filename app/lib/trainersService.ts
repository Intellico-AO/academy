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
import { Trainer, TrainerFormData } from '../types';

const COLLECTION = 'trainers';

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
// FORMADORES
// ==========================================

export async function getTrainers(centroFormacaoId: string): Promise<Trainer[]> {
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
  })) as Trainer[];
}

export async function getTrainer(id: string): Promise<Trainer | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Trainer;
  }

  return null;
}

export async function createTrainer(
  centroFormacaoId: string,
  data: TrainerFormData
): Promise<Trainer> {
  const db = requireDb();

  const now = new Date().toISOString();
  const trainerData: Omit<Trainer, 'id'> = {
    ...data,
    centroFormacaoId,
    status: 'ativo',
    dataCriacao: now,
    dataAtualizacao: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION), trainerData);
  
  return { id: docRef.id, ...trainerData };
}

export async function updateTrainer(
  id: string,
  data: Partial<TrainerFormData>
): Promise<void> {
  const db = requireDb();

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    dataAtualizacao: new Date().toISOString(),
  } as DocumentData);
}

export async function deleteTrainer(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function archiveTrainer(id: string): Promise<void> {
  const db = requireDb();

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: 'arquivado',
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function activateTrainer(id: string): Promise<void> {
  const db = requireDb();

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: 'ativo',
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function getActiveTrainers(centroFormacaoId: string): Promise<Trainer[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('centroFormacaoId', '==', centroFormacaoId),
    where('status', '==', 'ativo')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as Trainer[];
}

export async function checkTrainerEmailExists(
  centroFormacaoId: string,
  email: string
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const q = query(
    collection(db, COLLECTION),
    where('centroFormacaoId', '==', centroFormacaoId),
    where('email', '==', email)
  );
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

export async function checkTrainerNifExists(
  centroFormacaoId: string,
  nif: string
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const q = query(
    collection(db, COLLECTION),
    where('centroFormacaoId', '==', centroFormacaoId),
    where('nif', '==', nif)
  );
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

export async function getTrainerByEmail(email: string): Promise<Trainer | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, COLLECTION), where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Trainer;
  }

  return null;
}
