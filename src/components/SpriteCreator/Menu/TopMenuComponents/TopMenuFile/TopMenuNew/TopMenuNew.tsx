'use client';

import { useCallback } from 'react';
import TopMenuItem from '../../TopMenuItem/TopMenuItem';
import { useAutoSaveContext } from '@/context/AutoSaveContext';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import NewProjectModal from '@/components/SpriteCreator/Modals/NewProjectModal/NewProjectModal';

const TopMenuNew = () => {
  const { dirty, isSaving } = useAutoSaveContext();
  const { onShow } = useModalContext();

  const newProjectModal = <NewProjectModal />;

  const onClick = useCallback(() => {
    onShow('new-project-modal', newProjectModal, 'Create new project');
  }, []);

  return (
    <>
      <TopMenuItem text={'New Project'} onClick={onClick} disabled={dirty || isSaving} />
    </>
  );
};

export default TopMenuNew;
