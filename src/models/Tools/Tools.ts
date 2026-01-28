import { Cordinate, Layer, Rectangle, SelectionLayer } from '../Layer';
import { IProperty } from './Properties';

export type IToolDeps = {
  getLayer?: () => Layer | undefined;
  setLayer?: (layer: Layer, dirtyRectangle: Rectangle) => void;
  setLayer2?: (updater: (prev: Layer) => { layer: Layer; dirtyRect: Rectangle }) => void;
  getSelectionLayer?: () => SelectionLayer | undefined;
  setSelectionLayer?: (selectionLayer: SelectionLayer) => void;
  getPrimaryColor?: () => number | undefined;
  setPrimaryColor?: (color: number) => void;
  getSecondaryColor?: () => number | undefined;
  setSecondaryColor?: (color: number) => void;
  getProperties?: (toolKey: string) => IProperty[];
  setProperties?: (properties: IProperty[] | ((prev: IProperty[]) => IProperty[])) => void;
  getPan?: () => Cordinate | undefined;
  setPan?: (cord: Cordinate) => void;
  getCanvasRect?: () => Rectangle;
  setCanvasRect?: (rect: Rectangle) => void;
};

export interface ITool {
  name: string;
  onDown(x: number, y: number, pixelSize: number): void;
  onMove(x: number, y: number, pixelSize: number): void;
  onUp(x: number, y: number, pixelSize: number): void;
}
