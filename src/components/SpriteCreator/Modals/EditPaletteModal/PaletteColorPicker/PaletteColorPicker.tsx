'use client';

import { Color, WHITE } from '@/models/Tools/Color';
import ColorPickerCanvas from '../../ColorPicketModal/ColorPickerModalComponents/ColorPickerCanvas';
import ColorPickerSlider from '../../ColorPicketModal/ColorPickerModalComponents/ColorPickerSlider';

import styles from './PaletteColorPicker.module.css';
import { useCallback, useState } from 'react';
import ColorPickerInputs from '../../ColorPicketModal/ColorPickerModalComponents/ColorPickerInputs/ColorPickerInputs';
import { Palette } from '@/models/Palettes';
import { useColorContext } from '@/context/ColorContext';

type PaletteColorPickerProps = {
  selectedPalette: Palette | undefined;
};

const PaletteColorPicker = ({ selectedPalette }: PaletteColorPickerProps) => {
  const { setUserPallets } = useColorContext();

  const [currentColor, setCurrentColor] = useState<Color>(WHITE);

  const onAddClick = useCallback(() => {
    if (!selectedPalette) return;

    setUserPallets((prev) =>
      prev.map((p) =>
        p.name !== selectedPalette.name
          ? p
          : {
              ...p,
              colors: p.colors.includes(currentColor.hex)
                ? p.colors
                : [...p.colors, currentColor.hex],
            },
      ),
    );
  }, [currentColor, selectedPalette]);
  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.leftWrapper}>
          <div className={styles.currentColor} style={{ backgroundColor: currentColor.hex }} />
          <button
            className={styles.addToPalette}
            onClick={onAddClick}
            disabled={selectedPalette === undefined}
          >
            +
          </button>
        </div>
        <div className={styles.pickerWithInput}>
          <div className={styles.picker}>
            <ColorPickerCanvas color={currentColor} setColor={setCurrentColor} setHistory={false} />
            <ColorPickerSlider color={currentColor} setColor={setCurrentColor} />
          </div>
        </div>
      </div>
      <div className={styles.inputs}>
        <ColorPickerInputs color={currentColor} setColor={setCurrentColor} />
      </div>
    </>
  );
};

export default PaletteColorPicker;
