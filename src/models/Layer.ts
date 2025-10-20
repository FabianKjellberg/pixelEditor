export type Layer = {
  name: string
  
  xPos: number;
  yPos: number;
  width: number;
  height: number;

  pixels: Uint32Array;
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
