import { hsb100ToRgb, intToRGB, rgbaToInt, rgbToHex, rgbToHsb100 } from '@/helpers/color';
import { Hsb100, RGBAobj } from '@/models/Tools/Color';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ColorPickerSliderPointer from './ColorPickerSliderPointer';
import { ColorChangeOrigin, useToolContext } from '@/context/ToolContext';

const CANVAS_H = 200;
const CANVAS_W = 30;
const PIX = 2;

type ColorPickerSliderProps = {
  primary: boolean;
};

const ColorPickerSlider = ({ primary }: ColorPickerSliderProps) => {
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

  const [pointerY, setPointerY] = useState<number>(hsv.h * 2);

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
      const rgba: RGBAobj = hsb100ToRgb(y, 100, 100);
      ctx.fillStyle = rgbToHex(rgba);
      ctx.fillRect(0, y * PIX, CANVAS_W, PIX);
    }
  }, [hsv]);

  const pointerColor = useMemo((): string => {
    const rgba: RGBAobj = hsb100ToRgb(pointerY / 2, 100, 100);
    return rgbToHex(rgba);
  }, [pointerY]);

  const updatePos = (e: React.PointerEvent) => {
    if (hsvRef.current === undefined) return;

    const r = e.currentTarget.getBoundingClientRect();
    const ny = Math.max(0, Math.min(e.clientY - r.top, r.height));

    const rgb = hsb100ToRgb(Math.round(ny / PIX), hsvRef.current.s, hsvRef.current.b);

    setPointerY((prev) => (prev === ny ? prev : ny));
    setColor(rgbaToInt(rgb.r, rgb.g, rgb.b), 'slider');
  };

  useEffect(() => {
    if (tick.source !== 'pointer' && tick.source !== 'slider' && hsvRef.current != undefined) {
      setPointerY(hsvRef.current.h * PIX);
    }
  }, [tick]);

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
