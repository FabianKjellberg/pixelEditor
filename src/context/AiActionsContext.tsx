'use client';

import {
  AiAction,
  AiActionEnum,
  AiEllipseTool,
  AiFillBucket,
  AiLineTool,
  AiPenStroke,
  AiRectangleTool,
} from '@/models/AiModels';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useCanvasContext } from './CanvasContext';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from './LayerContext';
import { useUndoRedoContext } from './UndoRedoContext';
import {
  FillProperty,
  IProperty,
  OpacityProperty,
  SizeProperty,
  StrokeAlignProperty,
  StrokeWidthProperty,
} from '@/models/Tools/Properties';
import { rgbaToInt } from '@/helpers/color';
import { OvalTool } from '@/models/Tools/ShapeTools/OvalTool';
import { FillBucket } from '@/models/Tools/FillBucket';
import { LineTool } from '@/models/Tools/ShapeTools/LineTool';
import { RectangleTool } from '@/models/Tools/ShapeTools/RectangleTool';

type AiActionsContextValue = {
  excecuteActions: (actions: AiAction[]) => void | Promise<void>;
  getAiPrimaryColor: () => number;
  setAiPrimaryColor: (color: number) => void;
  getAiProperties: (toolKey: string) => IProperty[];
  setAiProperties: (toolKey: string, properties: IProperty[]) => void;
};

const AiActionContext = createContext<AiActionsContextValue | undefined>(undefined);

const DEFAULT_AI_COLOR = 0x000000ff;

/** Delay between each AI action (ms) so the canvas/undo can keep up */
const AI_ACTION_DELAY_MS = 150;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AiActionsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { setActiveLayer, getActiveLayer } = useLayerContext();
  const { getSelectionLayer, getCanvasRect, setDimensions, pixelSize } = useCanvasContext();
  const { checkPoint, hasBaseline } = useUndoRedoContext();

  // AI-specific properties - isolated from user's ToolContext
  const [aiPrimaryColor, setAiPrimaryColorState] = useState<number>(DEFAULT_AI_COLOR);
  const [aiSecondaryColor, setAiSecondaryColorState] = useState<number>(DEFAULT_AI_COLOR);
  const [aiPropertiesMap, setAiPropertiesMapState] = useState<Map<string, IProperty[]>>(new Map());

  const aiPrimaryColorRef = useRef(aiPrimaryColor);
  const aiSecondaryColorRef = useRef(aiSecondaryColor);
  const aiPropertiesRef = useRef(aiPropertiesMap);
  aiPrimaryColorRef.current = aiPrimaryColor;
  aiSecondaryColorRef.current = aiSecondaryColor;
  aiPropertiesRef.current = aiPropertiesMap;

  const getAiPrimaryColor = useCallback(() => aiPrimaryColorRef.current, []);
  const setAiPrimaryColor = useCallback((color: number) => setAiPrimaryColorState(color), []);

  const getAiSecondaryColor = useCallback(() => aiSecondaryColorRef.current, []);
  const setAiSecondaryColor = useCallback((color: number) => setAiSecondaryColorState(color), []);

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
      const color = rgbaToInt(
        penStroke.color.r,
        penStroke.color.g,
        penStroke.color.b,
        penStroke.opacity,
      );

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
        0,
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

  const aiEllipseTool = useCallback((ellpiseTool: AiEllipseTool) => {
    const strokeWidthProp = new StrokeWidthProperty(ellpiseTool.strokeWidth);
    const opacityProp = new OpacityProperty(ellpiseTool.opacity);
    const fillProp = new FillProperty(ellpiseTool.fill);
    const strokeAlignProp = new StrokeAlignProperty('Centered');

    const primaryColor = rgbaToInt(
      ellpiseTool.color.r,
      ellpiseTool.color.g,
      ellpiseTool.color.b,
      ellpiseTool.opacity,
    );

    const secondaryColor = rgbaToInt(
      ellpiseTool.fillColor.r,
      ellpiseTool.fillColor.g,
      ellpiseTool.fillColor.b,
      ellpiseTool.opacity,
    );

    const tool = new OvalTool({
      setLayer: setActiveLayer,
      getLayer: getActiveLayer,
      getPrimaryColor: () => primaryColor,
      getSecondaryColor: () => secondaryColor,
      getProperties: (key) => [strokeAlignProp, strokeWidthProp, fillProp, opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
      hasBaseline,
    });

    tool.onDown(ellpiseTool.from.x * pixelSize, ellpiseTool.from.y * pixelSize, pixelSize, 0);

    tool.onMove(ellpiseTool.to.x * pixelSize, ellpiseTool.to.y * pixelSize, pixelSize);

    tool.onUp(ellpiseTool.to.x * pixelSize, ellpiseTool.to.y * pixelSize, pixelSize);
  }, []);

  const aiFillBucket = useCallback((fillBucket: AiFillBucket) => {
    const opacityProp = new OpacityProperty(fillBucket.opacity);

    const color = rgbaToInt(
      fillBucket.color.r,
      fillBucket.color.g,
      fillBucket.color.b,
      fillBucket.opacity,
    );

    const tool = new FillBucket({
      setLayer: setActiveLayer,
      getLayer: getActiveLayer,
      getPrimaryColor: () => color,
      getProperties: (key) => [opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
      hasBaseline,
    });

    tool.onDown(fillBucket.x * pixelSize, fillBucket.y * pixelSize, pixelSize, 0);

    tool.onUp(fillBucket.x * pixelSize, fillBucket.y * pixelSize, pixelSize);
  }, []);

  const aiLineTool = useCallback((lineTool: AiLineTool) => {
    const strokeWidthProp = new StrokeWidthProperty(lineTool.strokeWidth);
    const opacityProp = new OpacityProperty(lineTool.opacity);

    const color = rgbaToInt(lineTool.color.r, lineTool.color.g, lineTool.color.b, lineTool.opacity);

    const tool = new LineTool({
      setLayer: setActiveLayer,
      getLayer: getActiveLayer,
      getPrimaryColor: () => color,
      getProperties: (key) => [strokeWidthProp, opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
      hasBaseline,
    });

    tool.onDown(lineTool.from.x * pixelSize, lineTool.from.y * pixelSize, pixelSize, 0);

    tool.onMove(lineTool.to.x * pixelSize, lineTool.to.y * pixelSize, pixelSize);

    tool.onUp(lineTool.to.x * pixelSize, lineTool.to.y * pixelSize, pixelSize);
  }, []);

  const aiRectangleTool = useCallback((rectangle: AiRectangleTool) => {
    const strokeWidthProp = new StrokeWidthProperty(rectangle.strokeWidth);
    const opacityProp = new OpacityProperty(rectangle.opacity);
    const fillProp = new FillProperty(rectangle.fill);
    const strokeAlignProp = new StrokeAlignProperty('Centered');

    const primaryColor = rgbaToInt(
      rectangle.color.r,
      rectangle.color.g,
      rectangle.color.b,
      rectangle.opacity,
    );

    const secondaryColor = rgbaToInt(
      rectangle.fillColor.r,
      rectangle.fillColor.g,
      rectangle.fillColor.b,
      rectangle.opacity,
    );

    const tool = new RectangleTool({
      setLayer: setActiveLayer,
      getLayer: getActiveLayer,
      getPrimaryColor: () => primaryColor,
      getSecondaryColor: () => secondaryColor,
      getProperties: (key) => [strokeAlignProp, strokeWidthProp, fillProp, opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
      hasBaseline,
    });

    tool.onDown(rectangle.from.x * pixelSize, rectangle.from.y * pixelSize, pixelSize, 0);

    tool.onMove(rectangle.to.x * pixelSize, rectangle.to.y * pixelSize, pixelSize);

    tool.onUp(rectangle.to.x * pixelSize, rectangle.to.y * pixelSize, pixelSize);
  }, []);

  const excecuteActions = useCallback(
    async (actions: AiAction[]) => {
      console.log(actions);

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        switch (action.action) {
          case AiActionEnum.changeCanvasSize:
            setDimensions(action.width, action.height);
            break;

          case AiActionEnum.penStroke:
            aiPenStroke(action);
            break;

          case AiActionEnum.ellipseTool:
            aiEllipseTool(action);
            break;

          case AiActionEnum.fillBucket:
            aiFillBucket(action);
            break;

          case AiActionEnum.lineTool:
            aiLineTool(action);
            break;

          case AiActionEnum.rectangleTool:
            aiRectangleTool(action);
            break;

          default:
            break;
        }
        if (i < actions.length - 1) {
          await delay(AI_ACTION_DELAY_MS);
        }
      }
    },
    [setDimensions, aiPenStroke, aiEllipseTool, aiFillBucket, aiLineTool, aiRectangleTool],
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
