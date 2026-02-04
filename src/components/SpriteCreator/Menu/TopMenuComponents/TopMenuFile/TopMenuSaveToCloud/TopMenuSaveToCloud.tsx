'use client';

import React, { useCallback, useEffect, useState } from 'react';

import topMenuStyle from '../../TopMenuItem/TopMenuItem.module.css';
import TopMenuItem from '../../TopMenuItem/TopMenuItem';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import SaveProjectToCloudModal from '@/components/SpriteCreator/Modals/SaveProjectToCloudModal/SaveProjectToCloudModal';
import { useUserContext } from '@/context/UserContextProvider';
import LoginModalContent from '../../TopMenuLogin/LoginModalContent/LoginModalContent';

const TopMenuSaveToCloud = () => {
  const [IsLoadedFromCloud, setIsLoadedFromCloud] = useState<boolean>(false);

  const { onShow } = useModalContext();
  const { user } = useUserContext();

  const saveProjectToCloudModal = <SaveProjectToCloudModal />;

  const openSave = useCallback(() => {
    onShow('save-project-to-cloud', saveProjectToCloudModal, 'Save to the cloud');
  }, [user, saveProjectToCloudModal, onShow]);

  const loginModal = <LoginModalContent onLoginCallback={openSave} />;

  const handleClickSaveProject = useCallback(() => {
    if (!user) {
      onShow('login-modal', loginModal, 'Login to save your project');
      return;
    }

    if (IsLoadedFromCloud) {
      return;
    }

    onShow('save-project-to-cloud', saveProjectToCloudModal, 'Save to the cloud');
  }, [user, IsLoadedFromCloud, onShow, loginModal, saveProjectToCloudModal]);

  return (
    <>
      <TopMenuItem text={'Save Project In Cloud'} onClick={handleClickSaveProject} />
      <div className={topMenuStyle.topMenuItemBorder} />
    </>
  );
};

export default TopMenuSaveToCloud;
