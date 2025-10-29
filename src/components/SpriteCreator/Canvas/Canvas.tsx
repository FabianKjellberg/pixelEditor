'use client';

import BackgroundCanvas from './BackgroundCanvas/BackgroundCanvas';
import styles from './Canvas.module.css';
import ClickHandler from './ClickHandler/ClickHandler';
import ActiveLayerHighlighter from './Highlighter/ActiveLayerHighlighter';
import LayerCanvas from './LayerCanvas/LayerCanvas';
import { useCanvasContext } from '@/context/CanvasContext';

type CanvasVars = React.CSSProperties & {
  '--canvas-w': string;
  '--canvas-h': string;
};

const Canvas = () => {
  const { width, height, pixelSize } = useCanvasContext();

  const w = `${width * pixelSize}px`;
  const h = `${height * pixelSize}px`;

  const vars: CanvasVars = {
    '--canvas-w': w,
    '--canvas-h': h,
  };

  return (
    <>
      <div className={styles.spriteCanvas}>
        <div className={styles.frame} style={vars}>
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
