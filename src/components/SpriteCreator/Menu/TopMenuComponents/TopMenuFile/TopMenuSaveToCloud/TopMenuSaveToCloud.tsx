'use client';

import React, { useCallback, useEffect, useState } from 'react';

import topMenuStyle from '../../TopMenuItem/TopMenuItem.module.css';
import TopMenuItem from '../../TopMenuItem/TopMenuItem';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import SaveProjectToCloudModal from '@/components/SpriteCreator/Modals/SaveProjectToCloudModal/SaveProjectToCloudModal';
import { useUserContext } from '@/context/UserContextProvider';
import LoginModalContent from '../../../../Modals/LoginModalContent/LoginModalContent';
import { useCanvasContext } from '@/context/CanvasContext';
import { useToastContext } from '@/context/ToastContext/ToastContext';

const TopMenuSaveToCloud = () => {
  const { isLoadedFromCloud } = useCanvasContext();
  const { onShow } = useModalContext();
  const { onToast } = useToastContext();
  const { user, loadingUser } = useUserContext();

  const saveProjectToCloudModal = <SaveProjectToCloudModal />;

  const openSave = useCallback(() => {
    onShow('save-project-to-cloud', saveProjectToCloudModal, 'Sync to the cloud');
  }, [saveProjectToCloudModal, onShow]);

  const loginModal = <LoginModalContent onLoginCallback={openSave} />;

  const handleClickSaveProject = useCallback(() => {
    if (!user) {
      onShow('login-modal', loginModal, 'Login to save your project');
      return;
    }

    if (isLoadedFromCloud) {
      onToast('This project is already synced, no need to save it', 'warning');
      return;
    }

    onShow('save-project-to-cloud', saveProjectToCloudModal, 'Save to the cloud');
  }, [user, isLoadedFromCloud, onShow, loginModal, saveProjectToCloudModal]);

  return (
    <>
      <TopMenuItem
        text={'Sync Project to Cloud'}
        onClick={handleClickSaveProject}
        disabled={loadingUser}
      />
    </>
  );
};

export default TopMenuSaveToCloud;
