'use client';

import { ITool } from '@/models/Tools/Tools';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useToolContext } from './ToolContext';
import { TransformTool } from '@/models/Tools/Transform';
import { useLayerContext } from './LayerContext';
import { useCanvasContext } from './CanvasContext';
import { useUndoRedoContext } from './UndoRedoContext';
import { useToastContext } from './ToastContext/ToastContext';

type TransformContextValue = {
  transforming: boolean;
  setTransforming: (transform: boolean) => void;
};

const TransformContext = createContext<TransformContextValue | undefined>(undefined);

export const TransformContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeTool, setActiveTool, getProperties } = useToolContext();
  const { setActiveLayers, getActiveLayers } = useLayerContext();
  const { getCanvasRect, getSelectionLayer } = useCanvasContext();
  const { checkPoint } = useUndoRedoContext();
  const { onToast } = useToastContext();

  const [transforming, setTransforming] = useState<boolean>(false);

  const lastToolRef = useRef<ITool | undefined>(undefined);

  const setTranformingCallback = useCallback(
    (transform: boolean) => {
      if (transform) {
        lastToolRef.current = activeTool;
        setActiveTool(
          new TransformTool({
            setLayers: setActiveLayers,
            getLayers: getActiveLayers,
            getProperties,
            getSelectionLayer,
            getCanvasRect,
            checkPoint,
            onToast,
          }),
        );
      } else if (lastToolRef.current) {
        setActiveTool(lastToolRef.current);
        lastToolRef.current = undefined;
      }

      setTransforming(transform);
    },
    [
      activeTool,
      setActiveLayers,
      getActiveLayers,
      getProperties,
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
      onToast,
    ],
  );

  const value = useMemo(() => {
    return {
      transforming,
      setTransforming: setTranformingCallback,
    };
  }, [transforming, setTranformingCallback]);

  return <TransformContext.Provider value={value}>{children}</TransformContext.Provider>;
};

export const useTransformContext = () => {
  const ctx = useContext(TransformContext);
  if (!ctx) throw new Error('you need to use transformcontext inside of its provider');
  return ctx;
};
