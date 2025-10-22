'use client';

import ToolButton from '../ToolButton/ToolButton';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from '@/context/LayerContext';
import { useEffect, useMemo } from 'react';
import { useToolContext } from '@/context/ToolContext';

const PenToolComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { setActiveTool, getColor } = useToolContext();

  const defaultTool: PenTool = useMemo(() => (new PenTool({setLayer: setActiveLayer, getLayer: getActiveLayer, getColor})),[getActiveLayer,setActiveLayer]);

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
