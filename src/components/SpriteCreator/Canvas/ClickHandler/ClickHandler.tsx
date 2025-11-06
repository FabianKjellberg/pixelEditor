'use client';

import { useToolContext } from '@/context/ToolContext';
import { useLayerContext } from '@/context/LayerContext';
import { getPixelPositions } from '@/util/LayerUtil';
import { useCanvasContext } from '@/context/CanvasContext';
import { useState } from 'react';
import { Cordinate } from '@/models/Layer';

const ClickHandler = () => {
  const { activeTool } = useToolContext();
  const { activeLayer } = useLayerContext();
  const { pixelSize, panX, panY, setPan } = useCanvasContext();

  const [pan, setPanDown] = useState<boolean>(false);
  const [lastPos, setLastPos] = useState<Cordinate | null>(null);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();

    if (e.ctrlKey) {
      setPanDown(true);
      setLastPos(getPixelOnCanvas(e));
    } else {
      const c = getPixelPositions(e, pixelSize, panX, panY);
      activeTool.onDown(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (pan) {
      console.log('panning');

      const currentPos: Cordinate = getPixelOnCanvas(e);

      if (lastPos != null) {
        setPan(panX + currentPos.x - lastPos.x, panY + currentPos.y - lastPos.y);
      }

      setLastPos(currentPos);
    } else {
      const c = getPixelPositions(e, pixelSize, panX, panY);
      activeTool.onMove(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, pixelSize, panX, panY);
    activeTool.onUp(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
    setPanDown(false);
    setLastPos(null);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
export default ClickHandler;

export function getPixelOnCanvas<T extends Element>(e: React.PointerEvent<T>): Cordinate {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
