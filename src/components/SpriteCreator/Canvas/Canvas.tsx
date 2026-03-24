'use client';

import { useEffect, useRef } from 'react';
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
import { useTransformContext } from '@/context/TransformContext';
import TransformOverlay from './TransformOverlay/TransformOverlay';
import ToolClickHandler from './ToolClickHandler/ToolClickHandler';
import ZoomHandler from './ZoomHandler/ZoomHandler';
import KeyboardShortcutHandler from './KeyboardShortcutHandler/KeyboardShortcutHandler';

const Canvas = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(frameRef);
  const { showSelectedLayerBoundary } = useSettingsContext();
  const { transforming } = useTransformContext();

  return (
    <div className={styles.spriteCanvas} ref={frameRef}>
      <div className={styles.stack}>
        {width && height && <BackgroundCanvas canvasWidth={width} canvasHeight={height} />}
        {width && height && <LayerCanvas canvasWidth={width} canvasHeight={height} />}
        {showSelectedLayerBoundary && <ActiveLayerHighlighter />}
        <Selection canvasWidth={width} canvasHeight={height} />
        <MouseEventContextProvider>
          {transforming && <TransformOverlay />}

          {width && height && <ToolOverlay canvasWidth={width} canvasHeight={height} />}
          <ToolClickHandler />

          <ZoomHandler />
          <KeyboardShortcutHandler />
        </MouseEventContextProvider>
      </div>
    </div>
  );
};

export default Canvas;
