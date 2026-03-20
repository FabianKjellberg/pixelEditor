'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useCanvasContext } from './CanvasContext';
import { api } from '@/api/client';
import { LoadingState } from '@/components/Loading/Loading';

export type MetaChangeName = {
  type: 'name';
  name: string;
  id: string;
};

export type MetaChangeVisible = {
  type: 'visible';
  visible: boolean;
  id: string;
};

export type MetaChangeCollapse = {
  type: 'collapse';
  collapsed: boolean;
  id: string;
};

export type MetaChangeOpacity = {
  type: 'opacity';
  opacity: number;
  id: string;
};

export type MetaChangeValue =
  | MetaChangeName
  | MetaChangeVisible
  | MetaChangeCollapse
  | MetaChangeOpacity;

type MetaDataAutoSaveContextValue = {
  addChange: (value: MetaChangeValue) => void;
  removeIds: (ids: string[]) => void;
  metaSaveState: LoadingState;
};

const MetaDataAutoSaveContext = createContext<MetaDataAutoSaveContextValue | undefined>(undefined);

export const MetaDataAutoSaveProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoadedFromCloud, projectId } = useCanvasContext();

  const [changes, setChanges] = useState<MetaChangeValue[]>([]);
  const [metaSaveState, setMetaSaveState] = useState<LoadingState>('saved');
  const timeOutRef = useRef<number | null>(null);

  const saveChanges = useCallback(
    async (changesToSave: MetaChangeValue[]) => {
      try {
        setMetaSaveState('saving');
        await api.project.saveMetaData(changesToSave, projectId);
      } finally {
        setMetaSaveState('saved');
      }
    },
    [projectId],
  );

  useEffect(() => {
    if (!isLoadedFromCloud) return;

    setMetaSaveState('not-saved');

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }

    if (changes.length === 0) {
      return;
    }

    const delay = 5000;

    const timer = window.setTimeout(() => {
      const toSave = [...changes];
      setChanges([]);
      saveChanges(toSave);
      timeOutRef.current = null;
    }, delay);

    timeOutRef.current = timer;
  }, [changes]);

  const addChange = useCallback(
    (value: MetaChangeValue) => {
      setChanges((prev) => {
        const exist = prev.some((v) => v.type === value.type && v.id === value.id);

        if (exist) {
          return prev.map((v) => (v.id === value.id && v.type === value.type ? value : v));
        } else {
          return [...prev, value];
        }
      });
    },
    [setChanges],
  );

  const removeIds = useCallback((ids: string[]) => {}, []);

  const value = useMemo((): MetaDataAutoSaveContextValue => {
    return { addChange, removeIds, metaSaveState };
  }, [addChange, removeIds, metaSaveState]);

  return (
    <MetaDataAutoSaveContext.Provider value={value}>{children}</MetaDataAutoSaveContext.Provider>
  );
};

export const useMetaDataAutoSaveContext = () => {
  const ctx = useContext(MetaDataAutoSaveContext);
  if (!ctx) throw new Error('useMetaDataAutoSaveConttext must be used within its provider');
  return ctx;
};
