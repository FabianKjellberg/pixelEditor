'use client';

import ColorPicker from './Tools/ColorPicker/ColorPicker';
import RedrawEverything from './Tools/redrawEverythingDEV/RedrawEverything';

import menuStyles from './Menu.module.css';
import LayerMenu from './LayerMenu/LayerMenu';
import { LayerSelectorProvider } from '@/context/LayerSelectorContext';

const RightMenu = () => {
  return (
    <div className={menuStyles.menu}>
      <div className={menuStyles.menuContainer}>
        <LayerSelectorProvider>
          <div className={menuStyles.toolContainer}>
            <p className={menuStyles.toolsHeader}>Layers</p>
            <LayerMenu />
          </div>
        </LayerSelectorProvider>
        <div className={menuStyles.toolContainer}>
          <p className={menuStyles.toolsHeader}>Color Picker</p>
          <ColorPicker />
        </div>
        {/*<RedrawEverything />*/}
      </div>
    </div>
  );
};
export default RightMenu;
