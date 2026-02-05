'use client';

import React from 'react';
import TopMenuItem from '../../TopMenuItem/TopMenuItem';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import OpenProjectFromCloudModal from '@/components/SpriteCreator/Modals/OpenProjectFromCloudModal/OpenProjectFromCloudModal';

const TopMenuOpenFromCloud = () => {
  const { onShow } = useModalContext();

  const modalContent = <OpenProjectFromCloudModal />;

  return (
    <>
      <TopMenuItem
        text={'Open Project From Cloud'}
        onClick={() =>
          onShow(
            'open-from-cloud',
            modalContent,
            'Which one of your projects would you like to open?',
          )
        }
      />
    </>
  );
};

export default TopMenuOpenFromCloud;
