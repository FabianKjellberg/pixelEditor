import { combineRectangles, getPixelPositions, outOfBoundFinder } from '@/util/LayerUtil';
import { ITool, IToolDeps } from './Tools';
import { Cordinate, Rectangle } from '../Layer';

export class MoveTool implements ITool {
  name: string = 'moveTool';
  private moving: boolean = false;
  private lastX: number | null = null;
  private lastY: number | null = null;

  constructor(private toolDeps: IToolDeps) {}

  onDown(x: number, y: number, pixelSize: number): void {
    const layer = this.toolDeps.getLayer?.() || undefined;
    if (layer == undefined) return;

    let pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);
    pixelPos = { x: pixelPos.x - layer.rect.x, y: pixelPos.y - layer.rect.y };

    const boundsItem = outOfBoundFinder(
      { x: pixelPos.x, y: pixelPos.y, width: 1, height: 1 },
      layer.rect.width,
      layer.rect.height,
    );
    //early return if you click out of bounds
    if (boundsItem.outOfBounds) return;

    this.lastX = pixelPos.x;
    this.lastY = pixelPos.y;
    this.moving = true;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    //early return if the layer is not moved
    if (!this.moving) return;

    if (this.lastX === null || this.lastY === null) return;

    const layer = this.toolDeps.getLayer?.();
    if (layer == undefined) return;

    let pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);
    pixelPos = { x: pixelPos.x - layer.rect.x, y: pixelPos.y - layer.rect.y };

    //early return if it hasnt moved
    if (this.lastX === pixelPos.x && this.lastY === pixelPos.y) return;

    const originalRectangle = { ...layer.rect };

    layer.rect.x += pixelPos.x - this.lastX;
    layer.rect.y += pixelPos.y - this.lastY;

    const dirtyRectangle: Rectangle = combineRectangles(originalRectangle, layer.rect);

    this.toolDeps.setLayer?.({ ...layer }, dirtyRectangle);
  }
  onUp(_x: number, _y: number): void {
    this.moving = false;
    this.lastX = null;
    this.lastY = null;
  }
}
