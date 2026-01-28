import type { IToggle } from '@/models/Tools/PropertySpecs';
import PropertyLabel from '../PropertyLabel/PropertyLabel';

import styles from './Toggle.module.css';

type ToggleProps = {
  toggleProperties: IToggle;
  onChange: (checked: boolean) => void;
  value: boolean;
};

const Toggle = ({ toggleProperties, value, onChange }: ToggleProps) => {
  return (
    <>
      <PropertyLabel label={toggleProperties.label} />
      <div className={styles.buttonRow}>
        <div className={styles.toggleContainer} onClick={() => onChange(!value)}>
          <div className={`${styles.toggleButton} ${value && styles.toggleButtonChecked}`} />
        </div>
        {value ? <p>on</p> : <p>off</p>}
      </div>
    </>
  );
};
export default Toggle;
