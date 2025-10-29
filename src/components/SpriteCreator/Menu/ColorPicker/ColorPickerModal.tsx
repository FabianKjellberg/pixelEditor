'use client';

import ColorPickerCanvas from './ColorPickerModalComponents/ColorPickerCanvas';
import styles from './ColorPickerModal.module.css';
import ColorPickerSlider from './ColorPickerModalComponents/ColorPickerSlider';
import { useEffect, useMemo, useState } from 'react';
import { hsb100ToRgb, intToRGB, rgbaToInt, rgbToHsb100 } from '@/helpers/color';
import { Hsb100, RGBAobj } from '@/models/Tools/Color';

type ColorPickerModalProps = {
  setColor: (color: number) => void;
  color: number;
};

export type hsvObject = {
  hue: number;
  sat: number;
  bright: number;
};

const ColorPickerModal = ({ setColor, color }: ColorPickerModalProps) => {
  const rgba = useMemo((): RGBAobj => intToRGB(color), [color]);

  const [hsv, setHsv] = useState<Hsb100>(rgbToHsb100(rgba));

  useEffect(() => {
    const rgb: RGBAobj = hsb100ToRgb(hsv.h, hsv.s, hsv.b);

    setColor(rgbaToInt(rgb.r, rgb.g, rgb.b, 255));
  }, [hsv, setColor]);

  return (
    <>
      <div className={styles.canvasSliderContainer}>
        <ColorPickerCanvas hsv={hsv} setHsv={setHsv} />
        <ColorPickerSlider hsv={hsv} setHsv={setHsv} />
      </div>
    </>
  );
};

export default ColorPickerModal;
