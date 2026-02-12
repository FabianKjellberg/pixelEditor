import { ITool, IToolDeps } from './Tools';
import { getProperty, IProperty, OpacityProperty, PropertyType, SizeProperty } from './Properties';
import { Cordinate, Layer, LayerEntity, Rectangle } from '../Layer';
import {
  createLayer,
  getPixelPositions,
  drawLine,
  isRectanglesIntersecting,
  clipLayerToSelection,
  clipLayerToRect,
  eraseFromCanvasLayer,
} from '@/util/LayerUtil';
import { rgbaToInt } from '@/helpers/color';

export class Eraser implements ITool {
  //variable to know if the eraser is "held down" on the canvas
  private erasing = false;
  name: string = 'eraser';
  deps: IToolDeps = {};

  //variables to make sure that move doesnt try to draw every move if it has already drew on the pixel
  private lastX: number | null = null;
  private lastY: number | null = null;
  private strokeNr: number = 1;
  private strokeMatrix: Layer = createLayer({ x: 0, y: 0, width: 0, height: 0 }, 0);

  private layerLastErased: LayerEntity | null = null;

  //Constructor make sure that the tool accesses the currently selected layer
  constructor(private toolDeps: IToolDeps) {
    this.deps = toolDeps;
  }

  /** -- INTERFACE METHODS -- **/
  onDown(x: number, y: number, pixelSize: number): void {
    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);

    const layer = this.deps.getLayer?.();
    if (!layer) return;

    const hasBaseLine = this.deps.hasBaseline?.(layer.id);

    if (hasBaseLine === false) {
      this.deps.checkPoint?.(layer);
    }

    this.erase(pixelPos.x, pixelPos.y);

    this.erasing = true;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    //return early if eraser is not held down
    if (!this.erasing) return;

    const pixelPos = getPixelPositions(x, y, pixelSize);

    // return early if its in the same pixel on the canvas
    if (this.lastX === pixelPos.x && this.lastY === pixelPos.y) return;

    this.erase(pixelPos.x, pixelPos.y);
  }
  onUp(): void {
    this.erasing = false;
    this.lastX = null;
    this.lastY = null;
    this.strokeNr++;

    const checkPoint = this.deps.checkPoint;
    if (!this.layerLastErased || !checkPoint) return;

    checkPoint(this.layerLastErased);
  }

  /** -- OTHER METHODS -- **/
  private erase = (x: number, y: number): void => {
    const setLayer = this.toolDeps.setLayer;
    if (setLayer == undefined) return;

    // Get properties (same pattern as PenTool)
    const properties: IProperty[] = this.toolDeps.getProperties?.('eraser') ?? [];
    const sizeProp = getProperty<SizeProperty>(properties, PropertyType.Size);
    const opacityProperty = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    // Create eraser "color" - RGB doesn't matter, only alpha (erase strength)
    // Default to 255 (full erase) like PenTool defaults to full opacity
    const eraserStrength = rgbaToInt(0, 0, 0, opacityProperty?.value ?? 255);

    // Return early if tool doesn't have access to canvas boundary
    const getCanvasRect = this.toolDeps.getCanvasRect;
    if (getCanvasRect === undefined) return;
    const canvasRect: Rectangle = getCanvasRect();

    // Update the stroke matrix if canvas size changed
    this.updateStrokeMatrixIfChanged(canvasRect);

    // Get selection layer
    const selectedLayer = this.toolDeps.getSelectionLayer?.();
    const size = sizeProp?.value ?? 1;

    const firstInStroke: boolean = this.lastX == null && this.lastY == null;

    // Set last x,y or current x,y if it doesn't exist
    const lastX: number = this.lastX ?? x;
    const lastY: number = this.lastY ?? y;

    // Update last x,y
    this.lastX = x;
    this.lastY = y;

    // Build layer from current coordinates to last coordinates
    const lineLayer: Layer = drawLine(
      lastX,
      lastY,
      x,
      y,
      size,
      eraserStrength,
      this.strokeMatrix,
      this.strokeNr,
      firstInStroke,
    );

    // Return early if erasing outside of canvas
    if (!isRectanglesIntersecting(canvasRect, lineLayer.rect)) {
      return;
    }

    // Filter pixels not in selection
    const selectionFilteredLayer: Layer = selectedLayer
      ? clipLayerToSelection(lineLayer, selectedLayer)
      : lineLayer;

    // Filter out pixels outside of canvas
    const filterCanvas: Layer = clipLayerToRect(selectionFilteredLayer, canvasRect);

    const dirtyRectangle: Rectangle = filterCanvas.rect;

    // Update layer using eraseFromCanvasLayer
    setLayer((prevLayer: LayerEntity) => {
      const newLayer = eraseFromCanvasLayer(filterCanvas, prevLayer.layer);
      const layer = {
        layer: newLayer,
        name: prevLayer.name,
        id: prevLayer.id,
      };

      this.layerLastErased = layer;

      return { layer: layer, dirtyRect: dirtyRectangle };
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
    this.strokeMatrix = createLayer(canvasRect, 0);
  }
}
