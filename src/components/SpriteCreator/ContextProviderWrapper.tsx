import { AutoSaveProvider } from '@/context/AutoSaveContext';
import { CanvasProvider } from '@/context/CanvasContext';
import { ContextMenuProvider } from '@/context/ContextMenuContext/ContextMenuContext';
import { LayerProvider } from '@/context/LayerContext';
import { ModalProvider } from '@/context/ModalContext/ModalContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToolProvider } from '@/context/ToolContext';
import { UserContextProvider } from '@/context/UserContextProvider';

const ContextProviderWrapper = ({ children }: { children: React.ReactNode }) => (
  <UserContextProvider>
    <SettingsProvider>
      <AutoSaveProvider>
        <CanvasProvider>
          <LayerProvider>
            <ToolProvider>
              <ModalProvider>
                <ContextMenuProvider>{children}</ContextMenuProvider>
              </ModalProvider>
            </ToolProvider>
          </LayerProvider>
        </CanvasProvider>
      </AutoSaveProvider>
    </SettingsProvider>
  </UserContextProvider>
);

export default ContextProviderWrapper;
