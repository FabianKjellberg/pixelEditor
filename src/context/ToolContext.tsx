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
import { upsertProperty, type AnyProperty, type IProperty } from '@/models/properties/Properties';

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

export type ColorChangeOrigin = 'pointer' | 'slider' | 'external';

export type ChangeColorTick = {
  tick: number;
  color: number;
  source: ColorChangeOrigin;
};

type ToolContextValue = {
  activeTool: ITool;
  getActiveTool: () => ITool;
  setActiveTool: (tool: ITool) => void;

  getProperties: (toolKey: string) => IProperty[];
  setProperties: (toolKey: string, properties: IProperty[]) => void;
  properties: IProperty[];

  ensureProperties: (toolKey: string, defaults: AnyProperty[]) => void;

  getPrimaryColor: () => number;
  setPrimaryColor: (color: number, origin: ColorChangeOrigin) => void;
  primaryColorChanged: ChangeColorTick;

  getSecondaryColor: () => number;
  setSecondaryColor: (color: number, origin: ColorChangeOrigin) => void;
  secondaryColorChanged: ChangeColorTick;

  flipPrimarySecondary: () => void;
};

const ToolContext = createContext<ToolContextValue | undefined>(undefined);

export const ToolProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTool, setActiveTool] = useState<ITool>(new NoopTool({}));

  const activeToolRef = useRef<ITool>(activeTool);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const setActiveToolCallback = useCallback(
    (tool: ITool) => {
      activeTool.onUp?.(0, 0, 0, 0);
      setActiveTool(tool);
    },
    [activeTool],
  );

  const getActiveTool = useCallback((): ITool => {
    return activeToolRef.current;
  }, []);

  const [primaryColor, setPrimaryColor] = useState<number>(0x000000ff);
  const [primaryColorChanged, setPrimaryColorChanged] = useState<ChangeColorTick>({
    tick: 0,
    source: 'external',
    color: primaryColor,
  });
  const [secondaryColor, setSecondaryColor] = useState<number>(0xffffffff);
  const [secondaryColorChanged, setSecondaryColorChanged] = useState<ChangeColorTick>({
    tick: 0,
    source: 'external',
    color: secondaryColor,
  });
  const [propertiesMap, setPropertiesMap] = useState<Map<string, AnyProperty[]>>(new Map());

  const propertiesRef = useRef(propertiesMap);
  useEffect(() => {
    propertiesRef.current = propertiesMap;

    activeTool.onAction?.('properties');
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
    setSecondaryColorChanged((prev) => {
      return { tick: prev.tick++, source: 'external', color: primaryColorTemp };
    });
    setPrimaryColorChanged((prev) => {
      return { tick: prev.tick++, source: 'external', color: secondaryColorTemp };
    });
  }, [setPrimaryColor, setSecondaryColor]);

  const setPrimaryColorCallback = useCallback((color: number, origin: ColorChangeOrigin) => {
    primaryColorRef.current = color;
    setPrimaryColor(color);
    setPrimaryColorChanged((prev) => {
      return { tick: prev.tick + 1, source: origin, color };
    });
  }, []);

  const setSecondaryColorCallback = useCallback((color: number, origin: ColorChangeOrigin) => {
    secondaryColorRef.current = color;
    setSecondaryColor(color);
    setSecondaryColorChanged((prev) => {
      return { tick: prev.tick + 1, source: origin, color };
    });
  }, []);

  const properties = useMemo(
    () => propertiesMap.get(activeTool.name) ?? [],
    [propertiesMap, activeTool.name],
  );

  const value = useMemo(
    () => ({
      activeTool,
      getActiveTool,
      setActiveTool: setActiveToolCallback,
      properties,
      setProperties,
      getProperties,
      ensureProperties,
      setPrimaryColor: setPrimaryColorCallback,
      getPrimaryColor,
      primaryColorChanged,
      setSecondaryColor: setSecondaryColorCallback,
      getSecondaryColor,
      secondaryColorChanged,
      flipPrimarySecondary,
    }),
    [
      activeTool,
      getActiveTool,
      setActiveTool,
      properties,
      setProperties,
      getProperties,
      ensureProperties,
      setPrimaryColor,
      getPrimaryColor,
      primaryColorChanged,
      setSecondaryColor,
      getSecondaryColor,
      secondaryColorChanged,
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
