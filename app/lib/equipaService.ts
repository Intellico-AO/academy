import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { UserAccount } from '../types';

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase não inicializado');
  return db;
}

// Buscar membros da equipa (responsáveis e assistentes) de um centro
export async function getEquipa(
  centroFormacaoId: string
): Promise<UserAccount[]> {
  const db = requireDb();

  const q = query(
    collection(db, 'users'),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map(
      (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as UserAccount
    )
    .filter(
      (u) => u.role === 'responsavel' || u.role === 'assistente'
    );
}

// Desativar membro da equipa
export async function archiveMembro(id: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'users', id), { ativo: false });
}

// Ativar membro da equipa
export async function activateMembro(id: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'users', id), { ativo: true });
}
