import { Cordinate } from '../Layer';
import { ITool, IToolDeps } from './Tools';

export class PanTool implements ITool {
  name: string = 'panTool';
  private paning: boolean = false;
  private relativeCanvasPos: Cordinate | null = null;
  deps: IToolDeps = {};

  constructor(private toolDeps: IToolDeps) {
    this.deps = toolDeps;
  }

  onDown(x: number, y: number): void {
    this.paning = true;
    this.relativeCanvasPos = { x, y };
  }
  onMove(x: number, y: number): void {
    if (!this.paning || !this.relativeCanvasPos) return;

    const pan: Cordinate | undefined = this.toolDeps.getPan?.();
    if (!pan) return;

    const lp = this.relativeCanvasPos;

    this.toolDeps.setPan?.({ x: x + pan.x - lp.x, y: y + pan.y - lp.y });
  }
  onUp(x: number, y: number): void {
    this.paning = false;
    this.relativeCanvasPos = null;
  }
}
