import { LayerTreeItem } from '@/models/Layer';
import { createLayerEntity } from '@/util/LayerUtil';
import styles from './LayerMenu.module.css';
import LayerGroup from './LayerGroup';
import { useCallback, useEffect, useMemo } from 'react';
import { useLayerContext } from '@/context/LayerContext';
import { useLayerSelectorContext } from '@/context/LayerSelectorContext';
import ConfirmationModal from '../../Modals/ConfirmationModal/ConfirmationModal';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import Loading, { LoadingState } from '@/components/Loading/Loading';
import { useCanvasContext } from '@/context/CanvasContext';
import { useMetaDataAutoSaveContext } from '@/context/MetaDataAutoSaveContext';

const LayerMenu = () => {
  const { layerTreeItems, activeLayerIds } = useLayerContext();
  const { addLayer, addGroup, deleteMultipleItems, orderState } = useLayerSelectorContext();
  const { metaSaveState } = useMetaDataAutoSaveContext();
  const { onShow } = useModalContext();
  const { isLoadedFromCloud } = useCanvasContext();

  const addLayerCallback = useCallback(() => {
    addLayer();
  }, [addLayer]);

  const addGroupCallback = useCallback(() => {
    addGroup();
  }, [addGroup]);

  const deleteSelectedLayers = useCallback(() => {
    deleteMultipleItems(activeLayerIds);
  }, [deleteMultipleItems, activeLayerIds]);

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

  const deleteDisabled = useMemo(() => activeLayerIds.length < 1, [activeLayerIds]);

  const loadingState = useMemo((): LoadingState => {
    if (orderState === 'not-saved' || metaSaveState === 'not-saved') return 'not-saved';
    else if (orderState === 'saving' || metaSaveState === 'saving') return 'saving';
    else return 'saved';
  }, [orderState, metaSaveState]);

  return (
    <div className={styles.menuWrapper}>
      <div className={styles.titleBar}>
        <p>Layers</p>
        <div className={styles.loading}>
          {isLoadedFromCloud && (
            <Loading
              size={14}
              withText={false}
              loadingState={loadingState}
              onToolTip={'Changes to metadata are saved after 5 seconds of inactivity.'}
            />
          )}
        </div>
      </div>
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
        <button onClick={deleteCallback} disabled={deleteDisabled}>
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
