import styles from './page.module.css';
import Canvas from '@/components/SpriteCreator/Canvas/Canvas';
import Menu from '@/components/SpriteCreator/Menu/Menu';
import { LayerProvider } from '@/context/LayerContext';
import { ToolProvider } from '@/context/ToolContext';

const CreateSprite = () => {
  return (
    <div className={styles.createSprite}>
      <LayerProvider>
        <ToolProvider>
          <Menu />
          <Canvas />
        </ToolProvider>
      </LayerProvider>
    </div>
  );
};
export default CreateSprite;
