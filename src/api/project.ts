import { LayerEntity } from '@/models/Layer';
import { apiClient } from './client';
import {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectWithLayers,
  ProjectPreview,
  UpdateCanvasDimensionResponseData,
} from '@/models/apiModels/projectModels';
import { BlobUrl, uploadBlob } from '@/util/BlobUtil';

export async function createProject(
  id: string,
  name: string,
  width: number,
  height: number,
  layer: LayerEntity[],
): Promise<CreateProjectResponse | null> {
  console.log(name);

  const response = await apiClient('POST', '/project/create', {
    project: {
      id,
      name,
      width,
      height,
    },
    layers: layer.map((layer, index) => ({
      id: layer.id,
      name: layer.name,
      width: layer.layer.rect.width,
      height: layer.layer.rect.height,
      x: layer.layer.rect.x,
      y: layer.layer.rect.y,
      zIndex: index,
      length: layer.layer.pixels.byteLength,
    })),
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
