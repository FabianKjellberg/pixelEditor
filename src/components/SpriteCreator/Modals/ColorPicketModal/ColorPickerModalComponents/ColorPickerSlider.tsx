'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ColorPickerSliderPointer from './ColorPickerSliderPointer';
import { ColorChangeOrigin, useToolContext } from '@/context/ToolContext';
import { Color } from '@/models/Tools/Color';
import { hsvToColor, hsvToHex } from '@/helpers/color';

const CANVAS_H = 200;
const CANVAS_W = 30;
const PIX = 2;

type ColorPickerSliderProps = {
  color: Color;
  setColor: (color: Color) => void;
};

const ColorPickerSlider = ({ color, setColor }: ColorPickerSliderProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const pointerY = useMemo(() => {
    return (color.hsv.h / 360) * CANVAS_H;
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
      const h = y * 3.6;
      const s = 1;
      const v = 1;

      const hex = hsvToHex({ h, s, v });

      ctx.fillStyle = hex;
      ctx.fillRect(0, y * PIX, CANVAS_W, PIX);
    }
  }, [color]);

  const pointerColor = useMemo((): string => {
    return hsvToHex({ h: color.hsv.h, s: 1, v: 1 });
  }, [color]);

  const updatePos = useCallback(
    (e: React.PointerEvent) => {
      const r = e.currentTarget.getBoundingClientRect();
      const ny = Math.max(0, Math.min(e.clientY - r.top, r.height));

      const h = (ny / CANVAS_H) * 360;
      const s = color.hsv.s;
      const v = color.hsv.v;

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
      }}
    >
      <canvas
        ref={ref}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ touchAction: 'none', outline: '4px solid #888', display: 'block' }}
      />
      <ColorPickerSliderPointer
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        y={pointerY}
        W={CANVAS_W}
        pointerColor={pointerColor}
      />
    </div>
  );
};
export default ColorPickerSlider;
