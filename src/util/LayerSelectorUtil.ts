import { LayerTreeItem } from '@/models/Layer';

export function removeRange(group: LayerTreeItem[]): LayerTreeItem[] {
  if (group.length === 0) return [];

  const first = group[0];

  switch (first.type) {
    case 'layer': {
      return group.splice(0, 1);
    }

    case 'group-start': {
      const endIndex = group.findIndex((item) => item.type === 'group-end' && item.id === first.id);

      if (endIndex === -1) {
        throw new Error('removeRange: could not find group end');
      }

      return group.splice(0, endIndex + 1);
    }

    case 'group-end': {
      throw new Error('removeRange: first item cannot be group-end');
    }
  }
}
