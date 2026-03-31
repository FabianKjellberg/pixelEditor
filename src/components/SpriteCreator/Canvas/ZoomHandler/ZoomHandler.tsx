'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useMouseEventContext } from '@/context/MouseEventContext/MouseEventContext';
import { useEffect, useState } from 'react';

const ZoomHandler = () => {
  const { onScrollEvent, getMouseDown } = useMouseEventContext();
  const { pixelSize, setPixelSize, setPan, pan } = useCanvasContext();

  const [pixelDecimalSize, setPixelDecimalSize] = useState<number>(pixelSize);

  useEffect(() => {
    setPixelDecimalSize(pixelSize);
  }, [pixelSize]);

  useEffect(() => {
    if (!onScrollEvent) return;

    if (getMouseDown()) return;

    const dY = onScrollEvent.deltaY;
    const c = onScrollEvent.pos;

    const absDelta = Math.abs(dY);
    const multiplier: number = dY > 0 ? 0.9 : dY < 0 ? 1.1 : 0; //!TODO maybe change???

    // Early returns at min/max values (also prevents 0 multiple)
    if (multiplier === 0) return;
    if (pixelDecimalSize * multiplier > 80) {
      setPixelDecimalSize(80);
      setPixelSize(80);
      return;
    }
    if (pixelDecimalSize * multiplier < 1) {
      setPixelDecimalSize(1);
      setPixelSize(1);
      return;
    }

    //Multiply by zoom strength
    for (let i = 0; i < Math.min(absDelta, 10); i++) {
      multiplier * multiplier;
    }

    const roundPixelDecimal = Math.round(pixelDecimalSize * multiplier);

    if (roundPixelDecimal !== pixelSize) {
      const oldZ = pixelSize;
      const newZ = roundPixelDecimal;

      // world coordinates under cursor before zoom change
      const worldX = (c.x - pan.x) / oldZ;
      const worldY = (c.y - pan.y) / oldZ;

      // choose pan so that same world point stays under the cursor
      const nextPanX = c.x - worldX * newZ;
      const nextPanY = c.y - worldY * newZ;

      setPan({ x: nextPanX, y: nextPanY });
    }

    setPixelDecimalSize((prev) => prev * multiplier);
    setPixelSize(roundPixelDecimal);
  }, [onScrollEvent?.trigger]);

  return null;
};

export default ZoomHandler;
