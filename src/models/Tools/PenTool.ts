import { getPixelIndex } from '@/helpers/color';
import { Layer } from '../Layer';
import { ITool } from './Tools';
import { config } from '@/config/env';
import { createLayer, increaseLayerBoundary, outOfBoundFinder } from '@/util/LayerUtil';

export class PenTool implements ITool {
  //variable to know if the pen is "held down" on the canvas
  name: string = 'pencil';
  private drawing: boolean = false;
  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;
  //variable to set the color that should be painted
  public selectedColor: number | null = config.defaultColor;

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private setLayer: (layer: Layer) => void, private layer: Layer) {}
  //Interface methods
  onDown(x: number, y: number): void {
    //if the layer doesnt have any pixels in it. create it
    if (this.layer.width == 0 && this.layer.height == 0) {
      this.layer = createLayer(1, 1, x, y);

      x = 0;
      y = 0;
    }

    this.draw(x, y);
    this.drawing = true;
  }
  onMove(x: number, y: number): void {
    if (this.drawing && !(this.lastX == x && this.lastY == y)) {
      this.draw(x, y);
      this.lastX = x;
      this.lastY = y;
    }
  }
  onUp(x: number, y: number): void {
    this.drawing = false;
    this.lastX = null;
    this.lastY = null;
  }

  //Other Methods
  private draw = (x: number, y: number): void => {
    if (!this.selectedColor) {
      this.selectedColor = config.defaultColor; //!TODO maybe implement toast??? to tell user to to select color?
    }

    let newLayer = this.layer;

    const boundsItem = outOfBoundFinder(x, y, newLayer.width, newLayer.height);
    if (boundsItem.outOfBounds) {
      newLayer = increaseLayerBoundary(boundsItem.dir, newLayer);

      x = x + boundsItem.dir.left;
      y = y + boundsItem.dir.top;
    }

    newLayer.pixels[getPixelIndex(y, newLayer.width, x)] = this.selectedColor >>> 0;

    this.layer = newLayer;
    this.setLayer({ ...newLayer, pixels: newLayer.pixels.slice() });
  };
}
