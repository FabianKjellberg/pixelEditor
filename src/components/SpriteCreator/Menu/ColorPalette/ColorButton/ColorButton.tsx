'use client';

import { Color } from '@/models/Tools/Color';

import styles from './ColorButton.module.css';
import { useCallback } from 'react';

type ColorButtonProps = {
  hex: string;
  onClick: (hex: string, rightClick: boolean) => void;
};

const ColorButton = ({ hex, onClick }: ColorButtonProps) => {
  const onLeftClick = useCallback(() => {
    onClick(hex, false);
  }, [hex]);
  const onRightClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      onClick(hex, true);
    },
    [hex],
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
