import {
  clipLayerToRect,
  createLayer,
  fillLayerScanLine,
  getPixelPositions,
  stampLayer,
  stampToCanvasLayer,
} from '@/util/LayerUtil';
import { ITool, IToolDeps } from './Tools';
import { config } from '@/config/env';
import {
  getProperty,
  IProperty,
  OpacityProperty,
  PropertyType,
  ToleranceProperty,
} from './Properties';
import { intToRGB, rgbaToInt } from '@/helpers/color';
import { RGBAobj } from './Color';
import { LayerEntity } from '../Layer';

export class FillBucket implements ITool {
  deps: IToolDeps;
  name: string = 'fillBucket';

  private layerLastDrawn: LayerEntity | null = null;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    if (mouseButton !== 0 && mouseButton !== 2) return;

    const pos = getPixelPositions(x, y, pixelSize);

    const getLayer = this.deps.getLayer?.();
    if (!getLayer) return;

    const setLayer = this.deps.setLayer;
    if (setLayer == undefined) return;

    const checkPoint = this.deps.checkPoint;
    if (!checkPoint) return;

    const hasBaseLine = this.deps.hasBaseline?.(getLayer.id);

    if (hasBaseLine === false) {
      this.deps.checkPoint?.(getLayer);
    }

    const color: number =
      mouseButton == 0
        ? (this.deps.getPrimaryColor?.() ?? config.defaultColor)
        : (this.deps.getSecondaryColor?.() ?? config.defaultColor);

    const properties: IProperty[] = this.deps.getProperties?.('fillBucket') ?? [];
    const toleranceProp = getProperty<ToleranceProperty>(properties, PropertyType.Tolerance);
    const opacityProp = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    const rgb: RGBAobj = intToRGB(color);

    const colorWithOpacity = rgbaToInt(rgb.r, rgb.g, rgb.b, opacityProp?.value ?? 255);

    const tolerance = toleranceProp?.value ?? 0;

    const canvasRect = this.deps.getCanvasRect?.();

    if (!canvasRect) return;

    const canvasLayer = createLayer(canvasRect);

    const fillLayer = stampToCanvasLayer(getLayer.layer, canvasLayer);

    const selectionLayer = this.deps.getSelectionLayer?.();

    const filledLayer = fillLayerScanLine(
      colorWithOpacity,
      tolerance,
      fillLayer,
      pos,
      selectionLayer,
    );

    if (!filledLayer) return;

    setLayer((prevLayer: LayerEntity) => {
      const newLayer = stampToCanvasLayer(filledLayer, prevLayer.layer);
      const layer = {
        layer: newLayer,
        name: prevLayer.name,
        id: prevLayer.id,
      };

      this.layerLastDrawn = layer;

      return { layer: layer, dirtyRect: fillLayer.rect };
    });
  }

  onMove(x: number, y: number, pixelSize: number): void {}
  onUp(x: number, y: number, pixelSize: number): void {
    const checkPoint = this.deps.checkPoint;
    if (!this.layerLastDrawn || !checkPoint) return;

    checkPoint(this.layerLastDrawn);
    this.layerLastDrawn = null;
  }
}
