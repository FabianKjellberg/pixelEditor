import type { ISlider } from '@/models/Tools/PropertySpecs';
import { useCallback, useMemo, useRef } from 'react';
import PropertyLabel from '../PropertyLabel/PropertyLabel';
import styles from './Slider.module.css';

export type SliderProps = {
  sliderProperties: ISlider;
  value: number;
  onChange: (value: number) => void;
};

const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));

const Slider = ({ value, onChange, sliderProperties }: SliderProps) => {
  const sliderValue = useMemo(() => value, [value]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const { min, max, label, linear = true } = sliderProperties;
  const range = max - min;
  const gamma = linear ? 1 : 2;

  const toPct = useCallback(
    (v: number) => {
      if (range === 0) return 0;
      const t = clamp((v - min) / range, 0, 1);
      return gamma === 1 ? t : Math.pow(t, 1 / gamma);
    },
    [min, range, gamma],
  );

  const fromPct = useCallback(
    (p: number) => {
      const t = gamma === 1 ? p : Math.pow(p, gamma);
      const raw = min + t * range;
      // keep integer steps like before; remove Math.round for continuous
      return clamp(Math.round(raw), min, max);
    },
    [min, max, range, gamma],
  );

  const pct = toPct(value);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const p = rect.width === 0 ? 0 : x / rect.width;
      onChange(fromPct(p));
    },
    [fromPct, onChange],
  );

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
    e.preventDefault();
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const knobStyle: React.CSSProperties = {
    left: `${pct * 100}%`,
  };

  return (
    <>
      <div>
        <PropertyLabel label={label} />
      </div>
      <div className={styles.sliderContainer}>
        <div className={styles.minMaxNr}>
          <p>{sliderProperties.min}</p>
        </div>
        <div
          ref={trackRef}
          className={styles.sliderBarContainer}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className={styles.sliderBar}></div>
          <div className={styles.sliderPoint} style={knobStyle} />
        </div>
        <div className={styles.minMaxNr}>
          <p>{sliderProperties.max}</p>
        </div>
      </div>
      <div className={styles.buttonPlusMinus}>
        <button onClick={() => onChange(Math.max(sliderValue - 1, min))}>-</button>
        {sliderValue}
        <button onClick={() => onChange(Math.min(sliderValue + 1, max))}>+</button>
      </div>
    </>
  );
};
export default Slider;
