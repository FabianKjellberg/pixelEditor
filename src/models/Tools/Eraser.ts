import { ITool } from './Tools';
import { Direction, Layer } from '../Layer';
import { outOfBoundFinder, tryReduceLayerSize } from '@/util/LayerUtil';
import { getPixelIndex, rgbaToInt } from '@/helpers/color';

export class Eraser implements ITool {
  //variable to know if the eraser is "held down" on the canvas
  private erasing = false;
  name: string = 'eraser';

  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private setLayer: (layer: Layer) => void, private layer: Layer) {}

  /** -- INTERFACE METHODS -- **/
  onDown(x: number, y: number): void {
    this.erasing = true;
    this.erase(x, y);
  }
  onMove(x: number, y: number): void {
    if (this.erasing && !(this.lastX == x && this.lastY == y)) {
      this.erase(x, y);
      this.lastX = x;
      this.lastY = y;
    }
  }
  onUp(x: number, y: number): void {
    this.erasing = false;
    this.lastX = null;
    this.lastY = null;
  }

  /** -- OTHER METHODS -- **/
  private erase = (x: number, y: number): void => {
    const bounadryItem = outOfBoundFinder(x, y, this.layer.width, this.layer.height);

    let newLayer = { ...this.layer };

    if (bounadryItem.outOfBounds) return;

    newLayer.pixels[getPixelIndex(y, newLayer.width, x)] = rgbaToInt(0, 0, 0, 0);

    const reduceDirection: Direction = {
      left: x === 0 ? 1 : 0,
      top: y === 0 ? 1 : 0,
      right: x === newLayer.width - 1 ? 1 : 0,
      bottom: y === newLayer.height - 1 ? 1 : 0,
    };

    newLayer = tryReduceLayerSize(reduceDirection, newLayer);

    this.layer = newLayer;
    this.setLayer({ ...newLayer, pixels: newLayer.pixels.slice() });
  };
}
