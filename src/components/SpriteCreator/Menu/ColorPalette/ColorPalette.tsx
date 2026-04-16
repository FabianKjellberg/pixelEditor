'use client';

import { hexToColor } from '@/helpers/color';

import styles from './ColorPalette.module.css';
import { useCallback, useMemo, useState } from 'react';
import { useColorContext } from '@/context/ColorContext';
import ColorButton from './ColorButton/ColorButton';
import MultiChoice from '../Tools/Properties/MultiChoice/MultiChoice';
import { IMultiChoice } from '@/models/properties/PropertySpecs';
import {
  PALETTE_GENERAL,
  PALETTE_RETRO,
  PALETTE_SHADING_EXTENDED,
  PALETTE_SKIN,
} from '@/models/Palettes';

const multiChoiceProps: IMultiChoice = {
  type: 'multiChoice',
  label: 'Select palette',
  choices: ['general', 'retro', 'shading', 'skin color', 'recents'],
  allowEmpty: false,
};

const ColorPalette = () => {
  const [selectPaletteValue, setSelectPaletteValue] = useState<string>('general');

  const { setPColor, setSColor, recentColors } = useColorContext();

  const palette = useMemo((): string[] => {
    switch (selectPaletteValue) {
      case 'general':
        return PALETTE_GENERAL;

      case 'retro':
        return PALETTE_RETRO;

      case 'shading':
        return PALETTE_SHADING_EXTENDED;

      case 'skin color':
        return PALETTE_SKIN;

      case 'recents':
        return recentColors;
    }

    return PALETTE_GENERAL;
  }, [selectPaletteValue, recentColors]);

  const onColorBtnClick = useCallback((hex: string, rightClick: boolean) => {
    if (rightClick) {
      setSColor(hexToColor(hex));
    } else {
      setPColor(hexToColor(hex));
    }
  }, []);

  const onChangePalette = useCallback((value: string | null) => {
    setSelectPaletteValue(value ?? 'general');
  }, []);

  return (
    <>
      <div className={styles.dropDown}>
        <MultiChoice
          onChange={onChangePalette}
          value={selectPaletteValue}
          multiChoiceProperties={multiChoiceProps}
        />
        <button>edit</button>
      </div>
      <div className={styles.paletteWrapper}>
        <div className={styles.grid}>
          {palette.map((hex) => (
            <div className={styles.colorButton}>
              <ColorButton hex={hex} onClick={onColorBtnClick} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default ColorPalette;
