'use client';

import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import styles from './TopMenuButton.module.css';
import { useRef } from 'react';

type TopMenuButtonItemProps = {
  label: string;
  contextMenu: React.ReactNode;
};

const TopMenuButtonItem = ({ label, contextMenu }: TopMenuButtonItemProps) => {
  const { onShow } = useContextMenuContext();
  const divRef = useRef<HTMLDivElement | null>(null);

  const showContextMenu = () => {
    const el = divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onShow(contextMenu, rect.x, rect.y + rect.height);
  };

  return (
    <>
      <div ref={divRef} className={styles.TopMenuButton} onClick={() => showContextMenu()}>
        {label}
      </div>
    </>
  );
};
export default TopMenuButtonItem;
