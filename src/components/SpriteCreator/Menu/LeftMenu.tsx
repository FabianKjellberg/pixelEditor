import menuStyles from './Menu.module.css';
import EraserComponent from './Tools/EraserComponent/EraserComponent';
import PenToolComponent from './Tools/PenToolComponent/PenToolComponent';
import MoveComponent from './Tools/MoveComponent/MoveComponent';
import Properties from './Tools/Properties/Properties';
import PanToolComponent from './Tools/PanToolComponent/PanToolComponent';
import RectangleSelectorComponent from './Tools/RectangleSelectorComponent/RectangleSelectorComponent';
import EyedropperComponent from './Tools/EyedropperComponent/EyedropperComponent';
import ShapeComponents from './Tools/ShapeComponents/ShapeComponents';
import BucketFillComponent from './Tools/BucketFillComponent';

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
              <PanToolComponent />
            </div>
            <div className={menuStyles.toolIconRow}>
              <RectangleSelectorComponent />
              <EyedropperComponent />
            </div>
            <div className={menuStyles.toolIconRow}>
              <ShapeComponents />
              <BucketFillComponent />
            </div>
          </div>
        </div>
        <div className={menuStyles.toolContainer}>
          <p className={menuStyles.toolsHeader}>Properties</p>
          <Properties />
        </div>
      </div>
    </div>
  );
};
export default LeftMenu;
