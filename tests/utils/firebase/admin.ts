import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const initializeTestAdminApp = () => {
  return initializeApp();
};

const createUser = async (email: string, password: string, claims: object | null = null) => {
  const auth = getAuth();
  const user = await auth.createUser({ email, password });
  await auth.setCustomUserClaims(user.uid, claims);
  return user;
};

export { initializeTestAdminApp, createUser };
