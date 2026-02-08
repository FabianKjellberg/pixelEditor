'use client';

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';

type LayerId = string;

type AutoSaveContextValue = {
  debounceSave: (layerId: LayerId, saveFn: (layerId: LayerId) => void, delay?: number) => void;
  dirty: boolean;
  dirtyCount: number;

  isSaving: boolean;
  beginSaving: (layerId: LayerId) => boolean;
  endSaving: (layerId: LayerId) => void;
};

const AutoSaveContext = createContext<AutoSaveContextValue | undefined>(undefined);

export const AutoSaveProvider = ({ children }: { children: React.ReactNode }) => {
  const saveTimersRef = useRef<Map<LayerId, number>>(new Map());
  const [dirtyCount, setDirtyCount] = useState(0);

  const savingRef = useRef<Set<LayerId>>(new Set());
  const [savingCount, setSavingCount] = useState(0);

  const isSaving = useMemo(() => {
    return savingCount > 0;
  }, [savingCount]);

  useEffect(() => {
    console.log(savingRef);
  }, [savingRef]);

  const beginSaving = useCallback(
    (layerId: LayerId): boolean => {
      const set = savingRef.current;

      if (set.has(layerId)) {
        return false;
      }

      set.add(layerId);
      savingRef.current = set;
      setSavingCount(set.size);

      return true;
    },
    [savingRef],
  );

  const endSaving = useCallback(
    (layerId: LayerId) => {
      const set = savingRef.current;

      set.delete(layerId);
      savingRef.current = set;
      setSavingCount(set.size);
    },
    [savingRef],
  );

  const debounceSave = useCallback(
    (layerId: LayerId, saveFn: (layerId: LayerId) => void, delay: number = 5000) => {
      const saveTimers = saveTimersRef.current;
      const wasDirty = saveTimers.has(layerId);

      const existing = saveTimers.get(layerId);
      if (existing) clearTimeout(existing);

      const timer = window.setTimeout(() => {
        saveTimers.delete(layerId);
        setDirtyCount(saveTimers.size);

        saveFn(layerId);
      }, delay);

      saveTimers.set(layerId, timer);

      if (!wasDirty) {
        setDirtyCount(saveTimers.size);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      debounceSave,
      dirty: dirtyCount > 0,
      dirtyCount,
      isSaving,
      beginSaving,
      endSaving,
    }),
    [debounceSave, dirtyCount, isSaving, beginSaving, endSaving],
  );

  return <AutoSaveContext.Provider value={value}>{children}</AutoSaveContext.Provider>;
};

export const useAutoSaveContext = () => {
  const ctx = useContext(AutoSaveContext);
  if (!ctx) throw new Error('useAutoSaveContext must be used within <AutoSaveProvider>');
  return ctx;
};
