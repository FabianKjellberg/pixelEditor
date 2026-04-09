'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useMouseEventContext } from '@/context/MouseEventContext/MouseEventContext';
import { useToolContext } from '@/context/ToolContext';
import { useTransformContext } from '@/context/TransformContext';
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
    mouseDown,
  } = useMouseEventContext();
  const { pixelSize } = useCanvasContext();
  const { setTransforming } = useTransformContext();

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

      if (activeTool.name === 'transform') {
        setTransforming(false);
      }
    } else if (onKeyDownEvent.key === 'escape') {
      activeTool.onCancel?.();

      if (activeTool.name === 'transform') {
        setTransforming(false);
      }
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
      activeTool.name == 'fillBucket' ||
      activeTool.name == 'freeformTool' ||
      activeTool.name == 'cicrcleSelector' ||
      activeTool.name == 'freeformSelector' ||
      activeTool.name == 'lassoSelector'
    )
      setCursorType({ cursor: 'crosshair' });
    else if (activeTool.name == 'rectangleSelector' || activeTool.name == 'eyedropper')
      setCursorType({ cursor: 'crosshair' });
    else if (activeTool.name == 'moveTool') setCursorType({ cursor: 'move' });
    else if (activeTool.name == 'panTool')
      setCursorType({ cursor: mouseDown ? 'grabbing' : 'grab' });
    else setCursorType({ cursor: 'pointer' });
  }, [ctrlDown, activeTool, shiftDown, mouseDown]);

  return null;
};

export default ToolClickHandler;
