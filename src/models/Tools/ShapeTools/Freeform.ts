import { Cordinate, Layer, LayerEntity, Rectangle } from '@/models/Layer';
import { ITool, IToolDeps } from '../Tools';
import {
  FillProperty,
  getProperty,
  OpacityProperty,
  PropertyType,
  StrokeWidthProperty,
} from '../../properties/Properties';
import {
  blendPixels,
  clipLayerToRect,
  clipLayerToSelection,
  createLayer,
  drawLine,
  fillPolygon,
  getPixelPositions,
  getSmallestRectangleFromPoints,
  replacePixels,
  stampToCanvasLayer,
} from '@/util/LayerUtil';
import { setAlpha } from '@/helpers/color';

export class FreeformTool implements ITool {
  deps: IToolDeps;
  name: string = 'freeformTool';

  private strokeColor: number = 0;
  private fillColor: number = 0;
  private lastX: number | null = null;
  private lastY: number | null = null;

  private layerLastDrawn: LayerEntity | null = null;
  private originalLayer: LayerEntity | null = null;

  private strokeNr: number = 1;
  private strokeMatrix: Layer = createLayer({ x: 0, y: 0, width: 0, height: 0 }, 0);

  private points: Cordinate[] = [];

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }
  onDown(x: number, y: number, pixelSize: number, mouseButton: number): void {
    if (mouseButton !== 0 && mouseButton !== 2) return;

    const properties = this.deps.getProperties?.('freeformTool');
    if (!properties) throw new Error('unable to fetch properties');

    const size = getProperty<StrokeWidthProperty>(properties, PropertyType.StrokeWidth);
    const opacity = getProperty<OpacityProperty>(properties, PropertyType.Opacity);

    if (!size || !opacity) throw new Error('unable to fetch size or opacity property');

    const pColor = this.deps.getPrimaryColor?.();
    const sColor = this.deps.getSecondaryColor?.();

    if (!pColor || !sColor) throw new Error('unable to fetch primary or secondary color');

    this.strokeColor =
      mouseButton === 0 ? setAlpha(pColor, opacity.value) : setAlpha(sColor, opacity.value);

    this.fillColor =
      mouseButton === 0 ? setAlpha(sColor, opacity.value) : setAlpha(pColor, opacity.value);

    if (!this.originalLayer) {
      const getLayers = this.deps.getLayers?.();
      if (!getLayers) throw new Error('unable to fetch getLayer');

      if (getLayers.length === 0) {
        this.deps.onToast?.(
          'You need to have a layer selected to use the Freeform Tool',
          'warning',
        );
        return;
      }

      if (getLayers.length > 1) {
        this.deps.onToast?.(
          'You can only have 1 layer selected to use the Freeform Tool',
          'warning',
        );
        return;
      }

      this.originalLayer = getLayers[0];
    }

    const pos = getPixelPositions(x, y, pixelSize);

    if (this.points.length > 0) {
      const dx = Math.abs(this.points[0].x - pos.x);
      const dy = Math.abs(this.points[0].y - pos.y);

      if (dx <= size.value && dy <= size.value) {
        this.commitShape();
        return;
      }
    }

    const canvasRect = this.deps.getCanvasRect?.();
    if (!canvasRect) throw new Error('unable to fetch canvasRect');

    this.updateStrokeMatrixIfChanged(canvasRect);

    this.points.push(pos);
  }
  onMove(x: number, y: number, pixelSize: number): void {
    if (this.points.length < 1) return;

    this.strokeNr++;
    //define points with the current mouse position
    const pos = getPixelPositions(x, y, pixelSize);
    const points = [...this.points, pos];

    if (this.lastX === pos.x && this.lastY === pos.y) return;

    const lastX = this.lastX ?? pos.x;
    const lastY = this.lastY ?? pos.y;

    this.lastX = pos.x;
    this.lastY = pos.y;

    const setLayers = this.deps.setLayers;
    if (!setLayers) throw new Error('unable to fetch setLayer');

    const properties = this.deps.getProperties?.('freeformTool');
    if (!properties) throw new Error('unable to fetch properties');

    const strokeWidth = getProperty<StrokeWidthProperty>(properties, PropertyType.StrokeWidth);
    if (!strokeWidth) throw new Error('unable to fetch stroke width');

    const fill = getProperty<FillProperty>(properties, PropertyType.FillProperty);
    if (!fill) throw new Error('unable to fetch fill property');

    const xPoints = points.map((p) => p.x);
    const yPoints = points.map((p) => p.y);

    const buffer = Math.floor(strokeWidth.value / 2);

    const layerRect: Rectangle = getSmallestRectangleFromPoints(xPoints, yPoints, buffer);
    const outLayer = createLayer(layerRect);

    if (fill.value && points.length > 2) {
      fillPolygon(points, outLayer, this.fillColor);
    }

    let first: boolean = true;
    for (let i = 1; i < points.length; i++) {
      const from = points[i - 1];
      const to = points[i];

      const lineLayer = drawLine(
        from.x,
        from.y,
        to.x,
        to.y,
        strokeWidth.value,
        this.strokeColor,
        first,
        this.strokeMatrix,
        this.strokeNr,
      );

      blendPixels(outLayer, lineLayer);

      first = false;
    }

    const selectedLayer = this.deps.getSelectionLayer?.();

    const selectionFilteredLayer: Layer = selectedLayer
      ? clipLayerToSelection(outLayer, selectedLayer)
      : outLayer;

    const dirtyRect = getSmallestRectangleFromPoints(
      [...xPoints, lastX],
      [...yPoints, lastY],
      buffer,
    );

    const originalLayer = this.originalLayer;
    if (!originalLayer) throw new Error('original Layer never set');

    setLayers((prevLayers: LayerEntity[]) => {
      const newLayer = stampToCanvasLayer(selectionFilteredLayer, originalLayer.layer);
      const layer = {
        ...prevLayers[0],
        layer: newLayer,
      };

      this.layerLastDrawn = layer;

      return { layers: [layer], dirtyRect };
    });
  }
  onCommit(): void {
    this.commitShape();
  }
  onCancel(): void {
    this.resetValues(true);
  }

  private resetValues(backToOriginal: boolean) {
    if (backToOriginal) {
      const setLayer = this.deps.setLayers;
      if (!setLayer) throw new Error('unable to fetch setLayer');

      const originalLayer = this.originalLayer;
      const dirtyRect = this.layerLastDrawn?.layer.rect;

      if (!originalLayer || !dirtyRect) return;

      setLayer((prevLayers: LayerEntity[]) => {
        const layer = {
          ...prevLayers[0],
          layer: originalLayer.layer,
        };

        return { layers: [layer], dirtyRect };
      });
    } else {
      const checkPoint = this.deps.checkPoint;
      if (!this.layerLastDrawn || !checkPoint || !this.originalLayer) return;

      checkPoint({
        up: [this.originalLayer],
        down: [this.layerLastDrawn],
      });
      this.layerLastDrawn = null;
      this.originalLayer = null;
    }

    this.points = [];
    this.strokeColor = 0;
    this.fillColor = 0;
    this.lastX = null;
    this.lastY = null;

    this.layerLastDrawn = null;
    this.originalLayer = null;
  }

  private commitShape() {
    if (this.points.length < 1) return;

    this.strokeNr++;

    const points = [...this.points, this.points[0]];

    const lastX = this.lastX ?? this.points[0].x;
    const lastY = this.lastX ?? this.points[0].y;

    const setLayers = this.deps.setLayers;
    if (!setLayers) throw new Error('unable to fetch setLayer');

    const properties = this.deps.getProperties?.('freeformTool');
    if (!properties) throw new Error('unable to fetch properties');

    const strokeWidth = getProperty<StrokeWidthProperty>(properties, PropertyType.StrokeWidth);
    if (!strokeWidth) throw new Error('unable to fetch stroke width');

    const xPoints = points.map((p) => p.x);
    const yPoints = points.map((p) => p.y);

    const buffer = Math.floor(strokeWidth.value / 2);

    const layerRect: Rectangle = getSmallestRectangleFromPoints(xPoints, yPoints, buffer);
    const outLayer = createLayer(layerRect);

    const fill = getProperty<FillProperty>(properties, PropertyType.FillProperty);
    if (!fill) throw new Error('unable to fetch fill property');

    if (fill.value) {
      fillPolygon(points, outLayer, this.fillColor);
    }

    let first: boolean = true;
    for (let i = 1; i < points.length; i++) {
      const from = points[i - 1];
      const to = points[i];

      const lineLayer = drawLine(
        from.x,
        from.y,
        to.x,
        to.y,
        strokeWidth.value,
        this.strokeColor,
        first,
        this.strokeMatrix,
        this.strokeNr,
      );

      blendPixels(outLayer, lineLayer);

      first = false;
    }

    const dirtyRect = getSmallestRectangleFromPoints(
      [...xPoints, lastX],
      [...yPoints, lastY],
      buffer,
    );

    const originalLayer = this.originalLayer;
    if (!originalLayer) throw new Error('original Layer never set');

    const canvasRect = this.deps.getCanvasRect?.();
    if (!canvasRect) throw new Error('unable to fetch canvasRect');

    const selectedLayer = this.deps.getSelectionLayer?.();

    const selectionFilteredLayer: Layer = selectedLayer
      ? clipLayerToSelection(outLayer, selectedLayer)
      : outLayer;

    const filterCanvas: Layer = clipLayerToRect(selectionFilteredLayer, canvasRect);

    setLayers((prevLayers: LayerEntity[]) => {
      const newLayer = stampToCanvasLayer(filterCanvas, originalLayer.layer);
      const layer = {
        ...prevLayers[0],
        layer: newLayer,
      };

      this.layerLastDrawn = layer;

      return { layers: [layer], dirtyRect };
    });

    this.resetValues(false);
  }

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
