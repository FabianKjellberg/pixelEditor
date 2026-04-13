'use client';

import { BLACK, Color, HSV, RGB, WHITE } from '@/models/Tools/Color';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ColorContextValue = {
  pColor: Color;
  setPColor: (color: Color) => void;
  getPColor: () => Color;
  sColor: Color;
  setSColor: (color: Color) => void;
  getSColor: () => Color;

  flipPrimarySecondary: () => void;
};

const ColorContext = createContext<ColorContextValue | undefined>(undefined);

export const ColorContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [pColor, setPColor] = useState<Color>(BLACK);
  const [sColor, setSColor] = useState<Color>(WHITE);

  const pColorRef = useRef<Color>(pColor);
  const sColorRef = useRef<Color>(sColor);

  useEffect(() => {
    pColorRef.current = pColor;
  }, [pColor]);
  useEffect(() => {
    sColorRef.current = sColor;
  }, [sColor]);

  const getPColor = useCallback(() => {
    return pColorRef.current;
  }, []);
  const getSColor = useCallback(() => {
    return sColorRef.current;
  }, []);

  const flipPrimarySecondary = useCallback(() => {
    const primaryColorTemp = pColorRef.current;
    const secondaryColorTemp = sColorRef.current;

    setPColor(secondaryColorTemp);
    setSColor(primaryColorTemp);
  }, []);

  const value = useMemo(
    () => ({
      pColor,
      setPColor,
      getPColor,
      sColor,
      setSColor,
      getSColor,
      flipPrimarySecondary,
    }),
    [pColor, setPColor, getPColor, sColor, setSColor, getSColor],
  );

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
};

export const useColorContext = () => {
  const ctx = useContext(ColorContext);

  if (!ctx) throw new Error('useColorContext has to be used within its provider');
  return ctx;
};
