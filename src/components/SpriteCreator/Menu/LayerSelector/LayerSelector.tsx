'use client';

import { useLayerContext } from '@/context/LayerContext';
import styles from './LayerSelector.module.css';
import { createLayer } from '@/util/LayerUtil';

const LayerSelector = () => {
  const { allLayers, activeLayerIndex, setActiveLayerIndex, addLayer } = useLayerContext();

  return (
    <div className={styles.layerContainer}>
      {allLayers.map((layer, index) => (
        <div onClick={(e) => setActiveLayerIndex(index)} key={index} className={index === activeLayerIndex ? styles.layerItemSelected : styles.layerItem}>
          {layer.name}
        </div>
      ))}

      <button onClick={() => addLayer(createLayer(0, 0, 0, 0, "Layer "+(allLayers.length+1)), allLayers.length)}>+</button>
    </div> 
  );
};
export default LayerSelector;
