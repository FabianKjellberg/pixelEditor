'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const defaultPixelSize: number = 25;
const defaultWidth: number = 10;
const defaultHeight: number = 10;

type CanvasContextValue = {
  setDimensions: (width: number, height: number) => void;
  height: number;
  width: number;

  setPixelSize: (size: number) => void;
  pixelSize: number;
};

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [pixelSize, setPixelSize] = useState<number>(defaultPixelSize);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [height, setHeight] = useState<number>(defaultHeight);

  const setDimensions = useCallback(
    (width: number, height: number) => {
      setHeight(height);
      setWidth(width);
    },
    [width, height],
  );

  const value = useMemo(
    () => ({
      pixelSize,
      setPixelSize,
      width,
      height,
      setDimensions,
    }),
    [pixelSize, setPixelSize, height, width, setDimensions],
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvasContext = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error('cant access context from here');
  }
  return ctx;
};
