import { Rectangle } from '@/models/Layer';
import { Hsb100, Hsv, RGBAobj } from '@/models/Tools/Color';

export const rgbaToInt = (r: number, g: number, b: number, a = 255): number =>
  (((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (a & 0xff)) >>> 0;

export const intToRGB = (rgba: number): RGBAobj => {
  const n = rgba >>> 0;
  return {
    r: (n >>> 24) & 0xff,
    g: (n >>> 16) & 0xff,
    b: (n >>> 8) & 0xff,
    a: n & 0xff,
  };
};

export const intToCssRgba = (v: number) => {
  const r = (v >>> 24) & 0xff;
  const g = (v >>> 16) & 0xff;
  const b = (v >>> 8) & 0xff;
  const a = (v & 0xff) / 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const getPixelIndex = (y: number, w: number, x: number): number => y * w + x;

export const getLocalPixelIndex = (globalX: number, globalY: number, rect: Rectangle): number => {
  const localX = globalX - rect.x;
  const localY = globalY - rect.y;

  if (localX < 0 || localY < 0 || localX >= rect.width || localY >= rect.height) {
    return -1;
  }

  return localY * rect.width + localX;
};

export function hsvToRgb(h: number, s: number, v: number): RGBAobj {
  const hh = ((h % 360) + 360) % 360; // normalize
  const ss = Math.max(0, Math.min(1, s));
  const vv = Math.max(0, Math.min(1, v));

  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;

  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (hh < 60) [r1, g1, b1] = [c, x, 0];
  else if (hh < 120) [r1, g1, b1] = [x, c, 0];
  else if (hh < 180) [r1, g1, b1] = [0, c, x];
  else if (hh < 240) [r1, g1, b1] = [0, x, c];
  else if (hh < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
    a: 255,
  };
}

export function hsb100ToRgb(h: number, s: number, b: number): RGBAobj {
  const hDeg = (Math.max(0, Math.min(100, h)) / 100) * 360;
  const s01 = Math.max(0, Math.min(100, s)) / 100;
  const v01 = Math.max(0, Math.min(100, b)) / 100;
  return hsvToRgb(hDeg, s01, v01);
}

export function rgbToHsv({ r, g, b, a }: RGBAobj): Hsv {
  const R = Math.min(255, Math.max(0, r)) / 255;
  const G = Math.min(255, Math.max(0, g)) / 255;
  const B = Math.min(255, Math.max(0, b)) / 255;

  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    switch (max) {
      case R:
        h = ((G - B) / d) % 6;
        break;
      case G:
        h = (B - R) / d + 2;
        break;
      case B:
        h = (R - G) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;

  return { h, s, v, a };
}

export function rgbToHsb100(rgba: RGBAobj): Hsb100 {
  const { h, s, v, a } = rgbToHsv(rgba);
  return {
    h: Math.round((h / 360) * 100), // 0..100
    s: Math.round(s * 100), // 0..100
    b: Math.round(v * 100), // 0..100
    a,
  };
}

export function rgbToHex({ r, g, b, a }: RGBAobj): string {
  const to2 = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
}
