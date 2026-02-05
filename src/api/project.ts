import { LayerEntity } from '@/models/Layer';
import { apiClient } from './client';
import {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectPreview,
} from '@/models/apiModels/projectModels';

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
