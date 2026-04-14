import {
  clipLayerToRect,
  clipLayerToSelection,
  drawLine,
  drawRectangle,
  getPixelPositions,
  getSmallestRectangleFromPoints,
  stampToCanvasLayer,
} from '@/util/LayerUtil';
import { ITool, IToolDeps } from '../Tools';
import { Layer, LayerEntity, Rectangle } from '@/models/Layer';
import { config } from '@/config/env';
import {
  FillProperty,
  getProperty,
  IProperty,
  OpacityProperty,
  PropertyType,
  StrokeAlignProperty,
  StrokeWidthProperty,
} from '../../properties/Properties';
import { setAlpha } from '@/helpers/color';
import { createToolTipSize, ToolTipValues } from '@/models/ToolTipValues';

export class RectangleTool implements ITool {
  deps: IToolDeps;
  name: string = 'rectangleTool';

  private downX: number | null = null;
  private downY: number | null = null;
  private lastX: number | null = null;
  private lastY: number | null = null;

  private layerLastDrawn: LayerEntity | null = null;
  private originalLayer: LayerEntity | null = null;

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
    const layers = this.deps.getLayers?.();
    if (!layers) return;

    if (layers.length === 0) {
      this.deps.onToast?.('You need to have a layer selected to use the Rectnagle Tool', 'warning');
      return;
    }

    if (layers.length > 1) {
      this.deps.onToast?.(
        'You can only have 1 layer selected to use the Rectnagle Tool',
        'warning',
      );
      return;
    }

    //set original layer
    this.originalLayer = layers[0];

    //get color and opacity
    const primaryColor = this.deps.getPrimaryColor?.();
    const secondaryColor = this.deps.getSecondaryColor?.();

    if (!primaryColor || !secondaryColor) return;

    const properties: IProperty[] = this.deps.getProperties?.('rectangleTool') ?? [];
    const opacityProperty = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    //add Opacity to color

    const primaryColorWithOpacity = setAlpha(primaryColor.int, opacityProperty?.value ?? 255);
    const secondaryColorWithOpacity = setAlpha(secondaryColor.int, opacityProperty?.value ?? 255);

    this.color = mouseButton === 0 ? primaryColorWithOpacity : secondaryColorWithOpacity;
    this.fillColor = mouseButton === 0 ? secondaryColorWithOpacity : primaryColorWithOpacity;

    //set initial tooltip values
    const toolTipValues: ToolTipValues[] = [];

    toolTipValues.push(createToolTipSize(undefined, undefined));

    this.deps.setToolTipValues?.(toolTipValues);
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

    const setLayers = this.deps.setLayers;
    if (setLayers == undefined) return;

    // get properties
    const properties: IProperty[] = this.deps.getProperties?.('rectangleTool') ?? [];
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
    let w = Math.abs(pos.x - this.downX);
    let h = Math.abs(pos.y - this.downY);

    switch (alignStrokeProperty.value) {
      case 'Outside':
        buffer = size;
        w += size * 2;
        h += size * 2;
        break;
      case 'Centered':
        buffer = Math.floor(size / 2);
        w += size;
        h += size;
        break;
      case 'Inside':
      default:
        break;
    }

    // update w + h
    this.deps.setToolTipValues?.([createToolTipSize(w, h)]);

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
    const lineLayer: Layer = drawRectangle(
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
    this.deps.setToolTipValues?.([]);

    const checkPoint = this.deps.checkPoint;
    if (!this.layerLastDrawn || !checkPoint) return;

    if (!this.layerLastDrawn || !checkPoint || !this.originalLayer) return;

    checkPoint({
      up: [this.originalLayer],
      down: [this.layerLastDrawn],
    });
    this.layerLastDrawn = null;
    this.originalLayer = null;
  }
}
