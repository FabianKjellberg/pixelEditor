'use client';

import { useEffect, useRef } from 'react';
import { config } from '@/config/env';
import { useCanvasContext } from '@/context/CanvasContext';
import { he } from 'zod/locales';

const BackgroundCanvas = () => {
  const { pixelSize, width, height } = useCanvasContext();

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const originalPixelSize = pixelSize;
    let pSize = pixelSize;

    if (pixelSize < 10) pSize = 10;

    let jCount: number = 0;
    let iCount: number = 0;
    for (let i = 0; i < height * originalPixelSize; i += pSize) {
      for (let j = 0; j < width * originalPixelSize; j += pSize) {
        const strokeColor = (jCount + (iCount % 2)) % 2 == 0 ? '#FFFFFF' : '#DDDDDD';

        ctx.fillStyle = strokeColor;
        ctx.fillRect(j, i, pSize, pSize);
        jCount++;
      }
      jCount = 0;
      iCount++;
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx);
  }, [pixelSize, width, height]);

  return (
    <>
      <canvas ref={canvasRef} width={width * pixelSize} height={height * pixelSize} />
    </>
  );
};
export default BackgroundCanvas;
