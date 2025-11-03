import styles from './TopMenuItem.module.css';

type TopMenuItemProps = {
  text: string;
  onClick: () => void;
};

const TopMenuItem = ({ text, onClick }: TopMenuItemProps) => {
  return (
    <div className={styles.topMenuItem} onClick={() => onClick()}>
      {text}
    </div>
  );
};

export default TopMenuItem;
