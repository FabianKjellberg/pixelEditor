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

import styles from './../ShapeComponents/ShapeComponents.module.css';
import { useLayerContext } from '@/context/LayerContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { useUndoRedoContext } from '@/context/UndoRedoContext';
import {
  DitheringProperty,
  FillProperty,
  GradientTypeProperty,
  OpacityProperty,
  PropertyType,
  SingleColor,
  StrokeAlignProperty,
  StrokeWidthProperty,
  ToleranceProperty,
} from '@/models/Tools/Properties';
import { FillBucket } from '@/models/Tools/AreaTools/FillBucket';
import { GradientTool } from '@/models/Tools/AreaTools/GradientTool';
import { useToastContext } from '@/context/ToastContext/ToastContext';

type toolWithImage = {
  icon: string;
  tool: ITool;
};

const AreaComponents = () => {
  const { onShow, onHide } = useContextMenuContext();
  const { setActiveTool } = useToolContext();
  const { setActiveLayers, getActiveLayers } = useLayerContext();
  const { getPrimaryColor, ensureProperties, getProperties, getSecondaryColor } = useToolContext();
  const { getSelectionLayer, getCanvasRect } = useCanvasContext();
  const { checkPoint } = useUndoRedoContext();
  const { onToast } = useToastContext();

  useEffect(() => {
    /* FILL BUCKET COMPONENT */
    const fillBucketExisting = getProperties('fillBucket');

    const fillBucketHasTolerance = fillBucketExisting.some(
      (p) => p.propertyType === PropertyType.Tolerance,
    );

    const fillBucketHasOpacity = fillBucketExisting.some(
      (p) => p.propertyType === PropertyType.Opacity,
    );

    if (!fillBucketHasOpacity || !fillBucketHasTolerance) {
      ensureProperties('fillBucket', [new ToleranceProperty(0), new OpacityProperty(255)]);
    }

    /* GRADIENT COMPONENT */
    const gradientExisting = getProperties('gradientTool');

    const gradientHasOpacity = gradientExisting.some(
      (p) => p.propertyType === PropertyType.Opacity,
    );

    const gradientHasSingleColor = gradientExisting.some(
      (p) => p.propertyType === PropertyType.SingleColor,
    );

    const gradientHasType = gradientExisting.some(
      (p) => p.propertyType === PropertyType.GradientType,
    );

    const gradientHasDithering = gradientExisting.some(
      (p) => p.propertyType === PropertyType.Dithering,
    );

    if (
      !gradientHasOpacity ||
      !gradientHasSingleColor ||
      !gradientHasType ||
      !gradientHasDithering
    ) {
      ensureProperties('gradientTool', [
        new OpacityProperty(255),
        new SingleColor(true),
        new GradientTypeProperty(),
        new DitheringProperty(),
      ]);
    }
  }, [ensureProperties, getProperties]);

  const fillBucket: FillBucket = useMemo(
    () =>
      new FillBucket({
        setLayers: setActiveLayers,
        getLayers: getActiveLayers,
        getProperties,
        getCanvasRect,
        getSelectionLayer,
        getPrimaryColor,
        getSecondaryColor,
        checkPoint,
        onToast,
      }),
    [getActiveLayers, setActiveLayers, getPrimaryColor, getProperties, onToast],
  );

  const gradientTool: GradientTool = useMemo(
    () =>
      new GradientTool({
        setLayers: setActiveLayers,
        getLayers: getActiveLayers,
        getPrimaryColor,
        getSecondaryColor,
        getProperties,
        getSelectionLayer,
        getCanvasRect,
        checkPoint,
        onToast,
      }),
    [getActiveLayers, setActiveLayers, getPrimaryColor, getProperties, onToast],
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const onClickCallbackItem = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          setActiveTool(fillBucket);
          break;
        case 1:
          setActiveTool(gradientTool);
          break;
        default:
          break;
      }

      setSelectedIndex(index);
      onHide();
    },
    [setActiveTool, onHide, fillBucket],
  );

  const onRightClickCallback = useCallback(
    (x: number, y: number) => {
      const menu = (
        <div className={styles.contextMenu}>
          <ToolButtonMimic
            icon="icons/bucket.png"
            index={0}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/gradient.png"
            index={1}
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
          icon: 'icons/bucket.png',
          tool: fillBucket,
        };
      case 1:
        return {
          icon: 'icons/gradient.png',
          tool: gradientTool,
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

export default AreaComponents;
