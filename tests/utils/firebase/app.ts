import { exec } from 'child_process';
import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { initializeTestAdminApp } from './admin';

const PROJECT_ID = 'demo-project';
const HOST = '127.0.0.1';
const AUTH_PORT = 9099;
const FIRESTORE_PORT = 8080;
const STORAGE_PORT = 9199;

const initializeTestApp = () => {
  if (getApps().length !== 0) return getApps()[0];

  process.env.GCLOUD_PROJECT = PROJECT_ID;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `${HOST}:${AUTH_PORT}`;
  process.env.FIRESTORE_EMULATOR_HOST = `${HOST}:${FIRESTORE_PORT}`;
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${HOST}:${STORAGE_PORT}`;
  const adminApp = initializeTestAdminApp();
  const app = initializeApp({
    apiKey: 'demo-api-key',
    authDomain: '',
    projectId: PROJECT_ID,
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
  connectAuthEmulator(getAuth(), `http://${HOST}:${AUTH_PORT}`, { disableWarnings: true });
  connectFirestoreEmulator(getFirestore(), HOST, FIRESTORE_PORT);
  connectStorageEmulator(getStorage(), HOST, STORAGE_PORT);
  return { app, adminApp };
};

const clearFirestore = async () => {
  await new Promise((resolve, reject) =>
    exec(
      `curl -v -X DELETE "http://${HOST}:${FIRESTORE_PORT}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents"`,
      (error, stdout) => (error ? reject(error) : resolve(stdout)),
    ),
  );
};

const clearAuth = async () => {
  await new Promise((resolve, reject) =>
    exec(
      `curl -H "Authorization: Bearer owner" -X DELETE "http://${HOST}:${AUTH_PORT}/emulator/v1/projects/${PROJECT_ID}/accounts"`,
      (error, stdout) => (error ? reject(error) : resolve(stdout)),
    ),
  );
};

const clearFirebase = async () => {
  await Promise.all([clearFirestore(), clearAuth()]);
};

export { initializeTestApp, clearFirestore, clearAuth, clearFirebase };
