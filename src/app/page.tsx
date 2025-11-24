import FrontPage from '@/components/FrontPage/FrontPage';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <div className={`${styles.page} scrollable`}>
        <FrontPage />
      </div>
    </>
  );
}
