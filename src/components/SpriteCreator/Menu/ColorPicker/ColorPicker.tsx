'use client';

import { ChangeEvent, useCallback, useMemo } from 'react';
import styles from './ColorPicker.module.css';
import { useToolContext } from '@/context/ToolContext';
import { RGBAobj } from '@/models/Tools/Color';
import { intToRGB, rgbaToInt } from '@/helpers/color';

const clamp8 = (n: number) => Math.max(0, Math.min(255, n | 0));

const ColorPicker = () => {
  const { color, setColor } = useToolContext();
  const rgba: RGBAobj = useMemo(() => intToRGB(color), [color]);

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, valueAsNumber } = e.currentTarget;
      const v = Number.isNaN(valueAsNumber) ? 0 : clamp8(valueAsNumber);

      const next = {
        r: name === 'r' ? v : rgba.r,
        g: name === 'g' ? v : rgba.g,
        b: name === 'b' ? v : rgba.b,
        a: name === 'a' ? v : rgba.a,
      };

      setColor(rgbaToInt(next.r, next.g, next.b, next.a));
    },
    [rgba, setColor],
  );

  return (
    <div className={styles.colorContainer}>
      {(['r', 'g', 'b', 'a'] as const).map((ch) => (
        <div key={ch} className={styles.colorInput}>
          <p>{ch.toUpperCase()}</p>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={255}
            step={1}
            name={ch}
            value={rgba[ch]}
            onChange={onInputChange}
          />
        </div>
      ))}
    </div>
  );
};

export default ColorPicker;
