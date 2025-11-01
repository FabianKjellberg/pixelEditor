import ColorPicker from './ColorPicker/ColorPicker';
import RedrawEverything from './redrawEverythingDEV/RedrawEverything';

import menuStyles from './Menu.module.css';
import EraserComponent from './EraserComponent/EraserComponent';
import PenToolComponent from './PenToolComponent/PenToolComponent';
import MoveComponent from './MoveComponent/MoveComponent';
import LayerSelector from './LayerSelector/LayerSelector';

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
        <RedrawEverything />
      </div>
    </div>
  );
};
export default RightMenu;
