import { outOfBoundFinder } from '@/util/LayerUtil';
import { Layer } from '../Layer';
import { ITool } from './Tools';

export class MoveTool implements ITool {
  name: string = 'moveTool';
  private moving: boolean = false;
  private lastX: number | null = null;
  private lastY: number | null = null;

  constructor(private setLayer: (layer: Layer) => void, private layer: Layer) {}

  onDown(x: number, y: number): void {
    const boundsItem = outOfBoundFinder(x, y, this.layer.width, this.layer.height);
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

    const newLayer = { ...this.layer };

    newLayer.xPos += x - this.lastX;
    newLayer.yPos += y - this.lastY;
    this.layer = newLayer;
    this.setLayer({ ...newLayer });
  }
  onUp(x: number, y: number): void {
    this.moving = false;
    this.lastX = null;
    this.lastY = null;
  }
}
