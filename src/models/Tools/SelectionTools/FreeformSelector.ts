import {
  AnyProperty,
  getProperty,
  PropertyType,
  SelectionModeProperty,
} from '@/models/properties/Properties';
import { ITool, IToolDeps } from '../Tools';
import { Cordinate, SelectionLayer } from '@/models/Layer';
import { combinedSelections, fillSelectionPolygon, subtractSelection } from '@/util/SelectionUtil';
import {
  createToolTipAngle,
  createToolTipDelta,
  createToolTipLength,
  ToolTipValues,
} from '@/models/ToolTipValues';
import { getAngle } from '@/util/TransformUtil';
import { getPixelIndex } from '@/helpers/color';
import { getPixelPositions } from '@/util/LayerUtil';

export class FreeformSelector implements ITool {
  deps: IToolDeps;
  name: string = 'freeformSelector';
  selecting: boolean = false;
  points: Cordinate[] = [];
  oldSelection: SelectionLayer | undefined = undefined;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    if (!this.selecting) {
      this.oldSelection = this.deps.getSelectionLayer?.();
    }

    this.selecting = true;

    const toolTipValues: ToolTipValues[] = [];

    toolTipValues.push(createToolTipDelta(undefined, undefined));
    toolTipValues.push(createToolTipAngle(undefined));
    toolTipValues.push(createToolTipLength(undefined));

    this.deps.setToolTipValues?.(toolTipValues);

    if (this.points.length > 0) {
      const firstX = this.points[0].x * pixelSize;
      const firstY = this.points[0].y * pixelSize;

      const dx = Math.abs(firstX - x);
      const dy = Math.abs(firstY - y);

      const r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      if (r < 10) {
        this.finalise(true);
        return;
      }
    }

    this.points.push({ x: x / pixelSize, y: y / pixelSize });

    const setSelectionOverlay = this.deps.setSelectionOverlay;

    if (!setSelectionOverlay) return;

    setSelectionOverlay(this.points);
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (!this.selecting) return;

    const pos = getPixelPositions(x, y, pixelSize);

    //Set tool tip values
    const toolTipValues: ToolTipValues[] = [];

    const px = this.points[this.points.length - 1].x;
    const py = this.points[this.points.length - 1].y;

    const dx = pos.x - px;
    const dy = pos.y - py;

    const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    const angle = getAngle(dx, dy);

    toolTipValues.push(createToolTipDelta(dx, dy));
    toolTipValues.push(createToolTipAngle(angle));
    toolTipValues.push(createToolTipLength(length));

    this.deps.setToolTipValues?.(toolTipValues);

    const selectionOverlay = this.deps.getSelectionOverlay?.();

    if (!selectionOverlay) return;

    const setSelectionOverlay = this.deps.setSelectionOverlay;

    if (!setSelectionOverlay) return;

    setSelectionOverlay([...this.points, { x: pos.x, y: pos.y }]);
  }
  onCommit(): void {
    this.finalise(true);
  }
  onCancel(): void {
    this.finalise(false);
  }

  private finalise(setSelection: boolean) {
    if (setSelection && this.points.length > 0) {
      const properties = this.deps.getProperties?.(this.name) ?? [];
      const replaceProp = getProperty<SelectionModeProperty>(
        properties,
        PropertyType.SelectionMode,
      );
      if (!replaceProp) return;

      this.points = [...this.points, this.points[0]];

      const selectionLayer = fillSelectionPolygon(this.points);

      let outSelection: SelectionLayer = selectionLayer;

      switch (replaceProp.value) {
        case 'Replace':
        default:
          break;
        case 'Add':
          outSelection = combinedSelections(this.oldSelection, selectionLayer);
          break;
        case 'Subtract':
          outSelection = subtractSelection(this.oldSelection, selectionLayer);
          break;
      }

      this.deps.setSelectionLayer?.(outSelection);
    }

    this.selecting = false;
    this.points = [];
    this.deps.setSelectionOverlay?.(undefined);
    this.deps.setToolTipValues?.([]);
    this.oldSelection = undefined;
  }
}
