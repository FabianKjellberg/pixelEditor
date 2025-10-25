import styles from './page.module.css';
import Canvas from '@/components/SpriteCreator/Canvas/Canvas';
import Menu from '@/components/SpriteCreator/Menu/Menu';
import { CanvasProvider } from '@/context/CanvasContext';
import { ContextMenuProvider } from '@/context/ContextMenuContext/ContextMenuContext';
import { LayerProvider } from '@/context/LayerContext';
import { ToolProvider } from '@/context/ToolContext';

const CreateSprite = () => {
  return (
    <div className={styles.createSprite}>
      <ContextMenuProvider>
        <CanvasProvider>
          <LayerProvider>
            <ToolProvider>
              <Menu />
              <Canvas />
            </ToolProvider>
          </LayerProvider>
        </CanvasProvider>
      </ContextMenuProvider>
    </div>
  );
};
export default CreateSprite;
