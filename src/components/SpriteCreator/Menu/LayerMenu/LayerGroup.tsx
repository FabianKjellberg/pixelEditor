'use client';

import { LayerTreeItem } from '@/models/Layer';
import { removeRange } from '@/util/LayerSelectorUtil';
import { useMemo } from 'react';
import LayerGroupItem from './LayerGroupItem';
import LayerItem from './LayerItem';

type LayerGroupProps = {
  layerGroup: LayerTreeItem[];
};

const LayerGroup = ({ layerGroup }: LayerGroupProps) => {
  const groupedGroups = useMemo((): LayerTreeItem[][] => {
    const originalGroup = [...layerGroup];

    const out: LayerTreeItem[][] = [];

    while (originalGroup.length >= 1) {
      const range = removeRange(originalGroup);

      out.push(range);
    }

    return out;
  }, [layerGroup]);

  return (
    <div>
      {groupedGroups.map((group) => {
        const firstItem = group[0];

        switch (firstItem.type) {
          case 'layer':
            return <LayerItem key={firstItem.id} layer={firstItem} />;
          case 'group-start':
            const groupItems = [...group.slice(1, -1)];
            return <LayerGroupItem group={firstItem} groupItems={groupItems} key={firstItem.id} />;
        }
      })}
    </div>
  );
};

export default LayerGroup;
