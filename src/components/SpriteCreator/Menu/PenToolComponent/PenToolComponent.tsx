'use client';

import ToolButton from '../ToolButton/ToolButton';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from '@/context/LayerContext';
import { useEffect, useMemo } from 'react';
import { useToolContext } from '@/context/ToolContext';

const PenToolComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { setActiveTool } = useToolContext();

  const defaultTool: PenTool = useMemo(() => (new PenTool({setLayer: setActiveLayer, getLayer: getActiveLayer})),[getActiveLayer,setActiveLayer]);

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
