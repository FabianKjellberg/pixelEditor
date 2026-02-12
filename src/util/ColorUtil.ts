import { intToRGB, rgbaToInt } from '@/helpers/color';
import { RGBAobj } from '@/models/Tools/Color';

export function blendColor(top: number, bottom: number): number {
  const t = intToRGB(top);
  const b = intToRGB(bottom);

  if (b.a === 0) return top;
  if (t.a === 0) return bottom;

  if (b.a === 255) {
    return blendOverOpaque(top, bottom);
  }

  const aT = t.a / 255;
  const aB = b.a / 255;

  const aOut = aT + aB * (1 - aT);

  if (aOut <= 0) {
    return rgbaToInt(0, 0, 0, 0);
  }

  const rPremul = t.r * aT + b.r * aB * (1 - aT);
  const gPremul = t.g * aT + b.g * aB * (1 - aT);
  const bPremul = t.b * aT + b.b * aB * (1 - aT);

  const rOut = Math.round(rPremul / aOut);
  const gOut = Math.round(gPremul / aOut);
  const bOut = Math.round(bPremul / aOut);
  const aOut255 = Math.round(aOut * 255);

  return rgbaToInt(rOut, gOut, bOut, aOut255);
}

function blendOverOpaque(top: number, bottom: number): number {
  const t = intToRGB(top);
  const b = intToRGB(bottom);

  const aT = t.a / 255; // 0–1
  const invA = 1 - aT;

  const r = Math.round(t.r * aT + b.r * invA);
  const g = Math.round(t.g * aT + b.g * invA);
  const bl = Math.round(t.b * aT + b.b * invA);

  return rgbaToInt(r, g, bl, 255);
}

export function getColorFromBackingRef(
  x: number,
  y: number,
  backingRef: HTMLCanvasElement,
): RGBAobj {
  const ctx = backingRef.getContext('2d');

  if (!ctx) throw new Error('no context provided');

  const { data } = ctx.getImageData(x, y, 1, 1);
  return {
    r: data[0],
    g: data[1],
    b: data[2],
    a: data[3],
  };
}
