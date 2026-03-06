import styles from './LayerContext.module.css';

const LayerLayerContext = () => {
  return (
    <div className={styles.layout}>
      <p className={styles.category}>Layer</p>
      <div className={styles.border} />
      <button>Duplicate</button>
      <div className={styles.border} />
      <button>Merge down</button>
      <div className={styles.border} />
      <button>Merge selected</button>
    </div>
  );
};

export default LayerLayerContext;
