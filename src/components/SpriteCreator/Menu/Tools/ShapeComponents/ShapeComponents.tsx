'use client';

import ToolButton from '../ToolButton/ToolButton';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { ITool } from '@/models/Tools/Tools';
import { LineTool } from '@/models/Tools/ShapeTools/LineTool';
import { RectangleTool } from '@/models/Tools/ShapeTools/RectangleTool';
import { OvalTool } from '@/models/Tools/ShapeTools/OvalTool';
import ToolButtonMimic from '../ToolButton/ToolButtonMimic';
import { useToolContext } from '@/context/ToolContext';

import styles from './ShapeComponents.module.css';
import { useLayerContext } from '@/context/LayerContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { useUndoRedoContext } from '@/context/UndoRedoContext';
import {
  FillProperty,
  OpacityProperty,
  PropertyType,
  StrokeAlignProperty,
  StrokeWidthProperty,
} from '@/models/Tools/Properties';

type toolWithImage = {
  icon: string;
  tool: ITool;
};

const ShapeComponents = () => {
  const { onShow, onHide } = useContextMenuContext();
  const { setActiveTool } = useToolContext();
  const { setActiveLayer, getActiveLayer } = useLayerContext();
  const { getPrimaryColor, ensureProperties, getProperties, getSecondaryColor } = useToolContext();
  const { getSelectionLayer, getCanvasRect } = useCanvasContext();
  const { checkPoint, hasBaseline } = useUndoRedoContext();

  useEffect(() => {
    /* LINE COMPONENT */
    const lineExisting = getProperties('lineTool');
    // Only ensure properties if they don't exist or are incomplete
    const lineHasStrokeWidth = lineExisting.some(
      (p) => p.propertyType === PropertyType.StrokeWidth,
    );
    const lineHasOpacity = lineExisting.some((p) => p.propertyType === PropertyType.Opacity);

    if (!lineHasStrokeWidth || !lineHasOpacity) {
      ensureProperties('lineTool', [new StrokeWidthProperty(2), new OpacityProperty(255)]);
    }

    /* RECTANGLE COMPONENT */
    const rectangleExisting = getProperties('rectangleTool');

    const rectangleHasStrokeWidth = rectangleExisting.some(
      (p) => p.propertyType === PropertyType.StrokeWidth,
    );

    const rectangleHasOpacity = rectangleExisting.some(
      (p) => p.propertyType === PropertyType.Opacity,
    );

    const rectangleHasFill = rectangleExisting.some(
      (p) => p.propertyType === PropertyType.FillProperty,
    );

    const rectangleHasAlign = rectangleExisting.some(
      (p) => p.propertyType === PropertyType.StrokeAlignProperty,
    );

    if (
      !rectangleHasStrokeWidth ||
      !rectangleHasOpacity ||
      !rectangleHasFill ||
      !rectangleHasAlign
    ) {
      ensureProperties('rectangleTool', [
        new StrokeWidthProperty(2),
        new OpacityProperty(255),
        new FillProperty(false),
        new StrokeAlignProperty('Centered'),
      ]);
    }

    /* OVAL COMPONENT */
    const ovalExisting = getProperties('ovalTool');

    const ovalHasStrokeWidth = ovalExisting.some(
      (p) => p.propertyType === PropertyType.StrokeWidth,
    );

    const ovalHasOpacity = ovalExisting.some((p) => p.propertyType === PropertyType.Opacity);

    const ovalHasFill = ovalExisting.some((p) => p.propertyType === PropertyType.FillProperty);

    const ovalHasAlign = ovalExisting.some(
      (p) => p.propertyType === PropertyType.StrokeAlignProperty,
    );

    if (!ovalHasStrokeWidth || !ovalHasOpacity || !ovalHasFill || !ovalHasAlign) {
      ensureProperties('ovalTool', [
        new StrokeWidthProperty(2),
        new OpacityProperty(255),
        new FillProperty(false),
        new StrokeAlignProperty('Centered'),
      ]);
    }
  }, [ensureProperties, getProperties]);

  const lineTool: LineTool = useMemo(
    () =>
      new LineTool({
        setLayer: setActiveLayer,
        getLayer: getActiveLayer,
        getPrimaryColor,
        getSecondaryColor,
        getProperties,
        getSelectionLayer,
        getCanvasRect,
        checkPoint,
        hasBaseline,
      }),
    [getActiveLayer, setActiveLayer, getPrimaryColor, getProperties],
  );

  const rectangleTool: RectangleTool = useMemo(
    () =>
      new RectangleTool({
        setLayer: setActiveLayer,
        getLayer: getActiveLayer,
        getPrimaryColor,
        getSecondaryColor,
        getProperties,
        getSelectionLayer,
        getCanvasRect,
        checkPoint,
        hasBaseline,
      }),
    [getActiveLayer, setActiveLayer, getPrimaryColor, getProperties],
  );

  const ovalTool: OvalTool = useMemo(
    () =>
      new OvalTool({
        setLayer: setActiveLayer,
        getLayer: getActiveLayer,
        getPrimaryColor,
        getSecondaryColor,
        getProperties,
        getSelectionLayer,
        getCanvasRect,
        checkPoint,
        hasBaseline,
      }),
    [getActiveLayer, setActiveLayer, getPrimaryColor, getProperties],
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const onClickCallbackItem = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          setActiveTool(lineTool);
          break;
        case 1:
          setActiveTool(rectangleTool);
          break;
        case 2:
          setActiveTool(ovalTool);
          break;
      }

      setSelectedIndex(index);
      onHide();
    },
    [setActiveTool, onHide, lineTool],
  );

  const onRightClickCallback = useCallback(
    (x: number, y: number) => {
      const menu = (
        <div className={styles.contextMenu}>
          <ToolButtonMimic
            icon="icons/line.png"
            index={0}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/rectangle.png"
            index={1}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/oval.png"
            index={2}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
        </div>
      );

      onShow(menu, x, y);
    },
    [onShow, onClickCallbackItem, selectedIndex],
  );

  useEffect(() => {}, [selectedIndex, setActiveTool]);

  const selectedTool = useMemo((): toolWithImage => {
    switch (selectedIndex) {
      case 0:
      default:
        return {
          icon: 'icons/line.png',
          tool: lineTool,
        };
      case 1:
        return {
          icon: 'icons/rectangle.png',
          tool: rectangleTool,
        };
      case 2:
        return {
          icon: 'icons/oval.png',
          tool: ovalTool,
        };
    }
  }, [selectedIndex]);

  return (
    <>
      <ToolButton
        icon={selectedTool.icon}
        tool={selectedTool.tool}
        onRightClickCallback={onRightClickCallback}
      />
    </>
  );
};

export default ShapeComponents;
