'use client';

import { ITool } from '@/models/Tools/Tools';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useToolContext } from './ToolContext';
import { Transform } from '@/models/Tools/Transform';

type TransformContextValue = {
  transforming: boolean;
  setTransforming: (transform: boolean) => void;
};

const TransformContext = createContext<TransformContextValue | undefined>(undefined);

export const TransformContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeTool, setActiveTool } = useToolContext();

  const [transforming, setTransforming] = useState<boolean>(false);

  const lastToolRef = useRef<ITool | undefined>(undefined);

  const setTranformingCallback = useCallback(
    (transform: boolean) => {
      if (transform) {
        lastToolRef.current = activeTool;
        setActiveTool(new Transform());
      } else if (lastToolRef.current) {
        setActiveTool(lastToolRef.current);
        lastToolRef.current = undefined;
      }

      setTransforming(transform);
    },
    [activeTool],
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
