'use client';

import { CSSProperties, useMemo } from 'react';
import styles from './ColorPicker.module.css';
import { useToolContext } from '@/context/ToolContext';
import { intToCssRgba } from '@/helpers/color';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import ColorPickerModal from '../../../Modals/ColorPicketModal/ColorPickerModal';
import { useColorContext } from '@/context/ColorContext';

const ColorPicker = () => {
  const { flipPrimarySecondary, pColor, sColor } = useColorContext();
  const { onShow } = useModalContext();

  const primaryColorStyle = useMemo(
    (): CSSProperties => ({ backgroundColor: intToCssRgba(pColor.int) }),
    [pColor],
  );
  const secondaryColorStyle = useMemo(
    (): CSSProperties => ({ backgroundColor: intToCssRgba(sColor.int) }),
    [sColor],
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
          <img className={styles.flipImage} src={'/icons/flip-arrow.png'} width={20} height={20} />
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
