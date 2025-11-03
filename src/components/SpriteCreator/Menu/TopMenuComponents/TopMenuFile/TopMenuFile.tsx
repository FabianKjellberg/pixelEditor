'use client';

import TopMenuItem from '../TopMenuItem/TopMenuItem';
import styles from '../TopMenuItem/TopMenuItem.module.css';

const TopMenuFile = () => {
  return (
    <>
      <TopMenuItem text={'Save as .pxl'} onClick={() => console.log('clicked save as png')} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Open .pxl file'} onClick={() => console.log('clicked save as png')} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Export to .png'} onClick={() => console.log('clicked save as png')} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem
        text={'Import .png as Layer'}
        onClick={() => console.log('clicked save as png')}
      />
    </>
  );
};
export default TopMenuFile;
