'use client';

import { useColorContext } from '@/context/ColorContext';
import styles from './ColorPickerInputs.module.css';
import { useCallback, useMemo } from 'react';
import { Color } from '@/models/Tools/Color';
import { rgbToColor } from '@/helpers/color';

type ColorPickerInputProps = {
  color: Color;
  setColor: (color: Color) => void;
};

const ColorPickerInputs = ({ color, setColor }: ColorPickerInputProps) => {
  const hue = useMemo(() => Math.round(color.hsv.h), [color]);
  const sat = useMemo(() => Math.round(color.hsv.s * 100), [color]);
  const bright = useMemo(() => Math.round(color.hsv.v * 100), [color]);

  const setR = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let r = Number(e.target.value);

      if (Number.isNaN(r)) return;

      if (r > 999) return;

      r = Math.max(0, Math.min(r, 255));

      const c = rgbToColor({ r, g: color.rgb.g, b: color.rgb.b });

      setColor(c);
    },
    [color],
  );

  const setG = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let g = Number(e.target.value);

      if (Number.isNaN(g)) return;

      if (g > 999) return;

      g = Math.max(0, Math.min(g, 255));

      const c = rgbToColor({ r: color.rgb.r, g, b: color.rgb.b });

      setColor(c);
    },
    [color],
  );

  const setB = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let b = Number(e.target.value);

      if (Number.isNaN(b)) return;

      if (b > 999) return;

      b = Math.max(0, Math.min(b, 255));

      const c = rgbToColor({ r: color.rgb.r, g: color.rgb.g, b });

      setColor(c);
    },
    [color],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <p className={styles.title}>R:</p>
        <input value={color.rgb.r} onChange={setR} />
        <p className={styles.title}>G:</p>
        <input value={color.rgb.g} onChange={setG} />
        <p className={styles.title}>B:</p>
        <input value={color.rgb.b} onChange={setB} />

        <p className={styles.title}>H:</p>
        <input value={hue} />
        <p className={styles.title}>S:</p>
        <div className={styles.inputWithSuffix}>
          <input value={sat} />
          <span className={styles.suffix}>%</span>
        </div>
        <p className={styles.title}>V:</p>
        <div className={styles.inputWithSuffix}>
          <input value={bright} />
          <span className={styles.suffix}>%</span>
        </div>
      </div>
      <div className={styles.hex}>
        <p className={styles.title}>Hex:</p>
        <input value={color.hex} />
      </div>
    </div>
  );
};

export default ColorPickerInputs;
