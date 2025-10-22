import { RGBAobj } from "@/models/Tools/Color";

export const rgbaToInt = (r: number, g: number, b: number, a = 255) :number =>
  ((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (a & 0xff);

  export const intToRGB = (rgba: number): RGBAobj => {
    const n = rgba >>> 0;            
    return {
      r: (n >>> 24) & 0xff,
      g: (n >>> 16) & 0xff,
      b: (n >>> 8)  & 0xff,
      a:  n         & 0xff,
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
