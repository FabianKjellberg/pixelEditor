'use client';
import { hsb100ToRgb, hsvToRgb, rgbaToInt, rgbToHex } from '@/helpers/color';
import { Hsb100, RGBAobj } from '@/models/Tools/Color';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ColorPickerPointer from './ColorPickerPointer';
const CANVAS_W = 200;
const CANVAS_H = 200;
const PIX = 2;

type ColorPickerCanvasProps = {
  hsv: Hsb100;
  setColor: (color: number) => void;
};

export default function ColorPickerCanvas({ hsv, setColor }: ColorPickerCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);

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
        const rgba: RGBAobj = hsb100ToRgb(hsv.h, x, 100 - y);
        ctx.fillStyle = rgbToHex(rgba);
        ctx.fillRect(x * PIX, y * PIX, PIX, PIX);
      }
    }
  }, [hsv]);

  const selectedColor = useMemo(() => {
    console.log(hsv);
    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.b);
    return rgbToHex(rgb);
  }, [hsv]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const rect = e.currentTarget.getBoundingClientRect();

      const x = Math.round(Math.max(Math.min(e.clientX - rect.left, 200), 0) / 2);
      const y = Math.round(Math.max(Math.min(e.clientY - rect.top, 200), 0) / 2);

      console.log(100 - y);
      console.log(x);

      const rgb = hsb100ToRgb(hsv.h, x, 100 - y);

      setColor(rgbaToInt(rgb.r, rgb.g, rgb.b));
    },
    [isDragging],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  }, []);

  const pointerX = useMemo(() => {
    return hsv.s * 2;
  }, [hsv]);

  const pointerY = useMemo(() => {
    return (100 - hsv.b) * 2;
  }, [hsv]);

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
        style={{ touchAction: 'none', outline: '4px solid #888' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <ColorPickerPointer
        x={pointerX}
        y={pointerY}
        selectedColor={selectedColor}
        W={CANVAS_W}
        H={CANVAS_H}
      />
    </div>
  );
}
