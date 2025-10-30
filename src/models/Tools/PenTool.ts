import { Layer, Rectangle } from '../Layer';
import { ITool, IToolDeps } from './Tools';
import { config } from '@/config/env';
import {
  createLayer,
  increaseLayerBoundary,
  lineStampLayer,
  outOfBoundFinder,
  stampLayer,
} from '@/util/LayerUtil';

export class PenTool implements ITool {
  //variable to know if the pen is "held down" on the canvas
  name: string = 'pencil';
  private drawing: boolean = false;
  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;

  private size: number = 1;

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private toolDeps: IToolDeps) {}
  //Interface methods
  onDown(x: number, y: number): void {
    const layer = this.toolDeps.getLayer?.() || undefined;
    if (layer == undefined) return;

    //Draw
    this.draw(x, y, layer);

    //put the "pen down"
    this.drawing = true;
  }
  onMove(x: number, y: number): void {
    //return early if pen is not held down
    if (!this.drawing) return;

    //return early if the the move is inside the same cordinate as last move
    if (this.lastX == x && this.lastY == y) return;

    //fetch the layer from context
    const layer = this.toolDeps.getLayer?.() || undefined;
    if (layer == undefined) return;

    //draw
    this.draw(x, y, layer);
  }
  onUp(_x: number, _y: number): void {
    //reset value on up
    this.drawing = false;
    this.lastX = null;
    this.lastY = null;
  }

  //Other Methods
  private draw = (x: number, y: number, layer: Layer): void => {
    const color: number = this.toolDeps.getPrimaryColor?.() ?? config.defaultColor;
    const size = this.size;
    const r = Math.floor(size / 2);

    // If the layer is empty, create a 1×1 at the first point (layer-local will start at 0,0)
    if (layer.rect.width === 0 && layer.rect.height === 0) {
      layer = createLayer({ width: 1, height: 1, x, y }, layer.name);
      x = 0;
      y = 0; // now in layer-local coords
    }

    // Previous point (center). If null (first draw), use current so we just stamp once.
    let prevX = this.lastX ?? x;
    let prevY = this.lastY ?? y;

    // Current point (center)
    let curX = x;
    let curY = y;

    // Stamp rect (top-left) derived from current center
    let stampRect: Rectangle = { x: curX - r, y: curY - r, width: size, height: size };

    // Check bounds against current layer and grow if needed
    const bounds = outOfBoundFinder(stampRect, layer.rect.width, layer.rect.height);

    if (bounds.outOfBounds) {
      // Grow layer and get how much it shifted (left/top add space *inside* the layer)
      layer = increaseLayerBoundary(bounds.dir, layer);

      // Shift both prev & current centers by the added margins on left/top
      const shiftX = bounds.dir.left ?? 0;
      const shiftY = bounds.dir.top ?? 0;

      prevX += shiftX;
      prevY += shiftY;
      curX += shiftX;
      curY += shiftY;

      // Recompute current stamp rect after shift
      stampRect = { x: curX - r, y: curY - r, width: size, height: size };
    }

    // Build stroke shape at current position
    const strokeShape: Layer = createLayer(stampRect, layer.name, color);

    // If there was movement, draw a line from previous center to current center
    if (prevX !== curX || prevY !== curY) {
      const prevRect: Rectangle = { x: prevX - r, y: prevY - r, width: size, height: size };
      layer = lineStampLayer(strokeShape, prevRect, layer);
    } else {
      layer = stampLayer(strokeShape, layer);
    }

    // Compute redraw rectangle (in canvas coords) that covers the stroke path
    const minX = Math.min(prevX, curX) - r;
    const minY = Math.min(prevY, curY) - r;
    const redrawRectangle: Rectangle = {
      x: layer.rect.x + minX,
      y: layer.rect.y + minY,
      width: Math.abs(curX - prevX) + size,
      height: Math.abs(curY - prevY) + size,
    };

    // Update last point (center)
    this.lastX = curX;
    this.lastY = curY;

    // Commit
    this.toolDeps.setLayer?.({ ...layer }, redrawRectangle);
  };
}
