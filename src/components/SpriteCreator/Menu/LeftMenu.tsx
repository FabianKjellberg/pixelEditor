import ColorPicker from './ColorPicker/ColorPicker';
import RedrawEverything from './redrawEverythingDEV/RedrawEverything';

import menuStyles from './Menu.module.css';
import EraserComponent from './EraserComponent/EraserComponent';
import PenToolComponent from './PenToolComponent/PenToolComponent';
import MoveComponent from './MoveComponent/MoveComponent';
import LayerSelector from './LayerSelector/LayerSelector';

const LeftMenu = () => {
  return (
    <div className={menuStyles.menu}>
      <div className={menuStyles.menuContainer}>
        <div className={menuStyles.toolContainer}>
          <p className={menuStyles.toolsHeader}>Tools</p>
          <div className={menuStyles.toolIconContainer}>
            <div className={menuStyles.toolIconRow}>
              <PenToolComponent />
              <EraserComponent />
            </div>
            <div className={menuStyles.toolIconRow}>
              <MoveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeftMenu;
