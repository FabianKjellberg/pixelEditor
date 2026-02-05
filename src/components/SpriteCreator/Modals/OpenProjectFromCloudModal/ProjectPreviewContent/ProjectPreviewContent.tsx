'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { api } from '@/api/client';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { ProjectPreview } from '@/models/apiModels/projectModels';

import styles from './ProjectPreviewContent.module.css';
import Loading from '@/components/Loading/Loading';
import SaveProjectToCloudModal from '../../SaveProjectToCloudModal/SaveProjectToCloudModal';
import ProjectPreviewCard from './ProjectPreviewCard/ProjectPreviewCard';

const ProjectPreviewContent = () => {
  const { onShow, onHide } = useModalContext();
  const createNewProjectModal = <SaveProjectToCloudModal />;

  const [projects, setProjects] = useState<ProjectPreview[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyProjects = async () => {
    try {
      const projectResponse = await api.project.getMyProjectPreviews();
      console.log(projectResponse);

      setProjects(projectResponse ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const onCreateNewProjectClick = useCallback(() => {
    onShow('save-project-to-cloud', createNewProjectModal, 'Create new project');
    onHide('open-from-cloud');
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContent}>
        <Loading customText="Loading projects" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className={styles.loadingContent}>
        <h2>You have no saved projects</h2>
        <button onClick={onCreateNewProjectClick}>create new project</button>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      {projects.map((project) => (
        <ProjectPreviewCard project={project} key={project.id} />
      ))}
    </div>
  );
};

export default ProjectPreviewContent;
