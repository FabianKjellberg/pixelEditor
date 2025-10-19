'use client';

import { useLayerContext } from '@/context/LayerContext';
import ToolButton from '../ToolButton/ToolButton';
import { MoveTool } from '@/models/Tools/MoveTool';

const MoveComponent = () => {
  const { activeLayer, setActiveLayer } = useLayerContext();

  return (
    <>
      <ToolButton icon="/icons/arrowicon.png" tool={new MoveTool(setActiveLayer, activeLayer)} />
    </>
  );
};
export default MoveComponent;
