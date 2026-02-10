'use client';

import { useRef } from 'react';
import BackgroundCanvas from './BackgroundCanvas/BackgroundCanvas';
import styles from './Canvas.module.css';
import ClickHandler from './ClickHandler/ClickHandler';
import ActiveLayerHighlighter from './Highlighter/ActiveLayerHighlighter';
import LayerCanvas from './LayerCanvas/LayerCanvas';
import useSize from '@/hooks/useSize';
import Selection from './Selection/Selection';
import { useSettingsContext } from '@/context/SettingsContext';
import ToolOverlay from './ToolOverlay/ToolOverlay';
import { MouseEventContextProvider } from '@/context/MouseEventContext/MouseEventContext';

const Canvas = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(frameRef);
  const { showSelectedLayerBoundary } = useSettingsContext();

  return (
    <div className={styles.spriteCanvas} ref={frameRef}>
      <div className={styles.stack}>
        {width && height && <BackgroundCanvas canvasWidth={width} canvasHeight={height} />}
        {width && height && <LayerCanvas canvasWidth={width} canvasHeight={height} />}
        {showSelectedLayerBoundary && <ActiveLayerHighlighter />}
        <Selection canvasWidth={width} canvasHeight={height} />
        <MouseEventContextProvider>
          {width && height && <ToolOverlay canvasWidth={width} canvasHeight={height} />}
          <ClickHandler />
        </MouseEventContextProvider>
      </div>
    </div>
  );
};

export default Canvas;
