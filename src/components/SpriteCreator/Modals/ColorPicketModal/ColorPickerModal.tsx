'use client';

import ColorPickerCanvas from './ColorPickerModalComponents/ColorPickerCanvas';
import styles from './ColorPickerModal.module.css';
import ColorPickerSlider from './ColorPickerModalComponents/ColorPickerSlider';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToolContext } from '@/context/ToolContext';
import { useColorContext } from '@/context/ColorContext';
import { CollapseButton } from '@/components/FileTree/Branch/CollapseButton/CollapseButton';
import ChevronButton from '@/components/ChevronButton/ChevronButton';
import ColorPickerInputs from './ColorPickerModalComponents/ColorPickerInputs/ColorPickerInputs';

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

  const [collapsed, setCollapsed] = useState<boolean>(true);

  const color = useMemo(() => {
    return primary ? pColor : sColor;
  }, [primary, pColor, sColor]);

  const setColor = useMemo(() => {
    return primary ? setPColor : setSColor;
  }, []);

  const toggleExtra = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <>
      <div className={styles.canvasSliderContainer}>
        <ColorPickerCanvas color={color} setColor={setColor} />
        <ColorPickerSlider color={color} setColor={setColor} />
      </div>
      <div>
        <p>More Controlls</p>
        <ChevronButton onClick={toggleExtra} collapsed={collapsed} />
      </div>
      {!collapsed && <ColorPickerInputs />}
    </>
  );
};

export default ColorPickerModal;
