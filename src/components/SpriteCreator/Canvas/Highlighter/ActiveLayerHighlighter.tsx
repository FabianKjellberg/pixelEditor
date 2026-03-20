'use client';

import { useLayerContext } from '@/context/LayerContext';
import { useMemo } from 'react';
import styles from './ActiveLayerHighlighter.module.css';
import { useCanvasContext } from '@/context/CanvasContext';
import { LayerEntity } from '@/models/Layer';
import { combineManyRectangles } from '@/util/LayerUtil';

const ActiveLayerHighlighter = () => {
  const { activeLayerIds, layerTreeItems } = useLayerContext();
  const { pixelSize, width, height, pan } = useCanvasContext();

  const combinedLayer = useMemo(() => {
    const activeLayers: LayerEntity[] = [];

    for (let i = 0; i < layerTreeItems.length; i++) {
      const layer = layerTreeItems[i];

      if (layer.type === 'layer' && activeLayerIds.some((id) => id === layer.id)) {
        activeLayers.push(layer);
      }
    }

    return combineManyRectangles(activeLayers.map((layer) => layer.layer.rect));
  }, [activeLayerIds, layerTreeItems]);

  const highLightStyle = useMemo(() => {
    const x1cordinate = Math.min(Math.max(0, combinedLayer.x), width);
    const x2cordinate = Math.min(width, combinedLayer.x + combinedLayer.width);
    const y1cordinate = Math.min(Math.max(0, combinedLayer.y), height);
    const y2cordinate = Math.min(height, combinedLayer.y + combinedLayer.height);

    // cordinates
    const x1 = pan.x + x1cordinate * pixelSize;
    const x2 = pan.x + x2cordinate * pixelSize;
    const y1 = pan.y + y1cordinate * pixelSize;
    const y2 = pan.y + y2cordinate * pixelSize;

    // Rectangle from cordinates
    return {
      width: x2 - x1,
      height: y2 - y1,
      left: x1,
      top: y1,
    };
  }, [combinedLayer, pixelSize, width, height, pan]);

  return (
    <>
      {combinedLayer.height > 0 && combinedLayer.width > 0 && (
        <div style={highLightStyle} className={styles.layerHighlight} />
      )}
    </>
  );
};
export default ActiveLayerHighlighter;
