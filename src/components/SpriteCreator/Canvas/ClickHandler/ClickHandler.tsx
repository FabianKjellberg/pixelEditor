'use client';

import { useToolContext } from '@/context/ToolContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Cordinate } from '@/models/Layer';
import { PanTool } from '@/models/Tools/PanTool';
import { useMouseEventContext } from '@/context/MouseEventContext/MouseEventContext';
import { useLayerContext } from '@/context/LayerContext';
import { useUndoRedoContext } from '@/context/UndoRedoContext';

const ClickHandler = () => {
  const { activeTool } = useToolContext();
  const { pixelSize, pan, getPan, setPan, setPixelSize } = useCanvasContext();

  const { undo, redo } = useUndoRedoContext();

  const {
    onPointerDownEvent,
    onPointerMoveEvent,
    onPointerUpEvent,
    onKeyDownEvent,
    onKeyUpEvent,
    onScrollEvent,
    setCursorType,
  } = useMouseEventContext();

  const [ctrlDown, setCtrlDown] = useState<boolean>(false);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [panTool, setPanTool] = useState<PanTool>(new PanTool({ getPan: getPan, setPan: setPan }));
  const [pixelDecimalSize, setPixelDecimalSize] = useState<number>(pixelSize);

  useEffect(() => {
    setPanTool(new PanTool({ getPan: getPan, setPan: setPan }));
  }, [setPan, getPan]);

  useEffect(() => {
    setPixelDecimalSize(pixelSize);
  }, [pixelSize]);

  //Pointer down event
  useEffect(() => {
    if (!onPointerDownEvent) return;

    setMouseDown(true);

    const c = onPointerDownEvent.pos;
    if (ctrlDown) {
      panTool.onDown(c.x, c.y);
    } else {
      activeTool.onDown(c.x, c.y, pixelSize, onPointerDownEvent.mouseButton);
    }
  }, [onPointerDownEvent?.trigger]);

  //Pointer Move event
  useEffect(() => {
    if (!onPointerMoveEvent) return;

    const c = onPointerMoveEvent.pos;
    if (ctrlDown) {
      panTool.onMove(c.x, c.y);
    } else {
      activeTool.onMove(c.x, c.y, pixelSize);
    }
  }, [onPointerMoveEvent?.trigger]);

  //Pointer up event
  useEffect(() => {
    if (!onPointerUpEvent) return;

    const c = onPointerUpEvent.pos;

    setMouseDown(false);

    panTool.onUp(c.x, c.y);
    activeTool.onUp(c.x, c.y, pixelSize, onPointerUpEvent.mouseButton);
  }, [onPointerUpEvent?.trigger]);

  //Key down event
  useEffect(() => {
    if (!onKeyDownEvent) return;

    if (
      onKeyDownEvent.ctrlDown &&
      onKeyDownEvent.shiftDown &&
      onKeyDownEvent.key == 'z' &&
      !mouseDown
    ) {
      redo();
    } else if (onKeyDownEvent.ctrlDown && onKeyDownEvent.key == 'z' && !mouseDown) {
      undo();
    }
    setCtrlDown(onKeyDownEvent.ctrlDown);
  }, [onKeyDownEvent?.trigger]);

  //Key upEvent
  useEffect(() => {
    if (!onKeyUpEvent) return;

    if (!onKeyUpEvent.ctrlDown) panTool.onUp(0, 0);
    setCtrlDown(onKeyUpEvent.ctrlDown);
  }, [onKeyUpEvent?.trigger]);

  // set different cursors
  useEffect(() => {
    if (ctrlDown) setCursorType({ cursor: 'move' });
    else if (
      activeTool.name == 'pencil' ||
      activeTool.name == 'eraser' ||
      activeTool.name == 'rectangleTool' ||
      activeTool.name == 'ovalTool' ||
      activeTool.name == 'lineTool' ||
      activeTool.name == 'fillBucket'
    )
      setCursorType({ cursor: 'crosshair' });
    else if (activeTool.name == 'rectangleSelector' || activeTool.name == 'eyedropper')
      setCursorType({ cursor: 'crosshair' });
    else if (activeTool.name == 'moveTool') setCursorType({ cursor: 'move' });
    else if (activeTool.name == 'panTool') setCursorType({ cursor: 'grab' });
    else setCursorType({ cursor: 'pointer' });
  }, [ctrlDown, activeTool]);

  //onScroll
  useEffect(() => {
    if (!onScrollEvent) return;

    const dY = onScrollEvent.deltaY;
    const c = onScrollEvent.pos;

    const absDelta = Math.abs(dY);
    const multiplier: number = dY > 0 ? 0.9 : dY < 0 ? 1.1 : 0; //!TODO maybe change???

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

      // world coordinates under cursor before zoom change
      const worldX = (c.x - pan.x) / oldZ;
      const worldY = (c.y - pan.y) / oldZ;

      // choose pan so that same world point stays under the cursor
      const nextPanX = c.x - worldX * newZ;
      const nextPanY = c.y - worldY * newZ;

      setPan({ x: nextPanX, y: nextPanY });
    }

    setPixelDecimalSize((prev) => prev * multiplier);
    setPixelSize(roundPixelDecimal);
  }, [onScrollEvent?.trigger]);

  return null;
};
export default ClickHandler;
