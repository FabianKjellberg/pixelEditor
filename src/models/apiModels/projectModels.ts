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
