'use client';

import { useEffect, useRef } from 'react';
import { config } from '@/config/env';

const BackgroundCanvas = ({}) => {
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    let verticalCounter: number = 0;
    let horizontalCounter: number = 0;

    for (let i = 0; i < config.canvasHeight; i += config.pixelSize) {
      for (let j = 0; j < config.canvasWidth; j += config.pixelSize) {
        const strokeColor =
          ((verticalCounter % 2) + (horizontalCounter % 2)) % 2 == 0 ? '#FFFFFF' : '#DDDDDD';

        ctx.fillStyle = strokeColor;
        ctx.fillRect(j, i, config.pixelSize, config.pixelSize);

        horizontalCounter++;
      }
      verticalCounter++;
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} width={config.canvasWidth} height={config.canvasWidth} />
    </>
  );
};
export default BackgroundCanvas;
