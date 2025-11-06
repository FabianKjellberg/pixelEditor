'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const defaultWidth: number = 64;
const defaultHeight: number = 64;
const defaultPixelSize: number = 25;
const defaultPanX: number = 10;
const defaultPanY: number = 10;

type CanvasContextValue = {
  setDimensions: (width: number, height: number) => void;
  height: number;
  width: number;

  setPan: (x: number, y: number) => void;
  panX: number;
  panY: number;

  setPixelSize: (size: number) => void;
  pixelSize: number;
};

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [pixelSize, setPixelSize] = useState<number>(defaultPixelSize);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [height, setHeight] = useState<number>(defaultHeight);
  const [panX, setPanX] = useState<number>(defaultPanX);
  const [panY, setPanY] = useState<number>(defaultPanY);

  const setPan = useCallback((x: number, y: number) => {
    setPanX(x), setPanY(y);
  }, []);

  const setDimensions = useCallback((width: number, height: number) => {
    setHeight(height);
    setWidth(width);
  }, []);

  const value = useMemo(
    () => ({
      pixelSize,
      setPixelSize,
      width,
      height,
      setDimensions,
      panX,
      panY,
      setPan,
    }),
    [pixelSize, setPixelSize, height, width, setDimensions, panX, panY, setPan],
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
