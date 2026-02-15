'use client';

import React, { useCallback, useMemo, useState } from 'react';

import styles from './SaveProjectToCloudModal.module.css';
import { useLayerContext } from '@/context/LayerContext';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { api } from '@/api/client';
import { useCanvasContext } from '@/context/CanvasContext';
import { makeBlob, uploadBlob } from '@/util/BlobUtil';
import { useToastContext } from '@/context/ToastContext/ToastContext';
import Loading from '@/components/Loading/Loading';

const SaveProjectToCloudModal = () => {
  const { allLayers } = useLayerContext();
  const { projectId, width, height, setIsLoadedFromCloud, requestPreview, setProjectName } =
    useCanvasContext();
  const { onHide } = useModalContext();
  const { onToast } = useToastContext();

  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const emptyName = useMemo(() => name === '', [name]);

  const onChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    [name],
  );

  const onClickSave = useCallback(async () => {
    try {
      setLoading(true);

      const urls = await api.project.createProject(projectId, name, width, height, allLayers);
      const previewBlob = await requestPreview();

      if (!urls) {
        console.error('failed to create project');
      } else {
        const preview: Promise<boolean> = uploadBlob(
          {
            url: urls.preview.uploadUrl,
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
                url: layer.uploadUrl,
                headers: layer.headers,
                expiration: urls.expiration,
              },
              layerBlob,
            );
          }),
        );

        const previewSuccess = await preview;

        onToast(name + ' is now synced, and will save automatically', 'success');
        setIsLoadedFromCloud(true);
        setProjectName(name);
        onHide('save-project-to-cloud');
        //TODO! implement refetching if upload fails, flag for not successfull saves of layers etc
      }
    } finally {
      setLoading(false);
    }
  }, [allLayers, name, setIsLoadedFromCloud]);

  const onClickCancel = useCallback(() => {
    onHide('save-project-to-cloud');
  }, []);

  return (
    <div className={styles.modalContent}>
      <h2 className={styles.title}>Save project to cloud</h2>
      <p className={styles.description}>
        Syncing saves your project to your account. You can open it again anytime from &quot;Open
        from cloud&quot;. Your canvas, layers, and pixels are stored safely.
      </p>
      <div className={styles.breakLine} />
      <p>Enter the name of your project</p>
      <input value={name} onChange={onChangeName} />

      <div className={styles.buttonContainer}>
        <button
          disabled={emptyName || loading}
          onClick={onClickSave}
          className={styles.loadingButton}
        >
          {loading ? <Loading withText={false} size={14} /> : <>Save</>}
        </button>
        <button onClick={onClickCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default SaveProjectToCloudModal;
