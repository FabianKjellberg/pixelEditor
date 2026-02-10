'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasContext } from '@/context/CanvasContext';
import { useToolContext } from '@/context/ToolContext';
import { Cordinate } from '@/models/Layer';

type ToolOverlayProps = {
  canvasWidth: number;
  canvasHeight: number;
};

const ToolOverlay = ({ canvasWidth, canvasHeight }: ToolOverlayProps) => {
  const viewPortRef = useRef<HTMLCanvasElement | null>(null);
  const viewportCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const { pixelSize, width, height, pan } = useCanvasContext();
  const { activeTool } = useToolContext();

  const [mousePosition, setMousePosition] = useState<Cordinate | null>(null);

  const render = useCallback(() => {
    const canvas = viewPortRef.current;
    const ctx = viewportCtxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Reset transform to DPR space for crisp clearing
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // Clear in CSS pixel space
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    ctx.clearRect(0, 0, cssW, cssH);

    // Apply same transform as your main canvases
    const zoom = Math.max(1, pixelSize | 0);
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // draw function here
    // use mousePosition + activeTool + (width/height if needed)
  }, [pixelSize, pan /* include deps you need for redraw */]);

  // Init context
  useEffect(() => {
    const canvas = viewPortRef.current;
    if (!canvas) return;
    viewportCtxRef.current = canvas.getContext('2d');
    render();
  }, [render]);

  // DPR-resize viewport canvas like BackgroundCanvas
  useEffect(() => {
    const canvas = viewPortRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(canvasWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvasHeight * dpr));

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    render();
  }, [canvasWidth, canvasHeight, render]);

  // Re-render on state changes that affect overlay
  useEffect(() => {
    render();
  }, [render, mousePosition, activeTool, width, height, pixelSize, pan]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = viewPortRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      // Mouse position in CSS pixels relative to the canvas element
      const xCss = e.clientX - rect.left;
      const yCss = e.clientY - rect.top;

      // If you want "world" (canvas pixel-grid) coordinates that match your drawing space:
      const zoom = Math.max(1, pixelSize | 0);
      const worldX = (xCss - pan.x) / zoom;
      const worldY = (yCss - pan.y) / zoom;

      const pos: Cordinate = { x: worldX, y: worldY };
      setMousePosition(pos);

      console.log(pos);
    },
    [pan.x, pan.y, pixelSize],
  );

  const onMouseLeave = useCallback(() => {
    setMousePosition(null);
  }, []);

  if (!canvasHeight || !canvasWidth) return null;

  return (
    <canvas
      ref={viewPortRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      // important for overlay behavior in a stacked canvas setup:
    />
  );
};

export default ToolOverlay;
