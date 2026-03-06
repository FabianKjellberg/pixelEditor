import { LayerTreeItem } from '@/models/Layer';
import { createLayerEntity } from '@/util/LayerUtil';
import styles from './LayerMenu.module.css';
import LayerGroup from './LayerGroup';
import { useCallback, useEffect } from 'react';
import { useLayerContext } from '@/context/LayerContext';
import { useLayerSelectorContext } from '@/context/LayerSelectorContext';
import ConfirmationModal from '../../Modals/ConfirmationModal/ConfirmationModal';
import { useModalContext } from '@/context/ModalContext/ModalContext';

const LayerMenu = () => {
  const { layerTreeItems, activeLayerIds } = useLayerContext();
  const { addLayer, addGroup, deleteItem } = useLayerSelectorContext();
  const { onShow } = useModalContext();

  const addLayerCallback = useCallback(() => {
    addLayer();
  }, []);

  const addGroupCallback = useCallback(() => {
    addGroup();
  }, []);

  const deleteSelectedLayers = useCallback(() => {
    activeLayerIds.forEach((id) => {
      deleteItem(id);
    });
  }, [activeLayerIds, deleteItem]);

  const deleteCallback = useCallback(() => {
    const id = 'delete-layer';

    const modal = (
      <ConfirmationModal
        id={id}
        text={`Are you sure you want to delete all ${activeLayerIds.length} selected layer/s`}
        callbackFunction={deleteSelectedLayers}
      />
    );

    onShow(id, modal, 'Delete selected layers');
  }, [deleteSelectedLayers, activeLayerIds]);

  return (
    <div className={styles.menuWrapper}>
      <LayerGroup layerGroup={layerTreeItems} />
      <div className={styles.breakLine}></div>
      <div className={styles.buttons}>
        <button onClick={addLayerCallback}>+</button>
        <button onClick={addGroupCallback}>
          <img
            src="/icons/folder.png"
            width={16}
            height={16}
            alt="folder"
            className={styles.buttonIcon}
          />
        </button>
        <button onClick={deleteCallback}>
          <img
            src="/icons/bin.png"
            width={16}
            height={16}
            alt="bin"
            className={styles.buttonIcon}
          />
        </button>
      </div>
    </div>
  );
};

export default LayerMenu;
