'use client';

import { useToolContext } from '@/context/ToolContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Cordinate } from '@/models/Layer';
import { PanTool } from '@/models/Tools/PanTool';
import styles from './ClickHandler.module.css';

const ClickHandler = () => {
  const { activeTool } = useToolContext();
  const { pixelSize, pan, getPan, setPan, setPixelSize } = useCanvasContext();

  const [ctrlDown, setCtrlDown] = useState<boolean>(false);
  const [panTool, setPanTool] = useState<PanTool>(new PanTool({ getPan: getPan, setPan: setPan }));
  const [pixelDecimalSize, setPixelDecimalSize] = useState<number>(pixelSize);

  useEffect(() => {
    setPanTool(new PanTool({ getPan: getPan, setPan: setPan }));
  }, [setPan, getPan]);

  useEffect(() => {
    setPixelDecimalSize(pixelSize);
  }, [pixelSize]);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();

    const c = getCanvasPosition(e, pan);

    if (e.ctrlKey) {
      panTool.onDown(c.x, c.y);
    } else {
      activeTool.onDown(c.x, c.y, pixelSize);
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const c = getCanvasPosition(e, pan);

    if (ctrlDown) {
      panTool.onMove(c.x, c.y);
    } else {
      activeTool.onMove(c.x, c.y, pixelSize);
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (ctrlDown) {
      panTool.onUp(0, 0);
    }

    const c = getCanvasPosition(e, pan);
    activeTool.onUp(c.x, c.y, pixelSize);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.ctrlKey) setCtrlDown(true);
  };

  const onKeyUp: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    setCtrlDown(false);
    panTool.onUp(0, 0);
  };

  const cursorType: CSSProperties = useMemo(() => {
    if (ctrlDown) return { cursor: 'move' };
    if (activeTool.name == 'rectangleSelector') return { cursor: 'crosshair' };
    return { cursor: 'pointer' };
  }, [ctrlDown, activeTool]);

  const onScroll: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    const absDelta = Math.abs(e.deltaY);
    const multiplier: number = e.deltaY > 0 ? 0.9 : e.deltaY < 0 ? 1.1 : 0; //!TODO maybe change???

    // Early returns at min/max values (also prevents 0 multiple)
    if (multiplier === 0) return;
    if (pixelDecimalSize * multiplier > 80) {
      setPixelDecimalSize(80);
      setPixelSize(80);
      return;
    }
    if (pixelDecimalSize * multiplier < 1) {
      setPixelDecimalSize(1);
      setPixelSize(1);
      return;
    }

    //Multiply by zoom strength
    for (let i = 0; i < Math.min(absDelta, 10); i++) {
      multiplier * multiplier;
    }

    const roundPixelDecimal = Math.round(pixelDecimalSize * multiplier);

    if (roundPixelDecimal !== pixelSize) {
      const oldZ = pixelSize;
      const newZ = roundPixelDecimal;

      // mouse position in the element's local coordinates (NOT screen coords)
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // world coordinates under cursor before zoom change
      const worldX = (mouseX - pan.x) / oldZ;
      const worldY = (mouseY - pan.y) / oldZ;

      // choose pan so that same world point stays under the cursor
      const nextPanX = mouseX - worldX * newZ;
      const nextPanY = mouseY - worldY * newZ;

      setPan({ x: nextPanX, y: nextPanY });
    }

    setPixelDecimalSize((prev) => prev * multiplier);
    setPixelSize(roundPixelDecimal);
  };

  return (
    <div
      className={styles.clickHandler}
      tabIndex={0}
      style={cursorType}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onPointerEnter={(e) => e.currentTarget.focus()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={onScroll}
      onScroll={(e) => {
        e.preventDefault();
      }}
    />
  );
};
export default ClickHandler;

export function getCanvasPosition<T extends Element>(
  e: React.PointerEvent<T>,
  pan: Cordinate,
): Cordinate {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  return { x: e.clientX - rect.left - pan.x, y: e.clientY - rect.top - pan.y };
}
