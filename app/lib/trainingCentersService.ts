import {
  doc,
  collection,
  query,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  where,
  orderBy,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { TrainingCenter, Status, Notification, NotificationType } from '../types';

function requireDb() {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore não está inicializado.');
  }
  return db;
}

// ==========================================
// CENTROS DE FORMAÇÃO
// ==========================================

export async function getAllTrainingCenters(): Promise<TrainingCenter[]> {
  const db = requireDb();
  const querySnapshot = await getDocs(collection(db, 'trainingCenters'));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as TrainingCenter[];
}

export async function getTrainingCenterById(id: string): Promise<TrainingCenter | null> {
  const db = requireDb();
  const docRef = doc(db, 'trainingCenters', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TrainingCenter;
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

// ==========================================
// NOTIFICAÇÕES
// ==========================================

export async function sendNotification(data: {
  centroFormacaoId: string;
  centroFormacaoNome: string;
  reguladorId: string;
  reguladorNome: string;
  tipo: NotificationType;
  assunto: string;
  mensagem: string;
}): Promise<Notification> {
  const db = requireDb();
  const now = new Date().toISOString();

  const docRef = await addDoc(collection(db, 'notifications'), {
    ...data,
    lida: false,
    dataCriacao: now,
  });

  return {
    id: docRef.id,
    ...data,
    lida: false,
    dataCriacao: now,
  };
}

export async function getNotificationsByCenter(
  centroFormacaoId: string
): Promise<Notification[]> {
  const db = requireDb();
  const q = query(
    collection(db, 'notifications'),
    where('centroFormacaoId', '==', centroFormacaoId),
    orderBy('dataCriacao', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Notification[];
}

export async function getNotificationsByRegulator(
  reguladorId: string
): Promise<Notification[]> {
  const db = requireDb();
  const q = query(
    collection(db, 'notifications'),
    where('reguladorId', '==', reguladorId),
    orderBy('dataCriacao', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Notification[];
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'notifications', id), { lida: true });
}

// ==========================================
// ESTATÍSTICAS
// ==========================================

export async function getTrainingCentersStats(): Promise<{
  total: number;
  ativos: number;
  arquivados: number;
  rascunho: number;
}> {
  const centers = await getAllTrainingCenters();
  return {
    total: centers.length,
    ativos: centers.filter((c) => c.status === 'ativo').length,
    arquivados: centers.filter((c) => c.status === 'arquivado').length,
    rascunho: centers.filter((c) => c.status === 'rascunho').length,
  };
}
