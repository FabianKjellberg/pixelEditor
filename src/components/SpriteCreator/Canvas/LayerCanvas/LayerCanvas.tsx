'use client';

import { Layer } from '@/models/Layer';
import { useEffect, useRef } from 'react';
import { config } from '@/config/env';
import { getPixelIndex, intToCssRgba } from '@/helpers/color';

interface LayerCanvasProps {
  layer: Layer;
}

const LayerCanvas = ({ layer }: LayerCanvasProps) => {
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    for (let i: number = 0; i < layer.height; i++) {
      for (let j: number = 0; j < layer.width; j++) {
        const px = layer.pixels[getPixelIndex(i, layer.width, j)];

        if (px) {
          ctx.fillStyle = intToCssRgba(px);
          ctx.fillRect(
            j * config.pixelSize + layer.xPos * config.pixelSize,
            i * config.pixelSize + layer.yPos * config.pixelSize,
            config.pixelSize,
            config.pixelSize,
          );
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx);
  }, [layer]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={config.canvasWidth}
        height={config.canvasHeight}
        style={{ position: 'fixed' }}
      />
    </>
  );
};

export default LayerCanvas;
