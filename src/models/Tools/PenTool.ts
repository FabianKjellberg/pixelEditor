import { Layer, Rectangle } from '../Layer';
import { getProperty, PropertyType, SizeProperty } from './Properties';
import { ITool, IToolDeps } from './Tools';
import { config } from '@/config/env';
import {
  createLayer,
  getPixelPositions,
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

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private toolDeps: IToolDeps) {}
  //Interface methods
  onDown(x: number, y: number, pixelSize: number): void {
    const layer = this.toolDeps.getLayer?.() || undefined;
    if (layer == undefined) return;

    //Draw
    this.draw(x, y, layer, pixelSize);

    //put the "pen down"
    this.drawing = true;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    //return early if pen is not held down
    if (!this.drawing) return;

    //return early if the the move is inside the same cordinate as last move
    if (this.lastX == x && this.lastY == y) return;

    //fetch the layer from context
    const layer = this.toolDeps.getLayer?.() || undefined;
    if (layer == undefined) return;

    //draw
    this.draw(x, y, layer, pixelSize);
  }
  onUp(): void {
    //reset value on up
    this.drawing = false;
    this.lastX = null;
    this.lastY = null;
  }

  //Other Methods
  private draw = (x: number, y: number, layer: Layer, ps: number): void => {
    const color: number = this.toolDeps.getPrimaryColor?.() ?? config.defaultColor;
    const sizeProp = getProperty<SizeProperty>(
      this.toolDeps.getProperties?.('pencil') ?? [],
      PropertyType.Size,
    );

    const size = sizeProp?.value ?? 0;
    const r = Math.floor(size / 2);

    //get position in pixelSize
    let pixelPos = getPixelPositions(x, y, ps);

    // If the layer is empty, create a 1×1 at the first point (layer-local will start at 0,0)
    if (layer.rect.width === 0 && layer.rect.height === 0) {
      layer = createLayer({ width: 1, height: 1, x: pixelPos.x, y: pixelPos.y }, layer.name);
      pixelPos = { x: 0, y: 0 };
    } else {
      //Get relative to layer
      pixelPos = { x: pixelPos.x - layer.rect.x, y: pixelPos.y - layer.rect.y };
    }

    // Previous point (center). If null (first draw), use current so we just stamp once.
    let prevX = this.lastX ?? pixelPos.x;
    let prevY = this.lastY ?? pixelPos.y;

    // Current point (center)
    let curX = pixelPos.x;
    let curY = pixelPos.y;

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
