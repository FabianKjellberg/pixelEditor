import styles from './ToolButton.module.css';

type ToolButtonProps = {
  icon: string;
};

const ToolButton = ({ icon }: ToolButtonProps) => {
  return (
    <>
      <button className={styles.toolButton}>{icon}</button>
    </>
  );
};

export default ToolButton;
