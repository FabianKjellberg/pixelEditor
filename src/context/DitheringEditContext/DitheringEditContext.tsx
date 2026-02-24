'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DitheringValue } from '@/models/Tools/Properties';

type DitheringEditState = {
  value: DitheringValue;
  onChange: (next: DitheringValue) => void;
} | null;

type DitheringEditContextValue = {
  ditheringEdit: DitheringEditState;
  setDitheringEdit: (
    value: DitheringValue | null,
    onChange?: (next: DitheringValue) => void,
  ) => void;
};

const DitheringEditContext = createContext<DitheringEditContextValue | undefined>(undefined);

export const DitheringEditProvider = ({ children }: { children: ReactNode }) => {
  const [ditheringEdit, setDitheringEditState] = useState<DitheringEditState>(null);

  const onChangeRef = useRef<((next: DitheringValue) => void) | null>(null);

  const setDitheringEdit = useCallback(
    (value: DitheringValue | null, onChange?: (next: DitheringValue) => void) => {
      if (value === null) {
        onChangeRef.current = null;
        setDitheringEditState(null);
        return;
      }
      if (!onChange) return;

      onChangeRef.current = onChange;

      const handler = (next: DitheringValue) => {
        onChangeRef.current?.(next);
        setDitheringEditState((prev) => (prev ? { ...prev, value: next } : prev));
      };

      setDitheringEditState({ value, onChange: handler });
    },
    [],
  );

  const value = useMemo(
    () => ({ ditheringEdit, setDitheringEdit }),
    [ditheringEdit, setDitheringEdit],
  );

  return <DitheringEditContext.Provider value={value}>{children}</DitheringEditContext.Provider>;
};

export const useDitheringEdit = () => {
  const ctx = useContext(DitheringEditContext);
  if (!ctx) throw new Error('useDitheringEdit must be used within DitheringEditProvider');
  return ctx;
};
