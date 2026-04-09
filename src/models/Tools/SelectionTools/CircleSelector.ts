import { getProperty, PropertyType, SelectionModeProperty } from '@/models/properties/Properties';
import { ITool, IToolDeps } from '../Tools';
import { Cordinate, SelectionLayer } from '@/models/Layer';
import { getPixelPositions } from '@/util/LayerUtil';
import {
  combinedSelections,
  createSelectionCircleLayer,
  createSelectionRectangleLayer,
  subtractSelection,
} from '@/util/SelectionUtil';

export class CircleSelector implements ITool {
  name: string = 'circleSelector';
  deps: IToolDeps = {};
  oldSelection: SelectionLayer | undefined;
  selecting: boolean = false;
  lastX: number | null = null;
  lastY: number | null = null;
  originX: number | null = null;
  originY: number | null = null;

  constructor(private toolDeps: IToolDeps) {
    this.deps = toolDeps;
  }
  onDown?(x: number, y: number, pixelSize: number, mouseButton: number): void {
    this.oldSelection = this.toolDeps.getSelectionLayer?.();
    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);
    this.originX = pixelPos.x;
    this.originY = pixelPos.y;

    this.select(pixelPos);
    this.selecting = true;
  }
  onMove?(x: number, y: number, pixelSize: number): void {
    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);

    if (this.selecting && !(this.originX === pixelPos.x && this.originY === pixelPos.y)) {
      this.select(pixelPos);
    }
  }
  onUp?(x: number, y: number, pixelSize: number, mouseButton: number): void {
    this.oldSelection = undefined;
    this.selecting = false;
    this.originX = null;
    this.originY = null;
  }

  private select = (pixelPos: Cordinate) => {
    const setSelectionLayer = this.toolDeps?.setSelectionLayer;

    if (setSelectionLayer === undefined) {
      return;
    }

    const properties = this.toolDeps.getProperties?.(this.name) ?? [];
    const replaceProp = getProperty<SelectionModeProperty>(properties, PropertyType.SelectionMode);
    if (!replaceProp) return;

    const newSelection: SelectionLayer = createSelectionCircleLayer(
      pixelPos.x,
      pixelPos.y,
      this.originX ?? pixelPos.x,
      this.originY ?? pixelPos.y,
    );

    let outSelection: SelectionLayer = newSelection;

    switch (replaceProp.value) {
      case 'Replace':
      default:
        break;
      case 'Add':
        outSelection = combinedSelections(this.oldSelection, newSelection);
        break;
      case 'Subtract':
        outSelection = subtractSelection(this.oldSelection, newSelection);
        break;
    }

    setSelectionLayer(outSelection);
  };
}
