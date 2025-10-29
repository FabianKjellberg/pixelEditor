'use client';

import {
  createContext,
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './ContextMenuContext.module.css';

const defaultShowContextMenu: boolean = false;
const defaultPosition: CSSProperties = { top: 0, left: 0 };

type ContextMenuContextValue = {
  onShow: (menuToShow: React.ReactNode, atX: number, atY: number) => void;
  onHide: () => void;
};

const ContextMenuContext = createContext<ContextMenuContextValue | undefined>(undefined);

export const ContextMenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [showMenu, setShowMenu] = useState<boolean>(defaultShowContextMenu);
  const [menu, setMenu] = useState<React.ReactNode | null>(null);
  const [position, setPosition] = useState<CSSProperties>(defaultPosition);
  const menuRef = useRef<HTMLDivElement>(null);

  const onShow = useCallback(
    (menuToShow: React.ReactNode, atX: number, atY: number) => {
      setMenu(menuToShow);
      setPosition({ left: atX, top: atY });
      setShowMenu(true);
    },
    [setMenu, setShowMenu],
  );
  const onHide = useCallback(() => {
    setMenu(null);
    setPosition(defaultPosition);
    setShowMenu(false);
  }, [setMenu, setShowMenu]);

  useEffect(() => {
    if (showMenu) {
      // Focus after paint to ensure the node exists
      requestAnimationFrame(() => menuRef.current?.focus({ preventScroll: true }));
    }
  }, [showMenu]);

  // Close on click-outside and on Escape
  useEffect(() => {
    if (!showMenu) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onHide();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onHide();
    };

    // Use capture so it runs before focus changes
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu, onHide]);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (!menuRef.current?.contains(next)) {
      onHide();
    }
  };

  const value = useMemo(() => ({ onShow, onHide }), [onShow, onHide]);

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
      {showMenu && (
        <div
          ref={menuRef}
          tabIndex={-1}
          role="menu"
          className={styles.contextMenuContainer}
          style={position}
          onBlur={handleBlur}
        >
          {menu}
        </div>
      )}
    </ContextMenuContext.Provider>
  );
};

export const useContextMenuContext = () => {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error('cant access this');
  }
  return ctx;
};
