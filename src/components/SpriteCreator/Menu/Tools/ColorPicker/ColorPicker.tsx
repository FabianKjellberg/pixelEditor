'use client';

import { CSSProperties, useMemo } from 'react';
import styles from './ColorPicker.module.css';
import { useToolContext } from '@/context/ToolContext';
import { intToCssRgba } from '@/helpers/color';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import ColorPickerModal from '../../../Modals/ColorPicketModal/ColorPickerModal';

const ColorPicker = () => {
  const {
    flipPrimarySecondary,
    getPrimaryColor,
    getSecondaryColor,
    primaryColorChanged,
    secondaryColorChanged,
  } = useToolContext();
  const { onShow } = useModalContext();

  const primaryColorStyle = useMemo(
    (): CSSProperties => ({ backgroundColor: intToCssRgba(primaryColorChanged.color) }),
    [primaryColorChanged],
  );
  const secondaryColorStyle = useMemo(
    (): CSSProperties => ({ backgroundColor: intToCssRgba(secondaryColorChanged.color) }),
    [secondaryColorChanged],
  );

  return (
    <div className={styles.colorWrapper}>
      <div className={styles.colorContainer}>
        <div
          className={styles.secondaryColor}
          style={secondaryColorStyle}
          onClick={() =>
            onShow('secondaryColor', <ColorPickerModal primary={false} />, 'Change secondary color')
          }
        />
        <div
          className={styles.primaryColor}
          style={primaryColorStyle}
          onClick={() =>
            onShow('primaryColor', <ColorPickerModal primary={true} />, 'Change primary color')
          }
        />
        <button className={styles.flipButton} onClick={() => flipPrimarySecondary()}>
          Flip
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
