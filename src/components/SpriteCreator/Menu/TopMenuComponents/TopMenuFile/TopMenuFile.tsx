'use client';

import TopMenuItem from '../TopMenuItem/TopMenuItem';
import styles from '../TopMenuItem/TopMenuItem.module.css';
import TopMenuNew from './TopMenuNew/TopMenuNew';
import TopMenuOpenFromCloud from './TopMenuOpenFromCloud/TopMenuOpenFromCloud';
import TopMenuSaveToCloud from './TopMenuSaveToCloud/TopMenuSaveToCloud';

const TopMenuFile = () => {
  return (
    <>
      <TopMenuNew />
      <div className={styles.topMenuItemBorder} />
      <TopMenuSaveToCloud />
      <div className={styles.topMenuItemBorder} />
      <TopMenuOpenFromCloud />
    </>
  );
};
export default TopMenuFile;
