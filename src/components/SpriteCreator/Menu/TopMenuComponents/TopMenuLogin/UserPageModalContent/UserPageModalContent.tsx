'use client';

import { useUserContext } from '@/context/UserContextProvider';
import styles from './UserPageModalContent.module.css';

const UserPageModalContent = () => {
  const { user } = useUserContext();

  if (!user) {
    return <div className={styles.container}>Not logged in</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <span className={styles.label}>Username:</span>
        <span className={styles.value}>{user.username}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>User ID:</span>
        <span className={styles.value}>{user.userId}</span>
      </div>
      {user.createdAt && (
        <div className={styles.field}>
          <span className={styles.label}>Member since:</span>
          <span className={styles.value}>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};

export default UserPageModalContent;
