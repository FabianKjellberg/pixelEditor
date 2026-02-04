'use client';

import React, { useCallback, useMemo, useState } from 'react';

import styles from './SaveProjectToCloudModal.module.css';
import { useLayerContext } from '@/context/LayerContext';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { api } from '@/api/client';
import { useCanvasContext } from '@/context/CanvasContext';

const SaveProjectToCloudModal = () => {
  const { allLayers } = useLayerContext();
  const { projectId, width, height } = useCanvasContext();
  const { onHide } = useModalContext();

  const [name, setName] = useState<string>('');

  const emptyName = useMemo(() => name === '', [name]);

  const onChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    [name],
  );

  const onClickSave = useCallback(async () => {
    const urls = await api.project.createProject(projectId, name, width, height, allLayers);

    console.log(allLayers);
  }, [allLayers]);

  const onClickCancel = useCallback(() => {
    onHide('save-project-to-cloud');
  }, []);

  return (
    <div className={styles.modalContent}>
      <p>Enter the name of your project</p>
      <input value={name} onChange={onChangeName} />

      <div className={styles.buttonContainer}>
        <button disabled={emptyName} onClick={onClickSave}>
          Save
        </button>
        <button onClick={onClickCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default SaveProjectToCloudModal;
