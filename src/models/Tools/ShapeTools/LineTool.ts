import {
  clipLayerToRect,
  clipLayerToSelection,
  drawLine,
  getPixelPositions,
  getSmallestRectangleFromPoints,
  stampToCanvasLayer,
} from '@/util/LayerUtil';
import { ITool, IToolDeps } from '../Tools';
import { config } from '@/config/env';
import { Layer, LayerEntity, Rectangle } from '@/models/Layer';
import {
  getProperty,
  IProperty,
  OpacityProperty,
  PropertyType,
  StrokeWidthProperty,
} from '../Properties';
import { intToRGB, rgbaToInt } from '@/helpers/color';

export class LineTool implements ITool {
  deps: IToolDeps;
  name: string = 'lineTool';

  private downX: number | null = null;
  private downY: number | null = null;
  private lastX: number | null = null;
  private lastY: number | null = null;

  private layerLastDrawn: LayerEntity | null = null;
  private originalLayer: Layer | null = null;

  private color: number | null = null;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    if (mouseButton !== 0 && mouseButton !== 2) return;

    const pos = getPixelPositions(x, y, pixelSize);

    this.downX = pos.x;
    this.downY = pos.y;
    this.lastX = pos.x;
    this.lastY = pos.y;

    //add a baseline entry if none exists
    const layer = this.deps.getLayer?.();
    if (!layer) return;

    const hasBaseLine = this.deps.hasBaseline?.(layer.id);

    if (hasBaseLine === false) {
      this.deps.checkPoint?.(layer);
    }

    //set original layer
    this.originalLayer = layer.layer;

    const setLayer = this.deps.setLayer;
    if (setLayer == undefined) return;

    //get color and opacity
    const color: number =
      mouseButton == 0
        ? (this.deps.getPrimaryColor?.() ?? config.defaultColor)
        : (this.deps.getSecondaryColor?.() ?? config.defaultColor);
    const properties: IProperty[] = this.deps.getProperties?.('lineTool') ?? [];
    const opacityProperty = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    //add Opacity to color
    const rgba = intToRGB(color);
    this.color = rgbaToInt(rgba.r, rgba.g, rgba.b, opacityProperty?.value ?? 255);
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (this.downX === null || this.downY === null || this.color === null) return;

    const pos = getPixelPositions(x, y, pixelSize);

    const lastX = this.lastX ?? this.downX;
    const lastY = this.lastY ?? this.downY;

    this.lastX = pos.x;
    this.lastY = pos.y;

    const setLayer = this.deps.setLayer;
    if (setLayer == undefined) return;

    // get properties
    const properties: IProperty[] = this.deps.getProperties?.('lineTool') ?? [];
    const strokeWidth = getProperty<StrokeWidthProperty>(properties, PropertyType.StrokeWidth);

    //get Props
    const selectedLayer = this.deps.getSelectionLayer?.();
    const size = strokeWidth?.value ?? 0;

    //Return early if tool doesnt have access to getting canvas boundary
    const getCanvasRect = this.deps.getCanvasRect;
    if (getCanvasRect === undefined) return;
    const canvasRect: Rectangle = getCanvasRect();

    // create dirty rectangle
    const dirtyRectangle = getSmallestRectangleFromPoints(
      [lastX, this.downX, pos.x],
      [lastY, this.downY, pos.y],
      Math.round(size),
    );

    const originalLayer = this.originalLayer;
    if (!originalLayer) return;

    //build layer from current cordinates to last cordinates
    const lineLayer: Layer = drawLine(this.downX, this.downY, pos.x, pos.y, size, this.color, true);

    //filter pixels in not selected pixels
    const selectionFilteredLayer: Layer = selectedLayer
      ? clipLayerToSelection(lineLayer, selectedLayer)
      : lineLayer;

    const filterCanvas: Layer = clipLayerToRect(selectionFilteredLayer, canvasRect);

    setLayer((prevLayer: LayerEntity) => {
      const newLayer = stampToCanvasLayer(filterCanvas, originalLayer);
      const layer = {
        layer: newLayer,
        name: prevLayer.name,
        id: prevLayer.id,
      };

      this.layerLastDrawn = layer;

      return { layer: layer, dirtyRect: dirtyRectangle };
    });
  }
  onUp(x: number, y: number, pixelSize: number): void {
    this.downX = null;
    this.downY = null;
    this.lastX = null;
    this.lastY = null;

    const checkPoint = this.deps.checkPoint;
    if (!this.layerLastDrawn || !checkPoint) return;

    checkPoint(this.layerLastDrawn);
  }
}
