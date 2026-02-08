'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { useModalContext } from '@/context/ModalContext/ModalContext';
import { ProjectPreview } from '@/models/apiModels/projectModels';

import styles from './OpenProjectFromCloudModal.module.css';
import ProjectPreviewContent from './ProjectPreviewContent/ProjectPreviewContent';
import Loading from '@/components/Loading/Loading';
import { api } from '@/api/client';
import { useCanvasContext } from '@/context/CanvasContext';
import { useLayerContext } from '@/context/LayerContext';
import { useAutoSaveContext } from '@/context/AutoSaveContext';

const OpenProjectFromCloudModal = () => {
  const { onHide } = useModalContext();
  const { loadProject } = useCanvasContext();
  const { loadLayers } = useLayerContext();
  const { dirty, isSaving } = useAutoSaveContext();

  const [selectedProject, setSelectedProject] = useState<ProjectPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const onCancelCallback = useCallback(() => {
    onHide('open-from-cloud');
  }, []);

  const onOpenCallback = useCallback(async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);

      const response = await api.project.getProject(selectedProject.id);

      if (!response) {
        console.log('failed retriving project');
        return;
      }

      loadProject(response.project);
      await loadLayers(response.layers);

      onHide('open-from-cloud');
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  const disableOpen = useMemo(
    () => !selectedProject || loading || dirty || isSaving,
    [selectedProject, loading, dirty, isSaving],
  );

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <h2>Open saved project from the cloud</h2>
      </div>
      <div className={styles.previews}>
        <ProjectPreviewContent
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      </div>

      <div className={styles.buttons}>
        {isSaving ||
          (dirty && <Loading customText="wait for project to finish syncing" size={18} />)}
        <button disabled={disableOpen} onClick={onOpenCallback} className={styles.openButton}>
          {loading ? <Loading withText={false} size={14} /> : <>open</>}
        </button>
        <button onClick={onCancelCallback}> Cancel</button>
      </div>
    </div>
  );
};

export default OpenProjectFromCloudModal;
