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
} from '../../properties/Properties';
import { intToRGB, rgbaToInt } from '@/helpers/color';

export class LineTool implements ITool {
  deps: IToolDeps;
  name: string = 'lineTool';

  private downX: number | null = null;
  private downY: number | null = null;
  private lastX: number | null = null;
  private lastY: number | null = null;

  private layerLastDrawn: LayerEntity | null = null;
  private originalLayer: LayerEntity | null = null;

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
    const layers = this.deps.getLayers?.();
    if (!layers) return;

    if (layers.length === 0) {
      this.deps.onToast?.('You need to have a layer selected to use the Line Tool', 'warning');
      return;
    }

    if (layers.length > 1) {
      this.deps.onToast?.('You can only have 1 layer selected to use the Line Tool', 'warning');
      return;
    }

    //set original layer
    this.originalLayer = layers[0];

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

    const setLayers = this.deps.setLayers;
    if (setLayers == undefined) return;

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

    setLayers((prevLayers: LayerEntity[]) => {
      const newLayer = stampToCanvasLayer(filterCanvas, originalLayer.layer);
      const layer = {
        ...prevLayers[0],
        layer: newLayer,
      };

      this.layerLastDrawn = layer;

      return { layers: [layer], dirtyRect: dirtyRectangle };
    });
  }
  onUp(x: number, y: number, pixelSize: number): void {
    this.downX = null;
    this.downY = null;
    this.lastX = null;
    this.lastY = null;

    const checkPoint = this.deps.checkPoint;
    if (!this.layerLastDrawn || !checkPoint || !this.originalLayer) return;

    checkPoint({
      up: [this.originalLayer],
      down: [this.layerLastDrawn],
    });
    this.layerLastDrawn = null;
    this.originalLayer = null;
  }
}
