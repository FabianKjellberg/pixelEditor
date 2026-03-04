export type LayerTreeItem = LayerEntity | LayerGroupStart | LayerGroupEnd;

export type LayerGroupStart = {
  type: 'group-start';
  id: string;
  name: string;
  collapsed: boolean;
};

export type LayerGroupEnd = {
  type: 'group-end';
  id: string;
};

export type LayerEntity = {
  type: 'layer';
  name: string;
  id: string;
  layer: Layer;
};

export type Layer = {
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
