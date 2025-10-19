'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Layer } from '@/models/Layer';
import { createLayer } from '@/util/LayerUtil';

const defaultLayers: Layer[] = [createLayer(0, 0, 0, 0)];

type LayerContextValue = {
  allLayers: Layer[];
  activeLayerIndex: number;
  setActiveLayerIndex: (index: number) => void;
  activeLayer: Layer;
  setActiveLayer: (layer: Layer) => void;
};

const LayerContext = createContext<LayerContextValue | undefined>(undefined);

export const LayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [allLayers, setAllLayers] = useState<Layer[]>(defaultLayers);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);

  const activeLayer: Layer = useMemo(
    () => allLayers[activeLayerIndex],
    [allLayers, activeLayerIndex],
  );
  const setActiveLayer: (layer: Layer) => void = useCallback(
    (layer) => {
      setAllLayers((prev) =>
        prev.map((prevLayer, index) => (index === activeLayerIndex ? layer : prevLayer)),
      );
    },
    [allLayers, activeLayerIndex],
  );

  const value = useMemo(
    () => ({
      allLayers,
      activeLayerIndex,
      setActiveLayerIndex,
      activeLayer,
      setActiveLayer,
    }),
    [allLayers, activeLayerIndex, activeLayer],
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
