'use client';

import { useCallback, useMemo } from 'react';
import TopMenuItem from '../TopMenuItem/TopMenuItem';
import { useCanvasContext } from '@/context/CanvasContext';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { SelectionLayer } from '@/models/Layer';
import styles from '../TopMenuItem/TopMenuItem.module.css';
import { createSelectionLayer, inverseSelection, selectLayer } from '@/util/SelectionUtil';
import { useLayerContext } from '@/context/LayerContext';

const TopMenuSelection = () => {
  const { selectionLayer, setSelectionLayer, getCanvasRect } = useCanvasContext();
  const { onHide } = useContextMenuContext();
  const { activeLayer } = useLayerContext();

  const clearSelectionOnClick = useCallback(() => {
    setSelectionLayer(undefined);
    onHide();
  }, []);

  const selectLayerOnClick = useCallback(() => {
    const sl: SelectionLayer = selectLayer(activeLayer.layer);

    setSelectionLayer(sl);
    onHide();
  }, []);

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

  const disabled = useMemo(() => selectionLayer === undefined, [selectionLayer]);

  return (
    <>
      <TopMenuItem text={'Select All'} onClick={selectAllOnClick} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Deselect'} onClick={clearSelectionOnClick} disabled={disabled} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'Invert'} onClick={inverseSelectionOnClick} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'From Active Layer/s'} onClick={selectLayerOnClick} />
      <div className={styles.topMenuItemBorder} />
      <TopMenuItem text={'from color range'} onClick={() => {}} disabled={true} />
    </>
  );
};
export default TopMenuSelection;
