'use client';

import { useLayerContext } from '@/context/LayerContext';
import styles from './LayerSelector.module.css';
import { createLayer, createLayerEntity } from '@/util/LayerUtil';
import { useState } from 'react';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import LayerContextMenu from './LayerContextMenu/LayerContextMenu';

const LayerSelector = () => {
  const { allLayers, activeLayerIndex, setActiveLayerIndex, addLayer, renameLayer } =
    useLayerContext();
  const { onShow } = useContextMenuContext();

  const [editTitleIndex, setEditTitleIndex] = useState<number | null>(null);

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();

    const contextMenu = <LayerContextMenu index={index} setEditTitleIndex={setEditTitleIndex} />;

    onShow(contextMenu, e.pageX, e.pageY);
  };

  return (
    <div className={styles.layerContainer}>
      {allLayers.map((layer, index) => (
        <div
          onClick={() => setActiveLayerIndex(index)}
          onDoubleClick={() => setEditTitleIndex(index)}
          onContextMenu={(e) => handleRightClick(e, index)}
          key={index}
          className={index === activeLayerIndex ? styles.layerItemSelected : styles.layerItem}
        >
          {editTitleIndex === index ? (
            <input
              className={styles.changeNameInput}
              defaultValue={layer.name}
              autoFocus
              onClick={(e) => e.stopPropagation()} // don't re-trigger parent click
              onBlur={(e) => {
                const v = e.currentTarget.value.trim();
                if (v && v !== layer.name) renameLayer(v, index);
                setEditTitleIndex(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); // save
                if (e.key === 'Escape') setEditTitleIndex(null); // cancel
              }}
            />
          ) : (
            layer.name
          )}
        </div>
      ))}
      <div className={styles.breakLine}></div>
      <button
        className={styles.layerItem}
        onClick={() =>
          addLayer(createLayerEntity('Layer ' + (allLayers.length + 1)), allLayers.length)
        }
      >
        +
      </button>
    </div>
  );
};
export default LayerSelector;
