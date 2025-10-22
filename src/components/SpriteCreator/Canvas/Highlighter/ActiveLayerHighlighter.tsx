'use client';

import { useLayerContext } from '@/context/LayerContext';
import { config } from '@/config/env';
import { useEffect, useMemo } from 'react';
import styles from './ActiveLayerHighlighter.module.css';

const ActiveLayerHighlighter = () => {
  const { activeLayer } = useLayerContext();

  const highLightStyle = useMemo(
    () => ({
      width: activeLayer.rect.width * config.pixelSize,
      height: activeLayer.rect.height * config.pixelSize,
      left: activeLayer.rect.x * config.pixelSize,
      top: activeLayer.rect.y * config.pixelSize,
    }),
    [activeLayer],
  );

  return (
    <>
      {activeLayer.rect.height > 0 && activeLayer.rect.width > 0 && (
        <div style={highLightStyle} className={styles.layerHighlight} />
      )}
    </>
  );
};
export default ActiveLayerHighlighter;
