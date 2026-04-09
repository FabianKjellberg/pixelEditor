'use client';

import ColorPickerCanvas from './ColorPickerModalComponents/ColorPickerCanvas';
import styles from './ColorPickerModal.module.css';
import ColorPickerSlider from './ColorPickerModalComponents/ColorPickerSlider';
import { useEffect, useMemo, useState } from 'react';
import { hsb100ToRgb, intToRGB, rgbToHsb100 } from '@/helpers/color';
import { useToolContext } from '@/context/ToolContext';
import { Hsb100 } from '@/models/Tools/Color';

type ColorPickerModalProps = {
  primary: boolean;
};

export type hsvObject = {
  hue: number;
  sat: number;
  bright: number;
};

const ColorPickerModal = ({ primary }: ColorPickerModalProps) => {
  const {
    setSecondaryColor,
    setPrimaryColor,
    getPrimaryColor,
    getSecondaryColor,
    secondaryColorChanged,
    primaryColorChanged,
  } = useToolContext();

  const [hsv, setHsv] = useState<Hsb100>(() => {
    const color = primary ? getPrimaryColor() : getSecondaryColor();

    return { h: 0, s: 0, b: 0 };
  });

  return (
    <>
      <div className={styles.canvasSliderContainer}>
        <ColorPickerCanvas hsv={hsv} setColor={primary ? setPrimaryColor : setSecondaryColor} />
        <ColorPickerSlider hsv={hsv} setColor={primary ? setPrimaryColor : setSecondaryColor} />
      </div>
    </>
  );
};

export default ColorPickerModal;
