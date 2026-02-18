import { Layer, LayerEntity, Rectangle } from '@/models/Layer';
import { ITool, IToolDeps } from '../Tools';
import { config } from '@/config/env';
import {
  FillProperty,
  getProperty,
  IProperty,
  OpacityProperty,
  PropertyType,
  StrokeAlignProperty,
  StrokeWidthProperty,
} from '../Properties';
import { intToRGB, rgbaToInt } from '@/helpers/color';
import {
  clipLayerToRect,
  clipLayerToSelection,
  drawOval,
  getPixelPositions,
  getSmallestRectangleFromPoints,
  stampToCanvasLayer,
} from '@/util/LayerUtil';

export class OvalTool implements ITool {
  deps: IToolDeps;
  name: string = 'ovalTool';

  private downX: number | null = null;
  private downY: number | null = null;
  private lastX: number | null = null;
  private lastY: number | null = null;

  private layerLastDrawn: LayerEntity | null = null;
  private originalLayer: Layer | null = null;

  private color: number | null = null;
  private fillColor: number | null = null;

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
    const primaryColor = this.deps.getPrimaryColor?.() ?? config.defaultColor;
    const secondaryColor = this.deps.getSecondaryColor?.() ?? config.defaultColor;

    const properties: IProperty[] = this.deps.getProperties?.('ovalTool') ?? [];
    const opacityProperty = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    //add Opacity to color
    const primaryRgba = intToRGB(primaryColor);
    const secondaryRgba = intToRGB(secondaryColor);
    const primaryColorWithOpacity = rgbaToInt(
      primaryRgba.r,
      primaryRgba.g,
      primaryRgba.b,
      opacityProperty?.value ?? 255,
    );
    const secondaryColorWithOpacity = rgbaToInt(
      secondaryRgba.r,
      secondaryRgba.g,
      secondaryRgba.b,
      opacityProperty?.value ?? 255,
    );

    this.color = mouseButton === 0 ? primaryColorWithOpacity : secondaryColorWithOpacity;
    this.fillColor = mouseButton === 0 ? secondaryColorWithOpacity : primaryColorWithOpacity;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (
      this.downX === null ||
      this.downY === null ||
      this.color === null ||
      this.fillColor === null
    )
      return;

    const pos = getPixelPositions(x, y, pixelSize);

    const lastX = this.lastX ?? this.downX;
    const lastY = this.lastY ?? this.downY;

    this.lastX = pos.x;
    this.lastY = pos.y;

    const setLayer = this.deps.setLayer;
    if (setLayer == undefined) return;

    // get properties
    const properties: IProperty[] = this.deps.getProperties?.('ovalTool') ?? [];
    const strokeWidth = getProperty<StrokeWidthProperty>(properties, PropertyType.StrokeWidth);
    const fillProperty = getProperty<FillProperty>(properties, PropertyType.FillProperty);
    const alignStrokeProperty = getProperty<StrokeAlignProperty>(
      properties,
      PropertyType.StrokeAlignProperty,
    );

    //get Props
    const selectedLayer = this.deps.getSelectionLayer?.();
    const size = strokeWidth?.value ?? 0;

    //Return early if tool doesnt have access to getting canvas boundary
    const getCanvasRect = this.deps.getCanvasRect;
    if (getCanvasRect === undefined) return;
    const canvasRect: Rectangle = getCanvasRect();

    if (!alignStrokeProperty || !alignStrokeProperty.value) return;

    let buffer = 0;

    switch (alignStrokeProperty.value) {
      case 'Outside':
        buffer = size;
        break;
      case 'Centered':
        buffer = Math.floor(size / 2);
        break;
      case 'Inside':
      default:
        break;
    }

    // create dirty rectangle
    const dirtyRectangle = getSmallestRectangleFromPoints(
      [lastX, this.downX, pos.x],
      [lastY, this.downY, pos.y],
      buffer,
    );

    const rectangleRect = getSmallestRectangleFromPoints(
      [this.downX, pos.x],
      [this.downY, pos.y],
      buffer,
    );

    const originalLayer = this.originalLayer;
    if (!originalLayer) return;

    const fill: boolean = fillProperty ? fillProperty.value : false;

    //build layer from current cordinates to last cordinates
    const lineLayer: Layer = drawOval(
      rectangleRect,
      size,
      this.color,
      fill ? this.fillColor : undefined,
    );

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
