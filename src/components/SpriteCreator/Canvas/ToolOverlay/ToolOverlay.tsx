'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasContext } from '@/context/CanvasContext';
import { useToolContext } from '@/context/ToolContext';
import { Cordinate } from '@/models/Layer';
import { getProperty, IProperty, PropertyType, SizeProperty } from '@/models/Tools/Properties';
import { useMouseEventContext } from '@/context/MouseEventContext/MouseEventContext';

type ToolOverlayProps = {
  canvasWidth: number;
  canvasHeight: number;
};

const ToolOverlay = ({ canvasWidth, canvasHeight }: ToolOverlayProps) => {
  const viewPortRef = useRef<HTMLCanvasElement | null>(null);
  const viewportCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const { pixelSize, width, height, pan } = useCanvasContext();
  const { activeTool } = useToolContext();
  const { onPointerMoveEvent, onPointerLeaveEvent } = useMouseEventContext();

  const [mousePosition, setMousePosition] = useState<Cordinate | null>({ x: 13, y: 13 });

  const render = useCallback(() => {
    const canvas = viewPortRef.current;
    const ctx = viewportCtxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    ctx.clearRect(0, 0, cssW, cssH);

    if (!mousePosition) return;

    const zoom = Math.max(1, pixelSize | 0);
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const properties: IProperty[] = activeTool.deps.getProperties?.(activeTool.name) ?? [];
    const sizeProp = getProperty<SizeProperty>(properties, PropertyType.Size);
    const size = sizeProp?.value ?? 0;
    const r = Math.floor(size / 2);

    // tools with size for now
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'gray';
    ctx.fillRect(mousePosition!.x - r, mousePosition!.y - r, size, size);
    ctx.restore();
  }, [pixelSize, pan, mousePosition]);

  useEffect(() => {
    if (!onPointerMoveEvent) return;

    const c = onPointerMoveEvent.pos;

    const x = Math.floor(c.x / pixelSize);
    const y = Math.floor(c.y / pixelSize);

    if (mousePosition?.x == x && mousePosition.y == y) return;

    setMousePosition({ x, y });
  }, [onPointerMoveEvent?.trigger]);

  useEffect(() => {
    if (!onPointerLeaveEvent) return;

    setMousePosition(null);
  }, [onPointerLeaveEvent?.trigger]);

  useEffect(() => {
    const canvas = viewPortRef.current;
    if (!canvas) return;
    viewportCtxRef.current = canvas.getContext('2d');
    render();
  }, [render]);

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

  useEffect(() => {
    render();
  }, [render, mousePosition, activeTool, width, height, pixelSize, pan]);

  if (!canvasHeight || !canvasWidth) return null;

  return <canvas ref={viewPortRef} />;
};

export default ToolOverlay;
