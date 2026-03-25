'use client';

import {
  createContext,
  CSSProperties,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './MouseEventContext.module.css';
import { Cordinate } from '@/models/Layer';
import { getCanvasPosition } from '@/helpers/canvas';
import { useCanvasContext } from '../CanvasContext';
import { useToolContext } from '../ToolContext';

type MouseEventContextValue = {
  cursorType: CSSProperties;
  setCursorType: (properties: CSSProperties) => void;

  mouseDown: boolean;
  getMouseDown: () => boolean;
  setMouseDown: (down: boolean) => void;

  onKeyDownEvent: KeyEvent | null;
  onKeyUpEvent: KeyEvent | null;

  onPointerDownEvent: PointerEventPayload | null;
  onPointerUpEvent: PointerEventPayload | null;
  onPointerMoveEvent: PointerEventPayload | null;
  onPointerLeaveEvent: PointerEventPayload | null;
  onPointerCancelEvent: PointerEventPayload | null;

  onScrollEvent: ScrollEvent | null;
};

export type KeyEvent = {
  ctrlDown: boolean;
  shiftDown: boolean;
  key: string;
  trigger: number;
};

export type PointerEventPayload = {
  pos: Cordinate;
  mouseButton: number;
  trigger: number;
  ctrlDown: boolean;
  shiftDown: boolean;
};

export type ScrollEvent = {
  deltaY: number;
  pos: Cordinate;
  trigger: number;
};

const MouseEventContext = createContext<MouseEventContextValue | undefined>(undefined);

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;

  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;

  // In case the event target is inside an input wrapper etc.
  const closest = el.closest('input, textarea, select, [contenteditable="true"]');
  return !!closest;
}

export const MouseEventContextProvider = ({ children }: { children: ReactNode }) => {
  const { pan } = useCanvasContext();
  const { activeTool } = useToolContext();

  const [cursorType, setCursorType] = useState<CSSProperties>({ cursor: 'pointer' });
  const [mouseDown, setMouseDown] = useState<boolean>(false);

  const mouseDownRef = useRef<boolean>(false);

  useEffect(() => {
    mouseDownRef.current = mouseDown;
  }, [mouseDown]);

  const getMouseDown = useCallback(() => {
    return mouseDownRef.current;
  }, []);

  const [onKeyDownEvent, setOnKeyDownEvent] = useState<KeyEvent | null>(null);
  const [onKeyUpEvent, setOnKeyUpEvent] = useState<KeyEvent | null>(null);

  const [onPointerDownEvent, setOnPointerDownEvent] = useState<PointerEventPayload | null>(null);
  const [onPointerMoveEvent, setOnPointerMoveEvent] = useState<PointerEventPayload | null>(null);
  const [onPointerUpEvent, setOnPointerUpEvent] = useState<PointerEventPayload | null>(null);
  const [onPointerLeaveEvent, setOnPointerLeaveEvent] = useState<PointerEventPayload | null>(null);
  const [onPointerCancelEvent, setOnPointerCancelEvent] = useState<PointerEventPayload | null>(
    null,
  );

  const [onScrollEvent, setOnScrollEvent] = useState<ScrollEvent | null>(null);

  useEffect(() => {
    const opts: AddEventListenerOptions = { capture: true };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don’t steal normal text editing undo/typing behavior
      if (isTypingTarget(e.target)) return;

      setOnKeyDownEvent((prev) => ({
        ctrlDown: e.ctrlKey || e.metaKey, // include Cmd on mac
        shiftDown: e.shiftKey,
        key: e.key.toLowerCase(),
        trigger: prev ? prev.trigger + 1 : 0,
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      setOnKeyUpEvent((prev) => ({
        ctrlDown: e.ctrlKey || e.metaKey,
        shiftDown: e.shiftKey,
        key: e.key.toLowerCase(),
        trigger: prev ? prev.trigger + 1 : 0,
      }));
    };

    window.addEventListener('keydown', handleKeyDown, opts);
    window.addEventListener('keyup', handleKeyUp, opts);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, opts);
      window.removeEventListener('keyup', handleKeyUp, opts);
    };
  }, []);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      setMouseDown(true);
      e.currentTarget.setPointerCapture(e.pointerId);

      const c = getCanvasPosition(e, pan);
      setOnPointerDownEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: e.button,
        ctrlDown: e.ctrlKey,
        shiftDown: e.shiftKey,
      }));
    },
    [pan],
  );

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);
      setOnPointerMoveEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: 0,
        ctrlDown: e.ctrlKey,
        shiftDown: e.shiftKey,
      }));
    },
    [pan],
  );

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setMouseDown(false);
      setOnPointerUpEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: e.button,
        ctrlDown: e.ctrlKey,
        shiftDown: e.shiftKey,
      }));
    },
    [pan],
  );

  const onPointerLeave: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);
      setOnPointerLeaveEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: 0,
        ctrlDown: e.ctrlKey,
        shiftDown: e.shiftKey,
      }));
    },
    [pan],
  );

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      setOnPointerCancelEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: 0,
        ctrlDown: e.ctrlKey,
        shiftDown: e.shiftKey,
      }));

      // You were also emitting pointerUp on cancel – keeping that behavior
      setOnPointerUpEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: 0,
        ctrlDown: e.ctrlKey,
        shiftDown: e.shiftKey,
      }));
    },
    [pan],
  );

  const onScroll: React.WheelEventHandler<HTMLDivElement> = useCallback((e) => {
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setOnScrollEvent((prev) => ({
      deltaY: e.deltaY,
      trigger: prev ? prev.trigger + 1 : 0,
      pos: { x, y },
    }));
  }, []);

  const value = useMemo(
    () => ({
      cursorType,
      setCursorType,
      mouseDown,
      getMouseDown,
      setMouseDown,
      onKeyDownEvent,
      onKeyUpEvent,

      onPointerDownEvent,
      onPointerUpEvent,
      onPointerMoveEvent,
      onPointerLeaveEvent,
      onPointerCancelEvent,

      onScrollEvent,
    }),
    [
      mouseDown,
      getMouseDown,
      setMouseDown,
      cursorType,
      onKeyDownEvent,
      onKeyUpEvent,
      onPointerDownEvent,
      onPointerUpEvent,
      onPointerMoveEvent,
      onPointerLeaveEvent,
      onPointerCancelEvent,
      onScrollEvent,
    ],
  );

  return (
    <MouseEventContext.Provider value={value}>
      {children}
      {activeTool.name === 'transform' ? (
        <div onContextMenu={(e) => e.preventDefault()} onWheel={onScroll} />
      ) : (
        <div
          className={styles.mouseEvents}
          style={cursorType}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          onPointerCancel={onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          onWheel={onScroll}
        />
      )}
    </MouseEventContext.Provider>
  );
};

export const useMouseEventContext = () => {
  const ctx = useContext(MouseEventContext);
  if (!ctx) {
    throw new Error('have to be inside MouseEventProvider to retrieve context');
  }
  return ctx;
};
