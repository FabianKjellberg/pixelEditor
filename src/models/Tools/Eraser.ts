import { ITool, IToolDeps } from './Tools';
import { getProperty, PropertyType, SizeProperty } from './Properties';
import { Direction, Layer, Rectangle } from '../Layer';
import {
  createLayer,
  getPixelPositions,
  lineStampLayer,
  rectanglesIntersecting,
  stampLayer,
  tryReduceLayerSize,
} from '@/util/LayerUtil';

export class Eraser implements ITool {
  //variable to know if the eraser is "held down" on the canvas
  private erasing = false;
  name: string = 'eraser';

  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private toolDeps: IToolDeps) {}

  /** -- INTERFACE METHODS -- **/
  onDown(x: number, y: number, pixelSize: number): void {
    const layer: Layer | undefined = this.toolDeps.getLayer?.();
    if (layer == undefined) return;
    this.erase(x, y, layer, pixelSize);
    this.erasing = true;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (this.erasing && !(this.lastX == x && this.lastY == y)) {
      const layer: Layer | undefined = this.toolDeps.getLayer?.();
      if (layer == undefined) return;
      this.erase(x, y, layer, pixelSize);
    }
  }
  onUp(): void {
    this.erasing = false;
    this.lastX = null;
    this.lastY = null;
  }

  /** -- OTHER METHODS -- **/
  private erase = (x: number, y: number, layer: Layer, ps: number): void => {
    const properties = this.toolDeps.getProperties?.(this.name) ?? [];
    const sizeProp = getProperty<SizeProperty>(properties, PropertyType.Size);

    const size = sizeProp?.value ?? 0;

    const r = Math.floor(size / 2);

    let pixelPos = getPixelPositions(x, y, ps);

    pixelPos = { x: pixelPos.x - layer.rect.x, y: pixelPos.y - layer.rect.y };

    const prevX = this.lastX ?? pixelPos.x;
    const prevY = this.lastY ?? pixelPos.y;

    const curX = pixelPos.x;
    const curY = pixelPos.y;

    //boundary of the rectangle of the stamped pen stroke relative to its own layer
    const stampRectangle: Rectangle = {
      x: curX - r,
      y: curY - r,
      width: size,
      height: size,
    };
    const layerRectangle: Rectangle = {
      x: 0,
      y: 0,
      width: layer.rect.width,
      height: layer.rect.height,
    };
    const prevStampRectangle: Rectangle = {
      x: prevX - r,
      y: prevY - r,
      width: size,
      height: size,
    };

    const stampIntersection: boolean = rectanglesIntersecting(layerRectangle, stampRectangle);
    const prevStampIntersection: boolean = rectanglesIntersecting(
      layerRectangle,
      prevStampRectangle,
    );

    if (!stampIntersection && !prevStampIntersection) {
      this.lastX = prevX;
      this.lastY = prevY;
      return;
    }

    const minX = Math.min(prevX, curX) - r;
    const minY = Math.min(prevY, curY) - r;
    const redrawRectangle: Rectangle = {
      x: layer.rect.x + minX,
      y: layer.rect.y + minY,
      width: Math.abs(curX - prevX) + size,
      height: Math.abs(curY - prevY) + size,
    };

    const strokeShape: Layer = createLayer(stampRectangle, '');

    if (curX == prevX && curY == prevY) {
      layer = stampLayer(strokeShape, layer);
    } else {
      const prevRect: Rectangle = { x: prevX - r, y: prevY - r, width: size, height: size };
      layer = lineStampLayer(strokeShape, prevRect, layer);
    }

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

    const localAffectedArea: Rectangle = {
      x: redrawRectangle.x - layer.rect.x,
      y: redrawRectangle.y - layer.rect.y,
      width: redrawRectangle.width,
      height: redrawRectangle.height,
    };

    //see if eraser toucher boundary
    const intersectEdges: Direction = {
      left: rectanglesIntersecting(localAffectedArea, leftEdgeRectangle) ? 1 : 0,
      top: rectanglesIntersecting(localAffectedArea, topEdgeRectangle) ? 1 : 0,
      right: rectanglesIntersecting(localAffectedArea, rightEdgeRectangle) ? 1 : 0,
      bottom: rectanglesIntersecting(localAffectedArea, bottomEdgeRectangle) ? 1 : 0,
    };

    const reduceLayer = tryReduceLayerSize(intersectEdges, layer);

    this.lastX = curX - reduceLayer.dir.left;
    this.lastY = curY - reduceLayer.dir.top;

    this.toolDeps.setLayer?.(reduceLayer.layer, redrawRectangle);
  };
}
