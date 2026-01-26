import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  fetchSignInMethodsForEmail,
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
import { UserAccount, TrainingCenter, RegisterFormData, UserRole, TrainerFormData, Trainer } from '../types';
import * as trainersService from './trainersService';

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

export interface EmailStatus {
  hasAccount: boolean;
  hasTrainer: boolean;
  userDoc: UserAccount | null;
  trainerDoc: Trainer | null;
}

export async function checkEmailStatus(email: string): Promise<EmailStatus> {
  const db = getFirebaseDb();

  if (!db)
    return {
      hasAccount: false,
      hasTrainer: false,
      userDoc: null,
      trainerDoc: null
    };

  let userDoc = await getUserByEmail(email);
  let hasAccount = false;

  console.log({ userDoc });

  if (userDoc) {
    hasAccount = true;

  }

  let hasTrainer = false;
  let trainerDoc: Trainer | null = null;

  if (!userDoc) {
    trainerDoc = await trainersService.getTrainerByEmail(email);
    hasTrainer = !!trainerDoc && !trainerDoc.userId; // Tem formador mas sem conta de utilizador
  }

  return { hasAccount, hasTrainer, userDoc, trainerDoc };
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const auth = requireAuth();
  const db = getFirebaseDb();

  if (!db) {
    const error = getFirebaseError();
    throw Object.assign(new Error(error || 'Sistema não disponível. Tente novamente.'), {
      code: 'auth/configuration-not-found',
    });
  }

  // 1. Verificar primeiro na coleção users
  let userDoc = await getUserByEmail(email);




  if (userDoc) {
    // 1.1 Tem conta na coleção users com uid: fazer login
    if (userDoc.uid) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(db, 'users', userDoc.id), {
        ultimoAcesso: new Date().toISOString(),
      });
      return userCredential.user;
    }

    // 1.2 Tem conta na coleção users sem uid: criar auth e atualizar
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: userDoc.nome });
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'users', userDoc.id), {
      uid: userCredential.user.uid,
      ultimoAcesso: now,
    });
    return userCredential.user;
  }

  // 2. Se não tem conta de utilizador, verificar na lista de formadores
  const trainerDoc = await trainersService.getTrainerByEmail(email);
  if (trainerDoc && !trainerDoc.userId) {
    // Tem formador mas sem conta de utilizador: criar utilizador a partir dos dados do formador
    const now = new Date().toISOString();
    const userRef = doc(collection(db, 'users'));
    const newUser: UserAccount = {
      id: userRef.id,
      uid: '', // Será preenchido após criar auth
      nome: trainerDoc.nome,
      email: trainerDoc.email,
      role: 'formador',
      centroFormacaoId: trainerDoc.centroFormacaoId,
      ativo: true,
      dataCriacao: now,
      ultimoAcesso: now,
    };

    // Criar conta Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: trainerDoc.nome });

    // Atualizar utilizador com uid
    newUser.uid = userCredential.user.uid;
    await setDoc(userRef, newUser);

    // Ligar formador ao utilizador criado
    await updateDoc(doc(db, 'trainers', trainerDoc.id), {
      userId: newUser.id,
    });

    return userCredential.user;
  }

  // 3. Não tem conta nem formador: rejeitar
  throw Object.assign(new Error('Não tem conta registada em nenhum centro de formação. Contacte o responsável do seu centro de formação.'), {
    code: 'auth/not-registered',
  });
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
    return () => { };
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

  // 4. Criar formador automaticamente para o responsável
  try {
    const trainerData: TrainerFormData = {
      nome: data.responsavelNome,
      email: data.responsavelEmail,
      telefone: data.responsavelTelefone,
      nif: '', // Será preenchido posteriormente se necessário
      morada: data.centroMorada || '',
      codigoPostal: data.centroCodigoPostal || '',
      localidade: data.centroLocalidade || '',
      dataNascimento: '',
      nacionalidade: 'Angolana',
      habilitacoes: '',
      certificacaoPedagogica: 'CCP',
      numeroCertificacao: '',
      validadeCertificacao: '',
      areasCompetencia: [],
      experienciaAnos: 0,
    };

    const trainer = await trainersService.createTrainer(center.id, trainerData);

    // Ligar o formador ao utilizador criado através do userId
    const trainerDocRef = doc(db, 'trainers', trainer.id);
    await updateDoc(trainerDocRef, {
      userId: user.id,
    });
  } catch (error) {
    // Se falhar ao criar formador, logar mas não bloquear o registo
    console.warn('Não foi possível criar formador automaticamente para o responsável:', error);
  }

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

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const db = getFirebaseDb();

  if (!db) return null;

  const q = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
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
