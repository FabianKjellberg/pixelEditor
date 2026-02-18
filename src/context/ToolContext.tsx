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
import { upsertProperty, type AnyProperty, type IProperty } from '@/models/Tools/Properties';

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

  ensureProperties: (toolKey: string, defaults: AnyProperty[]) => void;

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
  const [propertiesMap, setPropertiesMap] = useState<Map<string, AnyProperty[]>>(new Map());

  const propertiesRef = useRef(propertiesMap);
  useEffect(() => {
    propertiesRef.current = propertiesMap;
  }, [propertiesMap]);

  const getProperties = useCallback((toolKey: string) => {
    return propertiesRef.current.get(toolKey) ?? [];
  }, []);

  const setProperties = useCallback((toolKey: string, properties: AnyProperty[]) => {
    setPropertiesMap((prev) => {
      const next = new Map(prev);
      next.set(toolKey, properties);
      return next;
    });
  }, []);

  const ensureProperties = useCallback((toolKey: string, defaults: AnyProperty[]) => {
    setPropertiesMap((prev) => {
      const current = prev.get(toolKey) ?? [];

      // First, remove any duplicate properties by propertyType (keep the first occurrence)
      const uniqueCurrent = current.filter(
        (prop, index, self) =>
          self.findIndex((p) => p.propertyType === prop.propertyType) === index,
      );

      let nextProps = uniqueCurrent;

      // Then upsert each default property
      for (const def of defaults) {
        nextProps = upsertProperty(nextProps, def) as AnyProperty[];
      }

      // If nothing changed, return prev map to avoid rerenders
      const changed =
        nextProps.length !== current.length ||
        nextProps.some((p, i) => p.propertyType !== current[i]?.propertyType) ||
        uniqueCurrent.length !== current.length;

      if (!changed) return prev;

      const next = new Map(prev);
      next.set(toolKey, nextProps);
      return next;
    });
  }, []);

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

  const properties = useMemo(
    () => propertiesMap.get(activeTool.name) ?? [],
    [propertiesMap, activeTool.name],
  );

  const value = useMemo(
    () => ({
      activeTool,
      setActiveTool,
      properties,
      setProperties,
      getProperties,
      ensureProperties,
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
      properties,
      setProperties,
      getProperties,
      ensureProperties,
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
