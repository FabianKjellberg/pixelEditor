'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import styles from './ModalContext.module.css';

const defaultShowModal: boolean = false;

type ModalContextValue = {
  onShow: (content: React.ReactNode, headerString: string) => void;
  onHide: () => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [showModal, setShowModal] = useState<boolean>(defaultShowModal);
  const [content, setContent] = useState<React.ReactNode | undefined>(undefined);
  const [headerText, setHeaderText] = useState<string>('');

  const onShow = useCallback((content: React.ReactNode, headerString: string) => {
    setHeaderText(headerString);
    setContent(content);
    setShowModal(true);
  }, []);

  const onHide = useCallback(() => {
    setShowModal(false);
    setContent(undefined);
  }, [setContent, setShowModal]);

  const value = useMemo(() => ({ onShow, onHide }), [onShow, onHide]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {showModal && (
        <div className={styles.modalWrapper}>
          <div className={styles.modalContainer}>
            <div className={styles.headerContainer}>
              <p className={styles.headerText}>{headerText}</p>
              <button className={styles.closeButton} onClick={() => onHide()}>
                x
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('cant access this');
  }
  return ctx;
};
