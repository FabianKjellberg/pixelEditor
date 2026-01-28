import { intToRGB, rgbaToInt } from '@/helpers/color';
import { Cordinate, Layer, Rectangle } from '../Layer';
import { getProperty, IProperty, OpacityProperty, PropertyType, SizeProperty } from './Properties';
import { ITool, IToolDeps } from './Tools';
import { config } from '@/config/env';
import {
  clipLayerToRect,
  clipLayerToSelection,
  createLayer,
  drawLine,
  getPixelPositions,
  isRectanglesIntersecting,
  stampLayer,
  stampToCanvasLayer,
} from '@/util/LayerUtil';

export class PenTool implements ITool {
  //variable to know if the pen is "held down" on the canvas
  name: string = 'pencil';
  private drawing: boolean = false;
  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;
  private strokeNr: number = 1;
  private strokeMatrix: Layer = createLayer({ x: 0, y: 0, width: 0, height: 0 }, 'strokeMatrix', 0);

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private toolDeps: IToolDeps) {}
  //Interface methods
  onDown(x: number, y: number, pixelSize: number): void {
    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);

    //Draw
    this.draw(pixelPos.x, pixelPos.y);

    //put the "pen down"
    this.drawing = true;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    //return early if pen is not held down
    if (!this.drawing) return;

    const pixelPos = getPixelPositions(x, y, pixelSize);

    //fetch the layer from context

    //return early if the the move is inside the same cordinate as last move
    if (this.lastX == pixelPos.x && this.lastY == pixelPos.y) return;

    //draw
    this.draw(pixelPos.x, pixelPos.y);
  }
  onUp(): void {
    //reset value on up
    this.drawing = false;
    this.lastX = null;
    this.lastY = null;
    this.strokeNr++;
  }

  //Other Methods
  private draw = (x: number, y: number): void => {
    const setLayer = this.toolDeps.setLayer;
    if (setLayer == undefined) return;

    let color: number = this.toolDeps.getPrimaryColor?.() ?? config.defaultColor;

    //get properties
    const properties: IProperty[] = this.toolDeps.getProperties?.('pencil') ?? [];
    const sizeProp = getProperty<SizeProperty>(properties, PropertyType.Size);
    const opacityProperty = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    //add Opacity to properties
    const rgba = intToRGB(color);
    color = rgbaToInt(rgba.r, rgba.g, rgba.b, opacityProperty?.value ?? 255);

    //Return early if tool doesnt have access to getting canvas boundary
    const getCanvasRect = this.toolDeps.getCanvasRect;
    if (getCanvasRect === undefined) return;
    const canvasRect: Rectangle = getCanvasRect();

    //Update the matrix array and reset stroke if the canvas has changed size
    this.updateStrokeMatrixIfChanged(canvasRect);

    //get Props
    const selectedLayer = this.toolDeps.getSelectionLayer?.();
    const size = sizeProp?.value ?? 0;

    const firstInStroke: boolean = this.lastX == null && this.lastY == null;

    // set last last x,y or current x,y if it doesnt exist
    const lastX: number = this.lastX ?? x;
    const lastY: number = this.lastY ?? y;

    //update last x,y
    this.lastX = x;
    this.lastY = y;

    //build layer from current cordinates to last cordinates
    const lineLayer: Layer = drawLine(
      lastX,
      lastY,
      x,
      y,
      size,
      color,
      this.strokeMatrix,
      this.strokeNr,
      firstInStroke,
    );

    // return early if line is outside of canvas
    if (!isRectanglesIntersecting(canvasRect, lineLayer.rect)) {
      return;
    }

    //filter pixels in not selected pixels
    const selectionFilteredLayer: Layer = selectedLayer
      ? clipLayerToSelection(lineLayer, selectedLayer)
      : lineLayer;

    //filter out pixels outside of canvas
    const filterCanvas: Layer = clipLayerToRect(selectionFilteredLayer, canvasRect);

    const dirtyRectangle: Rectangle = filterCanvas.rect;

    setLayer((prevLayer: Layer) => {
      const newLayer = stampToCanvasLayer(filterCanvas, prevLayer);
      return {
        layer: newLayer,
        dirtyRect: dirtyRectangle,
      };
    });
  };

  private updateStrokeMatrixIfChanged(canvasRect: Rectangle) {
    if (
      canvasRect.height == this.strokeMatrix.rect.height &&
      canvasRect.width == this.strokeMatrix.rect.width
    ) {
      return;
    }

    this.strokeNr = 1;
    this.strokeMatrix = createLayer(canvasRect, 'strokedaddy', 0);
  }
}

/* water COLOR BRUSH?????

private draw = (x: number, y: number, layer: Layer): void => {
    let color: number = this.toolDeps.getPrimaryColor?.() ?? config.defaultColor;

    //get properties
    const properties: IProperty[] = this.toolDeps.getProperties?.('pencil') ?? [];
    const sizeProp = getProperty<SizeProperty>(properties, PropertyType.Size);
    const opacityProperty = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    //add Opacity to properties
    const rgba = intToRGB(color);
    color = rgbaToInt(rgba.r, rgba.g, rgba.b, opacityProperty?.value ?? 255);

    // Return early if tool doesnt have access to set layer
    const setLayer = this.toolDeps.setLayer;
    if (setLayer === undefined) return;

    //Return early if tool doesnt have access to getting canvas boundary
    const getCanvasRect = this.toolDeps.getCanvasRect;
    if (getCanvasRect === undefined) return;
    const canvasRect: Rectangle = getCanvasRect();

    //get Props
    const selectedLayer = this.toolDeps.getSelectionLayer?.();
    const size = sizeProp?.value ?? 0;

    // set last last x,y or current x,y if it doesnt exist
    const lastX: number = this.lastX ?? x;
    const lastY: number = this.lastY ?? y;

    //update last x,y
    this.lastX = x;
    this.lastY = y;

    //build layer from current cordinates to last cordinates
    const lineLayer: Layer = drawLine(x, y, lastX, lastY, size, color);

    // return early if line is outside of canvas
    if (!isRectanglesIntersecting(canvasRect, lineLayer.rect)) {
      return;
    }

    //filter pixels in not selected pixels
    const selectionFilteredLayer: Layer = selectedLayer
      ? clipLayerToSelection(lineLayer, selectedLayer)
      : lineLayer;

    //filter out pixels outside of canvas
    const filterCanvas: Layer = clipLayerToRect(selectionFilteredLayer, canvasRect);

    const dirtyRectangle: Rectangle = filterCanvas.rect;

    const newLayer = stampLayer(filterCanvas, layer);

    setLayer(newLayer, dirtyRectangle);

    Color brush
  };
 */
