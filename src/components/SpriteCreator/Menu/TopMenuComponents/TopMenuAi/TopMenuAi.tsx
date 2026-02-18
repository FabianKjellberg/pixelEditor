'use client';

import { useCallback } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import AiModal from '@/components/SpriteCreator/Modals/AiModal/AiModal';

const TopMenuAi = () => {
  const { onShow } = useModalContext();

  const aiModal = <AiModal />;

  const openAiModalClick = useCallback(() => {
    onShow('ai-modal', aiModal, 'Testing please work');
  }, []);

  return (
    <>
      <TopMenuItem text={'Create drawing with AI'} onClick={openAiModalClick} />
    </>
  );
};
export default TopMenuAi;
