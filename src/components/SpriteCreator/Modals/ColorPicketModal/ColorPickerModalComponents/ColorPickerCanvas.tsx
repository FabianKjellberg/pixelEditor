'use client';
import { hsb100ToRgb, hsvToRgb, intToRGB, rgbaToInt, rgbToHex, rgbToHsb100 } from '@/helpers/color';
import { Hsb100, RGBAobj } from '@/models/Tools/Color';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ColorPickerPointer from './ColorPickerPointer';
import { ColorChangeOrigin, useToolContext } from '@/context/ToolContext';
const CANVAS_W = 200;
const CANVAS_H = 200;
const PIX = 2;

type ColorPickerCanvasProps = {
  primary: boolean;
};

export default function ColorPickerCanvas({ primary }: ColorPickerCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const { setPrimaryColor, setSecondaryColor, primaryColorChanged, secondaryColorChanged } =
    useToolContext();

  const setColor = primary ? setPrimaryColor : setSecondaryColor;

  const tick = useMemo(() => {
    return primary ? primaryColorChanged : secondaryColorChanged;
  }, [primaryColorChanged, secondaryColorChanged]);

  const hsvRef = useRef<Hsb100 | undefined>(undefined);

  const hsv = useMemo(() => {
    const rgb = intToRGB(tick.color);
    const hsb = rgbToHsb100(rgb);
    hsvRef.current = hsb;
    return hsb;
  }, [tick]);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [pointerX, setPointerX] = useState<number>(hsv.s * PIX);
  const [pointerY, setPointerY] = useState<number>((100 - hsv.b) * PIX);

  useEffect(() => {
    hsvRef.current = hsv;

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
    const rgb = hsb100ToRgb(hsv.h, hsv.s, hsv.b);
    return rgbToHex(rgb);
  }, [hsv]);

  const updatePos = (e: React.PointerEvent) => {
    if (hsvRef.current === undefined) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = Math.round(Math.max(Math.min(e.clientX - rect.left, 200), 0) / PIX);
    const y = Math.round(Math.max(Math.min(e.clientY - rect.top, 200), 0) / PIX);

    const rgb = hsb100ToRgb(hsvRef.current.h, x, 100 - y);

    setPointerX(x * PIX);
    setPointerY(y * PIX);
    setColor(rgbaToInt(rgb.r, rgb.g, rgb.b), 'pointer');
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);

    updatePos(e);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      updatePos(e);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (tick.source !== 'pointer' && tick.source !== 'slider' && hsvRef.current != undefined) {
      setPointerX(hsvRef.current.s * PIX);
      setPointerY((100 - hsvRef.current.b) * PIX);
    }
  }, [tick]);

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
        selectedColor={selectedColor}
        W={CANVAS_W}
        H={CANVAS_H}
      />
    </div>
  );
}
