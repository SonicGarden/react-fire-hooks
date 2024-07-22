import { getAuth, getIdTokenResult, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect, useMemo } from 'react';
import type { User, ParsedToken } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();
  const [claims, setClaims] = useState<ParsedToken | null | undefined>();
  const signedIn = useMemo(() => {
    if (loading) return undefined;
    if (claims === undefined) return undefined;
    return !!claims;
  }, [loading, claims]);

  useEffect(() => {
    let isMounted = true;
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setLoading(true);
      setUser(user);
      const result = user && (await getIdTokenResult(user, true));
      setClaims(result?.claims || null);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      isMounted = false;
    };
  }, []);

  return { user, claims, loading, signedIn };
};
