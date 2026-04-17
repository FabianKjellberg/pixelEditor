'use client';

import ColorButton from '@/components/SpriteCreator/Menu/ColorPalette/ColorButton/ColorButton';
import { Palette } from '@/models/Palettes';

import styles from './PaletteColors.module.css';
import { useColorContext } from '@/context/ColorContext';
import { useCallback } from 'react';

type PaletteColorsProps = {
  palette: Palette | undefined;
};

const PaletteColors = ({ palette }: PaletteColorsProps) => {
  const { setUserPallets } = useColorContext();

  const onClick = useCallback(
    (hex: string, rightClick: boolean) => {
      if (!palette) return;

      if (rightClick) {
        setUserPallets((prev) => {
          return prev.map((p) => {
            return p.menuItem.id === palette.menuItem.id
              ? { ...p, colors: p.colors.filter((c) => c !== hex) }
              : p;
          });
        });
      }
    },
    [palette],
  );

  return (
    <>
      {palette ? (
        <>
          <div className={styles.grid}>
            {palette.colors.map((c, index) => (
              <div key={index + c + 'colorbutton'}>
                <ColorButton hex={c} onClick={onClick} addRecent={false} />
              </div>
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
