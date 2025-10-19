import { getPixelIndex } from '@/helpers/color';
import { Layer } from '../Layer';
import { ITool } from './Tools';
import { config } from '@/config/env';
import { createLayer, increaseLayerBoundary } from '@/util/LayerUtil';

export class PenTool implements ITool {
  //variable to know if the pen is "held down" on the canvas
  private drawing: boolean = false;
  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;
  //variable to set the color that should be painted
  public selectedColor: number | null = config.defaultColor;

  //Constructor make sure that the pentool accesses the currently selected layer
  constructor(private setLayer: (layer: Layer) => void, private layer: Layer) {}

  private draw = (x: number, y: number): Layer => {
    if (!this.selectedColor) {
      this.selectedColor = config.defaultColor; //!TODO maybe implement toast??? to tell user to to select color?
    }

    console.log(this.layer);
    let newLayer = this.layer;

    if (x < 0 || y < 0 || x >= newLayer.width || y >= newLayer.height) {
      const growthLeft = x < 0 ? x : 0;
      const growthTop = y < 0 ? y : 0;
      const growthRight = x >= newLayer.width ? x - (newLayer.width - 1) : 0;
      const growthBottom = y >= newLayer.height ? y - (newLayer.height - 1) : 0;

      newLayer = increaseLayerBoundary(growthLeft, growthTop, growthRight, growthBottom, newLayer);

      x = x - growthLeft;
      y = y - growthTop;
    }
    newLayer.pixels[getPixelIndex(y, newLayer.width, x)] = this.selectedColor >>> 0;

    this.layer = newLayer;
    return { ...newLayer, pixels: newLayer.pixels.slice() };
  };

  onDown(x: number, y: number): void {
    //if the layer doesnt have any pixels in it. create it
    if (this.layer.width == 0 && this.layer.height == 0) {
      this.layer = createLayer(1, 1, x, y);

      x = 0;
      y = 0;
    }

    this.setLayer(this.draw(x, y));
    this.drawing = true;
  }
  onMove(x: number, y: number): void {
    if (this.drawing && !(this.lastX == x && this.lastY == y)) {
      this.setLayer(this.draw(x, y));
      this.lastX = x;
      this.lastY = y;
    }
  }
  onUp(x: number, y: number): void {
    this.drawing = false;
    this.lastX = null;
    this.lastY = null;
  }
}
