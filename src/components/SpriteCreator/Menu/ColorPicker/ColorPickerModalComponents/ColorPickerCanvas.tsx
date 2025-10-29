'use client';
import { hsb100ToRgb, rgbToHex } from '@/helpers/color';
import { Hsb100, RGBAobj } from '@/models/Tools/Color';
import { useEffect, useMemo, useRef, useState } from 'react';
import ColorPickerPointer from './ColorPickerPointer';
const CANVAS_W = 200;
const CANVAS_H = 200;
const PIX = 2;

type ColorPickerCanvasProps = {
  hsv: Hsb100;
  setHsv: (hsv: Hsb100) => void;
};

export default function ColorPickerCanvas({ hsv, setHsv }: ColorPickerCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [pointerX, setPointerX] = useState<number>(hsv.s * PIX);
  const [pointerY, setPointerY] = useState<number>(Math.abs(hsv.b - 100) * PIX);

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

  const selectedColor = useMemo((): string => {
    const rgba: RGBAobj = hsb100ToRgb(hsv.h, pointerX / 2, 100 - pointerY / 2);
    return rgbToHex(rgba);
  }, [pointerX, pointerY, hsv.h]);

  useEffect(() => {
    const newS = Math.max(0, Math.min(100, pointerX / 2));
    const newB = Math.max(0, Math.min(100, 100 - pointerY / 2));

    if (hsv.s !== newS || hsv.b !== newB) {
      setHsv({ h: hsv.h, s: newS, b: newB });
    }
  }, [pointerX, pointerY, hsv.b, hsv.h, hsv.s, setHsv]);

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
      />
      <ColorPickerPointer
        x={pointerX}
        y={pointerY}
        setX={setPointerX}
        setY={setPointerY}
        selectedColor={selectedColor}
        W={CANVAS_W}
        H={CANVAS_H}
      />
    </div>
  );
}
