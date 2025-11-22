'use client';

import { useRef } from 'react';
import BackgroundCanvas from './BackgroundCanvas/BackgroundCanvas';
import styles from './Canvas.module.css';
import ClickHandler from './ClickHandler/ClickHandler';
import ActiveLayerHighlighter from './Highlighter/ActiveLayerHighlighter';
import LayerCanvas from './LayerCanvas/LayerCanvas';
import useSize from '@/hooks/useSize';

const Canvas = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(frameRef);

  return (
    <div className={styles.spriteCanvas} ref={frameRef}>
      <div className={styles.stack}>
        {width && height && <BackgroundCanvas canvasWidth={width} canvasHeight={height} />}
        {width && height && <LayerCanvas canvasWidth={width} canvasHeight={height} />}
        <ActiveLayerHighlighter />
        <ClickHandler />
      </div>
    </div>
  );
};

export default Canvas;
