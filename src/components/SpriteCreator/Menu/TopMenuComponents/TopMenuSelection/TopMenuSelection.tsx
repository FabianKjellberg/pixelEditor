'use client';

import { useCallback, useMemo } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import { useCanvasContext } from '@/context/CanvasContext';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { LayerEntity, SelectionLayer } from '@/models/Layer';
import styles from '../TopMenuItem/TopMenuItem.module.css';
import {
  addVisibleLayerToSelection,
  createSelectionLayer,
  inverseSelection,
  selectLayer,
} from '@/util/SelectionUtil';
import { useLayerContext } from '@/context/LayerContext';
import { combineManyRectangles } from '@/util/LayerUtil';

const TopMenuSelection = () => {
  const { selectionLayer, setSelectionLayer, getCanvasRect } = useCanvasContext();
  const { onHide } = useContextMenuContext();
  const { activeLayerIds, layerTreeItems } = useLayerContext();

  const clearSelectionOnClick = useCallback(() => {
    setSelectionLayer(undefined);
    onHide();
  }, []);

  const selectLayerOnClick = useCallback(() => {
    if (activeLayerIds.length < 1) return;

    const layers: LayerEntity[] = layerTreeItems.filter(
      (item): item is LayerEntity =>
        item.type === 'layer' && activeLayerIds.some((id) => id === item.id),
    );

    const rect = combineManyRectangles(layers.map((layer) => layer.layer.rect));

    const sl = createSelectionLayer(rect, false);

    console.log(sl);

    layers.map((layer) => {
      addVisibleLayerToSelection(layer, sl);
    });

    setSelectionLayer(sl);
    onHide();
  }, [activeLayerIds, setSelectionLayer, layerTreeItems]);

  const inverseSelectionOnClick = useCallback(() => {
    const canvasRect = getCanvasRect();

    const sl: SelectionLayer = inverseSelection(selectionLayer, canvasRect);

    setSelectionLayer(sl);
    onHide();
  }, []);

  const selectAllOnClick = useCallback(() => {
    const cr = getCanvasRect();

    const sl = createSelectionLayer(cr, true);

    setSelectionLayer(sl);
    onHide();
  }, []);

  const clearDisabled = useMemo(() => selectionLayer === undefined, [selectionLayer]);

  const activeLayerDisabled = useMemo(() => activeLayerIds.length < 1, [activeLayerIds]);

  return (
    <>
      <TopMenuItem text={'Select All'} onClick={selectAllOnClick} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Deselect'} onClick={clearSelectionOnClick} disabled={clearDisabled} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Invert'} onClick={inverseSelectionOnClick} disabled={clearDisabled} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem
        text={'From Active Layer/s'}
        onClick={selectLayerOnClick}
        disabled={activeLayerDisabled}
      />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'from color range'} onClick={() => {}} disabled={true} />
    </>
  );
};
export default TopMenuSelection;
