'use client';

import React, { useCallback, useRef } from 'react';

import styles from './TopMenuLogin.module.css';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import LoginModalContent from '../../../Modals/LoginModalContent/LoginModalContent';
import UserDropdownMenu from './UserDropdownMenu/UserDropdownMenu';
import { useUserContext } from '@/context/UserContextProvider';
import Loading from '@/components/Loading/Loading';

const TopMenuLogin = () => {
  const { onShow } = useModalContext();
  const { onShow: showContextMenu } = useContextMenuContext();
  const usernameRef = useRef<HTMLDivElement | null>(null);

  const { user, loadingUser, refetchUser } = useUserContext();

  const loginModal = <LoginModalContent onLoginCallback={refetchUser} />;

  const openLoginModal = useCallback(() => {
    onShow('login-modal', loginModal, 'Login or Register a new Account');
  }, [loginModal, onShow]);

  const openUserDropdown = useCallback(() => {
    const el = usernameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    showContextMenu(<UserDropdownMenu />, window.innerWidth, rect.y + rect.height);
  }, [showContextMenu]);

  return (
    <>
      {loadingUser ? (
        <div className={styles.fakeLoginMenuButton}>
          <Loading withText={false} size={16} />
        </div>
      ) : user ? (
        <div ref={usernameRef} className={styles.LoginMenuButton} onClick={openUserDropdown}>
          {user.username}
        </div>
      ) : (
        <div className={styles.LoginMenuButton} onClick={openLoginModal}>
          Login
        </div>
      )}
    </>
  );
};

export default TopMenuLogin;
