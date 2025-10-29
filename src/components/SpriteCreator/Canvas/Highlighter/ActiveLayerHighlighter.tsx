'use client';

import { useLayerContext } from '@/context/LayerContext';
import { config } from '@/config/env';
import { useEffect, useMemo } from 'react';
import styles from './ActiveLayerHighlighter.module.css';
import { useCanvasContext } from '@/context/CanvasContext';

const ActiveLayerHighlighter = () => {
  const { activeLayer } = useLayerContext();
  const { pixelSize, width, height } = useCanvasContext();

  const highLightStyle = useMemo(() => {
    const realX = activeLayer.rect.x * pixelSize;
    const realY = activeLayer.rect.y * pixelSize;
    let realW = activeLayer.rect.width * pixelSize;
    let realH = activeLayer.rect.height * pixelSize;

    //realX = realX < 0 ? 0 : realX;
    //realY = realY < 0 ? 0 : realY;

    realW = realW > width * pixelSize - realX ? width * pixelSize - realX : realW;
    realH = realH > height * pixelSize - realY ? height * pixelSize - realY : realH;

    return {
      width: realW,
      height: realH,
      left: realX,
      top: realY,
    };
  }, [activeLayer, pixelSize, width, height]);

  return (
    <>
      {activeLayer.rect.height > 0 && activeLayer.rect.width > 0 && (
        <div style={highLightStyle} className={styles.layerHighlight} />
      )}
    </>
  );
};
export default ActiveLayerHighlighter;
