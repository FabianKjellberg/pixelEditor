'use client';

import { useToolContext } from '@/context/ToolContext';
import { useLayerContext } from '@/context/LayerContext';
import { getPixelPositions } from '@/util/LayerUtil';
import { useCanvasContext } from '@/context/CanvasContext';

const ClickHandler = () => {
  const { activeTool } = useToolContext();
  const { activeLayer } = useLayerContext();
  const { pixelSize } = useCanvasContext();

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, pixelSize);
    activeTool.onDown(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, pixelSize);
    activeTool.onMove(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, pixelSize);
    activeTool.onUp(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
  };

  return (
    <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} />
  );
};
export default ClickHandler;
