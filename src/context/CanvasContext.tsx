'use client';

import { Cordinate } from '@/models/Layer';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const defaultWidth: number = 64;
const defaultHeight: number = 64;
const defaultPixelSize: number = 25;
const defaultPan: Cordinate = { x: 0, y: 0 };

type CanvasContextValue = {
  setDimensions: (width: number, height: number) => void;
  height: number;
  width: number;

  pan: Cordinate;
  getPan: () => Cordinate;
  setPan: (cor: Cordinate) => void;

  setPixelSize: (size: number) => void;
  pixelSize: number;
};

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [pixelSize, setPixelSize] = useState<number>(defaultPixelSize);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [height, setHeight] = useState<number>(defaultHeight);
  const [pan, setpan] = useState<Cordinate>(defaultPan);

  const panRef = useRef(pan);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const getPan = useCallback((): Cordinate => {
    return panRef.current;
  }, []);

  const setPan = useCallback((cor: Cordinate) => {
    setpan(cor);
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
      pan,
      getPan,
      setPan,
    }),
    [pixelSize, setPixelSize, height, width, setDimensions, pan, getPan, setPan],
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
