import { rectangleFromCenteredRect } from '@/helpers/transform';
import { CenteredRectangle, LayerEntity, Rectangle } from '../Layer';
import { AnyProperty, getProperty, PropertyType, TransformProperty } from './Properties';
import { IToolDeps, ITool } from './Tools';
import {
  combineRectangles,
  createLayer,
  replacePixels,
  stampToCanvasLayer,
} from '@/util/LayerUtil';

export class TransformTool implements ITool {
  name: string = 'transform';
  deps: IToolDeps = {};

  originalLayers: LayerEntity[] | undefined = undefined;
  originalLayersWithoutRect: LayerEntity[] | undefined;
  originalRect: Rectangle | undefined = undefined;
  transformingLayers: LayerEntity[] | undefined = undefined;
  lastTransRect: CenteredRectangle | undefined = undefined;

  constructor(deps: IToolDeps) {
    this.deps = deps;
  }

  onUpdate(property: AnyProperty): void {
    console.log('hej1');

    const transformProperty = getProperty<TransformProperty>([property], PropertyType.Transform);
    if (!transformProperty?.value) return;
    const selectionLayer = this.deps.getSelectionLayer?.();
    const setLayers = this.deps.setLayers;
    if (!setLayers) return;
    const layers = this.deps.getLayers?.();
    if (!layers) return;
    const transRect = transformProperty.value;

    const lastTransRect = this.lastTransRect;

    this.lastTransRect = transRect;

    console.log('ol', this.originalLayers);
    console.log('tl', this.transformingLayers);
    console.log('ltr', this.lastTransRect);
    console.log('olwor', this.originalLayersWithoutRect);

    if (
      !this.originalLayers ||
      /*!this.transformingLayers ||*/
      !lastTransRect ||
      !this.originalLayersWithoutRect
    ) {
      this.init(layers, transRect);
    } else {
      console.log(this.originalLayersWithoutRect);

      const dirtyRect = combineRectangles(
        rectangleFromCenteredRect(transRect),
        rectangleFromCenteredRect(lastTransRect),
      );

      setLayers((prevLayers: LayerEntity[]) => {
        return {
          layers: prevLayers,
          dirtyRect,
        };
      });
    }
  }

  onCommit?(): void {
    console.log('hej');
  }
  onCancel?(): void {
    const setLayers = this.deps.setLayers;
    if (!setLayers || !this.lastTransRect || !this.originalRect || !this.originalLayers) {
      return;
      throw new Error('unable to set layers back to normal');
    }

    if (this.originalRect === null) {
      return;
    }

    const originalLayers = this.originalLayers;

    const cr = this.lastTransRect;

    const dirtyRect = combineRectangles(rectangleFromCenteredRect(cr), this.originalRect);

    setLayers((prevLayers: LayerEntity[]) => {
      return { layers: originalLayers, dirtyRect };
    });
  }

  private init(layers: LayerEntity[], transRect: CenteredRectangle): void {
    this.originalLayers = layers;
    this.originalRect = rectangleFromCenteredRect(transRect);

    const emptyLayer = createLayer(this.originalRect);

    this.originalLayersWithoutRect = [];

    this.originalLayers.map((layer) => {
      const croppedLayer = { ...layer };
      replacePixels(croppedLayer.layer, emptyLayer);
      this.originalLayersWithoutRect?.push(croppedLayer);
    });
  }
}
