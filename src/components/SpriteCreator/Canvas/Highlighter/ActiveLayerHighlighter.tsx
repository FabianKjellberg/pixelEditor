'use client';

import { useLayerContext } from '@/context/LayerContext';
import { useMemo } from 'react';
import styles from './ActiveLayerHighlighter.module.css';
import { useCanvasContext } from '@/context/CanvasContext';

//!TODO rename this class to selectionhighligter

const ActiveLayerHighlighter = () => {
  const { activeLayer } = useLayerContext();
  const { pixelSize, width, height, pan } = useCanvasContext();

  const highLightStyle = useMemo(() => {
    const x1cordinate = Math.min(Math.max(0, activeLayer.layer.rect.x), width);
    const x2cordinate = Math.min(width, activeLayer.layer.rect.x + activeLayer.layer.rect.width);
    const y1cordinate = Math.min(Math.max(0, activeLayer.layer.rect.y), height);
    const y2cordinate = Math.min(height, activeLayer.layer.rect.y + activeLayer.layer.rect.height);

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
  }, [activeLayer, pixelSize, width, height, pan]);

  return (
    <>
      {activeLayer.layer.rect.height > 0 && activeLayer.layer.rect.width > 0 && (
        <div style={highLightStyle} className={styles.layerHighlight} />
      )}
    </>
  );
};
export default ActiveLayerHighlighter;
