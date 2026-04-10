import styles from './ChevronButton.module.css';

type ChevronButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  collapsed: boolean;
};

const ChevronButton = ({ onClick, disabled = false, collapsed }: ChevronButtonProps) => {
  return (
    <button className={styles.chevronButton} onClick={onClick} disabled={disabled}>
      <img
        src="/icons/chevron.png"
        width={8}
        height={8}
        alt="folder"
        className={`${styles.buttonIcon} ${collapsed || disabled ? styles.rotatedChevron : ''}`}
      />
    </button>
  );
};

export default ChevronButton;
