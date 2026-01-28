import styles from './PropertyLabel.module.css';

type PropertyLabelProps = {
  label: string;
};

const PropertyLabel = ({ label }: PropertyLabelProps) => {
  return <p className={styles.propertyLabel}>{label}:</p>;
};
export default PropertyLabel;
