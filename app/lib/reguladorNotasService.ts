import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { ReguladorNota } from '../types';

const COLLECTION = 'reguladorNotas';

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
// NOTAS DO REGULADOR
// ==========================================

export async function getNotasByCentro(
  centroFormacaoId: string
): Promise<ReguladorNota[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const querySnapshot = await getDocs(q);

  const notas = querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as ReguladorNota[];

  // Ordenar no cliente para evitar necessidade de índice composto
  return notas.sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
}

export async function getNotasByReferencia(
  referenciaId: string
): Promise<ReguladorNota[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('referenciaId', '==', referenciaId)
  );
  const querySnapshot = await getDocs(q);

  const notas = querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as ReguladorNota[];

  return notas.sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));
}

export async function createNota(
  data: Omit<ReguladorNota, 'id' | 'dataCriacao' | 'dataAtualizacao'>
): Promise<ReguladorNota> {
  const db = requireDb();
  const now = new Date().toISOString();

  // Remover campos undefined (Firestore não aceita undefined)
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );

  const notaData = {
    ...cleanData,
    dataCriacao: now,
    dataAtualizacao: now,
  } as Omit<ReguladorNota, 'id'>;

  const docRef = await addDoc(collection(db, COLLECTION), notaData);
  return { id: docRef.id, ...notaData };
}

export async function updateNota(
  id: string,
  conteudo: string
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, COLLECTION, id), {
    conteudo,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function deleteNota(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
