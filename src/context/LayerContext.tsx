'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Layer } from '@/models/Layer';
import { createLayer } from '@/util/LayerUtil';

const defaultLayer: Layer[] = [createLayer(0, 0, 0, 0, "Layer 1")];

type LayerContextValue = {
  allLayers: Layer[];
  activeLayerIndex: number;
  setActiveLayerIndex: (index: number) => void;
  
  activeLayer: Layer
  getActiveLayer: () => Layer | undefined;
  setActiveLayer: (layer: Layer) => void 

  addLayer: (layer: Layer, index: number) => void;
};

const LayerContext = createContext<LayerContextValue | undefined>(undefined);

export const LayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [allLayers, setAllLayers] = useState<Layer[]>(defaultLayer);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);

  const allLayersRef = useRef(allLayers);
  const activeLayerIndexRef = useRef(activeLayerIndex);

  useEffect(() => {allLayersRef.current = allLayers},[allLayers]);
  useEffect(() => { activeLayerIndexRef.current = activeLayerIndex; }, [activeLayerIndex]);

  const getActiveLayer = useCallback(() => {
    const idx = activeLayerIndexRef.current;
    return allLayersRef.current[idx];
  },[])

  const setActiveLayer = useCallback((layer: Layer) => {
    console.log(layer)
    
    setAllLayers(prev => {
      const idx = activeLayerIndexRef.current;
      if (idx < 0 || idx >= prev.length) return prev;
      const next = prev.slice();
      next[idx] = layer;
      return next;
    })
  },[])

  const activeLayer = useMemo(() => (allLayers[activeLayerIndex]),[allLayers, activeLayerIndex])

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
    }),
    [allLayers, activeLayerIndex, getActiveLayer, setActiveLayer, addLayer],
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
