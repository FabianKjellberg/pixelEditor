'use client';

import { Layer } from '@/models/Layer';
import { useEffect, useRef } from 'react';
import { config } from '@/config/env';
import { getPixelIndex, intToCssRgba } from '@/helpers/color';

interface LayerCanvasProps {
  layer: Layer;
}

const LayerCanvasOld = ({ layer }: LayerCanvasProps) => {
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    ctx.imageSmoothingEnabled = false;
    for (let i: number = 0; i < layer.rect.height; i++) {
      for (let j: number = 0; j < layer.rect.width; j++) {
        const px = layer.pixels[getPixelIndex(i, layer.rect.width, j)];

        if (px) {
          ctx.fillStyle = intToCssRgba(px);
          ctx.fillRect(
            j * config.pixelSize + layer.rect.x * config.pixelSize,
            i * config.pixelSize + layer.rect.y * config.pixelSize,
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
        style={{ position: 'fixed', imageRendering: 'pixelated' }}
      />
    </>
  );
};

export default LayerCanvasOld;
