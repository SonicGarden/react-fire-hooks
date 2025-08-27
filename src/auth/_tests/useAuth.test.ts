import { cleanup, renderHook } from '@testing-library/react-hooks';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { createUser } from '../../../tests/utils/firebase/admin';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';

console.log(process.env);
describe('useAuth', async () => {
  const { useAuth } = await import('../useAuth');

  beforeAll(() => {
    initializeTestApp();
  });

  beforeEach(async () => {
    await Promise.all([createUser('test@example.com', 'password', { admin: true })]);
  });

  afterEach(async () => {
    await Promise.all([clearFirebase(), cleanup(), vi.restoreAllMocks()]);
  });

  it('returns undefined when unauthenticated', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBe(undefined);
    expect(result.current.claims).toBe(undefined);
    expect(result.current.loading).toBe(undefined);
    expect(result.current.signedIn).toBe(undefined);
  });

  it('returns the user and claims when authenticated', async () => {
    const { result, waitFor } = renderHook(() => useAuth());
    await signInWithEmailAndPassword(getAuth(), 'test@example.com', 'password');
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.user).toEqual(expect.objectContaining({ email: 'test@example.com' }));
      expect(result.current.claims).toEqual(expect.objectContaining({ admin: true }));
      expect(result.current.signedIn).toBe(true);
    });
    await getAuth().signOut();
  });

  it('sets loading to true while authenticating', async () => {
    const { result, waitFor } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(undefined);
    const signInPromise = signInWithEmailAndPassword(getAuth(), 'test@example.com', 'password');
    await waitFor(() => expect(result.current.loading).toBe(true));
    await signInPromise;
    await getAuth().signOut();
  });

  it('sets signedIn to false when unauthenticated', async () => {
    const { result, waitFor } = renderHook(() => useAuth());
    await signInWithEmailAndPassword(getAuth(), 'test@example.com', 'password');
    await waitFor(() => expect(result.current.signedIn).toBe(true));
    await getAuth().signOut();
    await waitFor(() => expect(result.current.signedIn).toBe(false));
  });

  it('sets cookie when withCookie is true', async () => {
    const { result, waitFor } = renderHook(() => useAuth({ withCookie: true }));
    await signInWithEmailAndPassword(getAuth(), 'test@example.com', 'password');
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(document.cookie).toContain('__session=');
    });
    await getAuth().signOut();
    await waitFor(() => {
      expect(document.cookie).not.toContain('__session=');
    });
  });
});
