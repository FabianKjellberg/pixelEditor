'use client';

import { Cordinate, Rectangle, SelectionLayer } from '@/models/Layer';
import { convertSelectionLayer } from '@/util/LayerUtil';
import { createSelectionLayer } from '@/util/SelectionUtil';
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
  getCanvasRect: () => Rectangle;

  pan: Cordinate;
  getPan: () => Cordinate;
  setPan: (cor: Cordinate) => void;

  setPixelSize: (size: number) => void;
  pixelSize: number;

  selectionLayer: SelectionLayer | undefined;
  getSelectionLayer: () => SelectionLayer | undefined;
  setSelectionLayer: (selectionLayer: SelectionLayer | undefined) => void;
};

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [pixelSize, setPixelSize] = useState<number>(defaultPixelSize);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [height, setHeight] = useState<number>(defaultHeight);
  const [pan, setPanState] = useState<Cordinate>(defaultPan);
  const [selectionLayer, setSelectionLayer] = useState<SelectionLayer | undefined>(undefined);

  const panRef = useRef(pan);
  const selectionLayerRef = useRef(selectionLayer);
  const canvasRectRef = useRef<Rectangle>({ x: 0, y: 0, width: width, height: height });

  const getCanvasRect = useCallback((): Rectangle => {
    return canvasRectRef.current;
  }, []);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  useEffect(() => {
    selectionLayerRef.current = selectionLayer;
  }, [selectionLayer]);
  useEffect(() => {
    canvasRectRef.current = { x: 0, y: 0, width: width, height: height };
  }, [width, height]);

  const getPan = useCallback((): Cordinate => {
    return panRef.current;
  }, []);
  const getSelectionLayer = useCallback(() => {
    return selectionLayerRef.current;
  }, []);

  const setPan = useCallback((cor: Cordinate) => {
    setPanState(cor);
  }, []);
  const setSelectionLayerCallback = useCallback((selectionLayer: SelectionLayer | undefined) => {
    setSelectionLayer(selectionLayer);
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
      getCanvasRect,
      setDimensions,
      pan,
      getPan,
      setPan,
      selectionLayer,
      setSelectionLayer: setSelectionLayerCallback,
      getSelectionLayer,
    }),
    [
      pixelSize,
      setPixelSize,
      height,
      width,
      getCanvasRect,
      setDimensions,
      pan,
      getPan,
      setPan,
      selectionLayer,
      setSelectionLayerCallback,
      getSelectionLayer,
    ],
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
