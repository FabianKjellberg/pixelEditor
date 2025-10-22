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
  onMove(x: number, y: number): void {}
  onUp(x: number, y: number): void {}
  onDown = (_x: number, _y: number) => {};
}

type ToolContextValue = {
  activeTool: ITool;
  setActiveTool: (tool: ITool) => void;
  color: number;
  getColor: () => number;
  setColor: (color: number) => void;
};

const ToolContext = createContext<ToolContextValue | undefined>(undefined);

export const ToolProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTool, setActiveTool] = useState<ITool>(new NoopTool());
  const [color, setColor] = useState<number>(0x000000ff);

  const colorRef = useRef(color);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  const getColor = useCallback(() => colorRef.current, []);

  const value = useMemo(
    () => ({ activeTool, setActiveTool, setColor, getColor, color }),
    [activeTool, setActiveTool, setColor, getColor, color],
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
