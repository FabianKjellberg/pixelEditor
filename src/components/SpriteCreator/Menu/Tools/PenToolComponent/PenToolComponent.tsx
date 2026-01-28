'use client';

import ToolButton from '../ToolButton/ToolButton';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from '@/context/LayerContext';
import { useCallback, useEffect, useMemo } from 'react';
import { useToolContext } from '@/context/ToolContext';
import { OpacityProperty, SizeProperty, SmoothEdgeProperty } from '@/models/Tools/Properties';
import { useCanvasContext } from '@/context/CanvasContext';
import { Rectangle } from '@/models/Layer';

const PenToolComponent = () => {
  const { getActiveLayer, setActiveLayer, setActiveLayer2 } = useLayerContext();
  const { setActiveTool, getPrimaryColor, getProperties, setProperties } = useToolContext();
  const { getSelectionLayer, getCanvasRect } = useCanvasContext();

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
        setLayer: setActiveLayer,
        getLayer: getActiveLayer,
        setLayer2: setActiveLayer2,
        getPrimaryColor,
        getProperties,
        getSelectionLayer,
        getCanvasRect,
      }),
    [getActiveLayer, setActiveLayer, getPrimaryColor, getProperties],
  );

  useEffect(() => {
    setActiveTool(defaultTool);
  }, []);

  return <ToolButton icon="/icons/pencil.png" tool={defaultTool} />;
};
export default PenToolComponent;
