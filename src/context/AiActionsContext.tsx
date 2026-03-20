'use client';

import { AiToolCall } from '@/models/AiModels';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useCanvasContext } from './CanvasContext';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from './LayerContext';
import { useUndoRedoContext } from './UndoRedoContext';
import {
  FillProperty,
  GradientTypeProperty,
  IProperty,
  OpacityProperty,
  SingleColor,
  SizeProperty,
  StrokeAlignProperty,
  StrokeWidthProperty,
} from '@/models/Tools/Properties';
import { rgbaToInt } from '@/helpers/color';
import { OvalTool } from '@/models/Tools/ShapeTools/OvalTool';
import { FillBucket } from '@/models/Tools/AreaTools/FillBucket';
import { GradientTool } from '@/models/Tools/AreaTools/GradientTool';
import { LineTool } from '@/models/Tools/ShapeTools/LineTool';
import { RectangleTool } from '@/models/Tools/ShapeTools/RectangleTool';
import { FreeformTool } from '@/models/Tools/ShapeTools/Freeform';
import { LayerEntity } from '@/models/Layer';
import { createLayerEntity } from '@/util/LayerUtil';
import { useLayerSelectorContext } from './LayerSelectorContext';

type AiActionsContextValue = {
  excecuteActions: (actions: AiToolCall[]) => void | Promise<void>;
  getAiPrimaryColor: () => number;
  setAiPrimaryColor: (color: number) => void;
  getAiProperties: (toolKey: string) => IProperty[];
  setAiProperties: (toolKey: string, properties: IProperty[]) => void;
};

const AiActionContext = createContext<AiActionsContextValue | undefined>(undefined);

const DEFAULT_AI_COLOR = 0x000000ff;

/** Delay between each AI action (ms) so the canvas/undo can keep up */
const AI_ACTION_DELAY_MS = 75;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AiActionsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { setActiveLayers, getActiveLayers, setActiveLayerIds } = useLayerContext();
  const { addLayer } = useLayerSelectorContext();
  const { getSelectionLayer, getCanvasRect, setDimensions, pixelSize } = useCanvasContext();
  const { checkPoint } = useUndoRedoContext();

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
    (penStroke: AiToolCall) => {
      if (penStroke.tool != 'penStroke') return;

      const args = penStroke.args;

      if (args.points.length < 1) console.log('no points to draw');

      setAiProperties('pencil', [new SizeProperty(args.size)]);
      const color = rgbaToInt(args.color.r, args.color.g, args.color.b, args.opacity);

      setAiPrimaryColor(color);

      const strokeSize = new SizeProperty(args.size);
      const strokePen = new PenTool({
        setLayers: setActiveLayers,
        getLayers: getActiveLayers,
        getPrimaryColor: () => color,
        getProperties: (key) => (key === 'pencil' ? [strokeSize] : getAiProperties(key)),
        getSelectionLayer,
        getCanvasRect,
        checkPoint,
      });

      strokePen.onDown(args.points[0].x * pixelSize, args.points[0].y * pixelSize, pixelSize, 0);

      for (let i = 1; i < args.points.length; i++) {
        strokePen.onMove(args.points[i].x * pixelSize, args.points[i].y * pixelSize, pixelSize);
      }

      strokePen.onUp();
    },
    [
      setAiProperties,
      setAiPrimaryColor,
      getAiProperties,
      setActiveLayers,
      getActiveLayers,
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
      pixelSize,
    ],
  );

  const aiEllipseTool = useCallback((ellpiseTool: AiToolCall) => {
    if (ellpiseTool.tool != 'ellipseTool') return;

    const args = ellpiseTool.args;

    const strokeWidthProp = new StrokeWidthProperty(args.strokeWidth);
    const opacityProp = new OpacityProperty(args.opacity);
    const fillProp = new FillProperty(args.fill);
    const strokeAlignProp = new StrokeAlignProperty('Centered');

    const primaryColor = rgbaToInt(args.color.r, args.color.g, args.color.b, args.opacity);

    const secondaryColor = rgbaToInt(
      args.fillColor.r,
      args.fillColor.g,
      args.fillColor.b,
      args.opacity,
    );

    const tool = new OvalTool({
      setLayers: setActiveLayers,
      getLayers: getActiveLayers,
      getPrimaryColor: () => primaryColor,
      getSecondaryColor: () => secondaryColor,
      getProperties: (key) => [strokeAlignProp, strokeWidthProp, fillProp, opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
    });

    tool.onDown(args.from.x * pixelSize, args.from.y * pixelSize, pixelSize, 0);

    tool.onMove(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize);

    tool.onUp(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize);
  }, []);

  const aiFillBucket = useCallback((fillBucket: AiToolCall) => {
    if (fillBucket.tool != 'fillBucket') return;

    const args = fillBucket.args;

    const opacityProp = new OpacityProperty(args.opacity);

    const color = rgbaToInt(args.color.r, args.color.g, args.color.b, args.opacity);

    const tool = new FillBucket({
      setLayers: setActiveLayers,
      getLayers: getActiveLayers,
      getPrimaryColor: () => color,
      getProperties: (key) => [opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
    });

    tool.onDown(args.x * pixelSize, args.y * pixelSize, pixelSize, 0);

    tool.onUp(args.x * pixelSize, args.y * pixelSize, pixelSize);
  }, []);

  const aiLineTool = useCallback((lineTool: AiToolCall) => {
    if (lineTool.tool != 'lineTool') return;

    const args = lineTool.args;

    const strokeWidthProp = new StrokeWidthProperty(args.strokeWidth);
    const opacityProp = new OpacityProperty(args.opacity);

    const color = rgbaToInt(args.color.r, args.color.g, args.color.b, args.opacity);

    const tool = new LineTool({
      setLayers: setActiveLayers,
      getLayers: getActiveLayers,
      getPrimaryColor: () => color,
      getProperties: (key) => [strokeWidthProp, opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
    });

    tool.onDown(args.from.x * pixelSize, args.from.y * pixelSize, pixelSize, 0);

    tool.onMove(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize);

    tool.onUp(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize);
  }, []);

  const aiRectangleTool = useCallback((rectangle: AiToolCall) => {
    if (rectangle.tool != 'rectangleTool') return;

    const args = rectangle.args;

    const strokeWidthProp = new StrokeWidthProperty(args.strokeWidth);
    const opacityProp = new OpacityProperty(args.opacity);
    const fillProp = new FillProperty(args.fill);
    const strokeAlignProp = new StrokeAlignProperty('Centered');

    const primaryColor = rgbaToInt(args.color.r, args.color.g, args.color.b, args.opacity);

    const secondaryColor = rgbaToInt(
      args.fillColor.r,
      args.fillColor.g,
      args.fillColor.b,
      args.opacity,
    );

    const tool = new RectangleTool({
      setLayers: setActiveLayers,
      getLayers: getActiveLayers,
      getPrimaryColor: () => primaryColor,
      getSecondaryColor: () => secondaryColor,
      getProperties: (key) => [strokeAlignProp, strokeWidthProp, fillProp, opacityProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
    });

    tool.onDown(args.from.x * pixelSize, args.from.y * pixelSize, pixelSize, 0);

    tool.onMove(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize);

    tool.onUp(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize);
  }, []);

  const aiGradientTool = useCallback((gradient: AiToolCall) => {
    if (gradient.tool != 'gradientTool') return;

    const args = gradient.args;

    const opacityProp = new OpacityProperty(args.opacity);
    const singleColorProp = new SingleColor(args.singleColor);
    const gradientTypeProp = new GradientTypeProperty(args.gradientType);

    const primaryColor = rgbaToInt(args.color.r, args.color.g, args.color.b, args.opacity);
    const secondaryColor = rgbaToInt(args.toColor.r, args.toColor.g, args.toColor.b, args.opacity);

    const tool = new GradientTool({
      setLayers: setActiveLayers,
      getLayers: getActiveLayers,
      getPrimaryColor: () => primaryColor,
      getSecondaryColor: () => secondaryColor,
      getProperties: () => [opacityProp, singleColorProp, gradientTypeProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
    });

    tool.onDown(args.from.x * pixelSize, args.from.y * pixelSize, pixelSize, 0);
    tool.onMove(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize);
    tool.onUp(args.to.x * pixelSize, args.to.y * pixelSize, pixelSize, 0);
  }, []);

  const aiFreeformTool = useCallback((freeform: AiToolCall) => {
    if (freeform.tool != 'freeformTool') return;

    const args = freeform.args;
    if (args.points.length < 3) return;

    const strokeWidthProp = new StrokeWidthProperty(args.strokeWidth);
    const opacityProp = new OpacityProperty(args.opacity);
    const fillProp = new FillProperty(args.fill);

    const primaryColor = rgbaToInt(args.color.r, args.color.g, args.color.b, args.opacity);
    const secondaryColor = rgbaToInt(
      args.fillColor.r,
      args.fillColor.g,
      args.fillColor.b,
      args.opacity,
    );

    const tool = new FreeformTool({
      setLayers: setActiveLayers,
      getLayers: getActiveLayers,
      getPrimaryColor: () => primaryColor,
      getSecondaryColor: () => secondaryColor,
      getProperties: () => [strokeWidthProp, opacityProp, fillProp],
      getSelectionLayer,
      getCanvasRect,
      checkPoint,
    });

    for (const point of args.points) {
      tool.onDown(point.x * pixelSize, point.y * pixelSize, pixelSize, 0);
    }

    tool.onCommit?.();
  }, []);

  const excecuteActions = useCallback(
    async (actions: AiToolCall[]) => {
      const layers: string[] = [];

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];

        switch (action.tool) {
          case 'changeCanvasSize':
            setDimensions(action.args.width, action.args.height);
            break;

          case 'penStroke':
            await selectLayer(action.args.layerId, layers);
            aiPenStroke(action);
            break;

          case 'ellipseTool':
            await selectLayer(action.args.layerId, layers);
            aiEllipseTool(action);
            break;

          case 'fillBucket':
            await selectLayer(action.args.layerId, layers);
            aiFillBucket(action);
            break;

          case 'lineTool':
            await selectLayer(action.args.layerId, layers);
            aiLineTool(action);
            break;

          case 'rectangleTool':
            await selectLayer(action.args.layerId, layers);
            aiRectangleTool(action);
            break;

          case 'gradientTool':
            await selectLayer(action.args.layerId, layers);
            aiGradientTool(action);
            break;

          case 'freeformTool':
            await selectLayer(action.args.layerId, layers);
            aiFreeformTool(action);
            break;

          default:
            break;
        }
        if (i < actions.length - 1) {
          await delay(AI_ACTION_DELAY_MS);
        }
      }
    },
    [
      setDimensions,
      aiPenStroke,
      aiEllipseTool,
      aiFillBucket,
      aiLineTool,
      aiRectangleTool,
      aiGradientTool,
      aiFreeformTool,
    ],
  );

  const selectLayer = async (layerId: string, layers: string[]) => {
    if (layers.some((id) => id === layerId)) {
      setActiveLayerIds([layerId]);
    } else {
      addLayer(0, createLayerEntity(layerId, crypto.randomUUID()));
      setActiveLayerIds([layerId]);
      layers.unshift(layerId);
    }

    await delay(AI_ACTION_DELAY_MS);
  };

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
