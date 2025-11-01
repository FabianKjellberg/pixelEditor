'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ITool } from '@/models/Tools/Tools';

// Example fallback tool so the app has something usable by default
class NoopTool implements ITool {
  name: string = 'noop';
  onMove(_x: number, _y: number): void {}
  onUp(_x: number, _y: number): void {}
  onDown = (_x: number, _y: number) => {};
}

type ToolContextValue = {
  activeTool: ITool;
  setActiveTool: (tool: ITool) => void;

  primaryColor: number;
  getPrimaryColor: () => number;
  setPrimaryColor: (color: number) => void;
  secondaryColor: number;
  getSecondaryColor: () => number;
  setSecondaryColor: (color: number) => void;
  flipPrimarySecondary: () => void;
};

const ToolContext = createContext<ToolContextValue | undefined>(undefined);

export const ToolProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTool, setActiveTool] = useState<ITool>(new NoopTool());
  const [primaryColor, setPrimaryColor] = useState<number>(0x000000ff);
  const [secondaryColor, setSecondaryColor] = useState<number>(0xffffffff);

  const primaryColorRef = useRef(primaryColor);
  const secondaryColorRef = useRef(secondaryColor);
  useEffect(() => {
    primaryColorRef.current = primaryColor;
  }, [primaryColor]);
  useEffect(() => {
    secondaryColorRef.current = secondaryColor;
  }, [secondaryColor]);
  const getPrimaryColor = useCallback(() => primaryColorRef.current, []);
  const getSecondaryColor = useCallback(() => secondaryColorRef.current, []);

  const flipPrimarySecondary = useCallback(() => {
    const primaryColorTemp = primaryColorRef.current;
    const secondaryColorTemp = secondaryColorRef.current;

    setPrimaryColor(secondaryColorTemp);
    setSecondaryColor(primaryColorTemp);
  }, [setPrimaryColor, setSecondaryColor]);

  const value = useMemo(
    () => ({
      activeTool,
      setActiveTool,
      setPrimaryColor,
      getPrimaryColor,
      primaryColor,
      setSecondaryColor,
      getSecondaryColor,
      secondaryColor,
      flipPrimarySecondary,
    }),
    [
      activeTool,
      setActiveTool,
      setPrimaryColor,
      getPrimaryColor,
      primaryColor,
      setSecondaryColor,
      getSecondaryColor,
      secondaryColor,
      flipPrimarySecondary,
    ],
  );

  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>;
};

export const useToolContext = () => {
  const ctx = useContext(ToolContext);
  if (!ctx) {
    throw new Error('useMenuContext must be used within <ToolProvider>');
  }
  return ctx;
};
