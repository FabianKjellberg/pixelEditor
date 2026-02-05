'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { api } from '@/api/client';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { ProjectPreview } from '@/models/apiModels/projectModels';

import styles from './OpenProjectFromCloudModal.module.css';
import ProjectPreviewContent from './ProjectPreviewContent/ProjectPreviewContent';

const OpenProjectFromCloudModal = () => {
  const { onHide } = useModalContext();

  const onCancelCallback = useCallback(() => {
    onHide('open-from-cloud');
  }, []);

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <h2>Open saved project from the cloud</h2>
      </div>
      <div className={styles.previews}>
        <ProjectPreviewContent />
      </div>
      <div className={styles.footer}>
        <p>Total space used: 0/50MB</p>
        <div className={styles.buttons}>
          <button> open </button>
          <button onClick={onCancelCallback}> cancel</button>
        </div>
      </div>
    </div>
  );
};

export default OpenProjectFromCloudModal;

/* 

<div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        gap: '12px',
      }}
    >
      {!loading &&
        projects &&
        projects.map((project) => (
          <div key={project.id}>
            <p>{project.name}</p>
            {project.signedPreviewUrl ? (
              <img
                src={project.signedPreviewUrl}
                alt={project.name}
                width={128}
                height={128}
                style={{
                  imageRendering: 'pixelated',
                }}
              />
            ) : (
              <div style={{ width: 128, height: 128, background: '#eee' }} />
            )}
          </div>
        ))}

*/
