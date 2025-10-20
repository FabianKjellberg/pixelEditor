'use client';

import { useLayerContext } from '@/context/LayerContext';
import styles from './LayerSelector.module.css';
import { createLayer } from '@/util/LayerUtil';

const LayerSelector = () => {
  const { allLayers, setActiveLayerIndex, addLayer } = useLayerContext();

  return (
    <>
      {allLayers.map((layer, index) => (
        <div key={index} className={styles.LayerContainer}>
          layer{index}
          <button onClick={() => setActiveLayerIndex(index)}>select Layer</button>
        </div>
      ))}

      <button onClick={() => addLayer(createLayer(0, 0, 0, 0), allLayers.length)}>+</button>
    </>
  );
};
export default LayerSelector;
