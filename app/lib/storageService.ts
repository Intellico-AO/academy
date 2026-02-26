import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseApp, getFirebaseError } from './firebase';

function requireStorage() {
  const app = getFirebaseApp();
  if (!app) {
    const error = getFirebaseError();
    throw new Error(error || 'Firebase Storage não está inicializado');
  }
  return getStorage(app);
}

export async function uploadRegulatorImage(
  file: File,
  regulatorId: string
): Promise<string> {
  const storage = requireStorage();
  const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
  const path = `regulators/${regulatorId}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

