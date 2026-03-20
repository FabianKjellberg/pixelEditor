import { DeleteGroupResponseData, SaveGroupBody } from '@/models/apiModels/groupModels';
import { LayerGroupStart } from '@/models/Layer';
import { apiClient } from './client';
import { BlobUrl, uploadBlob } from '@/util/BlobUtil';

export async function createGroup(
  projectId: string,
  startIndex: number,
  endIndex: number,
  group: LayerGroupStart,
) {
  try {
    const groupBody: SaveGroupBody = {
      projectId: projectId,
      id: group.id,
      name: group.name,
      collapsed: group.collapsed,
      startIndex: startIndex,
      endIndex: endIndex,
    };

    const response = await apiClient('POST', '/group/create', groupBody);

    if (!response.ok) {
      throw new Error('failed creating group' + response);
    }
  } catch (error) {
    throw new Error('unable to save group' + error);
  }
}
