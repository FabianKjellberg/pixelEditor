'use client';

import { useColorContext } from '@/context/ColorContext';
import styles from './ColorPickerInputs.module.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Color } from '@/models/Tools/Color';
import {
  expandHex,
  hexToColor,
  hsvToColor,
  intToColor,
  isValidHex,
  rgbToColor,
} from '@/helpers/color';

type ColorPickerInputProps = {
  color: Color;
  setColor: (color: Color) => void;
};

const ColorPickerInputs = ({ color, setColor }: ColorPickerInputProps) => {
  const { addRecentColor } = useColorContext();

  const hue = useMemo(() => Math.round(color.hsv.h), [color]);
  const sat = useMemo(() => Math.round(color.hsv.s * 100), [color]);
  const bright = useMemo(() => Math.round(color.hsv.v * 100), [color]);

  const [hex, setHex] = useState<string>(color.hex);
  const [hexFocus, setHexFocus] = useState<boolean>(false);

  const setR = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let r = Number(e.target.value);

      if (Number.isNaN(r)) return;

      //cannot be 4 character, early return rather than adjusting value
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

      //cannot be 4 character, early return rather than adjusting value
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

      //cannot be 4 character, early return rather than adjusting value
      if (b > 999) return;

      b = Math.max(0, Math.min(b, 255));

      const c = rgbToColor({ r: color.rgb.r, g: color.rgb.g, b });

      setColor(c);
    },
    [color],
  );

  const setHue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let h = Number(e.target.value);

      if (Number.isNaN(h)) return;

      //cannot be 4 character, early return rather than adjusting value
      if (h > 999) return;

      h = Math.max(0, Math.min(h, 360));

      const c = hsvToColor({ h, s: color.hsv.s, v: color.hsv.v });

      setColor(c);
    },
    [color],
  );

  const setSat = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let s = Number(e.target.value);

      if (Number.isNaN(s)) return;

      //cannot be 4 character, early return rather than adjusting value
      if (s > 999) return;

      s = Math.max(0, Math.min(s, 100));

      s /= 100;

      const c = hsvToColor({ h: color.hsv.h, s, v: color.hsv.v });

      setColor(c);
    },
    [color],
  );

  const setBright = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = Number(e.target.value);

      if (Number.isNaN(v)) return;

      //cannot be 4 character, early return rather than adjusting value
      if (v > 999) return;

      v = Math.max(0, Math.min(v, 100));

      v /= 100;

      const c = hsvToColor({ h: color.hsv.h, s: color.hsv.s, v });

      setColor(c);
    },
    [color],
  );

  const setHexCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let c = e.target.value;

    setHex(c);

    if (!c.startsWith('#')) {
      c = '#' + c;
    }

    c.toLocaleLowerCase();

    const isHex = isValidHex(c);

    if (!isHex) return;

    c = expandHex(c);

    const color = hexToColor(c);

    setColor(color);
  }, []);

  useEffect(() => {
    if (!hexFocus) {
      setHex(color.hex);
    }
  }, [hexFocus, color]);

  const onHexBlur = useCallback(() => {
    addRecentColor(color.hex);
    setHexFocus(false);
  }, [color]);

  const onHexFocus = useCallback(() => {
    setHexFocus(true);
  }, []);

  const onInputBlue = useCallback(() => {
    addRecentColor(color.hex);
  }, [color]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <p className={styles.title}>R:</p>
        <input value={color.rgb.r} onChange={setR} onBlur={onInputBlue} />
        <p className={styles.title}>G:</p>
        <input value={color.rgb.g} onChange={setG} onBlur={onInputBlue} />
        <p className={styles.title}>B:</p>
        <input value={color.rgb.b} onChange={setB} onBlur={onInputBlue} />

        <p className={styles.title}>H:</p>
        <input value={hue} onChange={setHue} onBlur={onInputBlue} />
        <p className={styles.title}>S:</p>
        <div className={styles.inputWithSuffix}>
          <input value={sat} onChange={setSat} onBlur={onInputBlue} />
          <span className={styles.suffix}>%</span>
        </div>
        <p className={styles.title}>V:</p>
        <div className={styles.inputWithSuffix}>
          <input value={bright} onChange={setBright} onBlur={onInputBlue} />
          <span className={styles.suffix}>%</span>
        </div>
      </div>
      <div className={styles.hex}>
        <p className={styles.title}>Hex:</p>
        <input value={hex} onChange={setHexCallback} onBlur={onHexBlur} onFocus={onHexFocus} />
      </div>
    </div>
  );
};

export default ColorPickerInputs;
