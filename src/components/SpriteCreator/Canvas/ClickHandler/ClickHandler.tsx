'use client';

import styles from './ClickHandler.module.css';
import { useToolContext } from '@/context/ToolContext';
import { useLayerContext } from '@/context/LayerContext';
import { config } from '@/config/env';
import { getPixelPositions } from '@/util/LayerUtil';

const ClickHandler = () => {
  const { activeTool } = useToolContext();
  const { activeLayer } = useLayerContext();

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, config.pixelSize);
    activeTool.onDown(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, config.pixelSize);
    activeTool.onMove(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, config.pixelSize);
    activeTool.onUp(c.x - activeLayer.rect.x, c.y - activeLayer.rect.y);
  };

  return (
    <div
      className={styles.clickHandlerComponent}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
};
export default ClickHandler;
