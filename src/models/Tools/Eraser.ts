import { ITool, IToolDeps } from './Tools';
import { Direction, Layer, Rectangle } from '../Layer';
import {
  createLayer,
  outOfBoundFinder,
  rectanglesIntersecting,
  stampLayer,
  tryReduceLayerSize,
} from '@/util/LayerUtil';
import { getPixelIndex, rgbaToInt } from '@/helpers/color';

export class Eraser implements ITool {
  //variable to know if the eraser is "held down" on the canvas
  private erasing = false;
  name: string = 'eraser';

  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;

  private size: number = 2;

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private toolDeps: IToolDeps) {}

  /** -- INTERFACE METHODS -- **/
  onDown(x: number, y: number): void {
    this.erasing = true;
    this.erase(x, y);
  }
  onMove(x: number, y: number): void {
    if (this.erasing && !(this.lastX == x && this.lastY == y)) {
      this.erase(x, y);
    }
  }
  onUp(x: number, y: number): void {
    this.erasing = false;
    this.lastX = null;
    this.lastY = null;
  }

  /** -- OTHER METHODS -- **/
  private erase = (x: number, y: number): void => {
    let layer = this.toolDeps.getLayer?.();
    if (layer == undefined) return;

    this.lastX = x;
    this.lastY = y;

    //Update the coridnates based on the size of the pen stroke
    x = x - Math.floor(this.size / 2);
    y = y - Math.floor(this.size / 2);

    //boundary of the rectangle of the stamped pen stroke relative to its own layer
    const stampRectangle: Rectangle = { x: x, y: y, width: this.size, height: this.size };

    //return early if stamp outside of layer
    if (
      !rectanglesIntersecting(stampRectangle, {
        x: 0,
        y: 0,
        width: layer.rect.width,
        height: layer.rect.height,
      })
    ) {
      console.log('returning because stamp isnt intersecting with the selected layer');
      console.log(stampRectangle, layer.rect);
      return;
    }

    layer = stampLayer(createLayer(stampRectangle, ''), layer);

    const leftEdgeRectangle: Rectangle = { x: 0, y: 0, width: 1, height: layer.rect.height };
    const topEdgeRectangle: Rectangle = { x: 0, y: 0, width: layer.rect.width, height: 1 };
    const rightEdgeRectangle: Rectangle = {
      x: layer.rect.width - 1,
      y: 0,
      width: 1,
      height: layer.rect.height,
    };
    const bottomEdgeRectangle: Rectangle = {
      x: 0,
      y: layer.rect.height - 1,
      width: layer.rect.width,
      height: 1,
    };

    //see if eraser toucher boundary
    const intersectEdges: Direction = {
      left: rectanglesIntersecting(stampRectangle, leftEdgeRectangle) ? 1 : 0,
      top: rectanglesIntersecting(stampRectangle, topEdgeRectangle) ? 1 : 0,
      right: rectanglesIntersecting(stampRectangle, rightEdgeRectangle) ? 1 : 0,
      bottom: rectanglesIntersecting(stampRectangle, bottomEdgeRectangle) ? 1 : 0,
    };

    const redrawRectangle: Rectangle = {
      x: layer.rect.x + stampRectangle.x,
      y: layer.rect.y + stampRectangle.y,
      width: stampRectangle.width,
      height: stampRectangle.height,
    };

    layer = tryReduceLayerSize(intersectEdges, layer);
    this.toolDeps.setLayer?.(layer, redrawRectangle);
  };
}
