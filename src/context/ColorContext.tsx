'use client';

import { Palette } from '@/models/Palettes';
import { BLACK, Color, HSV, RGB, WHITE } from '@/models/Tools/Color';
import {
  createContext,
  Dispatch,
  SetStateAction,
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

  recentColors: string[];
  setRecentColors: (colors: string[]) => void;
  addRecentColor: (color: string) => void;

  flipPrimarySecondary: () => void;

  userPallets: Palette[];
  setUserPallets: Dispatch<SetStateAction<Palette[]>>;
};

const ColorContext = createContext<ColorContextValue | undefined>(undefined);

export const ColorContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [pColor, setPColor] = useState<Color>(BLACK);
  const [sColor, setSColor] = useState<Color>(WHITE);
  const [recentColors, setRecentColors] = useState<string[]>(['#000000', '#ffffff']);
  const [userPallets, setUserPallets] = useState<Palette[]>([]);

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

  const addRecentColor = useCallback(
    (color: string) => {
      setRecentColors((prev) => {
        const out = prev.filter((c) => c !== color);

        return [color, ...out].slice(0, 28);
      });
    },
    [setRecentColors],
  );

  const value = useMemo(
    () => ({
      pColor,
      setPColor,
      getPColor,
      sColor,
      setSColor,
      getSColor,
      recentColors,
      setRecentColors,
      flipPrimarySecondary,
      addRecentColor,
      userPallets,
      setUserPallets,
    }),
    [
      pColor,
      setPColor,
      getPColor,
      sColor,
      setSColor,
      getSColor,
      recentColors,
      setRecentColors,
      addRecentColor,
      userPallets,
      setUserPallets,
    ],
  );

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
};

export const useColorContext = () => {
  const ctx = useContext(ColorContext);

  if (!ctx) throw new Error('useColorContext has to be used within its provider');
  return ctx;
};
