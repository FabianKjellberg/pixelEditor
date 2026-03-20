import { useModalContext } from '@/context/ModalContext/ModalContext';
import { useCallback } from 'react';

import styles from './ConfirmationModal.module.css';

type ConfirmationModalProps = {
  id: string;
  callbackFunction: () => void;
  text: string;
};

const ConfirmationModal = ({ id, callbackFunction, text }: ConfirmationModalProps) => {
  const { onHide } = useModalContext();

  const onCancelCallback = useCallback(() => {
    onHide(id);
  }, [id, onHide]);

  const onConfirmCallback = useCallback(() => {
    callbackFunction();
    onHide(id);
  }, [callbackFunction, id, onHide]);

  const warningText = 'This action cannot be undone';

  return (
    <div className={styles.layout}>
      <div className={styles.warning}>
        <img src="/icons/redWarning.png" width={32} height={32} alt="Warning" />
        <div>
          <p className={styles.text}>{text}</p>
          <p className={styles.description}>{warningText}</p>
        </div>
      </div>

      <div className={styles.buttons}>
        <button className={styles.confirm} onClick={onConfirmCallback}>
          Delete
        </button>

        <button className={styles.cancel} onClick={onCancelCallback}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
