'use client';

import { useCallback } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import AiModal from '@/components/SpriteCreator/Modals/AiModal/AiModal';
import { useUserContext } from '@/context/UserContextProvider';
import { useToastContext } from '@/context/ToastContext/ToastContext';

const TopMenuAi = () => {
  const { onShow } = useModalContext();
  const { user } = useUserContext();
  const { onToast } = useToastContext();

  const aiModal = <AiModal />;

  const openAiModalClick = useCallback(() => {
    if (!user) {
      onToast('You need to be logged in to use the AI tool', 'warning');
    } else {
      onShow('ai-modal', aiModal, 'AI-Promt tool');
    }
  }, []);

  return (
    <>
      <TopMenuItem text={'Create drawing with AI'} onClick={openAiModalClick} />
    </>
  );
};
export default TopMenuAi;
