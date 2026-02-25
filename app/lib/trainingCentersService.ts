import {
  addDoc,
  collection,
  type DocumentData,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { AuditLog, Status, TrainingCenter, UserAccount } from '../types';
import { getFirebaseDb } from './firebase';

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
// CENTROS DE FORMAÇÃO
// ==========================================

export async function getAllTrainingCenters(): Promise<TrainingCenter[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const querySnapshot = await getDocs(collection(db, 'trainingCenters'));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as TrainingCenter[];
}

export async function getTrainingCenter(
  id: string
): Promise<TrainingCenter | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const docRef = doc(db, 'trainingCenters', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...convertTimestamps(docSnap.data()),
    } as TrainingCenter;
  }
  return null;
}

export async function updateTrainingCenterStatus(
  id: string,
  status: Status
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'trainingCenters', id), {
    status,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function updateTrainingCenter(
  id: string,
  data: Partial<TrainingCenter>
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'trainingCenters', id), {
    ...data,
    dataAtualizacao: new Date().toISOString(),
  });
}

// ==========================================
// ESTATÍSTICAS POR CENTRO
// ==========================================

export async function getUserCountByCenter(
  centroFormacaoId: string
): Promise<number> {
  const db = getFirebaseDb();
  if (!db) return 0;

  const q = query(
    collection(db, 'users'),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getCourseCountByCenter(
  centroFormacaoId: string
): Promise<number> {
  const db = getFirebaseDb();
  if (!db) return 0;

  const q = query(
    collection(db, 'courses'),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getTrainerCountByCenter(
  centroFormacaoId: string
): Promise<number> {
  const db = getFirebaseDb();
  if (!db) return 0;

  const q = query(
    collection(db, 'trainers'),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getUsersByCenter(
  centroFormacaoId: string
): Promise<UserAccount[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, 'users'),
    where('centroFormacaoId', '==', centroFormacaoId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...convertTimestamps(docSnap.data()),
  })) as UserAccount[];
}

export interface CenterStats {
  totalUtilizadores: number;
  totalCursos: number;
  totalFormadores: number;
}

export async function getCenterStats(
  centroFormacaoId: string
): Promise<CenterStats> {
  const [totalUtilizadores, totalCursos, totalFormadores] = await Promise.all([
    getUserCountByCenter(centroFormacaoId),
    getCourseCountByCenter(centroFormacaoId),
    getTrainerCountByCenter(centroFormacaoId),
  ]);

  return { totalUtilizadores, totalCursos, totalFormadores };
}

// ==========================================
// NOTIFICAÇÕES (REGISTO EM AUDIT LOG)
// ==========================================

export async function createNotificationLog(
  centroFormacaoId: string,
  centroNome: string,
  assunto: string,
  mensagem: string,
  utilizador: string
): Promise<string> {
  const db = requireDb();
  const now = new Date().toISOString();

  const log: Omit<AuditLog, 'id'> = {
    entidadeTipo: 'centro',
    entidadeId: centroFormacaoId,
    entidadeNome: centroNome,
    acao: 'criar',
    detalhes: `Notificação enviada — Assunto: ${assunto} | Mensagem: ${mensagem}`,
    alteracoesAntes: null,
    alteracoesDepois: { assunto, mensagem },
    utilizador,
    centroFormacaoId,
    dataHora: now,
  };

  const docRef = await addDoc(collection(db, 'auditLogs'), log);
  return docRef.id;
}

export async function createStatusChangeLog(
  centroFormacaoId: string,
  centroNome: string,
  statusAnterior: Status,
  statusNovo: Status,
  utilizador: string
): Promise<string> {
  const db = requireDb();
  const now = new Date().toISOString();

  const log: Omit<AuditLog, 'id'> = {
    entidadeTipo: 'centro',
    entidadeId: centroFormacaoId,
    entidadeNome: centroNome,
    acao:
      statusNovo === 'ativo'
        ? 'ativar'
        : statusNovo === 'arquivado'
          ? 'arquivar'
          : 'editar',
    detalhes: `Estado alterado de "${statusAnterior}" para "${statusNovo}"`,
    alteracoesAntes: { status: statusAnterior },
    alteracoesDepois: { status: statusNovo },
    utilizador,
    centroFormacaoId,
    dataHora: now,
  };

  const docRef = await addDoc(collection(db, 'auditLogs'), log);
  return docRef.id;
}
