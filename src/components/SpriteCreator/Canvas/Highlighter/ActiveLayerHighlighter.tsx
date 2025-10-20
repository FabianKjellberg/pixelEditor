'use client';

import { useLayerContext } from '@/context/LayerContext';
import { config } from '@/config/env';
import { useEffect, useMemo } from 'react';
import styles from './ActiveLayerHighlighter.module.css';

const ActiveLayerHighlighter = () => {
  const { activeLayer } = useLayerContext();

  const highLightStyle = useMemo(
    () => ({
      width: activeLayer.width * config.pixelSize,
      height: activeLayer.height * config.pixelSize,
      left: activeLayer.xPos * config.pixelSize,
      top: activeLayer.yPos * config.pixelSize,
    }),
    [activeLayer],
  );

  return (
    <>
      {activeLayer.height > 0 && activeLayer.width > 0 && (
        <div style={highLightStyle} className={styles.layerHighlight} />
      )}
    </>
  );
};
export default ActiveLayerHighlighter;
