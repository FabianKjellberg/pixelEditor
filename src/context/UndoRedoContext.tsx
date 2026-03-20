'use client';

import { Layer, LayerEntity, Rectangle } from '@/models/Layer';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLayerContext } from './LayerContext';
import { combineManyRectangles, combineRectangles } from '@/util/LayerUtil';

type UndoRedoValue = {
  undo: () => void;
  canUndo: boolean;
  redo: () => void;
  canRedo: boolean;
  checkPoint: (action: HistoryAction) => void;
};

export type HistoryAction = {
  up: LayerEntity[];
  down: LayerEntity[];
};

type historyState = {
  undo: HistoryAction[];
  redo: HistoryAction[];
};

type PendingLayerUpdate = {
  layers: LayerEntity[];
  dirtyRect: Rectangle;
} | null;

const MAX_HISTORY = 50;

const UndoRedoContext = createContext<UndoRedoValue | undefined>(undefined);

export const UndoRedoContextProvider = ({ children }: { children: ReactNode }) => {
  const { setLayerTreeItems, markDirty } = useLayerContext();

  const pendingUpdateRef = useRef<PendingLayerUpdate>(null);

  useEffect(() => {
    const u = pendingUpdateRef.current;
    if (!u) return;
    pendingUpdateRef.current = null;

    setLayerTreeItems((prev) => {
      const next = prev.map((item) => {
        const newLayer = u.layers.find((layer) => layer.id === item.id);

        if (!newLayer) return item;

        return newLayer;
      });

      return next;
    });

    markDirty(u.dirtyRect);
  }, [setLayerTreeItems, markDirty, pendingUpdateRef.current]);

  const [history, setHistory] = useState<historyState>({
    undo: [],
    redo: [],
  });

  const canUndo = useMemo((): boolean => history.undo.length > 0, [history.undo]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    setHistory((prev) => {
      const action = prev.undo[prev.undo.length - 1];

      const dirtyRect = combineManyRectangles([
        ...action.down.map((layer) => layer.layer.rect),
        ...action.up.map((layer) => layer.layer.rect),
      ]);

      pendingUpdateRef.current = {
        layers: action.up,
        dirtyRect: dirtyRect,
      };

      const { from, to } = popPushN(prev.undo, prev.redo, 1);

      return {
        undo: from,
        redo: to,
      };
    });
  }, [canUndo, history, setHistory]);

  const canRedo = useMemo((): boolean => history.redo.length > 0, [history.redo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setHistory((prev) => {
      const action = prev.redo[prev.redo.length - 1];

      const dirtyRect = combineManyRectangles([
        ...action.down.map((layer) => layer.layer.rect),
        ...action.up.map((layer) => layer.layer.rect),
      ]);

      pendingUpdateRef.current = {
        layers: action.down,
        dirtyRect: dirtyRect,
      };

      const { from, to } = popPushN(prev.redo, prev.undo, 1);

      return {
        undo: to,
        redo: from,
      };
    });
  }, [canRedo, history, setHistory]);

  const checkPoint = useCallback(
    (action: HistoryAction) => {
      setHistory((prev) => {
        const updated = [...prev.undo, action];

        return {
          redo: [],
          undo: [...updated.slice(-MAX_HISTORY)],
        };
      });
    },
    [history, setHistory],
  );

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const value = useMemo(
    () => ({
      undo,
      canUndo,
      redo,
      canRedo,
      checkPoint,
    }),
    [undo, canUndo, redo, canRedo, checkPoint],
  );

  return <UndoRedoContext.Provider value={value}>{children}</UndoRedoContext.Provider>;
};

export const useUndoRedoContext = () => {
  const ctx = useContext(UndoRedoContext);

  if (!ctx) {
    throw new Error('Have to be inside of the UndoRedoContextProvider to use it');
  }

  return ctx;
};

function popPushN<T>(from: T[], to: T[], count: number): { from: T[]; to: T[] } {
  const moved = from.slice(-count);
  const newFrom = from.slice(0, -count);
  const newTo = [...to, ...moved.slice().reverse()];
  return { from: newFrom, to: newTo };
}
