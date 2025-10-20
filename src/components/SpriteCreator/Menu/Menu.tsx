import styles from './Menu.module.css';

import EraserComponent from './EraserComponent/EraserComponent';
import PenToolComponent from './PenToolComponent/PenToolComponent';
import MoveComponent from './MoveComponent/MoveComponent';
import LayerSelector from './LayerSelector/LayerSelector';

const Menu = () => {
  return (
    <div className={styles.menu}>
      <div className={styles.menuContainer}>
        <div className={styles.toolContainer}>
          <p className={styles.toolsHeader}>Tools</p>
          <div className={styles.toolIconContainer}>
            <div className={styles.toolIconRow}>
              <PenToolComponent />
              <EraserComponent />
            </div>
            <div className={styles.toolIconRow}>
              <MoveComponent />
            </div>
          </div>
        </div>
        <div className={styles.toolContainer}>
          <p className={styles.toolsHeader}>Layers</p>
          <LayerSelector />
        </div>
      </div>
    </div>
  );
};
export default Menu;
