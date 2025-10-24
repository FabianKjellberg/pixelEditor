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
import type { Layer, Rectangle } from '@/models/Layer';
import { createLayer } from '@/util/LayerUtil';

const defaultRect: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
const defaultLayer: Layer[] = [createLayer(defaultRect, 'Layer 1')];

type LayerContextValue = {
  allLayers: Layer[];
  activeLayerIndex: number;
  setActiveLayerIndex: (index: number) => void;

  activeLayer: Layer;
  getActiveLayer: () => Layer | undefined;
  setActiveLayer: (layer: Layer, dirtyRectangle: Rectangle) => void;

  addLayer: (layer: Layer, index: number) => void;

  redrawVersion: number;
  consumeDirty: () => Rectangle[];
  markDirty: (dirty: Rectangle) => void;
};

const LayerContext = createContext<LayerContextValue | undefined>(undefined);

export const LayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [redrawVersion, setRedrawVersion] = useState(0);
  const dirtyQueueRef = useRef<Rectangle[]>([]);

  const pushDirty = useCallback(
    (dirtyRect: Rectangle): void => {
      dirtyQueueRef.current.push(dirtyRect);

      //push change
      setRedrawVersion((v) => v + 1);
    },
    [redrawVersion, dirtyQueueRef],
  );

  const consumeDirty = useCallback((): Rectangle[] => {
    //fetch queue
    const queue = dirtyQueueRef.current;

    //reset queue
    dirtyQueueRef.current = [];

    //return queue
    return queue;
  }, [dirtyQueueRef]);

  const [allLayers, setAllLayers] = useState<Layer[]>(defaultLayer);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);

  const allLayersRef = useRef(allLayers);
  const activeLayerIndexRef = useRef(activeLayerIndex);

  useEffect(() => {
    allLayersRef.current = allLayers;
  }, [allLayers]);
  useEffect(() => {
    activeLayerIndexRef.current = activeLayerIndex;
  }, [activeLayerIndex]);

  const getActiveLayer = useCallback(() => {
    const idx = activeLayerIndexRef.current;
    return allLayersRef.current[idx];
  }, []);

  const setActiveLayer = useCallback(
    (layer: Layer, dirtyRectangle: Rectangle) => {
      setAllLayers((prev) => {
        const idx = activeLayerIndexRef.current;
        if (idx < 0 || idx >= prev.length) return prev;
        const next = prev.slice();
        next[idx] = layer;
        return next;
      });

      pushDirty(dirtyRectangle);
    },
    [pushDirty],
  );

  const activeLayer = useMemo(() => allLayers[activeLayerIndex], [allLayers, activeLayerIndex]);

  const addLayer = useCallback(
    (layer: Layer, index?: number) => {
      setAllLayers((prev) => {
        const i = index == null ? prev.length : Math.max(0, Math.min(index, prev.length));
        return [...prev.slice(0, i), layer, ...prev.slice(i)];
      });
    },
    [allLayers],
  );

  const value = useMemo(
    () => ({
      allLayers,
      activeLayerIndex,
      setActiveLayerIndex,

      activeLayer,
      getActiveLayer,
      setActiveLayer,

      addLayer,

      redrawVersion,
      consumeDirty,
      markDirty: pushDirty,
    }),
    [
      allLayers,
      activeLayerIndex,
      setActiveLayerIndex,
      activeLayer,
      getActiveLayer,
      setActiveLayer,
      addLayer,
      redrawVersion,
      consumeDirty,
      pushDirty,
    ],
  );

  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
};

export const useLayerContext = () => {
  const ctx = useContext(LayerContext);
  if (!ctx) {
    throw new Error('useMenuContext must be used within <ToolProvider>');
  }
  return ctx;
};
