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
import type { ITool, IToolDeps } from '@/models/Tools/Tools';
import type { IProperty } from '@/models/Tools/Properties';

// Example fallback tool so the app has something usable by default
class NoopTool implements ITool {
  name: string = 'noop';
  deps: IToolDeps;
  onMove(_x: number, _y: number): void {}
  onUp(_x: number, _y: number): void {}
  onDown = (_x: number, _y: number) => {};

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }
}

type ToolContextValue = {
  activeTool: ITool;
  setActiveTool: (tool: ITool) => void;

  getProperties: (toolKey: string) => IProperty[];
  setProperties: (toolKey: string, properties: IProperty[]) => void;
  properties: IProperty[];

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
  const [activeTool, setActiveTool] = useState<ITool>(new NoopTool({}));
  const [primaryColor, setPrimaryColor] = useState<number>(0x000000ff);
  const [secondaryColor, setSecondaryColor] = useState<number>(0xffffffff);
  const [propertiesMap, setPropertiesMap] = useState<Map<string, IProperty[]>>(new Map());

  const propertiesRef = useRef(propertiesMap);
  useEffect(() => {
    propertiesRef.current = propertiesMap;
  }, [propertiesMap]);

  const getProperties = useCallback(
    (toolKey: string) => propertiesRef.current.get(toolKey) ?? [],
    [propertiesMap],
  );

  const setProperties = useCallback((toolKey: string, properties: IProperty[]) => {
    setPropertiesMap((prev) => {
      const next = new Map(prev);
      next.set(toolKey, properties);
      return next;
    });
  }, []);

  const properties = useMemo(
    () => propertiesMap.get(activeTool.name) ?? [],
    [propertiesMap, activeTool.name],
  );

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
      properties,
      setProperties,
      getProperties,
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
      properties,
      setProperties,
      getProperties,
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
