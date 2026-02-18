import { Cordinate, LayerEntity, Rectangle, SelectionLayer } from '../Layer';
import { IProperty } from './Properties';

export type IToolDeps = {
  getLayer?: () => LayerEntity | undefined;
  setLayer?: (updater: (prev: LayerEntity) => { layer: LayerEntity; dirtyRect: Rectangle }) => void;
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
  checkPoint?: (layer: LayerEntity) => void;
  hasBaseline?: (layerId: string) => boolean;
};

export interface ITool {
  deps: IToolDeps;
  name: string;
  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void;
  onMove(x: number, y: number, pixelSize: number): void;
  onUp(x: number, y: number, pixelSize: number, mouseButton: number): void;
}
