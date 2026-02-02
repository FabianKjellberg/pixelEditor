'use client';

import React, { useCallback, useEffect, useState } from 'react';

import styles from './TopMenuLogin.module.css';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import LoginModalContent from './LoginModalContent/LoginModalContent';
import { api } from '@/api/client';
import { User } from '@/api/users';
import { useUserContext } from '@/context/UserContextProvider';

const TopMenuLogin = () => {
  const { onShow } = useModalContext();

  const { user, loadingUser, refetchUser } = useUserContext();

  const loginModal = <LoginModalContent onLoginCallback={refetchUser} />;

  const openLoginModal = useCallback(() => {
    onShow('login-modal', loginModal, 'Login or Register a new Account');
  }, [loginModal, onShow]);

  return (
    <>
      {loadingUser ? (
        <p>loading</p>
      ) : user ? (
        <p>{user.username}</p>
      ) : (
        <div className={styles.LoginMenuButton} onClick={openLoginModal}>
          Login
        </div>
      )}
    </>
  );
};

export default TopMenuLogin;
