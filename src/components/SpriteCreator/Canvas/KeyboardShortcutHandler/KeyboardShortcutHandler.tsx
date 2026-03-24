'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useMouseEventContext } from '@/context/MouseEventContext/MouseEventContext';
import { useToolContext } from '@/context/ToolContext';
import { useUndoRedoContext } from '@/context/UndoRedoContext';
import { PanTool } from '@/models/Tools/PanTool';
import { ITool } from '@/models/Tools/Tools';
import { useEffect, useRef } from 'react';

const KeyboardShortcutHandler = () => {
  const { onKeyDownEvent, onKeyUpEvent, getMouseDown } = useMouseEventContext();
  const { setPan, getPan } = useCanvasContext();
  const { undo, redo } = useUndoRedoContext();
  const { getActiveTool, setActiveTool } = useToolContext();

  const lastToolRef = useRef<ITool | undefined>(undefined);

  // Key down
  useEffect(() => {
    if (!onKeyDownEvent) return;
    if (getMouseDown()) return;

    // Ctrl + Shift + Z => redo
    if (onKeyDownEvent.ctrlDown && onKeyDownEvent.shiftDown && onKeyDownEvent.key === 'z') {
      redo();
      return;
    }

    // Ctrl + Z => undo
    if (onKeyDownEvent.ctrlDown && onKeyDownEvent.key === 'z') {
      undo();
      return;
    }

    // Hold Ctrl => temporarily switch to pan tool
    if (onKeyDownEvent.ctrlDown) {
      const activeTool = getActiveTool();

      if (activeTool.name != 'panTool') {
        lastToolRef.current = activeTool;
        setActiveTool(new PanTool({ getPan, setPan }));
      }
    }
  }, [onKeyDownEvent?.trigger]);

  // Key up
  useEffect(() => {
    if (!onKeyUpEvent) return;

    if (!onKeyUpEvent.ctrlDown && lastToolRef.current) {
      const activeTool = getActiveTool();

      activeTool.onUp?.(0, 0, 0, 0);

      setActiveTool(lastToolRef.current);

      lastToolRef.current = undefined;
    }
  }, [onKeyUpEvent?.trigger]);

  return null;
};

export default KeyboardShortcutHandler;
