import { drawGradient, getPixelPositions, stampToCanvasLayer } from '@/util/LayerUtil';
import { ITool, IToolDeps } from '../Tools';
import { config } from '@/config/env';
import {
  DitheringProperty,
  getProperty,
  GradientTypeProperty,
  IProperty,
  OpacityProperty,
  PropertyType,
  SingleColor,
} from '../Properties';
import { intToRGB, rgbaToInt } from '@/helpers/color';
import { Layer, LayerEntity, Rectangle } from '@/models/Layer';

export class GradientTool implements ITool {
  deps: IToolDeps;
  name: string = 'gradientTool';

  private downX: number | null = null;
  private downY: number | null = null;

  private layerLastDrawn: LayerEntity | null = null;
  private originalLayer: LayerEntity | null = null;

  private fromColor: number | null = null;
  private toColor: number | null = null;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }
  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    if (mouseButton !== 0 && mouseButton !== 2) return;

    const pos = getPixelPositions(x, y, pixelSize);

    this.downX = pos.x;
    this.downY = pos.y;

    //add a baseline entry if none exists
    const layers = this.deps.getLayers?.();
    if (!layers) return;

    if (layers.length === 0) {
      this.deps.onToast?.('You need to have a layer selected to use the Gradient Tool', 'warning');
      return;
    }

    if (layers.length > 1) {
      this.deps.onToast?.('You can only have 1 layer selected to use the Gradient Tool', 'warning');
      return;
    }

    this.originalLayer = layers[0];

    //get color and opacity
    const primaryColor = this.deps.getPrimaryColor?.() ?? config.defaultColor;
    const secondaryColor = this.deps.getSecondaryColor?.() ?? config.defaultColor;

    const properties: IProperty[] = this.deps.getProperties?.('gradientTool') ?? [];
    const opacityProperty = getProperty<OpacityProperty>(properties, PropertyType.Opacity);
    const singleColorProperty = getProperty<SingleColor>(properties, PropertyType.SingleColor);

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

    this.fromColor = mouseButton === 0 ? primaryColorWithOpacity : secondaryColorWithOpacity;
    this.toColor = singleColorProperty?.value
      ? 0
      : mouseButton === 0
      ? secondaryColorWithOpacity
      : primaryColorWithOpacity;
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (
      this.downX === null ||
      this.downY === null ||
      this.toColor === null ||
      this.fromColor === null
    ) {
      return;
    }

    const originalLayer = this.originalLayer;
    if (!originalLayer) return;

    const properties: IProperty[] = this.deps.getProperties?.('gradientTool') ?? [];
    const gradientTypeProperty = getProperty<GradientTypeProperty>(
      properties,
      PropertyType.GradientType,
    );
    const ditheringProperty = getProperty<DitheringProperty>(properties, PropertyType.Dithering);

    const pos = getPixelPositions(x, y, pixelSize);

    const setLayers = this.deps.setLayers;
    if (setLayers == undefined) return;

    const getCanvasRect = this.deps.getCanvasRect;
    if (getCanvasRect === undefined) return;
    const canvasRect: Rectangle = getCanvasRect();

    const selectedLayer = this.deps.getSelectionLayer?.();

    const dp: Uint32Array = new Uint32Array(ditheringProperty?.value.pattern.flat() ?? []);
    const gradientLayer: Layer = drawGradient(
      canvasRect,
      this.downX,
      this.downY,
      pos.x,
      pos.y,
      this.toColor,
      this.fromColor,
      gradientTypeProperty?.value ?? '',
      dp,
      ditheringProperty?.value.size ?? 0,
      selectedLayer,
    );

    const dirtyRectangle = selectedLayer ? selectedLayer.rect : canvasRect;

    setLayers((prevLayers: LayerEntity[]) => {
      const newLayer = stampToCanvasLayer(gradientLayer, originalLayer.layer);
      const layer = {
        ...prevLayers[0],
        layer: newLayer,
      };

      this.layerLastDrawn = layer;

      return { layers: [layer], dirtyRect: dirtyRectangle };
    });
  }
  onUp(x: number, y: number, pixelSize: number, mouseButton: number): void {
    this.downX = null;
    this.downY = null;

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
