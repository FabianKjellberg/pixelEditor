'use client';

import styles from './LayerContext.module.css';
import Slider, { SliderProps } from '../../Tools/Properties/Slider/Slider';
import { LayerEntity } from '@/models/Layer';
import { useCallback, useMemo } from 'react';
import { useLayerContext } from '@/context/LayerContext';
import { ISlider } from '@/models/properties/PropertySpecs';
import { useCanvasContext } from '@/context/CanvasContext';
import { useMetaDataAutoSaveContext } from '@/context/MetaDataAutoSaveContext';

type LayerLayerContextProps = {
  layer: LayerEntity;
  onDuplicateCallback: () => void;
  onMergeDownCallback: () => void;
  mergeDownDisabled: boolean;
  onMergeSelectedCallback: () => void;
  mergeSelectedDisabled: boolean;
};

const LayerLayerContext = ({
  layer,
  onDuplicateCallback,
  onMergeDownCallback,
  mergeDownDisabled,
  onMergeSelectedCallback,
  mergeSelectedDisabled,
}: LayerLayerContextProps) => {
  const { setLayerTreeItems, layerTreeItems, markDirty } = useLayerContext();
  const { isLoadedFromCloud } = useCanvasContext();
  const { addChange } = useMetaDataAutoSaveContext();

  const opacity = useMemo((): number => {
    const thisItem = layerTreeItems.find((item) => item.type === 'layer' && item.id === layer.id);

    if (thisItem?.type === 'layer') {
      return thisItem.opacity;
    }

    return 0;
  }, [layerTreeItems]);

  const sliderProps: ISlider = {
    type: 'slider',
    label: 'Opacity',
    min: 0,
    max: 255,
  };

  const onChangeOpacity = useCallback(
    (value: number) => {
      setLayerTreeItems((prev) =>
        prev.map((item) =>
          item.id === layer.id && item.type === 'layer' ? { ...item, opacity: value } : item,
        ),
      );

      if (isLoadedFromCloud) {
        addChange({ type: 'opacity', opacity: value, id: layer.id });
      }

      markDirty(layer.layer.rect);
    },
    [opacity, setLayerTreeItems, markDirty, layer, isLoadedFromCloud, addChange],
  );

  const onDuplicateClick = useCallback(() => {
    onDuplicateCallback();
  }, [onDuplicateCallback]);

  const onMergeDownClick = useCallback(() => {
    onMergeDownCallback();
  }, [onMergeDownCallback, layer.id]);

  const onMergeSelectedClick = useCallback(() => {
    onMergeSelectedCallback();
  }, [onMergeSelectedCallback]);

  return (
    <div className={styles.layout}>
      <p className={styles.category}>Layer</p>
      <div className={styles.border} />
      <button onClick={onDuplicateClick}>Duplicate</button>
      <div className={styles.border} />
      <button disabled={mergeDownDisabled} onClick={onMergeDownClick}>
        Merge down
      </button>
      <div className={styles.border} />
      <button disabled={mergeSelectedDisabled} onClick={onMergeSelectedClick}>
        Merge selected
      </button>
      <div className={styles.border} />
      <div className={styles.opacitySlider}>
        <Slider value={opacity} sliderProperties={sliderProps} onChange={onChangeOpacity} />
      </div>
    </div>
  );
};

export default LayerLayerContext;
