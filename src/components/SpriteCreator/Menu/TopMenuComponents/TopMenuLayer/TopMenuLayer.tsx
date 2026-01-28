'use client';

import { useCallback, useMemo } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import { useSettingsContext } from '@/context/SettingsContext';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';

const TopMenuLayer = () => {
  const { showSelectedLayerBoundary, setShowSelectedLayerBoundary } = useSettingsContext();

  const { onHide } = useContextMenuContext();

  const showLayerBoundaryLabel = useMemo((): string => {
    return showSelectedLayerBoundary
      ? 'Hide selected layer boundary'
      : 'Show selected layer boundary';
  }, [showSelectedLayerBoundary]);

  const showLayerBoundaryOnClick = useCallback(() => {
    setShowSelectedLayerBoundary(!showSelectedLayerBoundary);
    onHide();
  }, []);

  return (
    <>
      <TopMenuItem text={showLayerBoundaryLabel} onClick={() => showLayerBoundaryOnClick()} />
    </>
  );
};
export default TopMenuLayer;
