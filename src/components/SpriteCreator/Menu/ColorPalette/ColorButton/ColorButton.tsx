'use client';

import { Color } from '@/models/Tools/Color';

import styles from './ColorButton.module.css';
import { useCallback } from 'react';
import { useColorContext } from '@/context/ColorContext';

type ColorButtonProps = {
  hex: string;
  onClick: (hex: string, rightClick: boolean) => void;
  addRecent?: boolean;
};

const ColorButton = ({ hex, onClick, addRecent = true }: ColorButtonProps) => {
  const { addRecentColor } = useColorContext();

  const onLeftClick = useCallback(() => {
    if (addRecent) addRecentColor(hex);
    onClick(hex, false);
  }, [hex, addRecentColor, addRecent]);

  const onRightClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (addRecent) addRecentColor(hex);
      onClick(hex, true);
    },
    [hex, addRecentColor, addRecent],
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
