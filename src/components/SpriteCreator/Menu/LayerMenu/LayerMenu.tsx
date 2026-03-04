import { LayerGroupEnd, LayerGroupStart, LayerTreeItem } from '@/models/Layer';
import { createLayer, createLayerEntity } from '@/util/LayerUtil';
import styles from './LayerMenu.module.css';
import LayerGroup from './LayerGroup';
import { useCallback, useEffect } from 'react';
import { useLayerContext } from '@/context/LayerContext';
import { useLayerSelectorContext } from '@/context/LayerSelectorContext';

const LayerMenu = () => {
  const { setLayerTreeItems, layerTreeItems } = useLayerContext();
  const { addLayer, addGroup, deleteLayer } = useLayerSelectorContext();

  const defaultGroup1 = createLayerEntity('layer1');

  const groups: LayerTreeItem[] = [defaultGroup1];

  useEffect(() => {
    setLayerTreeItems(groups);
  }, []);

  const addLayerCallback = useCallback(() => {
    addLayer();
  }, []);

  const addGroupCallback = useCallback(() => {
    addGroup();
  }, []);

  return (
    <>
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
        <button>
          <img
            src="/icons/bin.png"
            width={16}
            height={16}
            alt="bin"
            className={styles.buttonIcon}
          />
        </button>
      </div>
    </>
  );
};

export default LayerMenu;
