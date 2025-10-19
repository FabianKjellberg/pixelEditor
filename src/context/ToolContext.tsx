'use client';

import { createContext, useContext, useMemo, useState } from 'react';
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
};

const ToolContext = createContext<ToolContextValue | undefined>(undefined);

export const ToolProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTool, setActiveTool] = useState<ITool>(new NoopTool());
  const value = useMemo(() => ({ activeTool, setActiveTool }), [activeTool]);

  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>;
};

export const useToolContext = () => {
  const ctx = useContext(ToolContext);
  if (!ctx) {
    throw new Error('useMenuContext must be used within <ToolProvider>');
  }
  return ctx;
};
