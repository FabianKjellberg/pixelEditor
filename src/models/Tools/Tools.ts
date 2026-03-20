import { ToastType } from '@/context/ToastContext/ToastContext';
import { Cordinate, LayerEntity, Rectangle, SelectionLayer } from '../Layer';
import { IProperty } from './Properties';
import { HistoryAction } from '@/context/UndoRedoContext';

export type IToolDeps = {
  getLayers?: () => LayerEntity[] | undefined;
  setLayers?: (
    updater: (prev: LayerEntity[]) => { layers: LayerEntity[]; dirtyRect: Rectangle },
  ) => void;
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
  checkPoint?: (action: HistoryAction) => void;
  onToast?: (message: string, type?: ToastType) => void;
};

export interface ITool {
  deps: IToolDeps;
  name: string;
  onDown?(x: number, y: number, pixelSize: number, mouseButton: number): void;
  onMove?(x: number, y: number, pixelSize: number): void;
  onUp?(x: number, y: number, pixelSize: number, mouseButton: number): void;

  onCommit?(): void;
  onCancel?(): void;
}
