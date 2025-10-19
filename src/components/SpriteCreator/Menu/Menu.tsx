import styles from './Menu.module.css';

import Eraser from './Eraser/Eraser';
import PenTool from './PenTool/PenTool';

const Menu = () => {
  return (
    <div className="menu">
      <div className={styles.toolContainer}>
        <p className={styles.toolsHeader}>Tools</p>
        <div className={styles.toolIconContainer}>
          <PenTool />
          <Eraser />
        </div>
      </div>
    </div>
  );
};
export default Menu;
