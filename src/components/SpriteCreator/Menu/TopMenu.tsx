import styles from './Menu.module.css';
import TopMenuButtonItem from './TopMenuComponents/TopMenuButton/TopMenuButton';
import TopMenuCanvas from './TopMenuComponents/TopMenuCanvas/TopMenuCanvas';
import TopMenuFile from './TopMenuComponents/TopMenuFile/TopMenuFile';

const TopMenu = () => {
  return (
    <>
      <div className={styles.topMenu}>
        <TopMenuButtonItem label={'File'} contextMenu={<TopMenuFile />} />
        <TopMenuButtonItem label={'Canvas'} contextMenu={<TopMenuCanvas />} />
      </div>
    </>
  );
};
export default TopMenu;
