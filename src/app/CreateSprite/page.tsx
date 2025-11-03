import styles from './page.module.css';
import Canvas from '@/components/SpriteCreator/Canvas/Canvas';
import ContextProviderWrapper from '@/components/SpriteCreator/ContextProviderWrapper';
import LeftMenu from '@/components/SpriteCreator/Menu/LeftMenu';
import RightMenu from '@/components/SpriteCreator/Menu/RightMenu';
import TopMenu from '@/components/SpriteCreator/Menu/TopMenu';

const CreateSprite = () => {
  return (
    <div className={styles.createSprite}>
      <ContextProviderWrapper>
        <TopMenu />
        <div className={styles.mainScreen}>
          <LeftMenu />
          <Canvas />
          <RightMenu />
        </div>
      </ContextProviderWrapper>
    </div>
  );
};
export default CreateSprite;
