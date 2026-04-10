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
  const { getPrimaryColor, getSecondaryColor } = useToolContext();

  return (
    <>
      <div className={styles.canvasSliderContainer}>
        <ColorPickerCanvas primary={primary} />
        <ColorPickerSlider primary={primary} />
      </div>
    </>
  );
};

export default ColorPickerModal;
