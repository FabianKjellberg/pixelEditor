import { LayerEntity } from '@/models/Layer';
import { apiClient } from './client';

export type UrlHeader = {
  'Content-Type': string;
};

export type LayerUrl = {
  layerId: string;
  key: string;
  uploadUrl: string;
  headers: UrlHeader;
};

export type CreateProjectResponse = {
  projectId: string;
  preview: {
    key: string;
    uploadUrl: string;
    headers: UrlHeader;
  };
  layers: LayerUrl[];
  expiration: string;
};

type ProjectRequestBody = {
  id: string;
  name: string;
  width: number;
  height: number;
};

type LayerRequestBody = {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  length: number;
};

export type CreateProjectRequest = {
  project: ProjectRequestBody;
  layers: LayerRequestBody[];
};

export async function createProject(
  id: string,
  name: string,
  width: number,
  height: number,
  layer: LayerEntity[],
): Promise<CreateProjectResponse | null> {
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
      length: layer.layer.pixels.length,
    })),
  } as CreateProjectRequest);

  if (!response.ok) return null;

  const data = (await response.json()) as CreateProjectResponse;

  console.log(data);

  return data;
}
