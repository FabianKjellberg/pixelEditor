'use client';

import { useLayerContext } from '@/context/LayerContext';
import { useCanvasContext } from '@/context/CanvasContext';
import ToolButton from '../ToolButton/ToolButton';
import { MoveTool } from '@/models/Tools/MoveTool';
import { useMemo } from 'react';

const MoveComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { getSelectionLayer, setSelectionLayer } = useCanvasContext();

  const tool = useMemo(
    () =>
      new MoveTool({
        setLayer: setActiveLayer,
        getLayer: getActiveLayer,
        getSelectionLayer,
        setSelectionLayer,
      }),
    [getActiveLayer, setActiveLayer, getSelectionLayer, setSelectionLayer],
  );

  return (
    <>
      <ToolButton icon="/icons/arrowicon.png" tool={tool} />
    </>
  );
};
export default MoveComponent;
