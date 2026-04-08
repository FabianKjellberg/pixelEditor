import { AnyProperty } from '@/models/properties/Properties';
import { ITool, IToolDeps } from '../Tools';

export class LassoSelector implements ITool {
  deps: IToolDeps;
  name: string = 'lassoSelector';
  selecting: boolean = false;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    if (this.selecting) {
      this.finalise();
      return;
    }

    this.selecting = true;

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
    this.finalise();
  }
  onCancel(): void {
    this.selecting = false;
  }

  private finalise() {
    this.selecting = false;
    this.deps.setSelectionOverlay?.(undefined);
  }
}
