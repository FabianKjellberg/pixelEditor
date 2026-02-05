'use client';

import React, { useCallback } from 'react';
import styles from './ProjectPreviewCard.module.css';
import { ProjectPreview } from '@/models/apiModels/projectModels';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';

type ProjectPreviewCardProps = {
  project: ProjectPreview;
};

const ProjectPreviewCard = ({ project }: ProjectPreviewCardProps) => {
  //const { onShow, onHide } = useContextMenuContext();

  return (
    <div className={styles.card}>
      <div className={`${styles.image} ${styles.checkerBackground}`}>
        <img
          src={project.signedPreviewUrl}
          alt={project.name}
          width={128}
          height={128}
          className={styles.previewImg}
          draggable={false}
        />
      </div>

      <p className={styles.projectTitle} title={project.name}>
        {project.name}
      </p>
    </div>
  );
};

export default ProjectPreviewCard;
