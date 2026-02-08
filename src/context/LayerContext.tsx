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
import { FetchedLayer } from '@/models/apiModels/projectModels';
import { getLayerFromBlob } from '@/util/BlobUtil';
import { useCanvasContext } from './CanvasContext';
import { useAutoSaveContext } from './AutoSaveContext';
import { api } from '@/api/client';

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

  requestPreview: () => Promise<Blob>;
  registerPreviewProvider: (fn: () => Promise<Blob>) => void;

  loadLayers: (layers: FetchedLayer[]) => Promise<void>;
  resetToBlankProject: (width: number, height: number, layers?: LayerEntity[]) => void;
};

const LayerContext = createContext<LayerContextValue | undefined>(undefined);

export const LayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [redrawVersion, setRedrawVersion] = useState(0);
  const dirtyQueueRef = useRef<Rectangle[]>([]);

  const { getCanvasRect, isLoadedFromCloud, projectId } = useCanvasContext();
  const { debounceSave, beginSaving, endSaving } = useAutoSaveContext();

  const isLoadedFromCloudRef = useRef(isLoadedFromCloud);

  useEffect(() => {
    isLoadedFromCloudRef.current = isLoadedFromCloud;
  }, [isLoadedFromCloud]);

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

  // get a preview blob from the canvas backing ref
  const previewProviderRef = useRef<(() => Promise<Blob>) | null>(null);

  const registerPreviewProvider = (fn: () => Promise<Blob>) => {
    previewProviderRef.current = fn;
  };

  const requestPreview = (): Promise<Blob> => {
    if (previewProviderRef.current) {
      return previewProviderRef.current();
    }

    throw new Error('no preview function provided');
  };

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

        if (nextLayer === prevLayer) return prev;

        pushDirty(dirtyToPush);

        trySave(prevLayer);

        const next = prev.slice();
        next[idx] = nextLayer;
        return next;
      });
    },
    [pushDirty, isLoadedFromCloud, debounceSave],
  );

  const trySave = (layer: LayerEntity) => {
    if (isLoadedFromCloudRef.current) {
      debounceSave(layer.id, saveFunction);
    }
  };

  const saveFunction = (layerId: string) => {
    const layer: LayerEntity | undefined = allLayersRef.current.find((l) => l.id == layerId);

    if (!layer) {
      throw new Error('could not find layer to save');
    }

    if (!beginSaving(layerId)) {
      // maybe implement a waiting here
      throw new Error('this layer is already saving');
    }

    api.layer
      .saveLayer(layer, requestPreview)
      .catch((error) => {
        throw new Error(error);
      })
      .finally(() => {
        endSaving(layer.id);
      });
  };

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

      if (isLoadedFromCloud) {
        const rect = allLayers[index].layer.rect;
        const shouldPreview = rect.width > 0 && rect.height > 0;
        const layerId = allLayers[index].id;

        api.layer.deleteLayer(layerId, shouldPreview, requestPreview);
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

  const addLayer = useCallback(
    (layer: LayerEntity, index?: number) => {
      setAllLayers((prev) => {
        const i = index == null ? prev.length : Math.max(0, Math.min(index, prev.length));
        return [...prev.slice(0, i), layer, ...prev.slice(i)];
      });

      setActiveLayerIndex(index ?? allLayers.length - 1);

      if (isLoadedFromCloud) {
        api.layer.addLayer(layer, projectId, requestPreview, index);
      }
    },
    [isLoadedFromCloud, requestPreview, projectId, setActiveLayerIndex],
  );

  const renameLayer = useCallback(
    (name: string, layerIndex: number) => {
      setAllLayers((prev) =>
        prev.map((layer, index) => (index === layerIndex ? { ...layer, name } : layer)),
      );

      if (isLoadedFromCloud) {
        api.layer.renameLayer(allLayers[layerIndex].id, name);
      }
    },
    [setAllLayers, isLoadedFromCloud, allLayers],
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

      const indexedLayers = newLayers();

      if (isLoadedFromCloud) {
        api.layer.moveLayers(indexedLayers, requestPreview);
      }

      pushDirty(allLayers[from].layer.rect);

      setAllLayers(indexedLayers);
      setActiveLayerIndex(newIndex);
    },
    [pushDirty, allLayers, setAllLayers, setActiveLayerIndex, activeLayerIndex],
  );

  const resetToBlankProject = useCallback(
    (width: number, height: number, layers?: LayerEntity[]) => {
      const entities = layers ?? [
        createLayerEntity('Layer 1', crypto.randomUUID(), createLayer({ x: 0, y: 0, width, height })),
      ];
      setAllLayers(entities);
      setActiveLayerIndex(0);
      pushDirty({ x: 0, y: 0, width, height });
    },
    [pushDirty, setAllLayers, setActiveLayerIndex],
  );

  //Load layers
  const loadLayers = useCallback(
    async (layers: FetchedLayer[]): Promise<void> => {
      console.log(layers);

      const layerEntities: LayerEntity[] = (
        await Promise.all(
          layers.map(async (layer: FetchedLayer) => {
            return getLayerFromBlob(layer);
          }),
        )
      ).filter((layer): layer is LayerEntity => layer !== null);

      setAllLayers(layerEntities);
      pushDirty(getCanvasRect());
    },
    [getCanvasRect, setAllLayers],
  );

  const value = useMemo(
    () => ({
      //layers
      allLayers,
      activeLayerIndex,
      setActiveLayerIndex,

      //selected layer
      activeLayer,
      getActiveLayer,
      setActiveLayer,

      //built in functions
      deleteLayer,
      moveLayer,
      addLayer,
      renameLayer,

      //dirt rectangles
      redrawVersion,
      consumeDirty,
      markDirty: pushDirty,

      //preview
      requestPreview,
      registerPreviewProvider,

      //load layers
      loadLayers,
      resetToBlankProject,
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
      requestPreview,
      registerPreviewProvider,
      loadLayers,
      resetToBlankProject,
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
