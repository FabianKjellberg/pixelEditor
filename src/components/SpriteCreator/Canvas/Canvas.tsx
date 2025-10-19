'use client';

import BackgroundCanvas from './BackgroundCanvas/BackgroundCanvas';
import LayerCanvas from './LayerCanvas/LayerCanvas';
import styles from './Canvas.module.css';
import ClickHandler from './ClickHandler/ClickHandler';
import { useLayerContext } from '@/context/LayerContext';
import ActiveLayerHighlighter from './Highlighter/ActiveLayerHighlighter';

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
          <ActiveLayerHighlighter />
        </div>
        <div className={styles.canvases}>
          <ClickHandler />
        </div>
      </div>
    </>
  );
};

export default Canvas;
