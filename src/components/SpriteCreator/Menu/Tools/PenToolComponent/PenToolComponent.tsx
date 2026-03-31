'use client';

import ToolButton from '../ToolButton/ToolButton';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from '@/context/LayerContext';
import { useEffect, useMemo } from 'react';
import { useToolContext } from '@/context/ToolContext';
import { OpacityProperty, SizeProperty, SmoothEdgeProperty } from '@/models/properties/Properties';
import { useCanvasContext } from '@/context/CanvasContext';
import { useUndoRedoContext } from '@/context/UndoRedoContext';
import { useToastContext } from '@/context/ToastContext/ToastContext';

const PenToolComponent = () => {
  const { getActiveLayers, setActiveLayers } = useLayerContext();
  const { setActiveTool, getPrimaryColor, getProperties, setProperties, getSecondaryColor } =
    useToolContext();
  const { getSelectionLayer, getCanvasRect } = useCanvasContext();
  const { checkPoint } = useUndoRedoContext();
  const { onToast } = useToastContext();

  useEffect(() => {
    const existing = getProperties('pencil');
    if (!existing.length) {
      setProperties('pencil', [
        new SizeProperty(2),
        new OpacityProperty(255),
        new SmoothEdgeProperty(false),
      ]);
    }
  }, [getProperties, setProperties]);

  const defaultTool: PenTool = useMemo(
    () =>
      new PenTool({
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
    [getActiveLayers, setActiveLayers, getPrimaryColor, getProperties],
  );

  useEffect(() => {
    setActiveTool(defaultTool);
  }, []);

  return <ToolButton icon="/icons/pencil.png" tool={defaultTool} />;
};
export default PenToolComponent;
