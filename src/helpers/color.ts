import { Cordinate, Rectangle } from '@/models/Layer';
import { Color, HSV, RGB, RGBA } from '@/models/Tools/Color';

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

export const getGlobalCordinate = (localX: number, localY: number, rect: Rectangle): Cordinate => {
  return {
    x: localX + rect.x,
    y: localY + rect.y,
  };
};

export const hsvToRgb = (hsv: HSV): RGB => {
  const { h, s, v } = hsv;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

export const rgbToHsv = (rgb: RGB): HSV => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }
  }

  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
};

export const intToRgb = (color: number): RGB => {
  return {
    r: (color >>> 24) & 255,
    g: (color >>> 16) & 255,
    b: (color >>> 8) & 255,
  };
};

export const rgbToInt = (rgb: RGB): number => {
  return rgbaToInt(rgb.r, rgb.g, rgb.b, 255);
};

export const rgbToHex = (rgb: RGB): string => {
  return `#${[rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

export const hsvToColor = (hsv: HSV): Color => {
  const rgb = hsvToRgb(hsv);

  return {
    rgb,
    hsv,
    int: rgbToInt(rgb),
    hex: rgbToHex(rgb),
  };
};

export const rgbToColor = (rgb: RGB): Color => {
  return {
    rgb,
    hsv: rgbToHsv(rgb),
    int: rgbToInt(rgb),
    hex: rgbToHex(rgb),
  };
};

export const intToColor = (int: number): Color => {
  const rgb = intToRgb(int);

  return {
    rgb,
    hsv: rgbToHsv(rgb),
    int,
    hex: rgbToHex(rgb),
  };
};

export const hsvToHex = (hsv: HSV): string => {
  const rgb = hsvToRgb(hsv);

  return rgbToHex(rgb);
};

export function setAlpha(color: number, newAlpha: number): number {
  const a = newAlpha & 0xff;
  const rgb = color & 0xffffff00;
  return (rgb | a) >>> 0;
}

export function intToRgba(color: number): RGBA {
  return {
    r: (color >>> 24) & 255,
    g: (color >>> 16) & 255,
    b: (color >>> 8) & 255,
    a: color & 255,
  };
}

export function rgbaToInt(r: number, g: number, b: number, a: number = 255): number {
  return (((r & 255) << 24) | ((g & 255) << 16) | ((b & 255) << 8) | (a & 255)) >>> 0;
}
