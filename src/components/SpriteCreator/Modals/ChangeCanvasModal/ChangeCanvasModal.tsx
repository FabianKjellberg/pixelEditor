'use client';

import { useModalContext } from '@/context/ModalContext/ModalContext';
import styles from './ChangeCanvasModal.module.css';
import { useMemo, useState } from 'react';
import { useCanvasContext } from '@/context/CanvasContext';

const ChangeCanvasModal = () => {
  const { onHide } = useModalContext();
  const { width, height, setDimensions } = useCanvasContext();
  const [canvasWidth, setCanvasWidth] = useState<string>(width.toString());
  const [canvasHeight, setCanvasHeight] = useState<string>(height.toString());

  const onChangeWidth = (raw: string, { min = 1, max = Number.POSITIVE_INFINITY } = {}) => {
    if (raw.trim() === '') {
      setCanvasWidth('');
      return;
    }
    if (raw.length > 4) return;

    const normalized = raw.replace(',', '.');
    const num = Number(normalized);

    if (!Number.isFinite(num)) return;

    const whole = Math.floor(num);

    const clamped = Math.min(Math.max(whole, min), max);

    setCanvasWidth(clamped.toString());
  };
  const onChangeHeight = (raw: string, { min = 1, max = Number.POSITIVE_INFINITY } = {}) => {
    if (raw.trim() === '') {
      setCanvasHeight('');
      return;
    }
    if (raw.length > 4) return;

    const normalized = raw.replace(',', '.');
    const num = Number(normalized);

    if (!Number.isFinite(num)) return;

    const whole = Math.floor(num);

    const clamped = Math.min(Math.max(whole, min), max);

    setCanvasHeight(clamped.toString());
  };

  const changeCanvasSize = () => {
    const w = Number(canvasWidth);
    const h = Number(canvasHeight);

    if (w < 0 || w > 2048 || h < 0 || h > 2048) return;

    setDimensions(w, h);
    onHide('changeCanvasSize');
  };

  const disabled = useMemo((): boolean => {
    const w: number = Number(canvasWidth);
    const h: number = Number(canvasHeight);

    return !(w > 0 && h > 0) || (w === width && height === h);
  }, [canvasHeight, canvasWidth]);

  return (
    <>
      <div className={styles.changeCanvasSizeContainer}>
        <div className={styles.inputContainer}>
          <p>Width:</p>
          <div className={styles.inputInput}>
            <input
              value={canvasWidth}
              type="number"
              min={1}
              max={2048}
              step={1}
              onChange={(e) => onChangeWidth(e.target.value, { min: 1, max: 2048 })}
              className={styles.inputInputInput}
            />
            <p>px</p>
          </div>
          <p>Height:</p>
          <div className={styles.inputInput}>
            <input
              value={canvasHeight}
              type="number"
              min={1}
              max={2048}
              step={1}
              onChange={(e) => onChangeHeight(e.target.value, { min: 1, max: 2048 })}
              className={styles.inputInputInput}
            />
            <p>px</p>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button
            onClick={() => changeCanvasSize()}
            className={styles.confirmButton}
            disabled={disabled}
          >
            confirm
          </button>
          <button onClick={() => onHide('changeCanvasSize')}>cancel</button>
        </div>
      </div>
    </>
  );
};
export default ChangeCanvasModal;
