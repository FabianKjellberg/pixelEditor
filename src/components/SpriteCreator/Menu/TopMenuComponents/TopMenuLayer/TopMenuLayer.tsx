'use client';

import { useCallback, useMemo } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import { useSettingsContext } from '@/context/SettingsContext';
import styles from '../TopMenuItem/TopMenuItem.module.css';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { useTransformContext } from '@/context/TransformContext';
import { useLayerContext } from '@/context/LayerContext';
import { combineManyRectangles } from '@/util/LayerUtil';
import { LayerEntity } from '@/models/Layer';
import { useToastContext } from '@/context/ToastContext/ToastContext';

const TopMenuLayer = () => {
  const { showSelectedLayerBoundary, setShowSelectedLayerBoundary } = useSettingsContext();
  const { transforming, setTransforming } = useTransformContext();
  const { activeLayerIds, layerTreeItems } = useLayerContext();
  const { onToast } = useToastContext();
  const { onHide } = useContextMenuContext();

  const showLayerBoundaryLabel = useMemo((): string => {
    return showSelectedLayerBoundary
      ? 'Hide selected layer boundary'
      : 'Show selected layer boundary';
  }, [showSelectedLayerBoundary]);

  const showLayerBoundaryOnClick = useCallback(() => {
    setShowSelectedLayerBoundary(!showSelectedLayerBoundary);
    onHide();
  }, [activeLayerIds, layerTreeItems]);

  const freeTransformLayerCallback = useCallback(() => {
    const activeLayers: LayerEntity[] = layerTreeItems.filter((layer): layer is LayerEntity =>
      activeLayerIds.some((id) => id === layer.id),
    );

    const rectangle = combineManyRectangles(activeLayers.map((layer) => layer.layer.rect));

    if (rectangle.height > 0 && rectangle.width > 0) {
      if (!transforming) {
        setTransforming(true);
      }
    } else {
      onToast('You need to have atleast one layer with pixeldata selected', 'warning');
    }
    onHide();
  }, [transforming, setTransforming]);

  return (
    <>
      <TopMenuItem text={showLayerBoundaryLabel} onClick={showLayerBoundaryOnClick} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Free Transform'} onClick={freeTransformLayerCallback} />
    </>
  );
};
export default TopMenuLayer;
