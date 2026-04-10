'use client';

import styles from './ColorPickerInputs.module.css';

const ColorPickerInputs = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <p>R:</p>
        <input />
        <p>G:</p>
        <input />
        <p>B:</p>
        <input />

        <p>H:</p>
        <input />
        <p>S:</p>
        <input />
        <p>V:</p>
        <input />
      </div>
      <div className={styles.hex}>
        <p>Hex:</p>
        <input />
      </div>
    </div>
  );
};

export default ColorPickerInputs;
