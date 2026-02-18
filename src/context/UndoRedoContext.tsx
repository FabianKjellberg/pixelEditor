'use client';

import { LayerEntity, Rectangle } from '@/models/Layer';
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
import { combineRectangles } from '@/util/LayerUtil';

type UndoRedoValue = {
  undo: () => void;
  canUndo: boolean;
  redo: () => void;
  canRedo: boolean;
  checkPoint: (layer: LayerEntity) => void;
  hasBaseline: (layerId: string) => boolean;
};

type historyState = {
  undo: LayerEntity[];
  redo: LayerEntity[];
};

const MAX_HISTORY = 50;

const UndoRedoContext = createContext<UndoRedoValue | undefined>(undefined);

export const UndoRedoContextProvider = ({ children }: { children: ReactNode }) => {
  const { setLayerById } = useLayerContext();

  type PendingLayerUpdate = {
    id: string;
    pixels: Uint32Array;
    rect: Rectangle;
    dirtyRect: Rectangle;
  } | null;

  const pendingUpdateRef = useRef<PendingLayerUpdate>(null);

  useEffect(() => {
    const u = pendingUpdateRef.current;
    if (!u) return;
    pendingUpdateRef.current = null;
    setLayerById(u.id, u.pixels, u.rect, u.dirtyRect);
  }, [setLayerById, pendingUpdateRef.current]);

  const [history, setHistory] = useState<historyState>({
    undo: [],
    redo: [],
  });

  const canUndo = useMemo((): boolean => history.undo.length > 1, [history.undo]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    setHistory((prev) => {
      const u = prev.undo;
      const len = u.length;

      // is baseline means that there is a layer in the beggining that was created to make a reference for a
      // new layer being changed ex 1, 1, 2, 2 the first 2 will not represent a change but rather just a
      // "this is how layer 2 originally looked".
      const isBaseLine: boolean = len >= 4 && u[len - 3].id !== u[len - 2].id;

      // the new layer is the layer that will be shown after the undo is performed.
      const newLayer: LayerEntity = u[len - 2];

      //only need to get the prev layers rect to update the canvas
      const prevLayerRect: Rectangle = u[len - 1].layer.rect;

      // im getting both rectangles from the new layer and the old layer to make sure that every possible
      // pixel that can have been changed will update
      const dirtyRect: Rectangle = combineRectangles(newLayer.layer.rect, prevLayerRect);

      pendingUpdateRef.current = {
        id: newLayer.id,
        pixels: newLayer.layer.pixels,
        rect: newLayer.layer.rect,
        dirtyRect,
      };

      const { from, to } = popPushN(prev.undo, prev.redo, isBaseLine ? 2 : 1);

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
      const u = prev.undo;
      const r = prev.redo;
      const uLen = u.length;
      const rLen = r.length;

      // here the only important thing to look at is that there is a different layer at the top of each stack.
      // which would mean that the last undo was has a baseline
      const isBaseLine: boolean = u[uLen - 1].id !== r[rLen - 1].id;

      const newLayer: LayerEntity = r[rLen - (isBaseLine ? 2 : 1)];
      const prevRect: Rectangle = isBaseLine ? r[rLen - 1].layer.rect : u[uLen - 1].layer.rect;
      const dirtyRect: Rectangle = combineRectangles(newLayer.layer.rect, prevRect);

      pendingUpdateRef.current = {
        id: newLayer.id,
        pixels: newLayer.layer.pixels,
        rect: newLayer.layer.rect,
        dirtyRect,
      };

      const { from, to } = popPushN(prev.redo, prev.undo, isBaseLine ? 2 : 1);

      return {
        undo: to,
        redo: from,
      };
    });
  }, [canRedo, history, setHistory]);

  const checkPoint = useCallback(
    (layer: LayerEntity) => {
      setHistory((prev) => {
        const updated = [...prev.undo, layer];

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

  const hasBaseline = useCallback((layerId: string) => {
    const l = historyRef.current.undo.length;

    if (l === 0) return false;

    return historyRef.current.undo[historyRef.current.undo.length - 1].id === layerId;
  }, []);

  const value = useMemo(
    () => ({
      undo,
      canUndo,
      redo,
      canRedo,
      checkPoint,
      hasBaseline,
    }),
    [undo, canUndo, redo, canRedo, checkPoint, hasBaseline],
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
