import styles from './page.module.css';
import Canvas from '@/components/SpriteCreator/Canvas/Canvas';
import ContextProviderWrapper from '@/components/SpriteCreator/ContextProviderWrapper';
import LeftMenu from '@/components/SpriteCreator/Menu/LeftMenu';
import RightMenu from '@/components/SpriteCreator/Menu/RightMenu';

const CreateSprite = () => {
  return (
    <div className={styles.createSprite}>
      <ContextProviderWrapper>
        <LeftMenu />
        <Canvas />
        <RightMenu />
      </ContextProviderWrapper>
    </div>
  );
};
export default CreateSprite;
