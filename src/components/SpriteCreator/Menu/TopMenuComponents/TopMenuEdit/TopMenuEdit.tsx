'use client';

import { useUndoRedoContext } from '@/context/UndoRedoContext';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import styles from '../TopMenuItem/TopMenuItem.module.css';
const TopMenuEdit = () => {
  const { canUndo, canRedo, undo, redo } = useUndoRedoContext();

  return (
    <>
      <TopMenuItem text={'Undo (ctrl + z)'} disabled={!canUndo} onClick={undo} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Redo (ctrl + shift + z)'} disabled={!canRedo} onClick={redo} />
    </>
  );
};
export default TopMenuEdit;
