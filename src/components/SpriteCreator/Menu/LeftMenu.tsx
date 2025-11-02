import menuStyles from './Menu.module.css';
import EraserComponent from './EraserComponent/EraserComponent';
import PenToolComponent from './PenToolComponent/PenToolComponent';
import MoveComponent from './MoveComponent/MoveComponent';
import Properties from './Properties/Properties';

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
        <div className={menuStyles.toolContainer}>
          <p className={menuStyles.toolsHeader}>Properties</p>
          <Properties />
        </div>
      </div>
    </div>
  );
};
export default LeftMenu;
