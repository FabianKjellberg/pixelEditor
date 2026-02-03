import React from 'react';
import styles from './ChangelogEntry.module.css';

type ChangelogEntryProps = {
  date: string;
  title?: string;
  children: React.ReactNode;
};

const ChangelogEntry = ({ date, title, children }: ChangelogEntryProps) => {
  return (
    <section className={styles.entry}>
      <h3 className={styles.title}>
        {date}
        {title && ` ${title}`}
      </h3>
      <ul className={styles.list}>{children}</ul>
    </section>
  );
};

export default ChangelogEntry;
