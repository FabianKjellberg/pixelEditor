import styles from './Menu.module.css';
import SyncToCloudStatus from './TopMenuComponents/SyncToCloudStatus/SyncToCloudStatus';
import TopMenuButtonItem from './TopMenuComponents/TopMenuButton/TopMenuButton';
import TopMenuCanvas from './TopMenuComponents/TopMenuCanvas/TopMenuCanvas';
import TopMenuEdit from './TopMenuComponents/TopMenuEdit/TopMenuEdit';
import TopMenuFile from './TopMenuComponents/TopMenuFile/TopMenuFile';
import TopMenuLayer from './TopMenuComponents/TopMenuLayer/TopMenuLayer';
import TopMenuLogin from './TopMenuComponents/TopMenuLogin/TopMenuLogin';
import TopMenuSelection from './TopMenuComponents/TopMenuSelection/TopMenuSelection';

const TopMenu = () => {
  return (
    <>
      <div className={styles.topMenu}>
        <div className={styles.leftSide}>
          <TopMenuButtonItem label={'File'} contextMenu={<TopMenuFile />} />
          <TopMenuButtonItem label={'Edit'} contextMenu={<TopMenuEdit />} />
          <TopMenuButtonItem label={'Canvas'} contextMenu={<TopMenuCanvas />} />
          <TopMenuButtonItem label={'Layer'} contextMenu={<TopMenuLayer />} />
          <TopMenuButtonItem label={'Selection'} contextMenu={<TopMenuSelection />} />
          <SyncToCloudStatus />
        </div>
        <div className={styles.rightSide}>
          <TopMenuLogin />
        </div>
      </div>
    </>
  );
};
export default TopMenu;
