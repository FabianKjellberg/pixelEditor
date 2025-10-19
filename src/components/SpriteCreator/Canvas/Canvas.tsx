'use client';

import BackgroundCanvas from './BackgroundCanvas/BackgroundCanvas';
import LayerCanvas from './LayerCanvas/LayerCanvas';
import styles from './Canvas.module.css';
import ClickHandler from './ClickHandler/ClickHandler';
import { useLayerContext } from '@/context/LayerContext';
import { config } from '@/config/env';
import { useEffect } from 'react';

const Canvas = () => {
  const { allLayers } = useLayerContext();
  return (
    <>
      <div className={styles.spriteCanvas}>
        <div className={styles.canvases}>
          <BackgroundCanvas />
        </div>
        <div className={styles.canvases}>
          {allLayers.map((layer, index) => (
            <LayerCanvas key={index} layer={layer} />
          ))}
        </div>
        <div className={styles.canvases}>
          <ClickHandler />
        </div>
      </div>
    </>
  );
};

export default Canvas;
