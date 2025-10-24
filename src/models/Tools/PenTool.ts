import { getPixelIndex } from '@/helpers/color';
import { Layer, Rectangle } from '../Layer';
import { ITool, IToolDeps } from './Tools';
import { config } from '@/config/env';
import { createLayer, increaseLayerBoundary, outOfBoundFinder, stampLayer } from '@/util/LayerUtil';

export class PenTool implements ITool {
  //variable to know if the pen is "held down" on the canvas
  name: string = 'pencil';
  private drawing: boolean = false;
  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;

  private size: number = 2;

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private toolDeps: IToolDeps) {}
  //Interface methods
  onDown(x: number, y: number): void {
    let layer = this.toolDeps.getLayer?.() || undefined;
    if (layer == undefined) return;

    //if the layer doesnt have any pixels in it. create it
    if (layer.rect.width == 0 && layer.rect.height == 0) {
      layer = createLayer({ width: 1, height: 1, x, y }, layer.name);

      //from canvas cordinates to layer specific
      x = 0;
      y = 0;
    }

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
  onUp(x: number, y: number): void {
    //reset value on up
    this.drawing = false;
    this.lastX = null;
    this.lastY = null;
  }

  //Other Methods
  private draw = (x: number, y: number, layer: Layer): void => {
    //get selected color from dependencies
    const selectedColor: number = this.toolDeps.getColor?.() || config.defaultColor;

    //cordinates for last last drawn place pixel, change before we modify the x and y values
    this.lastX = x;
    this.lastY = y;

    //Update the coridnates based on the size of the pen stroke
    x = x - Math.floor(this.size / 2);
    y = y - Math.floor(this.size / 2);

    //boundary of the rectangle of the stamped pen stroke relative to its own layer
    const stampRectangle = { x: x, y: y, width: this.size, height: this.size };

    //Item showing if and how much a cordinated is outside a given rect (relative terms)
    const boundsItem = outOfBoundFinder(stampRectangle, layer.rect.width, layer.rect.height);
    console.log(boundsItem);
    //If the cordinate is out of bounds
    if (boundsItem.outOfBounds) {
      //Increase the layer boundary with the given directions and get a new updated layer
      layer = increaseLayerBoundary(boundsItem.dir, layer);

      console.log(layer);
      //update the cordinates with the new layer size and position
      x = x + boundsItem.dir.left;
      y = y + boundsItem.dir.top;
    }

    //create a layer that will replace part of another shape
    const strokeShape: Layer = createLayer(stampRectangle, layer.name, selectedColor);

    //replace part of the old layer with the new stroke
    layer = stampLayer(strokeShape, layer);

    const redrawRectangle: Rectangle = {
      x: layer.rect.x + stampRectangle.x,
      y: layer.rect.y + stampRectangle.y,
      width: stampRectangle.width,
      height: stampRectangle.height,
    };
    console.log(redrawRectangle);

    //Update the true layer in layercontext !TODO make it redraw affected area.
    this.toolDeps.setLayer?.({ ...layer }, redrawRectangle);
  };
}
