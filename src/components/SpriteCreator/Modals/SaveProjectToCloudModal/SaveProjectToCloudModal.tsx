'use client';

import React, { useCallback, useMemo, useState } from 'react';

import styles from './SaveProjectToCloudModal.module.css';
import { useLayerContext } from '@/context/LayerContext';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { api } from '@/api/client';
import { useCanvasContext } from '@/context/CanvasContext';
import { makeBlob, uploadBlob } from '@/util/BlobUtil';

const SaveProjectToCloudModal = () => {
  const { allLayers, requestPreview } = useLayerContext();
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
    const previewBlob = await requestPreview();

    if (!urls) {
      console.error('failed to create project');
    } else {
      const preview: Promise<boolean> = uploadBlob(
        {
          uploadUrl: urls.preview.uploadUrl,
          headers: urls.preview.headers,
          expiration: urls.expiration,
        },
        previewBlob,
      );

      const layers: boolean[] = await Promise.all(
        urls.layers.map(async (layer) => {
          const layerBlob = makeBlob(
            allLayers.find((al) => al.id === layer.layerId)?.layer.pixels || new Uint32Array(),
          );

          return uploadBlob(
            {
              uploadUrl: layer.uploadUrl,
              headers: layer.headers,
              expiration: urls.expiration,
            },
            layerBlob,
          );
        }),
      );

      const previewSuccess = await preview;

      //TODO! implement refetching if upload fails, flag for not successfull saves of layers etc
    }
  }, [allLayers, name]);

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
