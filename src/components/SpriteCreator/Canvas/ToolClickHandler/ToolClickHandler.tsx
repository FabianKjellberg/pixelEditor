'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useMouseEventContext } from '@/context/MouseEventContext/MouseEventContext';
import { useToolContext } from '@/context/ToolContext';
import { useEffect, useState } from 'react';

const ToolClickHandler = () => {
  const { activeTool } = useToolContext();

  const {
    onPointerDownEvent,
    onPointerMoveEvent,
    onPointerUpEvent,
    setCursorType,
    onKeyDownEvent,
    onKeyUpEvent,
  } = useMouseEventContext();
  const { pixelSize } = useCanvasContext();

  const [ctrlDown, setCtrlDown] = useState<boolean>(false);
  const [shiftDown, setShiftDown] = useState<boolean>(false);

  //Pointer down event
  useEffect(() => {
    if (!onPointerDownEvent) return;

    const e = onPointerDownEvent;

    if (e.ctrlDown && e.shiftDown) return;

    activeTool.onDown?.(e.pos.x, e.pos.y, pixelSize, onPointerDownEvent.mouseButton);
  }, [onPointerDownEvent?.trigger]);

  //Pointer Move event
  useEffect(() => {
    if (!onPointerMoveEvent) return;

    const e = onPointerMoveEvent;

    if (e.ctrlDown && e.shiftDown) return;

    activeTool.onMove?.(e.pos.x, e.pos.y, pixelSize);
  }, [onPointerMoveEvent?.trigger]);

  //Pointer up event
  useEffect(() => {
    if (!onPointerUpEvent) return;

    const e = onPointerUpEvent;

    if (e.ctrlDown && e.shiftDown) return;

    activeTool.onUp?.(e.pos.x, e.pos.y, pixelSize, onPointerUpEvent.mouseButton);
  }, [onPointerUpEvent?.trigger]);

  //Key down event
  useEffect(() => {
    if (!onKeyDownEvent) return;

    setCtrlDown(onKeyDownEvent.ctrlDown);
    setShiftDown(onKeyDownEvent.shiftDown);

    if (onKeyDownEvent.key === 'enter') {
      activeTool.onCommit?.();
    } else if (onKeyDownEvent.key === 'escape') {
      activeTool.onCancel?.();
    }
  }, [onKeyDownEvent?.trigger]);

  //Key upEvent
  useEffect(() => {
    if (!onKeyUpEvent) return;

    setCtrlDown(onKeyUpEvent.ctrlDown);
    setShiftDown(onKeyUpEvent.shiftDown);
  }, [onKeyUpEvent?.trigger]);

  useEffect(() => {
    //if (ctrlDown || shiftDown) return;

    if (
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
  }, [ctrlDown, activeTool, shiftDown]);

  return null;
};

export default ToolClickHandler;
