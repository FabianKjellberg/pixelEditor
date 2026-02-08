'use client';

import React, { useId } from 'react';
import styles from './Checkbox.module.css';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
};

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  id,
  className,
}: CheckboxProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      className={`${styles.root} ${disabled ? styles.disabled : ''} ${className ?? ''}`}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.box} aria-hidden />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Checkbox;
