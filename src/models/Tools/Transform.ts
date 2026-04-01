import { rectangleFromCenteredRect } from '@/helpers/transform';
import { CenteredRectangle, LayerEntity, Rectangle } from '../Layer';
import { AnyProperty, getProperty, PropertyType } from '../properties/Properties';
import { IToolDeps, ITool } from './Tools';
import {
  combineRectangles,
  createLayer,
  replacePixels,
  stampToCanvasLayer,
  tryReduceLayerSize,
} from '@/util/LayerUtil';
import {
  CropLayer,
  cropLayer,
  invertHorizontally,
  invertVertically,
  transformLayer,
} from '@/util/TransformUtil';
import { TransformInterpolation, TransformProperty } from '../properties/transformProperties';

export class TransformTool implements ITool {
  name: string = 'transform';
  deps: IToolDeps = {};

  //to set back onCancel
  originalLayers: LayerEntity[] | undefined = undefined;

  //layers to stamp the adjusted rectangle on to
  splitOriginal: CropLayer[] | undefined = undefined;

  // the original rectangle of the transformation
  originalRect: Rectangle | undefined = undefined;

  lastRect: Rectangle | undefined = undefined;

  lastTransformRect: CenteredRectangle | undefined;

  firstRound: boolean = true;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onUpdate(property: AnyProperty): void {
    const transformProperty = getProperty<TransformProperty>([property], PropertyType.Transform);
    if (!transformProperty?.value) return;

    const transformRect = transformProperty.value;

    // set up tool tool with values to change
    if (this.firstRound) {
      this.firstRound = false;
      this.init(transformRect);
    }
    //take existing cropped layers and add to original layers into the current rectangle
    else {
      this.updateLayers(transformRect);
    }
  }

  onCommit?(): void {
    const setLayers = this.deps.setLayers;
    const checkPoint = this.deps.checkPoint;
    const up = this.originalLayers;

    if (!setLayers || !checkPoint || !up) return;

    let down: LayerEntity[] = [];

    setLayers((prevLayers) => {
      const reducedLayerBounds = prevLayers.map((layer) => {
        return {
          ...layer,
          layer: tryReduceLayerSize({ top: 1, bottom: 1, left: 1, right: 1 }, layer.layer).layer,
        } as LayerEntity;
      });

      down = reducedLayerBounds;

      return {
        dirtyRect: { x: 0, y: 0, width: 1, height: 1 },
        layers: reducedLayerBounds,
      };
    });

    checkPoint({ down, up });
    this.reset();
  }
  onCancel?(): void {
    const setLayers = this.deps.setLayers;
    if (!setLayers || !this.originalRect || !this.originalLayers) {
      return;
    }

    if (this.originalRect === null) {
      return;
    }

    const originalLayers = this.originalLayers;

    const cr = this.lastRect;
    if (!cr) return;

    const dirtyRect = combineRectangles(cr, this.originalRect);

    setLayers((prevLayers: LayerEntity[]) => {
      return { layers: originalLayers, dirtyRect };
    });

    this.reset();
  }

  onAction(action: string): void {
    if (!this.lastTransformRect || !this.splitOriginal || !this.originalRect) return;

    const originalRect = this.originalRect;

    switch (action) {
      case 'horizontal':
        this.splitOriginal.map((original) =>
          invertHorizontally(original.croppedLayer, originalRect),
        );
        break;
      case 'vertical':
        this.splitOriginal.map((original) => {
          invertVertically(original.croppedLayer, originalRect);
        });
        break;

      default:
        break;
    }

    this.updateLayers(this.lastTransformRect);
  }

  private init(originalCRect: CenteredRectangle): void {
    //save original rect
    const originalRect = rectangleFromCenteredRect(originalCRect);

    //get original layers and crop
    const originalLayers = this.deps.getLayers?.();
    if (!originalLayers) return;
    const selectionLayer = this.deps.getSelectionLayer?.();

    const splitOriginal: CropLayer[] = [];

    originalLayers.map((layer) => {
      const croppedLayer = cropLayer(layer, originalRect, selectionLayer);

      splitOriginal.push(croppedLayer);
    });

    //save layers for later use
    this.splitOriginal = splitOriginal;
    this.originalRect = originalRect;
    this.originalLayers = originalLayers;
    this.lastRect = originalRect;
  }

  private updateLayers(transformRect: CenteredRectangle) {
    this.lastTransformRect = transformRect;
    const splitOriginal = this.splitOriginal;
    if (!splitOriginal) return;

    const properties = this.deps.getProperties?.('transform') ?? [];
    const rendering = getProperty<TransformInterpolation>(
      properties,
      PropertyType.TransformInterpolation,
    );

    if (!rendering) return;

    const originalRect = this.originalRect;
    if (!originalRect) return;

    const setLayers = this.deps.setLayers;
    if (!setLayers) return;

    const lastRect = this.lastRect;
    if (!lastRect) return;

    const updatedLayers: LayerEntity[] = [];

    splitOriginal.map((split) => {
      const updatedLayer = transformLayer(
        split.restLayer,
        split.croppedLayer,
        transformRect,
        originalRect,
        rendering.value,
      );

      updatedLayers.push(updatedLayer);
    });

    const transRect = rectangleFromCenteredRect(transformRect);

    const incTransRect: Rectangle = {
      x: transRect.x - 1,
      y: transRect.y - 1,
      width: transRect.width + 2,
      height: transRect.height + 2,
    };

    const incLastRect: Rectangle = {
      x: lastRect.x - 1,
      y: lastRect.y - 1,
      width: lastRect.width + 2,
      height: lastRect.height + 2,
    };

    const dirtyRect = combineRectangles(incTransRect, incLastRect);
    this.lastRect = transRect;

    setLayers((prevLayers) => {
      return { dirtyRect, layers: updatedLayers };
    });
  }

  private reset() {
    this.originalLayers = undefined;
    this.splitOriginal = undefined;
    this.originalRect = undefined;
    this.lastRect = undefined;
    this.firstRound = true;
  }
}
