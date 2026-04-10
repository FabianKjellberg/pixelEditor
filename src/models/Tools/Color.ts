export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type HSV = {
  h: number;
  s: number;
  v: number;
};

export type Color = {
  rgb: RGB;
  hsv: HSV;
  int: number;
  hex: string;
};

export const WHITE: Color = {
  rgb: { r: 255, g: 255, b: 255 },
  hsv: { h: 0, s: 0, v: 1 },
  int: 0xffffffff,
  hex: '#ffffff',
};

export const BLACK: Color = {
  rgb: { r: 0, g: 0, b: 0 },
  hsv: { h: 0, s: 0, v: 0 },
  int: 0x000000ff,
  hex: '#000000',
};
