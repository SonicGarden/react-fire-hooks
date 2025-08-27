import { getAuth, getIdTokenResult, onIdTokenChanged } from 'firebase/auth';
import { useState, useEffect, useMemo } from 'react';
import type { User, ParsedToken } from 'firebase/auth';
import Cookies from 'js-cookie';

const isEqualUser = (a: User | null | undefined, b: User | null | undefined) => {
  if (a !== b) return false;
  if (a === null && b === null) return true;
  if (a === undefined && b === undefined) return true;
  if (a?.displayName !== b?.displayName) return false;
  if (a?.email !== b?.email) return false;
  if (a?.emailVerified !== b?.emailVerified) return false;
  if (a?.isAnonymous !== b?.isAnonymous) return false;
  if (a?.phoneNumber !== b?.phoneNumber) return false;
  if (a?.photoURL !== b?.photoURL) return false;
  if (a?.providerId !== b?.providerId) return false;
  if (a?.tenantId !== b?.tenantId) return false;
  if (a?.uid !== b?.uid) return false;
  return true;
};

export const useAuth = (options?: { withCookie?: boolean; cookieKeyName?: string; cookiePath?: string }) => {
  const { withCookie = false, cookieKeyName = '__session', cookiePath = '/' } = options || {};

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
    const unsubscribe = onIdTokenChanged(auth, async (_user) => {
      if (!isMounted) return;
      setLoading(true);
      if (!isEqualUser(user, _user)) {
        setUser(_user);
      }
      const result = _user && (await getIdTokenResult(_user, true));

      if (!isEqualUser(user, _user) || JSON.stringify(result?.claims) !== JSON.stringify(claims)) {
        setClaims(result?.claims || null);
      }
      if (withCookie) {
        if (_user && result?.token) {
          Cookies.set(cookieKeyName, result.token, { path: cookiePath });
        } else {
          Cookies.remove(cookieKeyName, { path: cookiePath });
        }
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      isMounted = false;
    };
  }, []);

  return { user, claims, loading, signedIn };
};
