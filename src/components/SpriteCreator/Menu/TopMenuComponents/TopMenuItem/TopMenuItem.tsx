import { useCallback } from 'react';
import styles from './TopMenuItem.module.css';

type TopMenuItemProps = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
};

const TopMenuItem = ({ text, onClick, disabled = false }: TopMenuItemProps) => {
  const handleOnClick = useCallback(() => {
    if (disabled) return;

    onClick();
  }, [disabled]);

  return (
    <div
      className={`${styles.topMenuItem} ${disabled ? styles.disabled : ''}`}
      onClick={handleOnClick}
    >
      {text}
    </div>
  );
};

export default TopMenuItem;
