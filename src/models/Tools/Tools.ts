import { Layer, Rectangle } from '../Layer';

export enum PropertyType {
  Size = 0,
}

export type SizeProperty = {
  readonly propertyType: PropertyType.Size;
  size: number;
};

export type Property = SizeProperty;

export type IToolDeps = {
  getLayer?: () => Layer | undefined;
  setLayer?: (layer: Layer, dirtyRectangle: Rectangle) => void;
  getPrimaryColor?: () => number | undefined;
  setPrimaryColor?: (color: number) => void;
  getSecondaryColor?: () => number | undefined;
  setSecondaryColor?: (color: number) => void;
  getProperties?: () => Property[];
  setProperties?: (properties: Property[] | ((prev: Property[]) => Property[])) => void;
};

export interface ITool {
  name: string;
  onDown(x: number, y: number): void;
  onMove(x: number, y: number): void;
  onUp(x: number, y: number): void;
}

export function getProperty<T extends Property>(
  props: Property[],
  type: T['propertyType'],
): T | undefined {
  return props.find((p) => p.propertyType === type) as T | undefined;
}

export function upsertProperty(props: Property[], newProp: Property): Property[] {
  const i = props.findIndex((p) => p.propertyType === newProp.propertyType);
  if (i === -1) return [...props, newProp];
  const copy = props.slice();
  copy[i] = newProp;
  return copy;
}
