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
import type { Layer, LayerEntity, Rectangle } from '@/models/Layer';
import { createLayer, createLayerEntity } from '@/util/LayerUtil';

const defaultRect: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
const defaultLayer: LayerEntity[] = [createLayerEntity('Layer 1')];

type LayerContextValue = {
  allLayers: LayerEntity[];
  activeLayerIndex: number;
  setActiveLayerIndex: (index: number) => void;

  activeLayer: LayerEntity;
  getActiveLayer: () => LayerEntity | undefined;
  setActiveLayer: (
    updater: (prevLayer: LayerEntity) => { layer: LayerEntity; dirtyRect: Rectangle },
  ) => void;
  deleteLayer: (index: number) => void;
  moveLayer: (from: number, to: number) => void;

  addLayer: (layer: LayerEntity, index: number) => void;
  renameLayer: (name: string, layerIndex: number) => void;

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
    [dirtyQueueRef],
  );

  const consumeDirty = useCallback((): Rectangle[] => {
    //fetch queue
    const queue = dirtyQueueRef.current;

    //reset queue
    dirtyQueueRef.current = [];

    //return queue
    return queue;
  }, [dirtyQueueRef]);

  const [allLayers, setAllLayers] = useState<LayerEntity[]>(defaultLayer);
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
    (updater: (prevLayer: LayerEntity) => { layer: LayerEntity; dirtyRect: Rectangle }) => {
      let dirtyToPush: Rectangle | null = null;

      setAllLayers((prev) => {
        const idx = activeLayerIndexRef.current;
        if (idx < 0 || idx >= prev.length) return prev;

        const prevLayer = prev[idx];
        const { layer: nextLayer, dirtyRect } = updater(prevLayer);

        // store dirty to push after state update is scheduled
        dirtyToPush = dirtyRect;

        // no change -> return prev (optional micro-opt)
        if (nextLayer === prevLayer) return prev;

        pushDirty(dirtyToPush);

        const next = prev.slice();
        next[idx] = nextLayer;
        return next;
      });
    },
    [pushDirty],
  );

  const deleteLayer = useCallback(
    (index: number) => {
      if (allLayers.length <= 1) return;

      const dirtyRect = allLayers[index].layer.rect;

      if (index >= allLayers.length - 1) {
        setActiveLayerIndex(index - 1);
      }

      if (index <= activeLayerIndex)
        setActiveLayerIndex(activeLayerIndex - 1 < 0 ? 0 : activeLayerIndex - 1);

      if (activeLayerIndex >= allLayers.length - 1) {
        setActiveLayerIndex(activeLayerIndex - 1);
      }

      setAllLayers((prev) => {
        const i = index == null ? prev.length : Math.max(0, Math.min(index, prev.length));
        return [...prev.slice(0, i), ...prev.slice(i + 1)];
      });

      pushDirty(dirtyRect);
    },
    [pushDirty, setAllLayers, activeLayerIndex, setActiveLayerIndex, allLayers],
  );

  const activeLayer = useMemo(() => allLayers[activeLayerIndex], [allLayers, activeLayerIndex]);

  const addLayer = useCallback((layer: LayerEntity, index?: number) => {
    setAllLayers((prev) => {
      const i = index == null ? prev.length : Math.max(0, Math.min(index, prev.length));
      return [...prev.slice(0, i), layer, ...prev.slice(i)];
    });
  }, []);

  const renameLayer = useCallback(
    (name: string, layerIndex: number) => {
      setAllLayers((prev) =>
        prev.map((layer, index) => (index === layerIndex ? { ...layer, name } : layer)),
      );
    },
    [setAllLayers],
  );

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

  const moveLayer = useCallback(
    (from: number, to: number) => {
      const activeLayerName = allLayers[activeLayerIndex].name;

      const newLayers = (): LayerEntity[] => {
        if (allLayers.length === 0) return allLayers;

        const fromIdx = clamp(from, 0, allLayers.length - 1);
        let toIdx = clamp(to, 0, allLayers.length);

        if (fromIdx === toIdx) return allLayers;

        const item = allLayers[fromIdx];
        const without = [...allLayers.slice(0, fromIdx), ...allLayers.slice(fromIdx + 1)];

        if (toIdx > fromIdx) toIdx -= 1;

        toIdx = clamp(toIdx, 0, without.length);

        return [...without.slice(0, toIdx), item, ...without.slice(toIdx)];
      };

      let newIndex: number = 0;
      for (let i: number = 0; i < allLayers.length; i++) {
        if (newLayers()[i].name === activeLayerName) {
          newIndex = i;
          i = allLayers.length;
          continue;
        }
      }

      pushDirty(allLayers[from].layer.rect);

      setAllLayers(newLayers());
      setActiveLayerIndex(newIndex);
    },
    [pushDirty, allLayers, setAllLayers, setActiveLayerIndex, activeLayerIndex],
  );

  const value = useMemo(
    () => ({
      allLayers,
      activeLayerIndex,
      setActiveLayerIndex,

      activeLayer,
      getActiveLayer,
      setActiveLayer,
      deleteLayer,
      moveLayer,

      addLayer,
      renameLayer,

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
      deleteLayer,
      moveLayer,
      addLayer,
      renameLayer,
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
    throw new Error('cant access context from here');
  }
  return ctx;
};
