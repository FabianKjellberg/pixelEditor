export type SaveGroupBody = {
  projectId: string;
  id: string;
  collapsed: boolean;
  name: string;
  startIndex: number;
  endIndex: number;
};

export type DeleteGroupResponseData = {
  previewUrl: string;
};
