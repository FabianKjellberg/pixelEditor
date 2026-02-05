'use client';

import React from 'react';
import styles from './Loading.module.css';

type LoadingProps = {
  size?: number; // overall loader size in px (grid width/height)
  withText?: boolean; // default true
  customText?: string; // default "Loading"
  className?: string;
};

const Loading: React.FC<LoadingProps> = ({
  size = 24,
  withText = true,
  customText = 'Loading',
  className,
}) => {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ ['--loader-size' as any]: `${size}px` }}
      role="status"
      aria-live="polite"
    >
      {withText && (
        <span className={styles.text} style={{ fontSize: size }}>
          {customText}
        </span>
      )}
      <span className={styles.grid} aria-hidden="true" />
    </div>
  );
};

export default Loading;
