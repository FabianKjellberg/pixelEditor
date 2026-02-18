'use client';

import { AiAction, AiActionEnum, AiPenStroke } from '@/models/AiModels';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useCanvasContext } from './CanvasContext';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from './LayerContext';
import { useUndoRedoContext } from './UndoRedoContext';
import { IProperty, SizeProperty } from '@/models/Tools/Properties';
import { rgbaToInt } from '@/helpers/color';

type AiActionsContextValue = {
  excecuteActions: (actions: AiAction[]) => void;
  getAiPrimaryColor: () => number;
  setAiPrimaryColor: (color: number) => void;
  getAiProperties: (toolKey: string) => IProperty[];
  setAiProperties: (toolKey: string, properties: IProperty[]) => void;
};

const AiActionContext = createContext<AiActionsContextValue | undefined>(undefined);

const DEFAULT_AI_COLOR = 0x000000ff;

export const AiActionsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { setActiveLayer, getActiveLayer } = useLayerContext();
  const { getSelectionLayer, getCanvasRect, setDimensions, pixelSize } = useCanvasContext();
  const { checkPoint, hasBaseline } = useUndoRedoContext();

  // AI-specific properties - isolated from user's ToolContext
  const [aiPrimaryColor, setAiPrimaryColorState] = useState<number>(DEFAULT_AI_COLOR);
  const [aiPropertiesMap, setAiPropertiesMapState] = useState<Map<string, IProperty[]>>(new Map());

  const aiPrimaryColorRef = useRef(aiPrimaryColor);
  const aiPropertiesRef = useRef(aiPropertiesMap);
  aiPrimaryColorRef.current = aiPrimaryColor;
  aiPropertiesRef.current = aiPropertiesMap;

  const getAiPrimaryColor = useCallback(() => aiPrimaryColorRef.current, []);
  const setAiPrimaryColor = useCallback((color: number) => setAiPrimaryColorState(color), []);

  const getAiProperties = useCallback(
    (toolKey: string) => aiPropertiesRef.current.get(toolKey) ?? [],
    [],
  );
  const setAiProperties = useCallback((toolKey: string, properties: IProperty[]) => {
    setAiPropertiesMapState((prev) => {
      const next = new Map(prev);
      next.set(toolKey, properties);
      return next;
    });
  }, []);

  const aiPenStroke = useCallback(
    (penStroke: AiPenStroke) => {
      if (penStroke.points.length < 1) console.log('no points to draw');

      setAiProperties('pencil', [new SizeProperty(penStroke.size)]);
      const color = rgbaToInt(penStroke.color.r, penStroke.color.g, penStroke.color.b);

      setAiPrimaryColor(color);

      const strokeSize = new SizeProperty(penStroke.size);
      const strokePen = new PenTool({
        setLayer: setActiveLayer,
        getLayer: getActiveLayer,
        getPrimaryColor: () => color,
        getProperties: (key) => (key === 'pencil' ? [strokeSize] : getAiProperties(key)),
        getSelectionLayer,
        getCanvasRect,
        checkPoint,
        hasBaseline,
      });

      strokePen.onDown(
        penStroke.points[0].x * pixelSize,
        penStroke.points[0].y * pixelSize,
        pixelSize,
      );

      for (let i = 1; i < penStroke.points.length; i++) {
        strokePen.onMove(
          penStroke.points[i].x * pixelSize,
          penStroke.points[i].y * pixelSize,
          pixelSize,
        );
      }

      strokePen.onUp();
    },
    [
      setAiProperties,
      setAiPrimaryColor,
      getAiProperties,
      setActiveLayer,
      getActiveLayer,
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
      hasBaseline,
      pixelSize,
    ],
  );

  const excecuteActions = useCallback(
    (actions: AiAction[]) => {
      console.log(actions);

      for (const action of actions) {
        switch (action.action) {
          case AiActionEnum.changeCanvasSize:
            setDimensions(action.width, action.height);
            break;

          case AiActionEnum.penStroke:
            aiPenStroke(action);
            break;

          default:
            break;
        }
      }
    },
    [setDimensions, aiPenStroke],
  );

  const value = useMemo(
    () => ({
      excecuteActions,
      getAiPrimaryColor,
      setAiPrimaryColor,
      getAiProperties,
      setAiProperties,
    }),
    [excecuteActions, getAiPrimaryColor, setAiPrimaryColor, getAiProperties, setAiProperties],
  );

  return <AiActionContext.Provider value={value}>{children}</AiActionContext.Provider>;
};

export const useAiActionContext = () => {
  const ctx = useContext(AiActionContext);
  if (!ctx) {
    throw new Error('useAiActionContext must be used within <AiActionContextProvider>');
  }

  return ctx;
};
