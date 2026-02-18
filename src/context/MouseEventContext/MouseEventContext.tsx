'use client';

import {
  createContext,
  CSSProperties,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import styles from './MouseEventContext.module.css';
import { Cordinate } from '@/models/Layer';
import { getCanvasPosition } from '@/helpers/canvas';
import { useCanvasContext } from '../CanvasContext';

type MouseEventContextValue = {
  cursorType: CSSProperties;
  setCursorType: (properties: CSSProperties) => void;

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
};

export type ScrollEvent = {
  deltaY: number;
  pos: Cordinate;
  trigger: number;
};

const MouseEventContext = createContext<MouseEventContextValue | undefined>(undefined);

export const MouseEventContextProvider = ({ children }: { children: ReactNode }) => {
  const { pan } = useCanvasContext();

  const [cursorType, setCursorType] = useState<CSSProperties>({ cursor: 'pointer' });

  const [onKeyDownEvent, setOnKeyDownEvent] = useState<KeyEvent | null>(null);
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback((e) => {
    setOnKeyDownEvent((prev) => ({
      ctrlDown: e.ctrlKey,
      shiftDown: e.shiftKey,
      key: e.key.toLowerCase(),
      trigger: prev ? prev.trigger + 1 : 0,
    }));
  }, []);

  const [onKeyUpEvent, setOnKeyUpEvent] = useState<KeyEvent | null>(null);
  const onKeyUp: React.KeyboardEventHandler<HTMLDivElement> = useCallback((e) => {
    setOnKeyUpEvent((prev) => ({
      ctrlDown: e.ctrlKey,
      shiftDown: e.shiftKey,
      key: e.key.toLowerCase(),
      trigger: prev ? prev.trigger + 1 : 0,
    }));
  }, []);

  const [onPointerDownEvent, setOnPointerDownEvent] = useState<PointerEventPayload | null>(null);
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.currentTarget.focus();
      e.currentTarget.setPointerCapture(e.pointerId);

      const c = getCanvasPosition(e, pan);
      setOnPointerDownEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: e.button,
      }));
    },
    [pan],
  );

  const [onPointerMoveEvent, setOnPointerMoveEvent] = useState<PointerEventPayload | null>(null);
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);
      setOnPointerMoveEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: 0,
      }));
    },
    [pan],
  );

  const [onPointerUpEvent, setOnPointerUpEvent] = useState<PointerEventPayload | null>(null);
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      setOnPointerUpEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: e.button,
      }));
    },
    [pan],
  );

  const [onPointerLeaveEvent, setOnPointerLeaveEvent] = useState<PointerEventPayload | null>(null);
  const onPointerLeave: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);
      setOnPointerLeaveEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: 0,
      }));
    },
    [pan],
  );

  const [onPointerCancelEvent, setOnPointerCancelEvent] = useState<PointerEventPayload | null>(
    null,
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
      }));
      setOnPointerUpEvent((prev) => ({
        pos: c,
        trigger: prev ? prev.trigger + 1 : 0,
        mouseButton: 0,
      }));
    },
    [pan],
  );

  const [onScrollEvent, setOnScrollEvent] = useState<ScrollEvent | null>(null);
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
      cursorType,
      setCursorType,
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
      <div
        className={styles.mouseEvents}
        tabIndex={0}
        style={cursorType}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={onScroll}
      />
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
