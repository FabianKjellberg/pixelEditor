'use client';

import { useCallback, useMemo } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import { useCanvasContext } from '@/context/CanvasContext';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';

const TopMenuSelection = () => {
  const { selectionLayer, setSelectionLayer } = useCanvasContext();
  const { onHide } = useContextMenuContext();

  const clearSelectionOnClick = useCallback(() => {
    setSelectionLayer(undefined);
    onHide();
  }, []);

  const disabled = useMemo(() => selectionLayer === undefined, [selectionLayer]);

  return (
    <TopMenuItem text={'Clear selection'} onClick={clearSelectionOnClick} disabled={disabled} />
  );
};
export default TopMenuSelection;
