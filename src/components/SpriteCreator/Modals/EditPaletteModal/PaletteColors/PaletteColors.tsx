'use client';

import ColorButton from '@/components/SpriteCreator/Menu/ColorPalette/ColorButton/ColorButton';
import { Palette } from '@/models/Palettes';

import styles from './PaletteColors.module.css';

type PaletteColorsProps = {
  palette: Palette | undefined;
};

const PaletteColors = ({ palette }: PaletteColorsProps) => {
  return (
    <>
      {palette ? (
        <>
          <div className={styles.grid}>
            {palette.colors.map((c) => (
              <ColorButton hex={c} onClick={() => {}} />
            ))}
          </div>
        </>
      ) : (
        <p>no palette selected</p>
      )}
    </>
  );
};

export default PaletteColors;
