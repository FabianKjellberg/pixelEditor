import { LayerGroupEnd, LayerGroupStart } from '../Layer';

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

export type LayerTreeItemRequestBody = LayerRequestBody | GroupStartRequestBody;

export type LayerRequestBody = {
  type: 'layer';
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  length: number;
  visible: boolean;
  opacity: number;
};

export type GroupStartRequestBody = {
  type: 'group-start';
  id: string;
  zIndex: number;
  name: string;
  collapsed: boolean;
};

export type GroupEndRequestBody = {
  type: 'group-end';
  id: string;
  zIndex: string;
};

export type CreateProjectRequest = {
  project: ProjectRequestBody;
  layers: LayerTreeItemRequestBody[];
};

export type GetMyProjectPreviewsResponse = {
  projects: ProjectPreview[];
};

export type ProjectPreview = {
  signedPreviewUrl: string;
  id: string;
  latestActivity: Date | null;
  createdAt: Date;
  name: string;
};

export type FetchedProject = {
  id: string;
  name: string;
  createdAt: Date;
  latestActivity: Date | null;
  width: number;
  height: number;
};

export type FetchedLayer = {
  type: 'layer';
  id: string;
  name: string;
  signedBlobUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
};

export type FetchedGroupStart = {
  type: 'group-start';
  id: string;
  projectId: string;
  name: string;
  collapsed: boolean;
  zIndex: number;
};

export type FetchedGroupEnd = { type: 'group-end'; id: string; projectId: string; zIndex: number };

export type FetchedLayerTreeItem = FetchedLayer | FetchedGroupStart | FetchedGroupEnd;

export type ProjectWithLayers = {
  project: FetchedProject;
  layers: FetchedLayerTreeItem[];
};

export type UpdateCanvasDimensionResponseData = {
  previewUrl: string;
};

export type DeleteItemsResponseData = {
  previewUrl: string;
};
