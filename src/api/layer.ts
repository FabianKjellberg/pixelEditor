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

export async function deleteLayer(
  layerId: string,
  shouldPreview: boolean,
  requestPreview: () => Promise<Blob>,
): Promise<void> {
  try {
    const response = await apiClient('DELETE', '/layer/delete', { layerId, shouldPreview });

    if (response.ok) {
      if (shouldPreview) {
        const responseData: DeleteLayerResponseData = await response.json();

        const previewBlobUrl: BlobUrl = {
          url: responseData.previewUrl,
          headers: { 'Content-Type': 'image/webp' },
          expiration: '180',
        };
        const previewBlob = await requestPreview();
        const uploadOk = await uploadBlob(previewBlobUrl, previewBlob);

        if (!uploadOk) console.error('failed uploading layer or preview');
      }
    } else {
      throw new Error('response not ok, deleteLayer');
    }
  } catch (error) {
    throw new Error('failed to delete layer: ' + layerId + '. error: ' + error);
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

export async function renameLayer(layerId: string, name: string) {
  try {
    const response = await apiClient('PUT', '/layer/name', { layerId, name });

    if (!response.ok) {
      throw new Error('response not ok, renameLayer');
    }
  } catch (error) {
    throw new Error('failed to rename layer: ' + layerId + '. error: ' + error);
  }
}

export async function moveLayers(allLayers: LayerEntity[], requestPreview: () => Promise<Blob>) {
  try {
    const body: MoveLayerBody = {
      layerIndexes: allLayers.map((layer, index) => ({
        zIndex: index,
        layerId: layer.id,
      })),
    };

    const response = await apiClient('PUT', '/layer/move', body);

    if (response.ok) {
      const responseData: MoveLayerResponseData = await response.json();

      const previewBlobUrl: BlobUrl = {
        url: responseData.previewUrl,
        headers: { 'Content-Type': 'image/webp' },
        expiration: '180',
      };
      const previewBlob = await requestPreview();
      const uploadOk = await uploadBlob(previewBlobUrl, previewBlob);

      if (!uploadOk) console.error('failed uploading layer or preview');
    } else {
      throw new Error('response not ok, addLayer');
    }
  } catch (error) {
    throw new Error('failed to move layer: ' + '. error: ' + error);
  }
}
