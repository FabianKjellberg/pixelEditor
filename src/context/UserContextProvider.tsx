'use client';

import { api } from '@/api/client';
import { logout as apiLogout, User } from '@/api/users';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type UserContextValue = {
  user: User | null;
  loadingUser: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const trySetUser = useCallback(async () => {
    const userEntity = await api.users.getLoggedInUser();

    setUser(userEntity);
    setLoadingUser(false);
  }, [setUser, setLoadingUser]);

  const logout = useCallback(async () => {
    const success = await apiLogout();
    if (success) {
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    trySetUser();
  }, []);

  const value = useMemo(
    () => ({
      user: user,
      loadingUser: loadingUser,
      refetchUser: trySetUser,
      logout,
    }),
    [user, loadingUser, trySetUser, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within <UserProvider>');
  }
  return ctx;
};
