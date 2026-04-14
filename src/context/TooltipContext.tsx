'use client';

import { Cordinate } from '@/models/Layer';
import { ToolTipValues } from '@/models/ToolTipValues';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type TooltipValue = {
  canvasPos: Cordinate | undefined;
  setCanvasPos: (pos: Cordinate | undefined) => void;
  toolTipValues: ToolTipValues[];
  setToolTipValues: (values: ToolTipValues[]) => void;
};

const ToolTipContext = createContext<TooltipValue | undefined>(undefined);

export const ToolTipContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [canvasPos, setCanvasPos] = useState<Cordinate | undefined>(undefined);
  const [toolTipValues, setToolTipValues] = useState<ToolTipValues[]>([]);

  const setToolTipValuesCallback = useCallback((values: ToolTipValues[]) => {
    setToolTipValues(values);
  }, []);

  const value = useMemo(() => {
    return { canvasPos, setCanvasPos, setToolTipValues: setToolTipValuesCallback, toolTipValues };
  }, [canvasPos, setCanvasPos, setToolTipValuesCallback, toolTipValues]);

  return <ToolTipContext.Provider value={value}>{children}</ToolTipContext.Provider>;
};

export const useToolTipContext = () => {
  const ctx = useContext(ToolTipContext);

  if (!ctx) throw new Error('you have to be inside the tooltipprovider to use context');

  return ctx;
};
