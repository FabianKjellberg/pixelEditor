import { CanvasProvider } from '@/context/CanvasContext';
import { ContextMenuProvider } from '@/context/ContextMenuContext/ContextMenuContext';
import { LayerProvider } from '@/context/LayerContext';
import { ModalProvider } from '@/context/ModalContext/ModalContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToolProvider } from '@/context/ToolContext';

const ContextProviderWrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>
    <CanvasProvider>
      <LayerProvider>
        <ToolProvider>
          <ModalProvider>
            <ContextMenuProvider>{children}</ContextMenuProvider>
          </ModalProvider>
        </ToolProvider>
      </LayerProvider>
    </CanvasProvider>
  </SettingsProvider>
);

export default ContextProviderWrapper;
