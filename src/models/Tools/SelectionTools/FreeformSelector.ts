import { AnyProperty } from '@/models/properties/Properties';
import { ITool, IToolDeps } from '../Tools';
import { Cordinate } from '@/models/Layer';

export class FreeformSelector implements ITool {
  deps: IToolDeps;
  name: string = 'freeformSelector';
  selecting: boolean = false;
  points: Cordinate[] = [];

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    this.selecting = true;

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

    const selectionOverlay = this.deps.getSelectionOverlay?.();

    if (!selectionOverlay) return;

    const setSelectionOverlay = this.deps.setSelectionOverlay;

    if (!setSelectionOverlay) return;

    setSelectionOverlay([...this.points, { x: x / pixelSize, y: y / pixelSize }]);
  }
  onCommit(): void {
    this.finalise(true);
  }
  onCancel(): void {
    this.finalise(false);
  }

  private finalise(setSelection: boolean) {
    this.selecting = false;
    this.points = [];
    this.deps.setSelectionOverlay?.(undefined);
  }
}
