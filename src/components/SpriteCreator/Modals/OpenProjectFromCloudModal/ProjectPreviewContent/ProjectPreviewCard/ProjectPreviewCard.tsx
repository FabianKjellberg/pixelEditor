'use client';

import React, { useCallback, useMemo } from 'react';
import styles from './ProjectPreviewCard.module.css';
import { ProjectPreview } from '@/models/apiModels/projectModels';

type ProjectPreviewCardProps = {
  project: ProjectPreview;
  index: number;
  onCardClickCallback: (index: number) => void;
  selected: boolean;
};

const ProjectPreviewCard = ({
  project,
  index,
  onCardClickCallback,
  selected,
}: ProjectPreviewCardProps) => {
  const onCardClick = useCallback(() => {
    onCardClickCallback(index);
  }, []);

  const lastAccessed: Date = useMemo(
    () => new Date(project.latestActivity ? project.latestActivity : project.createdAt),
    [project.createdAt, project.latestActivity],
  );

  return (
    <div className={styles.card}>
      <p className={styles.projectTitle} title={project.name}>
        {project.name}
      </p>
      <div
        className={`${styles.image} ${styles.checkerBackground} ${selected ? styles.selected : ''}`}
        onClick={onCardClick}
      >
        <img
          src={project.signedPreviewUrl}
          alt={project.name}
          width={128}
          height={128}
          className={styles.previewImg}
          draggable={false}
        />
      </div>
      <p className={styles.lastAccessed} title={project.name}>
        Accessed: {lastAccessed.toLocaleDateString()}
      </p>
    </div>
  );
};

export default ProjectPreviewCard;
