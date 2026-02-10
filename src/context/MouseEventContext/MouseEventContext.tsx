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

type MouseEventContextValue = {};

export type KeyEvent = {
  ctrlDown: boolean;
  trigger: number; //call this via dependency array
};

export type PointerEvent = {
  pos: Cordinate;
  trigger: number; //call this via dependency array
};

export type ScrollEvent = {
  deltaY: number;
  trigger: number; //call this via dependency array
};

const MouseEventContext = createContext<MouseEventContextValue | undefined>(undefined);

export const MouseEventContextProvider = ({ children }: { children: ReactNode }) => {
  const { pan } = useCanvasContext();

  const [cursorType, setCursorType] = useState<CSSProperties>({ cursor: 'pointer' });

  const [onKeyDownEvent, setOnKeyDownEvent] = useState<KeyEvent | null>(null);
  const onKeyDown = useCallback(() => {}, []);

  const [onKeyUpEvent, setOnKeyUpEvent] = useState<KeyEvent | null>(null);
  const onKeyUp = useCallback(() => {}, []);

  const [onPointerDownEvent, setOnPointerDownEvent] = useState<PointerEvent | null>(null);
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const c = getCanvasPosition(e, pan);

      setOnPointerDownEvent((prev) => ({ pos: c, trigger: prev ? prev.trigger + 1 : 0 }));
    },
    [pan, onPointerDownEvent, setOnPointerDownEvent],
  );

  const [onPointerMoveEvent, setOnPointerMoveEvent] = useState<PointerEvent | null>(null);
  const onPointerMove = useCallback(() => {}, []);

  const [onPointerUpEvent, setOnPointerUpEvent] = useState<PointerEvent | null>(null);
  const onPointerUp = useCallback(() => {}, []);

  const [onPointerLeaveEvent, setOnPointerLeaveEvent] = useState<PointerEvent | null>(null);
  const onPointerLeave = useCallback(() => {}, []);

  const [onScrollEvent, setOnScrollEvent] = useState<ScrollEvent | null>(null);
  const onScroll = useCallback(() => {}, []);

  const value = useMemo(() => ({}), []);

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
