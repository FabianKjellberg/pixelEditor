'use client';

import { useEffect } from 'react';
import styles from './ClickHandler.module.css';
import { useToolContext } from '@/context/ToolContext';
import { PenTool } from '@/models/Tools/PenTool';
import { useLayerContext } from '@/context/LayerContext';
import { config } from '@/config/env';
import { getPixelPositions } from '@/util/LayerUtil';

const ClickHandler = () => {
  const { activeTool, setActiveTool } = useToolContext();
  const { setActiveLayer, activeLayer } = useLayerContext();

  //Should not be set here. it should be set in the while selecting a tool :) !TODO fix this
  useEffect(() => {
    const penTool = new PenTool(setActiveLayer, activeLayer);

    setActiveTool(penTool);
  }, []);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, config.pixelSize);
    activeTool.onDown(c.x - activeLayer.xPos, c.y - activeLayer.yPos);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, config.pixelSize);
    activeTool.onMove(c.x - activeLayer.xPos, c.y - activeLayer.yPos);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getPixelPositions(e, config.pixelSize);
    activeTool.onUp(c.x - activeLayer.xPos, c.y - activeLayer.yPos);
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
