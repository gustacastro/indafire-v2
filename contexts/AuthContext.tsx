'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthCookies } from '@/app/actions/auth.actions';
import { decodeToken, isTokenExpired, validateToken } from '@/lib/auth';
import {
  AuthContextValue,
  AuthProviderProps,
  AuthUser,
  NormalizedPermissions,
  NormalizedModules,
  PermissionActions,
} from '@/types/contexts/auth.types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialToken,
  initialPermissions,
  initialModules,
}: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() =>
    initialToken ? decodeToken(initialToken) : null
  );
  const [permissions, setPermissions] = useState<NormalizedPermissions>(initialPermissions);
  const [modules, setModules] = useState<NormalizedModules>(initialModules);
  const [isLoading, setIsLoading] = useState(!!initialToken);

  useEffect(() => {
    if (!initialToken) {
      setIsLoading(false);
      return;
    }

    if (isTokenExpired(initialToken)) {
      clearAuthCookies().then(() => {
        setUser(null);
        setPermissions({});
        setModules({});
        setIsLoading(false);
        router.push('/login');
      });
      return;
    }

    validateToken(initialToken).then((valid) => {
      if (!valid) {
        clearAuthCookies().then(() => {
          setUser(null);
          setPermissions({});
          setModules({});
          router.push('/login');
        });
      }
      setIsLoading(false);
    });
  }, [initialToken, router]);

  const hasPermission = useCallback(
    (module: string, action: keyof PermissionActions): boolean => {
      if (!(module in permissions)) return true;
      const modulePerms = permissions[module];
      if (!modulePerms) return false;
      return !!modulePerms[action];
    },
    [permissions]
  );

  const logout = useCallback(async () => {
    await clearAuthCookies();
    setUser(null);
    setPermissions({});
    setModules({});
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        modules,
        isAuthenticated: !!user,
        isLoading,
        hasPermission,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
