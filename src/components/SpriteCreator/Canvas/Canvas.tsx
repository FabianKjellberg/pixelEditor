'use client';

import BackgroundCanvas from './BackgroundCanvas/BackgroundCanvas';
import styles from './Canvas.module.css';
import ClickHandler from './ClickHandler/ClickHandler';
import { useLayerContext } from '@/context/LayerContext';
import ActiveLayerHighlighter from './Highlighter/ActiveLayerHighlighter';
import LayerCanvas from './LayerCanvas/LayerCanvas';
import { config } from '@/config/env';
import { useCanvasContext } from '@/context/CanvasContext';

const Canvas = () => {
  const { width, height, pixelSize } = useCanvasContext();

  const w = `${width * pixelSize}px`;
  const h = `${height * pixelSize}px`;
  return (
    <>
      <div className={styles.spriteCanvas}>
        <div
          className={styles.frame}
          style={{ ['--canvas-w' as any]: w, ['--canvas-h' as any]: h }}
        >
          <div className={styles.viewport}>
            <div className={styles.stack}>
              <BackgroundCanvas />
              <LayerCanvas />
              <ActiveLayerHighlighter />
              <ClickHandler />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Canvas;
