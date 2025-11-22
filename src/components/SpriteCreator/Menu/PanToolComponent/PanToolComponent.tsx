'use client';

import ToolButton from '../ToolButton/ToolButton';
import { PanTool } from '@/models/Tools/PanTool';
import { useCanvasContext } from '@/context/CanvasContext';

const PanToolComponent = () => {
  const { setPan, getPan } = useCanvasContext();

  return (
    <>
      <ToolButton icon="/icons/pan.png" tool={new PanTool({ setPan, getPan })} />
    </>
  );
};
export default PanToolComponent;
