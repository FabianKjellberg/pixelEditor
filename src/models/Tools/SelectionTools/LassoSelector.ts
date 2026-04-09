import {
  AnyProperty,
  getProperty,
  PropertyType,
  SelectionModeProperty,
} from '@/models/properties/Properties';
import { ITool, IToolDeps } from '../Tools';
import { SelectionLayer } from '@/models/Layer';
import { combinedSelections, fillSelectionPolygon, subtractSelection } from '@/util/SelectionUtil';

export class LassoSelector implements ITool {
  deps: IToolDeps;
  name: string = 'lassoSelector';
  selecting: boolean = false;
  oldSelection: SelectionLayer | undefined = undefined;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    if (this.selecting) {
      this.finalise(true);
      return;
    }

    this.selecting = true;
    this.oldSelection = this.deps.getSelectionLayer?.();

    const setSelectionOverlay = this.deps.setSelectionOverlay;

    if (!setSelectionOverlay) return;

    setSelectionOverlay([{ x: x / pixelSize, y: y / pixelSize }]);
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (!this.selecting) return;

    const selectionOverlay = this.deps.getSelectionOverlay?.();

    if (!selectionOverlay) return;

    const setSelectionOverlay = this.deps.setSelectionOverlay;

    if (!setSelectionOverlay) return;

    setSelectionOverlay([...selectionOverlay, { x: x / pixelSize, y: y / pixelSize }]);
  }
  onCommit(): void {
    this.finalise(true);
  }
  onCancel(): void {
    this.finalise(false);
  }

  private finalise(setSelection: boolean) {
    let points = this.deps.getSelectionOverlay?.();

    if (setSelection && points && points.length > 0) {
      const properties = this.deps.getProperties?.(this.name) ?? [];
      const replaceProp = getProperty<SelectionModeProperty>(
        properties,
        PropertyType.SelectionMode,
      );
      if (!replaceProp) return;

      points = [...points, points[0]];

      const selectionLayer = fillSelectionPolygon(points);

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
    this.deps.setSelectionOverlay?.(undefined);
    this.oldSelection = undefined;
  }
}
