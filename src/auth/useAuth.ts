import { getAuth, getIdTokenResult, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import Cookies from 'js-cookie';
import { useState, useEffect, useMemo } from 'react';
import type { User, ParsedToken } from 'firebase/auth';

export const useAuth = (options?: { withCookie?: boolean; cookieKeyName?: string; cookiePath?: string }) => {
  const { withCookie = false, cookieKeyName = '__session', cookiePath = '/' } = options || {};

  const [user, setUser] = useState<User | null | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();
  const [claims, setClaims] = useState<ParsedToken | null | undefined>();
  const [hasCookie, setHasCookie] = useState<boolean>(() => {
    if (!withCookie) return false;
    return !!Cookies.get(cookieKeyName);
  });
  const signedIn = useMemo(() => {
    if (loading) return undefined;
    if (claims === undefined) return undefined;
    return !!claims && (withCookie ? hasCookie : true);
  }, [loading, claims, hasCookie]);

  useEffect(() => {
    let isMounted = true;
    const auth = getAuth();
    const authStateUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setLoading(true);
      setUser(user);
      const result = user && (await getIdTokenResult(user, true));
      setClaims(result?.claims || null);
      setLoading(false);
    });

    const idTokenUnsubscribe = withCookie
      ? onIdTokenChanged(auth, async (user) => {
          if (!isMounted) return;
          if (user) {
            Cookies.set(cookieKeyName, await user.getIdToken(true), { path: cookiePath });
            setHasCookie(true);
          } else {
            Cookies.remove(cookieKeyName, { path: cookiePath });
            setHasCookie(false);
          }
        })
      : undefined;

    return () => {
      authStateUnsubscribe();
      idTokenUnsubscribe?.();
      isMounted = false;
    };
  }, []);

  return { user, claims, loading, signedIn, hasCookie };
};
