import { ToastType } from '@/context/ToastContext/ToastContext';
import { Cordinate, LayerEntity, Rectangle, SelectionLayer } from '../Layer';
import { AnyProperty, IProperty } from '../properties/Properties';
import { HistoryAction } from '@/context/UndoRedoContext';
import { Color } from './Color';

export type IToolDeps = {
  getLayers?: () => LayerEntity[] | undefined;
  setLayers?: (
    updater: (prev: LayerEntity[]) => { layers: LayerEntity[]; dirtyRect: Rectangle },
  ) => void;
  getSelectionLayer?: () => SelectionLayer | undefined;
  setSelectionLayer?: (selectionLayer: SelectionLayer) => void;
  getSelectionOverlay?: () => Cordinate[] | undefined;
  setSelectionOverlay?: (points: Cordinate[] | undefined) => void;
  getPrimaryColor?: () => Color;
  setPrimaryColor?: (color: Color) => void;
  getSecondaryColor?: () => Color;
  setSecondaryColor?: (color: Color) => void;
  getProperties?: (toolKey: string) => IProperty[];
  setProperties?: (properties: IProperty[] | ((prev: IProperty[]) => IProperty[])) => void;
  getPan?: () => Cordinate | undefined;
  setPan?: (cord: Cordinate) => void;
  getCanvasRect?: () => Rectangle;
  setCanvasRect?: (rect: Rectangle) => void;
  checkPoint?: (action: HistoryAction) => void;
  onToast?: (message: string, type?: ToastType) => void;
};

export interface ITool {
  deps: IToolDeps;
  name: string;
  onDown?(x: number, y: number, pixelSize: number, mouseButton: number): void;
  onMove?(x: number, y: number, pixelSize: number): void;
  onUp?(x: number, y: number, pixelSize: number, mouseButton: number): void;

  onUpdate?(property?: AnyProperty): void;
  onAction?(action: string): void;
  onCommit?(): void;
  onCancel?(): void;
}

export type toolWithImage = {
  icon: string;
  tool: ITool;
};
