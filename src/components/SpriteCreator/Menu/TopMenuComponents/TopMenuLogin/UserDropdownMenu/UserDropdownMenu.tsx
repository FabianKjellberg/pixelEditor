'use client';

import TopMenuItem from '../../TopMenuItem/TopMenuItem';
import styles from '../../TopMenuItem/TopMenuItem.module.css';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { useUserContext } from '@/context/UserContextProvider';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { useLayerContext } from '@/context/LayerContext';
import { useAutoSaveContext } from '@/context/AutoSaveContext';
import UserPageModalContent from '../UserPageModalContent/UserPageModalContent';

const UserDropdownMenu = () => {
  const { onShow } = useModalContext();
  const { onHide } = useContextMenuContext();
  const { logout } = useUserContext();
  const { setProjectId, setDimensions, setIsLoadedFromCloud } = useCanvasContext();
  const { resetToBlankProject } = useLayerContext();
  const { dirty, isSaving } = useAutoSaveContext();

  const handleOpenProfile = () => {
    onHide();
    onShow('user-page-modal', <UserPageModalContent />, 'User Profile');
  };

  const handleLogout = async () => {
    onHide();
    const success = await logout();
    if (success) {
      setProjectId(crypto.randomUUID());
      setDimensions(64, 64);
      resetToBlankProject(64, 64);
      setIsLoadedFromCloud(false);
    }
  };

  return (
    <>
      <TopMenuItem text={'Open Profile'} onClick={handleOpenProfile} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem
        text={'Logout'}
        onClick={handleLogout}
        disabled={dirty || isSaving}
      />
    </>
  );
};

export default UserDropdownMenu;
