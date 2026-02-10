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

  onPointerDownEvent: PointerEvent | null;
  onPointerUpEvent: PointerEvent | null;
  onPointerMoveEvent: PointerEvent | null;
  onPointerLeaveEvent: PointerEvent | null;

  onScrollEvent: ScrollEvent | null;
};

export type KeyEvent = {
  ctrlDown: boolean;
  trigger: number; //call via useEffect
};

export type PointerEvent = {
  pos: Cordinate;
  trigger: number; //call via useEffect
};

export type ScrollEvent = {
  deltaY: number;
  pos: Cordinate;
  trigger: number; //call via useEffect
};

const MouseEventContext = createContext<MouseEventContextValue | undefined>(undefined);

export const MouseEventContextProvider = ({ children }: { children: ReactNode }) => {
  const { pan } = useCanvasContext();

  const [cursorType, setCursorType] = useState<CSSProperties>({ cursor: 'pointer' });

  const [onKeyDownEvent, setOnKeyDownEvent] = useState<KeyEvent | null>(null);
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (c) => {
      setOnKeyDownEvent((prev) => ({
        ctrlDown: c.ctrlKey ? true : false,
        trigger: prev ? prev.trigger + 1 : 0,
      }));
    },
    [onKeyDownEvent, setOnKeyDownEvent],
  );

  const [onKeyUpEvent, setOnKeyUpEvent] = useState<KeyEvent | null>(null);
  const onKeyUp: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (c) => {
      setOnKeyUpEvent((prev) => ({
        ctrlDown: c.ctrlKey ? true : false,
        trigger: prev ? prev.trigger + 1 : 0,
      }));
    },
    [onKeyUpEvent, setOnKeyUpEvent],
  );

  const [onPointerDownEvent, setOnPointerDownEvent] = useState<PointerEvent | null>(null);
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      setOnPointerDownEvent((prev) => ({ pos: c, trigger: prev ? prev.trigger + 1 : 0 }));
    },
    [pan, onPointerDownEvent, setOnPointerDownEvent],
  );

  const [onPointerMoveEvent, setOnPointerMoveEvent] = useState<PointerEvent | null>(null);
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      setOnPointerMoveEvent((prev) => ({ pos: c, trigger: prev ? prev.trigger + 1 : 0 }));
    },
    [pan, onPointerMoveEvent, setOnPointerMoveEvent],
  );

  const [onPointerUpEvent, setOnPointerUpEvent] = useState<PointerEvent | null>(null);
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      setOnPointerUpEvent((prev) => ({ pos: c, trigger: prev ? prev.trigger + 1 : 0 }));
    },
    [pan, onPointerUpEvent, setOnPointerUpEvent],
  );

  const [onPointerLeaveEvent, setOnPointerLeaveEvent] = useState<PointerEvent | null>(null);
  const onPointerLeave: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      setOnPointerLeaveEvent((prev) => ({ pos: c, trigger: prev ? prev.trigger + 1 : 0 }));
    },
    [pan, onPointerLeaveEvent, setOnPointerLeaveEvent],
  );

  const [onScrollEvent, setOnScrollEvent] = useState<ScrollEvent | null>(null);
  const onScroll: React.WheelEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.stopPropagation();

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setOnScrollEvent((prev) => ({
        deltaY: e.deltaY,
        trigger: prev ? prev.trigger + 1 : 0,
        pos: { x, y },
      }));
    },
    [onScrollEvent, setOnScrollEvent],
  );

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
        onPointerEnter={(e) => e.currentTarget.focus()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={onScroll}
        onScroll={(e) => {
          e.preventDefault();
        }}
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
