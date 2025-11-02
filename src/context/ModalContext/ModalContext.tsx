'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type CSSProperties,
} from 'react';
import styles from './ModalContext.module.css';

export type ModalData = {
  id: string;
  headerText: string;
  content: React.ReactNode;
  position: CSSProperties;
  ref: React.RefObject<HTMLDivElement>;
};

type ModalContextValue = {
  onShow: (id: string, content: React.ReactNode, header: string) => void;
  onHide: (id: string) => void;
  onHideAll: () => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modals, setModals] = useState<ModalData[]>([]);

  // --- Open a modal ---
  const onShow = useCallback((id: string, content: React.ReactNode, header: string) => {
    setModals((prev) => {
      const alreadyExist = prev.some((modal) => modal.id === id);
      if (alreadyExist) return prev;

      const modalRef = { current: null } as unknown as React.RefObject<HTMLDivElement>;
      const newModal: ModalData = {
        id: id,
        headerText: header,
        content,
        position: { left: 0, top: 0, visibility: 'hidden' },
        ref: modalRef,
      };
      return [...prev, newModal];
    });
  }, []);

  const onHide = useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const onHideAll = useCallback(() => {
    setModals([]);
  }, []);

  const value = useMemo(() => ({ onShow, onHide, onHideAll }), [onShow, onHide, onHideAll]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.map((modal) => (
        <DraggableModal key={modal.id} modal={modal} onClose={() => onHide(modal.id)} />
      ))}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('cant access this');
  return ctx;
};

// -------------------
// Draggable modal component
// -------------------

function DraggableModal({ modal, onClose }: { modal: ModalData; onClose: () => void }) {
  const [position, setPosition] = useState<CSSProperties>(modal.position);
  const dragging = useRef(false);
  const grabOffset = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    if ((Number(position.left) || 0) !== 0 || (Number(position.top) || 0) !== 0) return;
    const el = modal.ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const left = Math.max(16, (window.innerWidth - r.width) / 2);
      const top = Math.max(16, (window.innerHeight - r.height) / 2);
      setPosition({ left, top, zIndex: 10000 });
    });
    return () => cancelAnimationFrame(id);
  }, [modal.ref, position.left, position.top]);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const left = Number(position.left) || 0;
    const top = Number(position.top) || 0;
    grabOffset.current = { dx: e.clientX - left, dy: e.clientY - top };
    e.preventDefault();
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current) return;
    const { dx, dy } = grabOffset.current;
    const w = modal.ref.current?.offsetWidth ?? 0;
    const h = modal.ref.current?.offsetHeight ?? 0;
    const pad = 8;
    let left = e.clientX - dx;
    let top = e.clientY - dy;
    left = Math.min(window.innerWidth - pad, Math.max(pad - (w - 1), left));
    top = Math.min(window.innerHeight - pad, Math.max(pad - (h - 1), top));
    setPosition({ left, top });
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={styles.modalWrapper}>
      <div ref={modal.ref} className={styles.modalContainer} style={{ ...position }}>
        <div className={styles.headerContainer}>
          <div
            className={styles.headerTextContainer}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <p className={styles.headerText}>{modal.headerText}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <p>x</p>
          </button>
        </div>
        {modal.content}
      </div>
    </div>
  );
}
