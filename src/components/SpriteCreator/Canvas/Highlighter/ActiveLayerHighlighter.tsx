'use client';

import { useLayerContext } from '@/context/LayerContext';
import { useMemo } from 'react';
import styles from './ActiveLayerHighlighter.module.css';
import { useCanvasContext } from '@/context/CanvasContext';

const ActiveLayerHighlighter = () => {
  const { activeLayer } = useLayerContext();
  const { pixelSize, width, height, panX, panY } = useCanvasContext();

  const highLightStyle = useMemo(() => {
    const realX = panX + activeLayer.rect.x * pixelSize;
    const realY = panY + activeLayer.rect.y * pixelSize;
    let realW = activeLayer.rect.width * pixelSize;
    let realH = activeLayer.rect.height * pixelSize;

    realW = realW > panX + width * pixelSize - realX ? panX + width * pixelSize - realX : realW;
    realH = realH > panY + height * pixelSize - realY ? panY + height * pixelSize - realY : realH;

    return {
      width: realW,
      height: realH,
      left: realX,
      top: realY,
    };
  }, [activeLayer, pixelSize, width, height, panX, panY]);

  return (
    <>
      {activeLayer.rect.height > 0 && activeLayer.rect.width > 0 && (
        <div style={highLightStyle} className={styles.layerHighlight} />
      )}
    </>
  );
};
export default ActiveLayerHighlighter;
