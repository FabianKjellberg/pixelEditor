'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type SettingsContextValue = {
  showSelectedLayerBoundary: boolean;
  setShowSelectedLayerBoundary: (show: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [showSelectedLayerBoundary, setShowSelectedLayerBoundary] = useState<boolean>(false);

  const value = useMemo(
    () => ({ showSelectedLayerBoundary, setShowSelectedLayerBoundary }),
    [showSelectedLayerBoundary, setShowSelectedLayerBoundary],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useMenuContext must be used within <ToolProvider>');
  }
  return ctx;
};
