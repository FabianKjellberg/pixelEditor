export type SaveLayerBody = {
  layerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  length: number;
};

export type SaveLayerResponseData = {
  previewUrl: string;
  layerUrl: string;
};

export type MoveLayerResponseData = {
  previewUrl: string;
};

export type AddLayerBody = {
  projectId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layerId: string;
  name: string;
  length: number;
  zIndex?: number;
};

export type AddLayerResponseData = {
  layerUrL: string;
  previewUrl: string;
};
export type DeleteLayerResponseData = {
  previewUrl: string;
};

export type MoveLayerBody = {
  layerIndexes: LayerIndex[];
};

type LayerIndex = {
  zIndex: number;
  layerId: string;
};
