'use client';

import ToolButton from '../ToolButton/ToolButton';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from '@/context/LayerContext';
import { useEffect, useMemo } from 'react';
import { useToolContext } from '@/context/ToolContext';
import { PropertyType, SizeProperty } from '@/models/Tools/Tools';

const PenToolComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { setActiveTool, getPrimaryColor } = useToolContext();

  const sizeProperty: SizeProperty = {
    size: 5,
    propertyType: PropertyType.Size,
  };

  const defaultTool: PenTool = useMemo(
    () =>
      new PenTool({
        setLayer: setActiveLayer,
        getLayer: getActiveLayer,
        getPrimaryColor,
        getProperties: () => [sizeProperty],
      }),
    [getActiveLayer, setActiveLayer, getPrimaryColor],
  );

  useEffect(() => {
    setActiveTool(defaultTool);
  }, []);

  return (
    <>
      <ToolButton icon="/icons/pencil.png" tool={defaultTool} />
    </>
  );
};
export default PenToolComponent;
