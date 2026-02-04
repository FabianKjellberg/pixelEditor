'use client';

import { useLayerContext } from '@/context/LayerContext';
import { Dispatch, SetStateAction, useMemo } from 'react';
import styles from './LayerContextMenu.module.css';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { LayerEntity } from '@/models/Layer';
import { createLayerEntity } from '@/util/LayerUtil';

function nextDuplicateName(name: string) {
  if (/\(\d+\)\s*$/.test(name)) {
    return name.replace(/\s*\((\d+)\)\s*$/, (_, n) => ` (${Number(n) + 1})`);
  }
  return `${name} (1)`;
}

type LayerContextMenuProps = {
  index: number;
  setEditTitleIndex: Dispatch<SetStateAction<number | null>>;
};

const LayerContextMenu = ({ index, setEditTitleIndex }: LayerContextMenuProps) => {
  const { deleteLayer, allLayers, addLayer, moveLayer } = useLayerContext();
  const { onHide } = useContextMenuContext();

  const onDelete = () => {
    deleteLayer(index);
    onHide();
  };

  const onDuplicate = () => {
    const duplicateLayer: LayerEntity = structuredClone(allLayers[index]); // Node 17+/modern browsers

    let duplicateNameExist = true;
    while (duplicateNameExist) {
      duplicateLayer.name = nextDuplicateName(duplicateLayer.name);

      if (!allLayers.some((layer) => layer.name === duplicateLayer.name))
        duplicateNameExist = false;
    }

    addLayer(duplicateLayer, index + 1);
    onHide();
  };

  const onAddLayerBelow = () => {
    addLayer(createLayerEntity('Layer ' + (allLayers.length + 1)), index + 1);

    onHide();
  };

  const onMoveTop = () => {
    moveLayer(index, 0);
    onHide();
  };

  const onMoveUp = () => {
    moveLayer(index, index - 1);
    onHide();
  };

  const onMoveDown = () => {
    moveLayer(index, index + 2);
    onHide();
  };

  const onMoveBottom = () => {
    moveLayer(index, allLayers.length);
    onHide();
  };

  const isAtBottom = useMemo((): boolean => index >= allLayers.length - 1, [allLayers, index]);
  const isAtTop = useMemo((): boolean => index <= 0, [index]);

  return (
    <>
      <div className={styles.layerContextCointainers}>
        <p className={styles.layerContextTitle}>{allLayers[index].name}</p>
        <div className={styles.layerContextButtons}>
          <button onClick={() => setEditTitleIndex(index)}>
            <p>Edit name</p>
          </button>
          <button onClick={() => onDuplicate()}>
            <p>Duplicate Layer</p>
          </button>
          <button onClick={() => onAddLayerBelow()}>
            <p>Add new layer below</p>
          </button>
          <button disabled={allLayers.length <= 1} onClick={() => onDelete()}>
            <p>Delete layer</p>
          </button>
          <button disabled={isAtTop} onClick={() => onMoveTop()}>
            <p>Move to the top</p>
          </button>
          <button disabled={isAtTop} onClick={() => onMoveUp()}>
            <p>Move up</p>
          </button>
          <button disabled={isAtBottom} onClick={() => onMoveDown()}>
            <p>Move down</p>
          </button>
          <button disabled={isAtBottom} onClick={() => onMoveBottom()}>
            <p>Move to the Bottom</p>
          </button>
        </div>
      </div>
    </>
  );
};

export default LayerContextMenu;
