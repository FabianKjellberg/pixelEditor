import { LayerEntity, Rectangle } from '@/models/Layer';
import { BlobUrl, makeBlob, uploadBlob } from '@/util/BlobUtil';
import { apiClient } from './client';
import {
  AddLayerBody,
  AddLayerResponseData,
  DeleteLayerResponseData,
  MoveLayerBody,
  MoveLayerResponseData,
  SaveLayerBody,
  SaveLayerResponseData,
} from '@/models/apiModels/layerModels';

export async function saveLayer(
  layer: LayerEntity,
  requestPreview: () => Promise<Blob>,
): Promise<void> {
  try {
    const layerRect: Rectangle = layer.layer.rect;

    const body: SaveLayerBody = {
      layerId: layer.id,
      x: layerRect.x,
      y: layerRect.y,
      width: layerRect.width,
      height: layerRect.height,
      length: layer.layer.pixels.byteLength,
    };

    const response = await apiClient('PUT', '/layer/save', body);

    if (response.ok) {
      const responseData: SaveLayerResponseData = await response.json();

      const previewBlobUrl: BlobUrl = {
        url: responseData.previewUrl,
        headers: { 'Content-Type': 'image/webp' },
        expiration: '180',
      };
      const previewBlob = await requestPreview();

      const layerBlobUrl: BlobUrl = {
        url: responseData.layerUrl,
        headers: { 'Content-Type': 'application/octet-stream' },
        expiration: '180',
      };
      const layerBlob = makeBlob(layer.layer.pixels);

      const uploadPreview = uploadBlob(previewBlobUrl, previewBlob);
      const uploadLayer = uploadBlob(layerBlobUrl, layerBlob);

      const [previewOk, layerOk] = await Promise.all([uploadPreview, uploadLayer]);
      if (!previewOk || !layerOk) console.error('failed uploading layer or preview');
    } else {
      throw new Error('response not ok, savelayer');
    }
  } catch (error) {
    throw new Error('failed to save layer: ' + layer.id + '. error: ' + error);
  }
}

export async function addLayer(
  layer: LayerEntity,
  projectId: string,
  requestPreview: () => Promise<Blob>,
  index?: number,
): Promise<void> {
  try {
    const shouldPreview: boolean = layer.layer.rect.height > 0 && layer.layer.rect.width > 0;
    const length = layer.layer.pixels.byteLength;
    const layerRect = layer.layer.rect;

    const addLayerBody: AddLayerBody = {
      projectId,
      length,
      x: layerRect.x,
      y: layerRect.y,
      width: layerRect.width,
      height: layerRect.height,
      zIndex: index,
      layerId: layer.id,
      name: layer.name,
      opacity: layer.opacity,
      visible: layer.visible,
    };

    const response = await apiClient('POST', '/layer/create', addLayerBody);

    if (response.ok) {
      const previewOk = true;

      const responseData: AddLayerResponseData = await response.json();

      const layerBlobUrl: BlobUrl = {
        url: responseData.layerUrL,
        headers: { 'Content-Type': 'application/octet-stream' },
        expiration: '180',
      };
      const layerBlob = makeBlob(layer.layer.pixels);
      const layerOk = await uploadBlob(layerBlobUrl, layerBlob);

      if (shouldPreview) {
        const previewBlobUrl: BlobUrl = {
          url: responseData.previewUrl,
          headers: { 'Content-Type': 'image/webp' },
          expiration: '180',
        };

        const previewBlob = await requestPreview();

        const previewOk = await uploadBlob(previewBlobUrl, previewBlob);
      }

      if (!previewOk || !layerOk) console.error('failed uploading layer or preview');
    } else {
      throw new Error('response not ok, addLayer');
    }
  } catch (error) {
    throw new Error('failed to add layer: ' + layer.id + '. error: ' + error);
  }
}
