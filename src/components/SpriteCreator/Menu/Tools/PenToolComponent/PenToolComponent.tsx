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
import { useColorContext } from '@/context/ColorContext';

const PenToolComponent = () => {
  const { getActiveLayers, setActiveLayers } = useLayerContext();
  const { setActiveTool, getProperties, setProperties } = useToolContext();
  const { getSColor, getPColor } = useColorContext();
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
        getPrimaryColor: getPColor,
        getSecondaryColor: getSColor,
        getProperties,
        getSelectionLayer,
        getCanvasRect,
        checkPoint,
        onToast,
      }),
    [getActiveLayers, setActiveLayers, getSColor, getPColor, getProperties],
  );

  useEffect(() => {
    setActiveTool(defaultTool);
  }, []);

  return <ToolButton icon="/icons/pencil.png" tool={defaultTool} />;
};
export default PenToolComponent;
