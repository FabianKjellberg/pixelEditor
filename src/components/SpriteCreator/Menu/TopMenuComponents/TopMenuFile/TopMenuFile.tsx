'use client';

import TopMenuItem from '../TopMenuItem/TopMenuItem';
import styles from '../TopMenuItem/TopMenuItem.module.css';
import TopMenuOpenFromCloud from './TopMenuOpenFromCloud/TopMenuOpenFromCloud';
import TopMenuSaveToCloud from './TopMenuSaveToCloud/TopMenuSaveToCloud';

const TopMenuFile = () => {
  return (
    <>
      <TopMenuSaveToCloud />
      <div className={styles.topMenuItemBorder} />
      <TopMenuOpenFromCloud />
    </>
  );
};
export default TopMenuFile;
