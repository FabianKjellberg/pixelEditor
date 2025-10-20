import { outOfBoundFinder } from '@/util/LayerUtil';
import { ITool, IToolDeps } from './Tools';

export class MoveTool implements ITool {
  name: string = 'moveTool';
  private moving: boolean = false;
  private lastX: number | null = null;
  private lastY: number | null = null;

  constructor(private toolDeps: IToolDeps) {}

  onDown(x: number, y: number): void {
    const layer = this.toolDeps.getLayer();
    if(layer == undefined) return;
    
    const boundsItem = outOfBoundFinder(x, y, layer.width, layer.height);
    //early return if you click out of bounds
    if (boundsItem.outOfBounds) return;

    this.lastX = x;
    this.lastY = y;
    this.moving = true;
  }
  onMove(x: number, y: number): void {
    //early return if the layer is not moved
    if (!this.moving) return;

    if (this.lastX === null || this.lastY === null) return;

    //early return if it hasnt moved
    if (this.lastX === x && this.lastY === y) return;

    const layer = this.toolDeps.getLayer();
    if (layer == undefined) return;

    layer.xPos += x - this.lastX;
    layer.yPos += y - this.lastY;
    this.toolDeps.setLayer({ ...layer });
  }
  onUp(x: number, y: number): void {
    this.moving = false;
    this.lastX = null;
    this.lastY = null;
  }
}
