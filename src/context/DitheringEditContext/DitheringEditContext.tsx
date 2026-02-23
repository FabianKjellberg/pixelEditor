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
  const ref = useRef<DitheringEditState>(null);

  const setDitheringEdit = useCallback(
    (value: DitheringValue | null, onChange?: (next: DitheringValue) => void) => {
      if (value === null) {
        ref.current = null;
        setDitheringEditState(null);
        return;
      }
      if (!onChange) return;
      const state: DitheringEditState = {
        value,
        onChange: (next) => {
          onChange(next);
          const nextState = { value: next, onChange: state.onChange };
          ref.current = nextState;
          setDitheringEditState(nextState);
        },
      };
      ref.current = state;
      setDitheringEditState(state);
    },
    [],
  );

  const ditheringEditOrRef = ditheringEdit ?? ref.current;
  const value = useMemo(
    () => ({ ditheringEdit: ditheringEditOrRef, setDitheringEdit }),
    [ditheringEditOrRef, setDitheringEdit],
  );

  return (
    <DitheringEditContext.Provider value={value}>{children}</DitheringEditContext.Provider>
  );
};

export const useDitheringEdit = () => {
  const ctx = useContext(DitheringEditContext);
  if (!ctx) throw new Error('useDitheringEdit must be used within DitheringEditProvider');
  return ctx;
};
