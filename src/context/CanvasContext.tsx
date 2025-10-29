'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const defaultWidth: number = 124;
const defaultHeight: number = 64;

type CanvasContextValue = {
  setDimensions: (width: number, height: number) => void;
  height: number;
  width: number;

  setPixelSize: (size: number) => void;
  pixelSize: number;
};

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [pixelSize, setPixelSize] = useState<number>(1);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [height, setHeight] = useState<number>(defaultHeight);

  useEffect(() => {
    const pixelHeight: number = Math.floor(window.innerHeight / defaultHeight);
    const pixelWidth: number = Math.floor((window.innerWidth - 200) / defaultWidth);

    setPixelSize(pixelHeight < pixelWidth ? pixelHeight : pixelWidth);
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
