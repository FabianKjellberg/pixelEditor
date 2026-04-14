import { getPixelPositions } from '@/util/LayerUtil';
import { Cordinate, SelectionLayer } from '../../Layer';
import { getProperty, PropertyType, SelectionModeProperty } from '../../properties/Properties';
import { ITool, IToolDeps } from '../Tools';
import {
  combinedSelections,
  createSelectionRectangleLayer,
  subtractSelection,
} from '@/util/SelectionUtil';
import { createToolTipSize, ToolTipValues } from '@/models/ToolTipValues';

export class RectangleSelector implements ITool {
  name: string = 'rectangleSelector';
  deps: IToolDeps = {};
  oldSelection: SelectionLayer | undefined = undefined;
  selecting: boolean = false;
  lastX: number | null = null;
  lastY: number | null = null;
  originX: number | null = null;
  originY: number | null = null;

  constructor(private toolDeps: IToolDeps) {
    this.deps = toolDeps;
  }
  onDown(x: number, y: number, pixelSize: number): void {
    this.oldSelection = this.toolDeps.getSelectionLayer?.();
    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);
    this.originX = pixelPos.x;
    this.originY = pixelPos.y;

    //set initial tooltip values
    const toolTipValues: ToolTipValues[] = [];

    toolTipValues.push(createToolTipSize(undefined, undefined));

    this.deps.setToolTipValues?.(toolTipValues);

    this.select(pixelPos);
    this.selecting = true;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);

    if (!this.originX || !this.originY) return;

    const w = Math.abs(this.originX - pixelPos.x) + 1;
    const h = Math.abs(this.originY - pixelPos.y) + 1;

    this.deps.setToolTipValues?.([createToolTipSize(w, h)]);

    if (this.selecting && !(this.originX === pixelPos.x && this.originY === pixelPos.y)) {
      this.select(pixelPos);
    }
  }
  onUp(x: number, y: number, pixelSize: number): void {
    this.oldSelection = undefined;
    this.selecting = false;
    this.originX = null;
    this.originY = null;
    this.deps.setToolTipValues?.([]);
  }

  private select = (pixelPos: Cordinate) => {
    const setSelectionLayer = this.toolDeps?.setSelectionLayer;

    if (setSelectionLayer === undefined) {
      return;
    }

    const properties = this.toolDeps.getProperties?.(this.name) ?? [];
    const replaceProp = getProperty<SelectionModeProperty>(properties, PropertyType.SelectionMode);
    if (!replaceProp) return;

    const newSelection: SelectionLayer = createSelectionRectangleLayer(
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
