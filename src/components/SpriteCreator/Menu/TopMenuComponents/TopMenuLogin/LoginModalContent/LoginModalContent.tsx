'use client';

import React, { useCallback, useMemo, useState } from 'react';
import styles from './LoginModalContent.module.css';
import { api } from '@/api/client';
import { useModalContext } from '@/context/ModalContext/ModalContext';

enum MessageType {
  error = 'error',
  warning = 'warning',
  success = 'success',
}

interface LoginModalContentProps {
  onLoginCallback?: () => void;
}

const LoginModalContent = ({ onLoginCallback }: LoginModalContentProps) => {
  const { onHide } = useModalContext();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ message: string; type: MessageType } | null>(null);

  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const disabledButtons = useMemo(() => {
    return username === '' || password === '' || loading;
  }, [username, password, loading]);

  const onLoginClick = useCallback(async () => {
    setLoading(true);

    const response = await api.users.login(username, password);

    if (!response.ok) {
      setMessage({ message: response.reason ?? '', type: MessageType.error });
    } else {
      onHide('login-modal');

      if (onLoginCallback) onLoginCallback();
    }

    setLoading(false);
  }, [username, password]);

  const onRegisterClick = useCallback(async () => {
    setLoading(true);
    const response = await api.users.createAccount(username, password);

    if (!response.ok) {
      setMessage({ message: response.reason ?? '', type: MessageType.error });
    }

    if (response.ok) {
      setMessage({ message: 'Successfully created account', type: MessageType.success });
      setUsername('');
      setPassword('');
    }

    setLoading(false);
  }, [username, password]);

  return (
    <div className={styles.loginModal}>
      <h3 className={styles.loginModalTitle}>Log in or create a new account</h3>
      <div className={styles.loginInput}>
        <p>Username: </p>
        <input onChange={onUsernameChange} value={username} />
      </div>
      <div className={styles.loginInput}>
        <p>Password: </p>
        <input
          onChange={onPasswordChange}
          value={password}
          type="password"
          autoComplete="current-password"
        />
      </div>
      <p className={styles.decorativeText}>
        {' '}
        * Usernames and password must be 4 characters or longer
      </p>
      {message && (
        <div className={styles[`message-${message.type}`]}>
          <p>{message.message}</p>
        </div>
      )}
      <div className={styles.loginButtons}>
        <button disabled={disabledButtons} onClick={onLoginClick}>
          Log in
        </button>
        <button disabled={disabledButtons} onClick={onRegisterClick}>
          Register account
        </button>
      </div>
    </div>
  );
};

export default LoginModalContent;
