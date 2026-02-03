import React from 'react';
import styles from '../Documentation.module.css';

export type FlowchartItemProps = {
  stepNumber: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  showDivider?: boolean;
};

const FlowchartItem = ({
  stepNumber,
  title,
  description,
  imageSrc,
  imageAlt,
  showDivider = true,
}: FlowchartItemProps) => {
  return (
    <>
      <div className={styles.flowStep} style={stepNumber === 1 ? { marginTop: '24px' } : undefined}>
        <span className={styles.stepNumber}>{stepNumber}.</span>
        <span>
          <b>{title}</b>
        </span>
      </div>
      <p style={{ marginBottom: '12px', marginLeft: '36px' }}>{description}</p>
      <img src={imageSrc} alt={imageAlt} className={styles.authFlowImage} />
      {showDivider && <hr className={styles.flowDivider} />}
    </>
  );
};

export default FlowchartItem;
