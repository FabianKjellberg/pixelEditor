import {
  clipLayerToSelection,
  combineRectangles,
  createLayer,
  getPixelPositions,
  isRectanglesIntersecting,
  outOfBoundFinder,
  reduceLayerToContent,
  stampToCanvasLayer,
} from '@/util/LayerUtil';
import { ITool, IToolDeps } from './Tools';
import { Cordinate, Layer, LayerEntity, Rectangle, SelectionLayer } from '../Layer';
import { getPixelIndex, rgbaToInt } from '@/helpers/color';

export class MoveTool implements ITool {
  name: string = 'moveTool';
  deps: IToolDeps = {};
  private moving: boolean = false;
  private lastX: number | null = null;
  private lastY: number | null = null;

  // Selection-based movement state
  private selectionActive: boolean = false;
  private floatingLayer: Layer | null = null; // Pixels being moved (from selection)
  private baseLayer: Layer | null = null; // Original layer with selection pixels removed
  private movingSelectionLayer: SelectionLayer | null = null; // Selection layer being moved

  private layerLastMoved: LayerEntity | null = null;

  constructor(private toolDeps: IToolDeps) {
    this.deps = toolDeps;
  }

  onDown(x: number, y: number, pixelSize: number): void {
    const layer = this.toolDeps.getLayer?.() || undefined;
    if (layer == undefined) return;

    const hasBaseLine = this.deps.hasBaseline?.(layer.id);

    if (hasBaseLine === false) {
      this.deps.checkPoint?.(layer);
    }

    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);
    const selectionLayer = this.toolDeps.getSelectionLayer?.();

    // Check if there's an active selection
    if (selectionLayer && selectionLayer.rect.width > 0 && selectionLayer.rect.height > 0) {
      // Check if click is within selection bounds
      const clickInSelection = this.isPointInSelection(pixelPos.x, pixelPos.y, selectionLayer);

      if (clickInSelection) {
        // Extract the selected pixels into a floating layer
        this.floatingLayer = clipLayerToSelection(layer.layer, selectionLayer);

        // Create base layer with selection pixels removed (cleared to transparent)
        this.baseLayer = this.clearSelectionFromLayer(layer.layer, selectionLayer);

        // Store a copy of the selection layer to move along with the pixels
        this.movingSelectionLayer = {
          pixels: selectionLayer.pixels,
          rect: { ...selectionLayer.rect },
        };

        this.selectionActive = true;
        this.lastX = pixelPos.x;
        this.lastY = pixelPos.y;
        this.moving = true;
        return;
      }
    }

    // No selection or click outside selection: regular layer move
    const localPos = { x: pixelPos.x - layer.layer.rect.x, y: pixelPos.y - layer.layer.rect.y };

    const boundsItem = outOfBoundFinder(
      { x: localPos.x, y: localPos.y, width: 1, height: 1 },
      layer.layer.rect.width,
      layer.layer.rect.height,
    );

    // Early return if you click out of bounds
    if (boundsItem.outOfBounds) return;

    this.selectionActive = false;
    this.lastX = localPos.x;
    this.lastY = localPos.y;
    this.moving = true;
  }

  onMove(x: number, y: number, pixelSize: number): void {
    // Early return if not moving
    if (!this.moving) return;
    if (this.lastX === null || this.lastY === null) return;

    const pixelPos: Cordinate = getPixelPositions(x, y, pixelSize);

    if (this.selectionActive) {
      this.moveSelection(pixelPos.x, pixelPos.y);
    } else {
      this.moveWholeLayer(pixelPos.x, pixelPos.y);
    }
  }

  onUp(_x: number, _y: number): void {
    if (this.selectionActive && this.floatingLayer && this.baseLayer) {
      const combinedLayer = stampToCanvasLayer(this.floatingLayer, this.baseLayer);
      const reducedLayer = reduceLayerToContent(combinedLayer);

      const dirtyRect = combineRectangles(
        combineRectangles(this.baseLayer.rect, this.floatingLayer.rect),
        reducedLayer.rect,
      );

      const current = this.toolDeps.getLayer?.();
      if (current) {
        const finalLayerEntity: LayerEntity = {
          id: current.id,
          name: current.name,
          layer: reducedLayer,
        };

        this.layerLastMoved = finalLayerEntity;

        this.toolDeps.setLayer?.(() => ({
          layer: finalLayerEntity,
          dirtyRect,
        }));
      }
    }

    if (this.layerLastMoved) this.deps.checkPoint?.(this.layerLastMoved);

    // reset
    this.moving = false;
    this.lastX = null;
    this.lastY = null;
    this.selectionActive = false;
    this.floatingLayer = null;
    this.baseLayer = null;
    this.movingSelectionLayer = null;
    this.layerLastMoved = null;
  }

  /**
   * Move only the selected pixels (floating layer)
   */
  private moveSelection(x: number, y: number): void {
    if (!this.floatingLayer || !this.baseLayer || !this.movingSelectionLayer) return;
    if (this.lastX === null || this.lastY === null) return;

    // Early return if hasn't moved
    if (this.lastX === x && this.lastY === y) return;

    const deltaX = x - this.lastX;
    const deltaY = y - this.lastY;

    // Update last position
    this.lastX = x;
    this.lastY = y;

    // Store original floating rect for dirty calculation
    const originalFloatingRect = { ...this.floatingLayer.rect };

    // Move the floating layer
    this.floatingLayer.rect.x += deltaX;
    this.floatingLayer.rect.y += deltaY;

    // Move the selection layer along with the pixels
    this.movingSelectionLayer.rect.x += deltaX;
    this.movingSelectionLayer.rect.y += deltaY;

    // Update the selection layer in context
    this.toolDeps.setSelectionLayer?.({
      pixels: this.movingSelectionLayer.pixels,
      rect: { ...this.movingSelectionLayer.rect },
    });

    // Calculate dirty rectangle (covers old and new positions + base)
    const floatingCombined = combineRectangles(originalFloatingRect, this.floatingLayer.rect);
    const dirtyRect = combineRectangles(floatingCombined, this.baseLayer.rect);

    // Create a temporary combined layer for display
    const displayLayer = stampToCanvasLayer(this.floatingLayer, this.baseLayer);

    this.toolDeps.setLayer?.((prevLayer: LayerEntity) => {
      const layerEntity: LayerEntity = {
        id: prevLayer.id,
        name: prevLayer.name,
        layer: displayLayer,
      };

      this.layerLastMoved = layerEntity;

      return {
        layer: layerEntity,
        dirtyRect,
      };
    });
  }

  /**
   * Move the whole layer (original behavior when no selection)
   */
  private moveWholeLayer(x: number, y: number): void {
    const layerEntity = this.toolDeps.getLayer?.();
    if (!layerEntity) return;
    if (this.lastX === null || this.lastY === null) return;

    const localPos = { x: x - layerEntity.layer.rect.x, y: y - layerEntity.layer.rect.y };
    if (this.lastX === localPos.x && this.lastY === localPos.y) return;

    const originalRect = { ...layerEntity.layer.rect };

    const nextRect: Rectangle = {
      ...layerEntity.layer.rect,
      x: layerEntity.layer.rect.x + (localPos.x - this.lastX),
      y: layerEntity.layer.rect.y + (localPos.y - this.lastY),
    };

    const nextLayer: Layer = {
      ...layerEntity.layer,
      rect: nextRect,
    };

    const nextEntity: LayerEntity = {
      ...layerEntity,
      layer: nextLayer,
    };

    const dirtyRect = combineRectangles(originalRect, nextRect);

    this.layerLastMoved = nextEntity;

    this.toolDeps.setLayer?.(() => ({
      layer: nextEntity,
      dirtyRect,
    }));
  }

  /**
   * Check if a point (in canvas coordinates) is within the selection
   */
  private isPointInSelection(x: number, y: number, selectionLayer: SelectionLayer): boolean {
    // Convert to selection-local coordinates
    const localX = x - selectionLayer.rect.x;
    const localY = y - selectionLayer.rect.y;

    // Check bounds
    if (
      localX < 0 ||
      localY < 0 ||
      localX >= selectionLayer.rect.width ||
      localY >= selectionLayer.rect.height
    ) {
      return false;
    }

    // Check if the pixel is selected (non-zero)
    const index = getPixelIndex(localY, selectionLayer.rect.width, localX);
    return selectionLayer.pixels[index] !== 0;
  }

  /**
   * Create a copy of the layer with selection pixels cleared to transparent
   */
  private clearSelectionFromLayer(layer: Layer, selectionLayer: SelectionLayer): Layer {
    // Check if there's any intersection
    if (!isRectanglesIntersecting(layer.rect, selectionLayer.rect)) {
      // No intersection, return a copy of the original layer
      return {
        ...layer,
        pixels: layer.pixels.slice(),
      };
    }

    // Create a copy of the layer
    const newLayer: Layer = {
      ...layer,
      rect: { ...layer.rect },
      pixels: layer.pixels.slice(),
    };

    const TRANSPARENT = rgbaToInt(0, 0, 0, 0);

    // Clear pixels that are within the selection
    for (let y = 0; y < selectionLayer.rect.height; y++) {
      for (let x = 0; x < selectionLayer.rect.width; x++) {
        // Check if this pixel is selected
        const selectionIndex = getPixelIndex(y, selectionLayer.rect.width, x);
        if (selectionLayer.pixels[selectionIndex] === 0) continue;

        // Convert to layer-local coordinates
        const globalX = selectionLayer.rect.x + x;
        const globalY = selectionLayer.rect.y + y;
        const layerLocalX = globalX - layer.rect.x;
        const layerLocalY = globalY - layer.rect.y;

        // Check if within layer bounds
        if (
          layerLocalX < 0 ||
          layerLocalY < 0 ||
          layerLocalX >= layer.rect.width ||
          layerLocalY >= layer.rect.height
        ) {
          continue;
        }

        // Clear the pixel
        const layerIndex = getPixelIndex(layerLocalY, layer.rect.width, layerLocalX);
        newLayer.pixels[layerIndex] = TRANSPARENT;
      }
    }

    return newLayer;
  }
}
