'use client';

import { useCallback } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import styles from '../TopMenuItem/TopMenuItem.module.css';
import TopMenuNew from './TopMenuNew/TopMenuNew';
import TopMenuOpenFromCloud from './TopMenuOpenFromCloud/TopMenuOpenFromCloud';
import TopMenuSaveToCloud from './TopMenuSaveToCloud/TopMenuSaveToCloud';
import { useCanvasContext } from '@/context/CanvasContext';

const TopMenuFile = () => {
  const { downloadPng } = useCanvasContext();

  const saveAsPNGOnClick = useCallback(() => {
    downloadPng();
  }, []);

  return (
    <>
      <TopMenuNew />
      <div className={styles.topMenuItemBorder} />
      <TopMenuSaveToCloud />
      <div className={styles.topMenuItemBorder} />
      <TopMenuOpenFromCloud />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Export as PNG'} onClick={saveAsPNGOnClick} />
    </>
  );
};
export default TopMenuFile;
