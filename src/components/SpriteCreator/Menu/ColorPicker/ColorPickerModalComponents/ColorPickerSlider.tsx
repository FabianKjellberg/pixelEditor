import { hsb100ToRgb, rgbToHex } from '@/helpers/color';
import { Hsb100, RGBAobj } from '@/models/Tools/Color';
import { useEffect, useMemo, useRef, useState } from 'react';
import ColorPickerSliderPointer from './ColorPickerSliderPointer';

const CANVAS_H = 200;
const CANVAS_W = 30;
const PIX = 2;

type ColorPickerSliderProps = {
  hsv: Hsb100;
  setHsv: (hsv: Hsb100) => void;
};

const ColorPickerSlider = ({ hsv, setHsv }: ColorPickerSliderProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [pointerY, setPointerY] = useState<number>(hsv.h * 2);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    // Set CSS size (logical) and backing store size (device pixels)
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;

    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let y = 0; y < 100; y++) {
      const rgba: RGBAobj = hsb100ToRgb(y, 100, 100);
      ctx.fillStyle = rgbToHex(rgba);
      ctx.fillRect(0, y * PIX, CANVAS_W, PIX);
    }
  }, [hsv]);

  const pointerColor = useMemo((): string => {
    const rgba: RGBAobj = hsb100ToRgb(pointerY / 2, 100, 100);
    return rgbToHex(rgba);
  }, [pointerY]);

  useEffect(() => {
    setHsv({ h: pointerY / 2, s: hsv.s, b: hsv.b });
  }, [pointerY, hsv.s, hsv.b, setHsv]);

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
        y={pointerY}
        setY={setPointerY}
        W={CANVAS_W}
        pointerColor={pointerColor}
      />
    </div>
  );
};
export default ColorPickerSlider;
