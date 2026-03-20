import {
  clipLayerToSelection,
  combineRectangles,
  getPixelPositions,
  isRectanglesIntersecting,
  reduceLayerToContent,
  stampToCanvasLayer,
} from '@/util/LayerUtil';
import { ITool, IToolDeps } from './Tools';
import { Cordinate, Layer, LayerEntity, Rectangle, SelectionLayer } from '../Layer';
import { getPixelIndex, rgbaToInt } from '@/helpers/color';

export class MoveTool implements ITool {
  name: string = 'moveTool';
  deps: IToolDeps = {};

  private moving = false;
  private lastX: number | null = null;
  private lastY: number | null = null;

  private selectionActive = false;
  private floatingLayers: Layer[] | null = null;
  private baseLayers: Layer[] | null = null;
  private movingSelectionLayer: SelectionLayer | null = null;

  private originalLayers: LayerEntity[] | null = null;
  private lastMovedLayers: LayerEntity[] | null = null;

  constructor(private toolDeps: IToolDeps) {
    this.deps = toolDeps;
  }

  onDown(x: number, y: number, pixelSize: number): void {
    const selected = this.toolDeps.getLayers?.();
    if (!selected || selected.length === 0) {
      this.deps.onToast?.('You need to select at least one layer to use the Move Tool', 'warning');
      return;
    }

    this.originalLayers = selected.map((layer) => ({
      ...layer,
      layer: {
        ...layer.layer,
        rect: { ...layer.layer.rect },
        pixels: layer.layer.pixels.slice(),
      },
    }));
    this.lastMovedLayers = null;

    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);
    const selectionLayer = this.toolDeps.getSelectionLayer?.() ?? null;

    this.selectionActive = false;
    this.floatingLayers = null;
    this.baseLayers = null;
    this.movingSelectionLayer = null;

    if (selectionLayer && selectionLayer.rect.width > 0 && selectionLayer.rect.height > 0) {
      const clickInSelection = this.isPointInSelection(pixelPos.x, pixelPos.y, selectionLayer);

      if (clickInSelection) {
        this.floatingLayers = selected.map((e) => clipLayerToSelection(e.layer, selectionLayer));
        this.baseLayers = selected.map((e) =>
          this.clearSelectionFromLayer(e.layer, selectionLayer),
        );

        this.movingSelectionLayer = {
          pixels: selectionLayer.pixels,
          rect: { ...selectionLayer.rect },
        };

        this.selectionActive = true;
      }
    }

    this.lastX = pixelPos.x;
    this.lastY = pixelPos.y;
    this.moving = true;
  }

  onMove(x: number, y: number, pixelSize: number): void {
    if (!this.moving) return;
    if (this.lastX === null || this.lastY === null) return;

    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);

    if (this.selectionActive) {
      this.moveSelection(pixelPos.x, pixelPos.y);
    } else {
      this.moveWholeLayers(pixelPos.x, pixelPos.y);
    }
  }

  onUp(_x: number, _y: number): void {
    if (this.selectionActive && this.floatingLayers && this.baseLayers) {
      const floatingLayers = this.floatingLayers;
      const baseLayers = this.baseLayers;

      this.toolDeps.setLayers?.((prevSelected) => {
        if (
          prevSelected.length !== floatingLayers.length ||
          prevSelected.length !== baseLayers.length
        ) {
          return { layers: prevSelected, dirtyRect: { x: 0, y: 0, width: 0, height: 0 } };
        }

        let dirtyRectAcc: Rectangle | null = null;

        const nextSelected = prevSelected.map((entity, i) => {
          const floating = floatingLayers[i];
          const base = baseLayers[i];

          const combined = stampToCanvasLayer(floating, base);
          const reduced = reduceLayerToContent(combined);

          const layerDirty = combineRectangles(
            combineRectangles(base.rect, floating.rect),
            reduced.rect,
          );

          dirtyRectAcc = dirtyRectAcc ? combineRectangles(dirtyRectAcc, layerDirty) : layerDirty;

          return {
            ...entity,
            layer: reduced,
          };
        });

        this.lastMovedLayers = nextSelected.map((layer) => ({
          ...layer,
          layer: {
            ...layer.layer,
            rect: { ...layer.layer.rect },
            pixels: layer.layer.pixels.slice(),
          },
        }));

        return {
          layers: nextSelected,
          dirtyRect: dirtyRectAcc ?? { x: 0, y: 0, width: 0, height: 0 },
        };
      });
    }

    const checkPoint = this.toolDeps.checkPoint;
    if (checkPoint && this.originalLayers && this.lastMovedLayers) {
      checkPoint({
        up: this.originalLayers,
        down: this.lastMovedLayers,
      });
    }

    this.moving = false;
    this.lastX = null;
    this.lastY = null;

    this.selectionActive = false;
    this.floatingLayers = null;
    this.baseLayers = null;
    this.movingSelectionLayer = null;
    this.originalLayers = null;
    this.lastMovedLayers = null;
  }

  private moveSelection(x: number, y: number): void {
    if (!this.floatingLayers || !this.baseLayers || !this.movingSelectionLayer) return;
    if (this.lastX === null || this.lastY === null) return;

    if (this.lastX === x && this.lastY === y) return;

    const deltaX = x - this.lastX;
    const deltaY = y - this.lastY;

    this.lastX = x;
    this.lastY = y;

    const originalFloatingRects = this.floatingLayers.map((l) => ({ ...l.rect }));
    for (const fl of this.floatingLayers) {
      fl.rect.x += deltaX;
      fl.rect.y += deltaY;
    }
    this.movingSelectionLayer.rect.x += deltaX;
    this.movingSelectionLayer.rect.y += deltaY;

    this.toolDeps.setSelectionLayer?.({
      pixels: this.movingSelectionLayer.pixels,
      rect: { ...this.movingSelectionLayer.rect },
    });

    const floatingLayers = this.floatingLayers;
    const baseLayers = this.baseLayers;

    this.toolDeps.setLayers?.((prevSelected) => {
      if (
        prevSelected.length !== floatingLayers.length ||
        prevSelected.length !== baseLayers.length
      ) {
        return { layers: prevSelected, dirtyRect: { x: 0, y: 0, width: 0, height: 0 } };
      }

      let dirtyRectAcc: Rectangle | null = null;

      const nextSelected = prevSelected.map((entity, i) => {
        const floating = floatingLayers[i];
        const base = baseLayers[i];

        const originalFloating = originalFloatingRects[i];

        const floatingCombined = combineRectangles(originalFloating, floating.rect);
        const dirtyRect = combineRectangles(floatingCombined, base.rect);

        dirtyRectAcc = dirtyRectAcc ? combineRectangles(dirtyRectAcc, dirtyRect) : dirtyRect;

        const displayLayer = stampToCanvasLayer(floating, base);

        return {
          ...entity,
          layer: displayLayer,
        };
      });

      this.lastMovedLayers = nextSelected.map((layer) => ({
        ...layer,
        layer: {
          ...layer.layer,
          rect: { ...layer.layer.rect },
          pixels: layer.layer.pixels.slice(),
        },
      }));

      return {
        layers: nextSelected,
        dirtyRect: dirtyRectAcc ?? { x: 0, y: 0, width: 0, height: 0 },
      };
    });
  }

  private moveWholeLayers(x: number, y: number): void {
    if (this.lastX === null || this.lastY === null) return;

    const deltaX = x - this.lastX;
    const deltaY = y - this.lastY;

    if (deltaX === 0 && deltaY === 0) return;

    this.lastX = x;
    this.lastY = y;

    this.toolDeps.setLayers?.((prevSelected) => {
      let dirtyRectAcc: Rectangle | null = null;

      const nextSelected = prevSelected.map((entity) => {
        const originalRect = { ...entity.layer.rect };

        const nextRect: Rectangle = {
          ...entity.layer.rect,
          x: entity.layer.rect.x + deltaX,
          y: entity.layer.rect.y + deltaY,
        };

        const nextLayer: Layer = {
          ...entity.layer,
          rect: nextRect,
        };

        const nextEntity: LayerEntity = {
          ...entity,
          layer: nextLayer,
        };

        const dirtyRect = combineRectangles(originalRect, nextRect);
        dirtyRectAcc = dirtyRectAcc ? combineRectangles(dirtyRectAcc, dirtyRect) : dirtyRect;

        return nextEntity;
      });

      this.lastMovedLayers = nextSelected.map((layer) => ({
        ...layer,
        layer: {
          ...layer.layer,
          rect: { ...layer.layer.rect },
          pixels: layer.layer.pixels.slice(),
        },
      }));

      return {
        layers: nextSelected,
        dirtyRect: dirtyRectAcc ?? { x: 0, y: 0, width: 0, height: 0 },
      };
    });
  }

  private isPointInSelection(x: number, y: number, selectionLayer: SelectionLayer): boolean {
    const localX = x - selectionLayer.rect.x;
    const localY = y - selectionLayer.rect.y;

    if (
      localX < 0 ||
      localY < 0 ||
      localX >= selectionLayer.rect.width ||
      localY >= selectionLayer.rect.height
    ) {
      return false;
    }

    const index = getPixelIndex(localY, selectionLayer.rect.width, localX);
    return selectionLayer.pixels[index] !== 0;
  }

  private clearSelectionFromLayer(layer: Layer, selectionLayer: SelectionLayer): Layer {
    if (!isRectanglesIntersecting(layer.rect, selectionLayer.rect)) {
      return {
        ...layer,
        pixels: layer.pixels.slice(),
      };
    }

    const newLayer: Layer = {
      ...layer,
      rect: { ...layer.rect },
      pixels: layer.pixels.slice(),
    };

    const TRANSPARENT = rgbaToInt(0, 0, 0, 0);

    for (let y = 0; y < selectionLayer.rect.height; y++) {
      for (let x = 0; x < selectionLayer.rect.width; x++) {
        const selectionIndex = getPixelIndex(y, selectionLayer.rect.width, x);
        if (selectionLayer.pixels[selectionIndex] === 0) continue;

        const globalX = selectionLayer.rect.x + x;
        const globalY = selectionLayer.rect.y + y;
        const layerLocalX = globalX - layer.rect.x;
        const layerLocalY = globalY - layer.rect.y;

        if (
          layerLocalX < 0 ||
          layerLocalY < 0 ||
          layerLocalX >= layer.rect.width ||
          layerLocalY >= layer.rect.height
        ) {
          continue;
        }

        const layerIndex = getPixelIndex(layerLocalY, layer.rect.width, layerLocalX);
        newLayer.pixels[layerIndex] = TRANSPARENT;
      }
    }

    return newLayer;
  }
}
