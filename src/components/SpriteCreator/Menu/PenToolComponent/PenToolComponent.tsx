'use client';

import ToolButton from '../ToolButton/ToolButton';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from '@/context/LayerContext';
import { useEffect } from 'react';
import { useToolContext } from '@/context/ToolContext';

const PenToolComponent = () => {
  const { activeLayer, setActiveLayer } = useLayerContext();
  const { setActiveTool } = useToolContext();

  const defaultTool: PenTool = new PenTool(setActiveLayer, activeLayer);

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
