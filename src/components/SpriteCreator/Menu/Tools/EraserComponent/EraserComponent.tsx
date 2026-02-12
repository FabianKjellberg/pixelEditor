'use client';

import { useLayerContext } from '@/context/LayerContext';
import ToolButton from '../ToolButton/ToolButton';
import { Eraser } from '@/models/Tools/Eraser';
import { useToolContext } from '@/context/ToolContext';
import { useEffect } from 'react';
import { OpacityProperty, SizeProperty } from '@/models/Tools/Properties';
import { useCanvasContext } from '@/context/CanvasContext';
import { useUndoRedoContext } from '@/context/UndoRedoContext';

const EraserComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { getProperties, setProperties } = useToolContext();
  const { getSelectionLayer, getCanvasRect } = useCanvasContext();
  const { checkPoint, hasBaseline } = useUndoRedoContext();

  useEffect(() => {
    const existing = getProperties('eraser');
    if (!existing.length) {
      setProperties('eraser', [new SizeProperty(5), new OpacityProperty(255)]);
    }
  }, [getProperties, setProperties]);

  return (
    <ToolButton
      icon="/icons/eraser.png"
      tool={
        new Eraser({
          setLayer: setActiveLayer,
          getLayer: getActiveLayer,
          getProperties,
          getCanvasRect,
          getSelectionLayer,
          checkPoint,
          hasBaseline,
        })
      }
    />
  );
};
export default EraserComponent;
