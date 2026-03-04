'use client';

import { useUndoRedoContext } from '@/context/UndoRedoContext';
import menuStyles from './Menu.module.css';

const UndoRedoButtons = () => {
  const { undo, redo, canRedo, canUndo } = useUndoRedoContext();

  return (
    <div className={menuStyles.undoRedoMenuButtonContainer}>
      <button onClick={undo} disabled={!canUndo}>
        undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        redo
      </button>
    </div>
  );
};

export default UndoRedoButtons;
