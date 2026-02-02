'use client';

import TopMenuItem from '../../TopMenuItem/TopMenuItem';
import styles from '../../TopMenuItem/TopMenuItem.module.css';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { useUserContext } from '@/context/UserContextProvider';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import UserPageModalContent from '../UserPageModalContent/UserPageModalContent';

const UserDropdownMenu = () => {
  const { onShow } = useModalContext();
  const { onHide } = useContextMenuContext();
  const { logout } = useUserContext();

  const handleOpenProfile = () => {
    onHide();
    onShow('user-page-modal', <UserPageModalContent />, 'User Profile');
  };

  const handleLogout = async () => {
    onHide();
    await logout();
  };

  return (
    <>
      <TopMenuItem text={'Open Profile'} onClick={handleOpenProfile} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Logout'} onClick={handleLogout} />
    </>
  );
};

export default UserDropdownMenu;
