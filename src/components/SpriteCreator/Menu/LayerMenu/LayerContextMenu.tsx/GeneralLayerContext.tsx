import { LayerEntity, LayerGroupStart } from '@/models/Layer';

import styles from './LayerContext.module.css';

type GeneralLayerContextProps = {
  editNameTrigger: () => void;
  addLayerBelowTrigger: () => void;
  addGroupBelowTrigger: () => void;
  deleteTrigger: () => void;
  deleteDisabled: boolean;
};

const GeneralLayerContext = ({
  editNameTrigger,
  addLayerBelowTrigger,
  addGroupBelowTrigger,
  deleteTrigger,
  deleteDisabled,
}: GeneralLayerContextProps) => {
  return (
    <div className={styles.layout}>
      <p className={styles.category}>General</p>
      <div className={styles.border} />
      <button onClick={editNameTrigger}>Edit name</button>
      <div className={styles.border} />
      <button onClick={addLayerBelowTrigger}>Add layer below</button>
      <div className={styles.border} />
      <button onClick={addGroupBelowTrigger}>Add group below</button>
      <div className={styles.border} />
      <button onClick={deleteTrigger} disabled={deleteDisabled}>
        Delete
      </button>
      <div className={styles.border} />
    </div>
  );
};

export default GeneralLayerContext;
