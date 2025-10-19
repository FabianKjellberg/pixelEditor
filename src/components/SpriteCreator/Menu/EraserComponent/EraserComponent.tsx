'use client';

import { useLayerContext } from '@/context/LayerContext';
import ToolButton from '../ToolButton/ToolButton';
import { Eraser } from '@/models/Tools/Eraser';

const EraserComponent = () => {
  const { activeLayer, setActiveLayer } = useLayerContext();

  return (
    <>
      <ToolButton icon="/icons/eraser.png" tool={new Eraser(setActiveLayer, activeLayer)} />
    </>
  );
};
export default EraserComponent;
