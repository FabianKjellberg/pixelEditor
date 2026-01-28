'use client';

import { useLayerContext } from '@/context/LayerContext';
import ToolButton from '../ToolButton/ToolButton';
import { MoveTool } from '@/models/Tools/MoveTool';

const MoveComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();

  return (
    <>
      <ToolButton icon="/icons/arrowicon.png" tool={new MoveTool({setLayer: setActiveLayer, getLayer: getActiveLayer})} />
    </>
  );
};
export default MoveComponent;
