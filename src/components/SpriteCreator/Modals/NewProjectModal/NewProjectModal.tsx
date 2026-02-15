'use client';

import React, { useCallback, useMemo, useState } from 'react';

import styles from './NewProjectModal.module.css';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { useLayerContext } from '@/context/LayerContext';
import { useAutoSaveContext } from '@/context/AutoSaveContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { useUserContext } from '@/context/UserContextProvider';
import { api } from '@/api/client';
import { makeBlob, uploadBlob } from '@/util/BlobUtil';
import { createLayer, createLayerEntity } from '@/util/LayerUtil';
import Checkbox from '@/components/Checkbox/Checkbox';
import Loading from '@/components/Loading/Loading';

const NewProjectModal = () => {
  const { onHide } = useModalContext();
  const { setDimensions, setIsLoadedFromCloud, setProjectId, requestPreview, setProjectName } =
    useCanvasContext();
  const { resetToBlankProject } = useLayerContext();
  const { dirty, isSaving } = useAutoSaveContext();
  const { user } = useUserContext();

  const [canvasWidth, setCanvasWidth] = useState<string>('64');
  const [canvasHeight, setCanvasHeight] = useState<string>('64');
  const [canvasName, setCanvasName] = useState<string>('Untitled');
  const [syncToCloud, setSyncToCloud] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  const onChangeWidth = (raw: string, { min = 1, max = Number.POSITIVE_INFINITY } = {}) => {
    if (raw.trim() === '') {
      setCanvasWidth('');
      return;
    }
    if (raw.length > 4) return;

    const normalized = raw.replace(',', '.');
    const num = Number(normalized);

    if (!Number.isFinite(num)) return;

    const whole = Math.floor(num);

    const clamped = Math.min(Math.max(whole, min), max);

    setCanvasWidth(clamped.toString());
  };
  const onChangeHeight = (raw: string, { min = 1, max = Number.POSITIVE_INFINITY } = {}) => {
    if (raw.trim() === '') {
      setCanvasHeight('');
      return;
    }
    if (raw.length > 4) return;

    const normalized = raw.replace(',', '.');
    const num = Number(normalized);

    if (!Number.isFinite(num)) return;

    const whole = Math.floor(num);

    const clamped = Math.min(Math.max(whole, min), max);

    setCanvasHeight(clamped.toString());
  };

  const onChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCanvasName(e.target.value);
    },
    [canvasName],
  );

  const createNewProject = useCallback(async () => {
    const w = Number(canvasWidth);
    const h = Number(canvasHeight);
    if (!(w > 0 && h > 0)) return;

    setCreating(true);
    try {
      if (syncToCloud && user) {
        const newProjectId = crypto.randomUUID();
        const layer = createLayer({ x: 0, y: 0, width: w, height: h });
        const layerEntity = createLayerEntity('Layer 1', crypto.randomUUID(), layer);

        const urls = await api.project.createProject(newProjectId, canvasName || 'Untitled', w, h, [
          layerEntity,
        ]);
        if (!urls) {
          console.error('Failed to create project');
          return;
        }

        setProjectName(canvasName);
        setProjectId(newProjectId);
        setDimensions(w, h);
        resetToBlankProject(w, h, [layerEntity]);
        setIsLoadedFromCloud(true);

        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => requestAnimationFrame(r));

        const previewBlob = await requestPreview();
        const previewOk = await uploadBlob(
          {
            url: urls.preview.uploadUrl,
            headers: urls.preview.headers,
            expiration: urls.expiration,
          },
          previewBlob,
        );
        const layerOk = await uploadBlob(
          {
            url: urls.layers[0].uploadUrl,
            headers: urls.layers[0].headers,
            expiration: urls.expiration,
          },
          makeBlob(layerEntity.layer.pixels),
        );
        if (!previewOk || !layerOk) {
          console.error('Failed to upload project assets');
        }
      } else {
        setProjectId(crypto.randomUUID());
        setDimensions(w, h);
        resetToBlankProject(w, h);
        setIsLoadedFromCloud(false);
      }
      onHide('new-project-modal');
    } finally {
      setCreating(false);
    }
  }, [
    canvasWidth,
    canvasHeight,
    canvasName,
    syncToCloud,
    user,
    setProjectId,
    setDimensions,
    resetToBlankProject,
    setIsLoadedFromCloud,
    requestPreview,
    onHide,
  ]);

  const disabled = useMemo((): boolean => {
    const w: number = Number(canvasWidth);
    const h: number = Number(canvasHeight);

    return !(w > 0 && h > 0) || isSaving || dirty || creating;
  }, [canvasHeight, canvasWidth, isSaving, dirty, creating]);

  return (
    <>
      <div className={styles.changeCanvasSizeContainer}>
        <p>
          * Make sure that you save or sync your unsaved changes in your currently opened project
          before proceeding
        </p>
        <div className={styles.inputContainer}>
          <p>Project name:</p>
          <div className={styles.inputInput}>
            <input
              value={canvasName}
              type="text"
              onChange={onChangeName}
              className={styles.inputInputInput}
            />
          </div>

          <p>Width:</p>
          <div className={styles.inputInput}>
            <input
              value={canvasWidth}
              type="number"
              min={1}
              max={1024}
              step={1}
              onChange={(e) => onChangeWidth(e.target.value, { min: 1, max: 1024 })}
              className={styles.inputInputInput}
            />
            <p>px</p>
          </div>
          <p>Height:</p>
          <div className={styles.inputInput}>
            <input
              value={canvasHeight}
              type="number"
              min={1}
              max={1024}
              step={1}
              onChange={(e) => onChangeHeight(e.target.value, { min: 1, max: 1024 })}
              className={styles.inputInputInput}
            />
            <p>px</p>
          </div>
          <Checkbox
            label="Sync to cloud when creating"
            checked={syncToCloud}
            onChange={setSyncToCloud}
            disabled={!user}
          />
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={createNewProject} className={styles.confirmButton} disabled={disabled}>
            {creating ? <Loading withText={false} size={14} /> : 'create'}
          </button>
          <button onClick={() => onHide('new-project-modal')} disabled={creating}>
            cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default NewProjectModal;
