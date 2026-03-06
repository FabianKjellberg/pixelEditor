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
import type { LayerEntity, LayerTreeItem, Rectangle } from '@/models/Layer';
import { createLayer, createLayerEntity } from '@/util/LayerUtil';
import { FetchedLayer } from '@/models/apiModels/projectModels';
import { getLayerFromBlob } from '@/util/BlobUtil';
import { useCanvasContext } from './CanvasContext';
import { useAutoSaveContext } from './AutoSaveContext';
import { api } from '@/api/client';
import { useToastContext } from './ToastContext/ToastContext';

const defaultLayer: LayerEntity[] = [createLayerEntity('Layer 1')];

type LayerContextValue = {
  layerTreeItems: LayerTreeItem[];
  setLayerTreeItems: React.Dispatch<React.SetStateAction<LayerTreeItem[]>>;

  activeLayerIds: string[];
  setActiveLayerIds: React.Dispatch<React.SetStateAction<string[]>>;

  allLayers: LayerEntity[];

  getActiveLayers: () => LayerEntity[] | undefined;
  setActiveLayers: (
    updater: (prevLayers: LayerEntity[]) => { layers: LayerEntity[]; dirtyRect: Rectangle },
  ) => void;
  setLayerById: (
    layerId: string,
    pixels: Uint32Array,
    rect: Rectangle,
    dirtyRect: Rectangle,
  ) => void;

  redrawVersion: number;
  consumeDirty: () => Rectangle[];
  markDirty: (dirty: Rectangle) => void;

  loadLayers: (layers: FetchedLayer[]) => Promise<void>;
  resetToBlankProject: (width: number, height: number, layers?: LayerEntity[]) => void;
};

const LayerContext = createContext<LayerContextValue | undefined>(undefined);

export const LayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [layerTreeItems, setLayerTreeItems] = useState<LayerTreeItem[]>(defaultLayer);
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>([defaultLayer[0].id]);

  const [redrawVersion, setRedrawVersion] = useState(0);
  const dirtyQueueRef = useRef<Rectangle[]>([]);

  const { getCanvasRect, isLoadedFromCloud, requestPreview } = useCanvasContext();
  const { debounceSave, beginSaving, endSaving } = useAutoSaveContext();
  const { onToast } = useToastContext();

  const isLoadedFromCloudRef = useRef(isLoadedFromCloud);

  useEffect(() => {
    isLoadedFromCloudRef.current = isLoadedFromCloud;
  }, [isLoadedFromCloud]);

  const pushDirty = useCallback(
    (dirtyRect: Rectangle): void => {
      dirtyQueueRef.current.push(dirtyRect);

      setRedrawVersion((v) => v + 1);
    },
    [dirtyQueueRef],
  );

  const consumeDirty = useCallback((): Rectangle[] => {
    const queue = dirtyQueueRef.current;

    dirtyQueueRef.current = [];

    return queue;
  }, [dirtyQueueRef]);

  const allLayers = useMemo((): LayerEntity[] => {
    const layers = layerTreeItems.filter((item) => item.type === 'layer');

    return layers;
  }, [layerTreeItems]);

  const allLayersRef = useRef(allLayers);
  const activeLayerIdsRef = useRef(activeLayerIds);

  useEffect(() => {
    allLayersRef.current = allLayers;
  }, [allLayers]);
  useEffect(() => {
    activeLayerIdsRef.current = activeLayerIds;
  }, [activeLayerIds]);

  const getActiveLayers = useCallback(() => {
    const ids = activeLayerIdsRef.current;
    return allLayersRef.current.filter((layer) => ids.some((id) => id === layer.id));
  }, []);

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

  const trySave = (layers: LayerEntity[]) => {
    if (isLoadedFromCloudRef.current) {
      layers.forEach((layer) => {
        debounceSave(layer.id, saveFunction);
      });
    }
  };

  const setActiveLayers = useCallback(
    (updater: (prevLayer: LayerEntity[]) => { layers: LayerEntity[]; dirtyRect: Rectangle }) => {
      let dirtyToPush: Rectangle | null = null;

      setLayerTreeItems((prev) => {
        const ids = activeLayerIdsRef.current;
        if (ids.length <= 0) {
          onToast('A layer needs to be selected for you to use this tool');
          return prev;
        }

        const prevLayers = prev.filter(
          (item): item is LayerEntity => item.type === 'layer' && ids.some((id) => id === item.id),
        );

        const { layers: nextLayers, dirtyRect } = updater(prevLayers);

        // store dirty to push after state update is scheduled
        dirtyToPush = dirtyRect;

        if (nextLayers === prevLayers) return prev;

        pushDirty(dirtyToPush);

        trySave(prevLayers);

        const layerMap = new Map(nextLayers.map((layer) => [layer.id, layer]));

        return prev.map((item) => layerMap.get(item.id) ?? item);
      });
    },
    [pushDirty, debounceSave, trySave],
  );

  const setLayerById = useCallback(
    (layerId: string, pixels: Uint32Array, rect: Rectangle, dirtyRect: Rectangle) => {
      setLayerTreeItems((prev) => {
        const idx = prev.findIndex((l) => l.id === layerId);
        if (idx === -1) return prev;

        const prevEntry = prev[idx];

        if (prevEntry.type !== 'layer') return prev;

        pushDirty(dirtyRect);
        trySave([prevEntry]);

        const next = prev.slice();
        next[idx] = {
          ...prevEntry,
          layer: { ...prevEntry.layer, pixels, rect },
        };
        return next;
      });
    },
    [setLayerTreeItems, pushDirty, trySave],
  );

  const resetToBlankProject = useCallback(
    (width: number, height: number, layers?: LayerEntity[]) => {
      const entities = layers ?? [
        createLayerEntity(
          'Layer 1',
          crypto.randomUUID(),
          createLayer({ x: 0, y: 0, width, height }),
        ),
      ];
      setLayerTreeItems(entities);
      setActiveLayerIds([entities[0].id]);
      pushDirty({ x: 0, y: 0, width, height });
    },
    [pushDirty, setLayerTreeItems, setActiveLayerIds],
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

      setLayerTreeItems(layerEntities);
      pushDirty(getCanvasRect());
    },
    [getCanvasRect, setLayerTreeItems],
  );

  const value = useMemo(
    () => ({
      //layerTreeItems
      layerTreeItems,
      setLayerTreeItems,

      activeLayerIds,
      setActiveLayerIds,

      //layers
      allLayers,

      //selected layer
      getActiveLayers,
      setActiveLayers,
      setLayerById,

      //dirt rectangles
      redrawVersion,
      consumeDirty,
      markDirty: pushDirty,

      //load layers
      loadLayers,
      resetToBlankProject,
    }),
    [
      layerTreeItems,
      setLayerTreeItems,
      allLayers,
      getActiveLayers,
      setActiveLayers,
      redrawVersion,
      consumeDirty,
      pushDirty,
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
