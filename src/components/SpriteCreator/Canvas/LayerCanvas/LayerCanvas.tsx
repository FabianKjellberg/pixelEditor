'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useLayerContext } from '@/context/LayerContext';
import { Rectangle } from '@/models/Layer';
import { useCallback, useEffect, useRef } from 'react';
import { ensureCanvas2D } from '@/helpers/canvas';
import { createPreview } from '@/util/BlobUtil';
import { getColorFromBackingRef } from '@/util/ColorUtil';
import { RGBAobj } from '@/models/Tools/Color';

type LayerCanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
};

const LayerCanvas = ({ canvasHeight, canvasWidth }: LayerCanvasProps) => {
  const backingRef = useRef<HTMLCanvasElement | null>(null);
  const viewPortRef = useRef<HTMLCanvasElement | null>(null);
  const viewportCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const backingCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const accumRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null);
  const accumCtxRef = useRef<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>(
    null,
  );
  const layerRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null);
  const layerCtxRef = useRef<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null>(
    null,
  );

  const {
    pixelSize,
    width,
    height,
    pan,
    setPixelSize,
    setPan,
    registerPreviewProvider,
    registerGetColorFromCordinateProvider,
  } = useCanvasContext();
  const { allLayers, redrawVersion, consumeDirty } = useLayerContext();

  const renderViewPort = () => {
    const vctx = viewportCtxRef.current;
    const vCanvas = viewPortRef.current;
    const bCanvas = backingRef.current;
    if (!vctx || !vCanvas || !bCanvas) return;

    const dpr = window.devicePixelRatio || 1;

    vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vctx.imageSmoothingEnabled = false;

    const cssW = vCanvas.width / dpr;
    const cssH = vCanvas.height / dpr;
    vctx.clearRect(0, 0, cssW, cssH);

    const zoom = Math.max(1, pixelSize | 0);
    vctx.translate(pan.x, pan.y);
    vctx.scale(zoom, zoom);

    vctx.drawImage(bCanvas, 0, 0);
  };

  const redrawBackCanvas = (rect: Rectangle) => {
    const backingCtx = backingCtxRef.current;
    const backing = backingRef.current;
    if (!backingCtx || !backing) return;

    // clip rect to backing bounds
    const rx = Math.max(0, rect.x);
    const ry = Math.max(0, rect.y);
    const rw = Math.max(0, Math.min(rect.x + rect.width, backing.width) - rx);
    const rh = Math.max(0, Math.min(rect.y + rect.height, backing.height) - ry);
    if (rw <= 0 || rh <= 0) return;

    // prepare accum and per-layer canvases
    const accumCtx = ensureCanvas2D(accumRef, accumCtxRef, rw, rh);
    const lCtx = ensureCanvas2D(layerRef, layerCtxRef, rw, rh);

    // clear accumulation target (transparent)
    accumCtx.clearRect(0, 0, rw, rh);

    // Draw layers bottom-to-top: lower index = drawn first (bottom), higher index = drawn last (on top)
    const layersBottomToTop = [...allLayers].reverse();
    for (const layer of layersBottomToTop) {
      const L = layer.layer.rect; // { x, y, width, height }
      // overlap of (rx,ry,rw,rh) with layer rect
      const ix = Math.max(rx, L.x);
      const iy = Math.max(ry, L.y);
      const ax = Math.min(rx + rw, L.x + L.width);
      const ay = Math.min(ry + rh, L.y + L.height);
      const w = ax - ix;
      const h = ay - iy;
      if (w <= 0 || h <= 0) continue;

      // local positions in the layer and in the accum target
      const srcStartX = ix - L.x;
      const srcStartY = iy - L.y;
      const dstX = ix - rx;
      const dstY = iy - ry;

      // build ImageData for the layer subrect
      const img = lCtx.createImageData(w, h);
      const data = img.data;

      // layer pixel packing: Uint32 RGBA (R in highest byte, A in lowest)
      // flatten the subrect rows
      const W = L.width;
      let di = 0;
      for (let yy = 0; yy < h; yy++) {
        const row = (srcStartY + yy) * W + srcStartX;
        for (let xx = 0; xx < w; xx++) {
          const c = layer.layer.pixels[row + xx] >>> 0;
          data[di++] = (c >>> 24) & 255; // R
          data[di++] = (c >>> 16) & 255; // G
          data[di++] = (c >>> 8) & 255; // B
          data[di++] = c & 255; // A
        }
      }

      lCtx.clearRect(0, 0, rw, rh);
      lCtx.putImageData(img, dstX, dstY);

      (accumCtx as CanvasRenderingContext2D).globalCompositeOperation = 'source-over';
      (accumCtx as CanvasRenderingContext2D).drawImage(layerRef.current as CanvasImageSource, 0, 0);
    }

    // Write the composed block back to the backing at world coords
    backingCtx.clearRect(rx, ry, rw, rh);
    (backingCtx as CanvasRenderingContext2D).drawImage(
      accumRef.current as CanvasImageSource,
      rx,
      ry,
    );

    renderViewPort();
  };

  useEffect(() => {
    const dirtyRects = consumeDirty();
    if (dirtyRects.length < 1) return;

    const minX = Math.min(...dirtyRects.map((r) => r.x));
    const minY = Math.min(...dirtyRects.map((r) => r.y));
    const maxX = Math.max(...dirtyRects.map((r) => r.x + r.width));
    const maxY = Math.max(...dirtyRects.map((r) => r.y + r.height));

    const bigRect: Rectangle = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    const smallRectArea = dirtyRects.reduce((total, rect) => total + rect.width * rect.height, 0);

    if (bigRect.width * bigRect.height <= smallRectArea) {
      redrawBackCanvas(bigRect);
    } else {
      dirtyRects.forEach((rect) => {
        redrawBackCanvas(rect);
      });
    }
  }, [redrawVersion, consumeDirty, redrawBackCanvas]);

  useEffect(() => {
    if (!width || !height) return;
    const backing = document.createElement('canvas');
    backing.width = width;
    backing.height = height;
    backingRef.current = backing;

    const ctx = backing.getContext('2d')!;
    backingCtxRef.current = ctx;

    redrawBackCanvas({ x: 0, y: 0, width: width, height: height });
  }, [width, height]);

  useEffect(() => {
    const canvas = viewPortRef.current;
    if (!canvas || !canvasWidth || !canvasHeight) return;

    const dpr = window.devicePixelRatio || 1;

    // 1) resize (this clears the canvas)
    canvas.width = Math.max(1, Math.floor(canvasWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvasHeight * dpr));
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 2) reacquire context (and its default state)
    viewportCtxRef.current = canvas.getContext('2d');

    // 3) repaint now
    renderViewPort();
  }, [width, height, canvasHeight, canvasWidth, pixelSize, pan]);

  //Center canvas whenever the width and height changes
  useEffect(() => {
    const newPixelSize = Math.max(
      1,
      Math.min(Math.floor(canvasHeight / height), Math.floor(canvasWidth / width)),
    );

    setPixelSize(newPixelSize);
    setPan({
      x: canvasWidth / 2 - (width * newPixelSize) / 2,
      y: canvasHeight / 2 - (height * newPixelSize) / 2,
    });
  }, [width, height]);

  //make preview image from backingRef,
  const requestPreview = useCallback(async (): Promise<Blob> => {
    const backing = backingRef.current;
    if (!backing) {
      throw new Error('backing canvas not ready');
    }

    return await createPreview(backing);
  }, []);

  if (!canvasHeight || !canvasWidth) return;

  registerPreviewProvider(requestPreview);

  const getColorFromCanvas = useCallback((x: number, y: number): RGBAobj => {
    const backing = backingRef.current;
    if (!backing) {
      throw new Error('backing canvas not ready');
    }

    return getColorFromBackingRef(x, y, backing);
  }, []);

  registerGetColorFromCordinateProvider(getColorFromCanvas);

  return (
    <>
      <canvas ref={viewPortRef} />
    </>
  );
};

export default LayerCanvas;
