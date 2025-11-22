'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasContext } from '@/context/CanvasContext';

type BackgroundCanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
};

const BackgroundCanvas = ({ canvasWidth, canvasHeight }: BackgroundCanvasProps) => {
  const backingRef = useRef<HTMLCanvasElement | null>(null);
  const viewPortRef = useRef<HTMLCanvasElement | null>(null);
  const viewportCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const backingCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const { pixelSize, width, height, pan } = useCanvasContext();

  const render = () => {
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

  useEffect(() => {
    if (!width || !height) return;
    const backing = document.createElement('canvas');
    backing.width = width;
    backing.height = height;
    backingRef.current = backing;

    const ctx = backing.getContext('2d')!;
    backingCtxRef.current = ctx;

    if (pixelSize < 7) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    } else {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const strokeColor = (x + (y % 2)) % 2 === 0 ? '#FFFFFF' : '#DDDDDD';
          ctx.fillStyle = strokeColor;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, [width, height]);

  useEffect(() => {
    if (viewPortRef.current) {
      viewportCtxRef.current = viewPortRef.current.getContext('2d');
    }

    render();
  }, [viewPortRef.current]);

  useEffect(() => {
    const canvas = viewPortRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(canvasWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvasHeight * dpr));

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    render();
  }, [width, height, canvasHeight, canvasWidth, pixelSize, pan]);

  if (!canvasHeight || !canvasWidth) return;

  return (
    <>
      <canvas ref={viewPortRef} />
    </>
  );
};
export default BackgroundCanvas;
