import React from 'react';
import styles from './DocumentationSection.module.css';

type DocumentationSectionProps = {
  title: string;
  children: React.ReactNode;
};

const DocumentationSection = ({ title, children }: DocumentationSectionProps) => {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>{children}</div>
    </section>
  );
};

export default DocumentationSection;
