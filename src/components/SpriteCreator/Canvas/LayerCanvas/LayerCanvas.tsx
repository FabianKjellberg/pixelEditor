'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useLayerContext } from '@/context/LayerContext';
import { Rectangle } from '@/models/Layer';
import { useEffect, useRef } from 'react';

const LayerCanvas = () => {
  const { allLayers, redrawVersion, consumeDirty } = useLayerContext();
  const { width, height, pixelSize } = useCanvasContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // one reusable scratch canvas + context
  const scratchRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null);
  const sctxRef = useRef<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>(null);

  const ensureScratch = (w: number, h: number) => {
    if (!scratchRef.current) {
      // Create either an OffscreenCanvas or normal canvas
      if (typeof OffscreenCanvas !== 'undefined') {
        const offscreen = new OffscreenCanvas(1, 1);
        scratchRef.current = offscreen;
        sctxRef.current = offscreen.getContext('2d');
      } else {
        const htmlCanvas = document.createElement('canvas');
        htmlCanvas.width = 1;
        htmlCanvas.height = 1;
        scratchRef.current = htmlCanvas;
        sctxRef.current = htmlCanvas.getContext('2d');
      }
    }

    // Resize if needed
    if (scratchRef.current.width !== w || scratchRef.current.height !== h) {
      scratchRef.current.width = w;
      scratchRef.current.height = h;
    }

    return sctxRef.current!;
  };

  const blitLayerRegion = (
    ctx: CanvasRenderingContext2D,
    layer: { rect: Rectangle; pixels: Uint32Array },
    r: Rectangle,
  ) => {
    const L = layer.rect;

    const ix = Math.max(r.x, L.x);
    const iy = Math.max(r.y, L.y);
    const ax = Math.min(r.x + r.width, L.x + L.width);
    const ay = Math.min(r.y + r.height, L.y + L.height);
    const w = ax - ix;
    const h = ay - iy;
    if (w <= 0 || h <= 0) return;

    const sctx = ensureScratch(w, h);
    const img = sctx.createImageData(w, h);
    const data = img.data;

    let di = 0;
    const startX = ix - L.x;
    const startY = iy - L.y;
    const W = L.width;

    for (let yy = 0; yy < h; yy++) {
      const row = (startY + yy) * W + startX;
      for (let xx = 0; xx < w; xx++) {
        const c = layer.pixels[row + xx] >>> 0;
        const a = c & 0xff;
        if (a === 0) {
          di += 4;
          continue;
        }
        data[di++] = (c >>> 24) & 255; // R
        data[di++] = (c >>> 16) & 255; // G
        data[di++] = (c >>> 8) & 255; // B
        data[di++] = a; // A
      }
    }

    sctx.putImageData(img, 0, 0);

    const p = pixelSize;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scratchRef.current!, ix * p, iy * p, w * p, h * p);
  };

  const redrawArea = (ctx: CanvasRenderingContext2D, r: Rectangle) => {
    const p = pixelSize;
    ctx.clearRect(r.x * p, r.y * p, r.width * p, r.height * p);
    for (const layer of allLayers) blitLayerRegion(ctx, layer, r);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dirty = consumeDirty();
    for (const r of dirty) redrawArea(ctx, r);
  }, [redrawVersion, allLayers, consumeDirty, redrawArea]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const r = { x: 0, y: 0, width: width, height: height };

    redrawArea(ctx, r);
  }, [width, height, pixelSize, redrawArea]);

  return (
    <canvas
      ref={canvasRef}
      width={width * pixelSize}
      height={height * pixelSize}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default LayerCanvas;
