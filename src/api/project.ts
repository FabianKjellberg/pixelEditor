import { LayerEntity, LayerTreeItem } from '@/models/Layer';
import { apiClient } from './client';
import {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectWithLayers,
  ProjectPreview,
  UpdateCanvasDimensionResponseData,
  DeleteItemsResponseData,
} from '@/models/apiModels/projectModels';
import { BlobUrl, uploadBlob } from '@/util/BlobUtil';
import { Order } from '@/context/LayerSelectorContext';
import { MetaChangeValue } from '@/context/MetaDataAutoSaveContext';

export async function saveOrder(order: Order[], projectId: string) {
  const response = await apiClient('PUT', '/project/order', { order: order, projectId: projectId });

  if (!response.ok) throw new Error('failed to save order');
}

export async function createProject(
  id: string,
  name: string,
  width: number,
  height: number,
  layers: LayerTreeItem[],
): Promise<CreateProjectResponse | null> {
  console.log(name);

  const response = await apiClient('POST', '/project/create', {
    project: {
      id,
      name,
      width,
      height,
    },
    layers: layers.map((layer, index) =>
      layer.type === 'layer'
        ? {
            type: 'layer',
            id: layer.id,
            name: layer.name,
            width: layer.layer.rect.width,
            height: layer.layer.rect.height,
            x: layer.layer.rect.x,
            y: layer.layer.rect.y,
            zIndex: index,
            length: layer.layer.pixels.byteLength,
            visible: layer.visible,
            opacity: layer.opacity,
          }
        : layer.type === 'group-start'
        ? {
            type: 'group-start',
            id: layer.id,
            name: layer.name,
            collapsed: layer.collapsed,
            zIndex: index,
          }
        : layer.type === 'group-end'
        ? { type: 'group-end', id: layer.id, zIndex: index }
        : { type: 'unknown' },
    ),
  } as CreateProjectRequest);

  if (!response.ok) return null;

  const data = (await response.json()) as CreateProjectResponse;

  return data;
}

export async function getMyProjectPreviews(): Promise<ProjectPreview[] | null> {
  const response = await apiClient('GET', '/project/previews');

  if (!response.ok) return null;

  const data = (await response.json()) as ProjectPreview[];

  return data;
}

export async function getProject(projectId: string): Promise<ProjectWithLayers | null> {
  const response = await apiClient('GET', `/project/${projectId}`);

  if (!response.ok) return null;

  const data = (await response.json()) as ProjectWithLayers;

  return data;
}

export async function updateCanvasDimension(
  width: number,
  height: number,
  projectId: string,
  requestPreview: () => Promise<Blob>,
): Promise<void> {
  try {
    const response = await apiClient('PUT', '/project/size', { width, height, projectId });

    if (!response.ok) {
      console.error('response not good, update canvas dimensions');
      return;
    }

    const responseData: UpdateCanvasDimensionResponseData = await response.json();

    const previewBlobUrl: BlobUrl = {
      url: responseData.previewUrl,
      headers: { 'Content-Type': 'image/webp' },
      expiration: '180',
    };
    const previewBlob = await requestPreview();
    const uploadOk = await uploadBlob(previewBlobUrl, previewBlob);

    if (!uploadOk) console.error('failed uploading layer or preview');
  } catch (error) {
    throw new Error('updating size failed' + error);
  }
}

export async function deleteMultipleItems(
  ids: string[],
  shouldPreview: boolean,
  projectId: string,
  requestPreview: () => Promise<Blob>,
) {
  try {
    const response = await apiClient('DELETE', '/project/delete-items', {
      ids,
      shouldPreview,
      projectId,
    });

    if (response.ok) {
      if (shouldPreview) {
        const responseData: DeleteItemsResponseData = await response.json();

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
    throw new Error('failed to delete multiple items. error: ' + error);
  }
}

export async function saveMetaData(changes: MetaChangeValue[], projectId: string) {
  try {
    const response = await apiClient('PUT', '/project/update-metadata', { changes, projectId });

    if (!response.ok) {
      console.error('unable to save metadata');
    }
  } catch (error) {
    throw new Error('failed saving metadata: ' + error);
  }
}
