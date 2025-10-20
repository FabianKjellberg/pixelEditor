import { getPixelIndex } from '@/helpers/color';
import { Layer } from '../Layer';
import { ITool, IToolDeps } from './Tools';
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
  constructor(private toolDeps: IToolDeps) {}
  //Interface methods
  onDown(x: number, y: number): void {
    let layer = this.toolDeps.getLayer()
    if(layer == undefined) return;
    
    //if the layer doesnt have any pixels in it. create it
    if (layer.width == 0 && layer.height == 0) {
      layer = createLayer(1,1,x,y, layer.name);

      x = 0;
      y = 0;
    }
    this.draw(x, y, layer)
    this.drawing = true;
  }
  onMove(x: number, y: number): void {
    if (!(this.drawing && !(this.lastX == x && this.lastY == y))) return;
    
    const layer = this.toolDeps.getLayer();
    if(layer == undefined) return;

    this.draw(x, y, layer);
    this.lastX = x;
    this.lastY = y;    
  }
  onUp(x: number, y: number): void {
    this.drawing = false;
    this.lastX = null;
    this.lastY = null;
  }

  //Other Methods
  private draw = (x: number, y: number, layer: Layer): void => {
    if (!this.selectedColor) {
      this.selectedColor = config.defaultColor; //!TODO maybe implement toast??? to tell user to to select color?
    }

    const boundsItem = outOfBoundFinder(x, y, layer.width, layer.height);
    if (boundsItem.outOfBounds) {
      layer = increaseLayerBoundary(boundsItem.dir, layer);

      x = x + boundsItem.dir.left;
      y = y + boundsItem.dir.top;
    }

    layer.pixels[getPixelIndex(y, layer.width, x)] = this.selectedColor >>> 0;

    this.toolDeps.setLayer({ ...layer, pixels: layer.pixels.slice() });
  };
}
