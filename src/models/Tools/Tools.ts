import { Layer, Rectangle } from '../Layer';
import { IProperty } from './Properties';

export type IToolDeps = {
  getLayer?: () => Layer | undefined;
  setLayer?: (layer: Layer, dirtyRectangle: Rectangle) => void;
  getPrimaryColor?: () => number | undefined;
  setPrimaryColor?: (color: number) => void;
  getSecondaryColor?: () => number | undefined;
  setSecondaryColor?: (color: number) => void;
  getProperties?: (toolKey: string) => IProperty[];
  setProperties?: (properties: IProperty[] | ((prev: IProperty[]) => IProperty[])) => void;
};

export interface ITool {
  name: string;
  onDown(x: number, y: number): void;
  onMove(x: number, y: number): void;
  onUp(x: number, y: number): void;
}
