'use client';

import React, { useCallback } from 'react';
import TopMenuItem from '../../TopMenuItem/TopMenuItem';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import OpenProjectFromCloudModal from '@/components/SpriteCreator/Modals/OpenProjectFromCloudModal/OpenProjectFromCloudModal';
import { useUserContext } from '@/context/UserContextProvider';
import LoginModalContent from '@/components/SpriteCreator/Modals/LoginModalContent/LoginModalContent';

const TopMenuOpenFromCloud = () => {
  const { onShow } = useModalContext();
  const { user, loadingUser } = useUserContext();

  const modalContent = <OpenProjectFromCloudModal />;

  const openOpen = useCallback(() => {
    onShow('open-from-cloud', modalContent, 'Which one of your projects would you like to open?');
  }, [onShow, modalContent]);

  const loginModal = <LoginModalContent onLoginCallback={openOpen} />;

  const onClick = useCallback(() => {
    if (!user) {
      onShow('login-modal', loginModal, 'Login to save your project');
      return;
    }

    onShow('open-from-cloud', modalContent, 'Which one of your projects would you like to open?');
  }, [user]);

  return (
    <>
      <TopMenuItem text={'Open Project From Cloud'} onClick={onClick} disabled={loadingUser} />
    </>
  );
};

export default TopMenuOpenFromCloud;
