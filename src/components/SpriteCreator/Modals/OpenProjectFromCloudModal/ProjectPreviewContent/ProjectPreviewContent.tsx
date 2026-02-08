'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '@/api/client';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { ProjectPreview } from '@/models/apiModels/projectModels';

import styles from './ProjectPreviewContent.module.css';
import Loading from '@/components/Loading/Loading';
import SaveProjectToCloudModal from '../../SaveProjectToCloudModal/SaveProjectToCloudModal';
import ProjectPreviewCard from './ProjectPreviewCard/ProjectPreviewCard';
import { useCanvasContext } from '@/context/CanvasContext';

type ProjectPreviewContentProps = {
  selectedProject: ProjectPreview | null;
  setSelectedProject: (project: ProjectPreview | null) => void;
};

const ProjectPreviewContent = ({
  selectedProject,
  setSelectedProject,
}: ProjectPreviewContentProps) => {
  const { onShow, onHide } = useModalContext();
  const { projectId } = useCanvasContext();

  const createNewProjectModal = <SaveProjectToCloudModal />;

  const [projects, setProjects] = useState<ProjectPreview[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyProjects = async () => {
    try {
      const projectResponse = await api.project.getMyProjectPreviews();

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

  const onCardClick = useCallback(
    (index: number) => {
      const project =
        filteredProjects && filteredProjects.length - 1 >= index ? filteredProjects[index] : null;

      setSelectedProject(project);
    },
    [setSelectedProject, selectedProject, projects],
  );

  const filteredProjects = useMemo(
    () => (projects ? projects.filter((pr) => pr.id != projectId) : []),
    [projects, projectId],
  );

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
      {filteredProjects.map((project, index) => (
        <ProjectPreviewCard
          project={project}
          key={project.id}
          index={index}
          onCardClickCallback={onCardClick}
          selected={selectedProject ? selectedProject.id === project.id : false}
        />
      ))}
    </div>
  );
};

export default ProjectPreviewContent;
