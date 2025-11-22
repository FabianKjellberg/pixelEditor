'use client';

import { useLayerContext } from '@/context/LayerContext';
import { useMemo } from 'react';
import styles from './ActiveLayerHighlighter.module.css';
import { useCanvasContext } from '@/context/CanvasContext';

const ActiveLayerHighlighter = () => {
  const { activeLayer } = useLayerContext();
  const { pixelSize, width, height, pan } = useCanvasContext();

  const highLightStyle = useMemo(() => {
    const realX = pan.x + activeLayer.rect.x * pixelSize;
    const realY = pan.y + activeLayer.rect.y * pixelSize;
    let realW = activeLayer.rect.width * pixelSize;
    let realH = activeLayer.rect.height * pixelSize;

    realW = realW > pan.x + width * pixelSize - realX ? pan.x + width * pixelSize - realX : realW;
    realH = realH > pan.y + height * pixelSize - realY ? pan.y + height * pixelSize - realY : realH;

    return {
      width: realW,
      height: realH,
      left: realX,
      top: realY,
    };
  }, [activeLayer, pixelSize, width, height, pan]);

  return (
    <>
      {activeLayer.rect.height > 0 && activeLayer.rect.width > 0 && (
        <div style={highLightStyle} className={styles.layerHighlight} />
      )}
    </>
  );
};
export default ActiveLayerHighlighter;
