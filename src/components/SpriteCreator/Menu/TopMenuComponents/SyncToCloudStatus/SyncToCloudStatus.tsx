'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useUserContext } from '@/context/UserContextProvider';
import React, { useMemo } from 'react';

import styles from './SyncToCloudStatus.module.css';
import Loading from '@/components/Loading/Loading';
import { useAutoSaveContext } from '@/context/AutoSaveContext';

enum SyncStatus {
  green = 'green',
  red = 'red',
  yellow = 'yellow',
}

const SyncToCloudStatus = () => {
  const { user, loadingUser } = useUserContext();
  const { isLoadedFromCloud } = useCanvasContext();
  const { dirty, dirtyCount, isSaving } = useAutoSaveContext();

  const syncStatus = useMemo((): SyncStatus => {
    if (!user) return SyncStatus.yellow;
    if (!isLoadedFromCloud) return SyncStatus.yellow;

    if (isSaving) return SyncStatus.yellow;

    if (dirty) return SyncStatus.yellow;
    return SyncStatus.green;
  }, [user, isLoadedFromCloud, isSaving, dirty]);

  const statusText = useMemo(() => {
    if (!user) return 'login to sync your projects';
    if (!isLoadedFromCloud) return 'File -> Save project to cloud, to sync this project';

    if (isSaving) return 'Saving...';

    if (dirty) return dirtyCount + ' Layer/s not synced';
    return 'Synced';
  }, [user, isLoadedFromCloud, isSaving, dirty, dirtyCount]);

  if (loadingUser) {
    return <Loading withText={false} size={16} />;
  }

  if (loadingUser) {
    return <Loading withText={false} size={16} />;
  }

  return (
    <div className={styles.status}>
      <p className={`${styles.statusText} ${styles[syncStatus]}`}>{statusText}</p>
      {isSaving && <Loading customText="saving layer/s" size={18} />}
    </div>
  );
};
export default SyncToCloudStatus;
