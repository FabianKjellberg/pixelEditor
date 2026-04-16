'use client';

import ColorPicker from './Tools/ColorPicker/ColorPicker';

import menuStyles from './Menu.module.css';
import LayerMenu from './LayerMenu/LayerMenu';
import { LayerSelectorProvider } from '@/context/LayerSelectorContext';
import ToolTip from './ToolTip/ToolTip';
import ColorPalette from './ColorPalette/ColorPalette';

const RightMenu = () => {
  return (
    <div className={menuStyles.menu}>
      <div className={menuStyles.menuContainer}>
        <LayerSelectorProvider>
          <div className={`${menuStyles.toolContainer} ${menuStyles.layersContainer}`}>
            <LayerMenu />
          </div>
        </LayerSelectorProvider>
        <div className={`${menuStyles.toolContainer} ${menuStyles.colorPickerContainer}`}>
          <p className={menuStyles.toolsHeader}>Color Picker</p>
          <ColorPicker />
        </div>
        <div className={`${menuStyles.toolContainer} ${menuStyles.paletteContainer}`}>
          <p className={menuStyles.toolsHeader}>Palette</p>
          <ColorPalette />
        </div>
      </div>
      <div className={`${menuStyles.toolContainer} ${menuStyles.bottom}`}>
        <ToolTip />
      </div>
    </div>
  );
};
export default RightMenu;
