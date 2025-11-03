'use client';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import ChangeCanvasModal from '@/components/SpriteCreator/Modals/ChangeCanvasModal/ChangeCanvasModal';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';

const TopMenuCanvas = () => {
  const { onShow } = useModalContext();
  const { onHide } = useContextMenuContext();

  const onChangeCanvasClick = () => {
    onShow('changeCanvasSize', <ChangeCanvasModal />, 'Change canvas size');
    onHide();
  };

  return (
    <>
      <TopMenuItem text={'Change canvas size'} onClick={() => onChangeCanvasClick()} />
    </>
  );
};
export default TopMenuCanvas;
