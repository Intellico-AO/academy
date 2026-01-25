import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, getFirebaseError } from './firebase';
import { UserAccount, TrainingCenter, RegisterFormData, UserRole } from '../types';

// Helper to get auth with error handling
function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) {
    const error = getFirebaseError();
    throw new Error(error || 'Firebase Auth não está inicializado. Verifique as configurações.');
  }
  return auth;
}

// Helper to get db with error handling
function requireDb() {
  const db = getFirebaseDb();
  if (!db) {
    const error = getFirebaseError();
    throw new Error(error || 'Firebase Firestore não está inicializado. Verifique as configurações.');
  }
  return db;
}

// ==========================================
// AUTENTICAÇÃO
// ==========================================

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const auth = requireAuth();
  const db = getFirebaseDb();
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Atualizar último acesso
  if (db) {
    try {
      const userDoc = await getUserByUid(userCredential.user.uid);
      if (userDoc) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          ultimoAcesso: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Não foi possível atualizar último acesso:', e);
    }
  }
  
  return userCredential.user;
}

export async function signOut(): Promise<void> {
  const auth = requireAuth();
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = requireAuth();
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    // Se auth não estiver disponível, retorna função vazia
    console.warn('Firebase Auth não disponível para onAuthChange');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ==========================================
// REGISTO DE CENTRO DE FORMAÇÃO
// ==========================================

export async function registerTrainingCenter(data: RegisterFormData): Promise<{
  center: TrainingCenter;
  user: UserAccount;
}> {
  const auth = requireAuth();
  const db = requireDb();

  // 1. Criar utilizador no Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.responsavelEmail,
    data.responsavelPassword
  );

  // Atualizar perfil do utilizador
  await updateProfile(userCredential.user, {
    displayName: data.responsavelNome,
  });

  const now = new Date().toISOString();

  // 2. Criar documento do Centro de Formação
  const centerRef = doc(collection(db, 'trainingCenters'));
  const center: TrainingCenter = {
    id: centerRef.id,
    nome: data.centroNome,
    nif: data.centroNif,
    email: data.centroEmail,
    telefone: data.centroTelefone,
    morada: data.centroMorada,
    codigoPostal: data.centroCodigoPostal,
    localidade: data.centroLocalidade,
    pais: data.centroPais,
    responsavel: data.responsavelNome,
    emailResponsavel: data.responsavelEmail,
    telefoneResponsavel: data.responsavelTelefone,
    certificacoes: [],
    areasFormacao: [],
    status: 'ativo',
    dataCriacao: now,
    dataAtualizacao: now,
  };

  await setDoc(centerRef, center);

  // 3. Criar documento do Utilizador
  const userRef = doc(collection(db, 'users'));
  const user: UserAccount = {
    id: userRef.id,
    uid: userCredential.user.uid,
    nome: data.responsavelNome,
    email: data.responsavelEmail,
    role: 'admin',
    centroFormacaoId: center.id,
    ativo: true,
    dataCriacao: now,
    ultimoAcesso: now,
  };

  await setDoc(userRef, user);

  return { center, user };
}

// ==========================================
// UTILIZADORES
// ==========================================

export async function getUserByUid(uid: string): Promise<UserAccount | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as UserAccount;
  }

  return null;
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserAccount;
  }

  return null;
}

export async function getUsersByCenterId(centroFormacaoId: string): Promise<UserAccount[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(collection(db, 'users'), where('centroFormacaoId', '==', centroFormacaoId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as UserAccount[];
}

export async function createUser(
  email: string,
  password: string,
  nome: string,
  role: UserRole,
  centroFormacaoId: string
): Promise<UserAccount> {
  const auth = requireAuth();
  const db = requireDb();

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(userCredential.user, {
    displayName: nome,
  });

  const now = new Date().toISOString();
  const userRef = doc(collection(db, 'users'));
  const user: UserAccount = {
    id: userRef.id,
    uid: userCredential.user.uid,
    nome,
    email,
    role,
    centroFormacaoId,
    ativo: true,
    dataCriacao: now,
    ultimoAcesso: now,
  };

  await setDoc(userRef, user);

  return user;
}

export async function updateUser(id: string, data: Partial<UserAccount>): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'users', id), data as Record<string, unknown>);
}

// ==========================================
// CENTROS DE FORMAÇÃO
// ==========================================

export async function getTrainingCenter(id: string): Promise<TrainingCenter | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const docRef = doc(db, 'trainingCenters', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TrainingCenter;
  }

  return null;
}

export async function updateTrainingCenter(id: string, data: Partial<TrainingCenter>): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, 'trainingCenters', id), {
    ...data,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function getAllTrainingCenters(): Promise<TrainingCenter[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const querySnapshot = await getDocs(collection(db, 'trainingCenters'));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as TrainingCenter[];
}

// ==========================================
// VERIFICAÇÕES
// ==========================================

export async function checkEmailExists(email: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const q = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

export async function checkNifExists(nif: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const q = query(collection(db, 'trainingCenters'), where('nif', '==', nif));
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}
