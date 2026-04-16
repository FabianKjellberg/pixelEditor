'use client';

import { Color } from '@/models/Tools/Color';

import styles from './ColorButton.module.css';
import { useCallback } from 'react';
import { useColorContext } from '@/context/ColorContext';

type ColorButtonProps = {
  hex: string;
  onClick: (hex: string, rightClick: boolean) => void;
};

const ColorButton = ({ hex, onClick }: ColorButtonProps) => {
  const { addRecentColor } = useColorContext();

  const onLeftClick = useCallback(() => {
    addRecentColor(hex);
    onClick(hex, false);
  }, [hex, addRecentColor]);
  const onRightClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      addRecentColor(hex);
      onClick(hex, true);
    },
    [hex, addRecentColor],
  );

  return (
    <button
      onContextMenu={onRightClick}
      onClick={onLeftClick}
      className={styles.button}
      style={{ backgroundColor: hex }}
    />
  );
};

export default ColorButton;
