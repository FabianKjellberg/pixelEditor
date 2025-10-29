import styles from './page.module.css';
import Canvas from '@/components/SpriteCreator/Canvas/Canvas';
import ContextProviderWrapper from '@/components/SpriteCreator/ContextProviderWrapper';
import Menu from '@/components/SpriteCreator/Menu/Menu';

const CreateSprite = () => {
  return (
    <div className={styles.createSprite}>
      <ContextProviderWrapper>
        <Menu />
        <Canvas />
      </ContextProviderWrapper>
    </div>
  );
};
export default CreateSprite;
