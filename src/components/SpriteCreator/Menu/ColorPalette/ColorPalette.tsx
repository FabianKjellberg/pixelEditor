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
import { useModalContext } from '@/context/ModalContext/ModalContext';
import EditPaletteModal from '../../Modals/EditPaletteModal/EditPaletteModal';

const ColorPalette = () => {
  const { setPColor, setSColor, recentColors, userPallets } = useColorContext();
  const { onShow } = useModalContext();

  const [selectPaletteValue, setSelectPaletteValue] = useState<string>('general');

  const multiChoiceProps: IMultiChoice = useMemo(() => {
    return {
      type: 'multiChoice',
      label: 'Select palette',
      choices: [
        { id: 'general', text: 'general' },
        { id: 'retro', text: 'retro' },
        { id: 'shading', text: 'shading' },
        { id: 'skin color', text: 'skin color' },
        { id: 'recents', text: 'recents' },
        ...userPallets.map((p) => p.menuItem),
      ],
      allowEmpty: false,
    };
  }, [userPallets]);

  const palette = useMemo((): string[] => {
    const colors = userPallets.find((p) => p.menuItem.id === selectPaletteValue)?.colors;

    if (colors) return colors;

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
  }, [selectPaletteValue, recentColors, userPallets]);

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

  const clickEditCallback = useCallback(() => {
    onShow('edit-palette', <EditPaletteModal />, 'Edit palettes');
  }, []);

  return (
    <>
      <div className={styles.dropDown}>
        <MultiChoice
          onChange={onChangePalette}
          value={selectPaletteValue}
          multiChoiceProperties={multiChoiceProps}
        />
        <button className={styles.editButton} onClick={clickEditCallback}>
          <img
            src="/icons/cog.png"
            width={16}
            height={16}
            alt="edit"
            className={styles.buttonIcon}
          />
        </button>
      </div>
      <div className={styles.paletteWrapper}>
        <div className={styles.grid}>
          {palette.map((hex, index) => (
            <div className={styles.colorButton} key={'palette' + hex + index}>
              <ColorButton hex={hex} onClick={onColorBtnClick} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default ColorPalette;
