import ColorPicker from './Tools/ColorPicker/ColorPicker';
import RedrawEverything from './Tools/redrawEverythingDEV/RedrawEverything';

import menuStyles from './Menu.module.css';
import LayerSelector from './Tools/LayerSelector/LayerSelector';

const RightMenu = () => {
  return (
    <div className={menuStyles.menu}>
      <div className={menuStyles.menuContainer}>
        <div className={menuStyles.toolContainer}>
          <p className={menuStyles.toolsHeader}>Layers</p>
          <LayerSelector />
        </div>
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
