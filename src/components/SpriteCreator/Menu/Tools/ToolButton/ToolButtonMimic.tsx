'use client';

import styles from './ToolButton.module.css';
import { useCallback, useMemo } from 'react';
import Image from 'next/image';

type ToolButtonProps = {
  icon: string;
  onClickCallback: (index: number) => void;
  index: number;
  selectedIndex: number;
};

const ToolButtonMimic = ({ icon, onClickCallback, index, selectedIndex }: ToolButtonProps) => {
  const onContextmenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onClickCallback(index);
    },
    [onClickCallback, index],
  );

  const onClick = useCallback(() => {
    onClickCallback(index);
  }, [onClickCallback, index]);

  return (
    <>
      <button
        className={styles.toolButton}
        onClick={onClick}
        onContextMenu={onContextmenu}
        disabled={index === selectedIndex}
      >
        <Image alt="" src={icon} className={styles.icon} width={64} height={64} />
      </button>
    </>
  );
};

export default ToolButtonMimic;
