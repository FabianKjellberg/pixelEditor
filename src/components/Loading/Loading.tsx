'use client';

import React from 'react';
import styles from './Loading.module.css';

type LoadingProps = {
  size?: number; // overall loader size in px (grid width/height)
  withText?: boolean; // default true
  customText?: string; // default "Loading"
  className?: string;
  loadingState?: LoadingState;
  onToolTip?: string;
};

export type LoadingState = 'saved' | 'not-saved' | 'saving';

const Loading: React.FC<LoadingProps> = ({
  size = 24,
  withText = true,
  customText = 'Loading',
  className,
  loadingState,
  onToolTip,
}) => {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ ['--loader-size' as string | number]: `${size}px` }}
      role="status"
      aria-live="polite"
      title={onToolTip}
    >
      {withText && (
        <span className={styles.text} style={{ fontSize: size }}>
          {customText}
        </span>
      )}
      {!loadingState || loadingState === 'saving' ? (
        <span className={styles.grid} aria-hidden="true" />
      ) : loadingState === 'saved' ? (
        <img className={styles.icon} src={'/icons/saved.png'} width={size} height={size} />
      ) : (
        <img className={styles.icon} src={'/icons/notSaved.png'} width={size} height={size} />
      )}
    </div>
  );
};

export default Loading;
