'use client';

import { Cordinate, SelectionLayer } from '@/models/Layer';
import { convertSelectionLayer, createSelectionLayer } from '@/util/LayerUtil';
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

const defaultSelectionLayer: SelectionLayer = createSelectionLayer(1, 1, false);

type CanvasContextValue = {
  setDimensions: (width: number, height: number) => void;
  height: number;
  width: number;

  pan: Cordinate;
  getPan: () => Cordinate;
  setPan: (cor: Cordinate) => void;

  setPixelSize: (size: number) => void;
  pixelSize: number;

  selectionLayer: SelectionLayer;
  getSelectionLayer: () => SelectionLayer | undefined;
  setSelectionLayer: (selectionLayer: SelectionLayer) => void;
};

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [pixelSize, setPixelSize] = useState<number>(defaultPixelSize);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [height, setHeight] = useState<number>(defaultHeight);
  const [pan, setpan] = useState<Cordinate>(defaultPan);
  const [selectionLayer, setSelectionLayer] = useState<SelectionLayer>(defaultSelectionLayer);

  const panRef = useRef(pan);
  const selectionLayerRef = useRef(selectionLayer);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);
  useEffect(() => {
    selectionLayerRef.current = selectionLayer;
  }, [selectionLayer]);

  const getPan = useCallback((): Cordinate => {
    return panRef.current;
  }, []);
  const getSelectionLayer = useCallback(() => {
    return selectionLayer;
  }, []);

  const setPan = useCallback((cor: Cordinate) => {
    setpan(cor);
  }, []);
  const setSelectionLayerCallback = useCallback((selectionLayer: SelectionLayer) => {
    setSelectionLayer(selectionLayer);
  }, []);
  const setDimensions = useCallback((width: number, height: number) => {
    setHeight(height);
    setWidth(width);
  }, []);

  useEffect(() => {
    const newSelectionLayer: SelectionLayer = convertSelectionLayer(selectionLayer, width, height);

    setSelectionLayerCallback(newSelectionLayer);
  }, [width, height]);

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
      selectionLayer,
      setSelectionLayer: setSelectionLayerCallback,
      getSelectionLayer,
    }),
    [
      pixelSize,
      setPixelSize,
      height,
      width,
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
