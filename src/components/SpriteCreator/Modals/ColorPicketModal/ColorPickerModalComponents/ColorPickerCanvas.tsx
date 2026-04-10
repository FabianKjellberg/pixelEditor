'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ColorPickerPointer from './ColorPickerPointer';
import { ColorChangeOrigin, useToolContext } from '@/context/ToolContext';
import { Color } from '@/models/Tools/Color';
import { hsvToColor, hsvToHex, hsvToRgb } from '@/helpers/color';
const CANVAS_W = 200;
const CANVAS_H = 200;
const PIX = 2;

type ColorPickerCanvasProps = {
  color: Color;
  setColor: (color: Color) => void;
};

export default function ColorPickerCanvas({ color, setColor }: ColorPickerCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const pointerX = useMemo((): number => {
    return CANVAS_W * color.hsv.s;
  }, [color]);

  const pointerY = useMemo((): number => {
    return CANVAS_H - CANVAS_H * color.hsv.v;
  }, [color]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;

    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const h = color.hsv.h;
        const s = x / 100;
        const v = (100 - y) / 100;

        const hex: string = hsvToHex({ h, s, v });
        ctx.fillStyle = hex;
        ctx.fillRect(x * PIX, y * PIX, PIX, PIX);
      }
    }
  }, [color]);

  const updatePos = useCallback(
    (e: React.PointerEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = Math.round(Math.max(Math.min(e.clientX - rect.left, CANVAS_W), 0));
      const y = Math.round(Math.max(Math.min(e.clientY - rect.top, CANVAS_H), 0));

      const h = color.hsv.h;
      const s = x / CANVAS_W;
      const v = 1 - y / CANVAS_H;

      const c = hsvToColor({ h, s, v });

      setColor(c);
    },
    [color],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);

      updatePos(e);
    },
    [updatePos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      updatePos(e);
    },
    [isDragging, updatePos],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: CANVAS_W,
        height: CANVAS_H,
        display: 'inline-block',
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={ref}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ touchAction: 'none', outline: '4px solid #888' }}
      />
      <ColorPickerPointer
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        x={pointerX}
        y={pointerY}
        selectedColor={color.hex}
        W={CANVAS_W}
        H={CANVAS_H}
      />
    </div>
  );
}
