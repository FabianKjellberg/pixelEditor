'use client';

import ColorPickerCanvas from './ColorPickerModalComponents/ColorPickerCanvas';
import styles from './ColorPickerModal.module.css';
import ColorPickerSlider from './ColorPickerModalComponents/ColorPickerSlider';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useToolContext } from '@/context/ToolContext';
import { useColorContext } from '@/context/ColorContext';

type ColorPickerModalProps = {
  primary: boolean;
};

export type hsvObject = {
  hue: number;
  sat: number;
  bright: number;
};

const ColorPickerModal = ({ primary }: ColorPickerModalProps) => {
  const { pColor, sColor, setPColor, setSColor } = useColorContext();

  const color = useMemo(() => {
    return primary ? pColor : sColor;
  }, [primary, pColor, sColor]);

  const setColor = useMemo(() => {
    return primary ? setPColor : setSColor;
  }, []);

  return (
    <>
      <div className={styles.canvasSliderContainer}>
        <ColorPickerCanvas color={color} setColor={setColor} />
        <ColorPickerSlider color={color} setColor={setColor} />
      </div>
    </>
  );
};

export default ColorPickerModal;
