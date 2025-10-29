'use client';

import { CSSProperties, useMemo } from 'react';
import styles from './ColorPicker.module.css';
import { useToolContext } from '@/context/ToolContext';
import { intToCssRgba } from '@/helpers/color';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import ColorPickerModal from './ColorPickerModal';

const ColorPicker = () => {
  const { setPrimaryColor, setSecondaryColor, primaryColor, secondaryColor, flipPrimarySecondary } =
    useToolContext();
  const { onShow } = useModalContext();

  const primaryColorStyle = useMemo(
    (): CSSProperties => ({ backgroundColor: intToCssRgba(primaryColor) }),
    [primaryColor],
  );
  const secondaryColorStyle = useMemo(
    (): CSSProperties => ({ backgroundColor: intToCssRgba(secondaryColor) }),
    [secondaryColor],
  );

  return (
    <div className={styles.colorWrapper}>
      <div className={styles.colorContainer}>
        <div
          className={styles.secondaryColor}
          style={secondaryColorStyle}
          onClick={() =>
            onShow(
              <ColorPickerModal setColor={setSecondaryColor} color={secondaryColor} />,
              'Change secondary color',
            )
          }
        />
        <div
          className={styles.primaryColor}
          style={primaryColorStyle}
          onClick={() =>
            onShow(
              <ColorPickerModal setColor={setPrimaryColor} color={primaryColor} />,
              'Change primary color',
            )
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
