export type Layer = {
  name: string;
  rect: Rectangle;
  pixels: Uint32Array;
};

export type SelectionLayer = {
  pixels: Uint8Array;
  rect: Rectangle;
};

export type Cordinate = {
  x: number;
  y: number;
};
export type OutOfBoundItem = {
  outOfBounds: boolean;
  dir: Direction;
};

export type Direction = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};
