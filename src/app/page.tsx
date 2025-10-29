import styles from './page.module.css';
import Tree from '@/components/FileTree/Tree/Tree';

export default function Home() {
  return (
    <>
      <div className={styles.page}>
        <div className={styles.testingCss}>
          <Tree />
        </div>
      </div>
    </>
  );
}
