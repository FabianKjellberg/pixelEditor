'use client';

import { LayerEntity } from '@/models/Layer';
import styles from './LayerMenu.module.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLayerSelectorContext } from '@/context/LayerSelectorContext';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import GeneralLayerContext from './LayerContextMenu.tsx/GeneralLayerContext';
import LayerLayerContext from './LayerContextMenu.tsx/LayerLayerContext';
import { useLayerContext } from '@/context/LayerContext';
import ConfirmationModal from '../../Modals/ConfirmationModal/ConfirmationModal';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import { useMetaDataAutoSaveContext } from '@/context/MetaDataAutoSaveContext';
import { useCanvasContext } from '@/context/CanvasContext';
import {
  combineManyRectangles,
  combineRectangles,
  createLayerEntity,
  stampLayer,
} from '@/util/LayerUtil';
import { error } from 'console';

type LayerItemProp = {
  layer: LayerEntity;
};

export enum DropAtEnum {
  over,
  below,
  on,
  none,
}

const LayerItem = ({ layer }: LayerItemProp) => {
  const {
    changeLayerName,
    setDragId,
    dragId,
    checkDropAvailability,
    dropItem,
    addLayer,
    addGroup,
    deleteItem,
    onSelectItem,
  } = useLayerSelectorContext();
  const { onShow, onHide } = useContextMenuContext();
  const { onShow: onShowModal } = useModalContext();
  const { layerTreeItems, activeLayerIds, setLayerTreeItems, markDirty, setLayerById } =
    useLayerContext();
  const { addChange } = useMetaDataAutoSaveContext();
  const { isLoadedFromCloud } = useCanvasContext();

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(layer.name);
  const [dropAt, setDropAt] = useState<DropAtEnum>(DropAtEnum.none);

  useEffect(() => {
    setInputValue(layer.name);
  }, [layer.name]);

  const commitInput = useCallback(() => {
    const next = inputValue.trim();
    if (next.length > 0 && next !== layer.name) {
      changeLayerName(layer.id, next);
    }
    setIsEditing(false);
  }, [changeLayerName, layer.id, layer.name, inputValue]);

  const cancelInput = useCallback(() => {
    setInputValue(layer.name);
    setIsEditing(false);
  }, [layer.name]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const onDragStartCallback = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setDragId(layer.id);
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (dragId === layer.id) return;

      const rect = e.currentTarget.getBoundingClientRect();

      const middle = rect.top + rect.height / 2;

      const position = e.clientY > middle ? DropAtEnum.below : DropAtEnum.over;

      const canDrop = checkDropAvailability(position, layer.id);

      if (!canDrop) return;

      setDropAt(position);
    },
    [dragId, checkDropAvailability, layer.id],
  );

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropAt(DropAtEnum.none);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const drop = dropAt;

      dropItem(drop, dragId, layer.id);

      setDropAt(DropAtEnum.none);
    },
    [dropItem, setDropAt, dropAt, dragId, layer.id],
  );

  const addLayerBelowCallback = useCallback(() => {
    const index = layerTreeItems.findIndex((item) => item.id === layer.id);
    if (index === -1) return;

    addLayer(index + 1);
  }, [layerTreeItems, addLayer, layer.id]);

  const addGroupBelowCallback = useCallback(() => {
    const index = layerTreeItems.findIndex((item) => item.id === layer.id);
    if (index === -1) return;

    addGroup(index + 1);
  }, [layerTreeItems, addGroup, layer.id]);

  const deleteLayer = useCallback(() => {
    deleteItem(layer.id);
  }, [deleteItem, layer]);

  const deleteCallback = useCallback(() => {
    const deleteLayerId = 'delete-layer';

    const deleteModal = (
      <ConfirmationModal
        id={deleteLayerId}
        text={`Are you sure you want to delete ${layer.name}.`}
        callbackFunction={deleteLayer}
      />
    );

    onShowModal(deleteLayerId, deleteModal, 'Warning');
    onHide();
  }, [onShow, deleteLayer]);

  const mergeDownDisabled = useMemo((): boolean => {
    const index = layerTreeItems.findIndex((item) => item.id === layer.id);

    if (layerTreeItems.length <= index + 1) return true;

    if (layerTreeItems[index + 1].type === 'layer') return false;

    return true;
  }, [layer.id, layerTreeItems]);

  const mergeSelectedDisabled = useMemo((): boolean => {
    return activeLayerIds.length <= 1;
  }, [activeLayerIds]);

  const onMergeDownCallback = useCallback(() => {
    const layerIndex = layerTreeItems.findIndex((item) => item.id === layer.id);

    const layerToStamp = layerTreeItems[layerIndex];
    const originalLayer = layerTreeItems[layerIndex + 1];

    if (originalLayer.type != 'layer' || layerToStamp.type != 'layer')
      throw new Error('layer not found');

    const newLayer = stampLayer(layerToStamp.layer, originalLayer.layer, false);

    const dirtyRect = combineRectangles(layerToStamp.layer.rect, originalLayer.layer.rect);

    setLayerById({ ...originalLayer, layer: newLayer }, dirtyRect);

    deleteItem(layerToStamp.id);
  }, [layerTreeItems, markDirty, deleteItem, setLayerById]);

  const onDuplicateCallback = useCallback(() => {
    const newLayer = layer.layer;
    const newLayerId = crypto.randomUUID();
    const newLayerEntity = createLayerEntity(
      layer.name + ' - copy',
      newLayerId,
      newLayer,
      layer.opacity,
      layer.visible,
    );

    const layerIndex = layerTreeItems.findIndex((l) => l.id === layer.id && l.type === 'layer');

    addLayer(layerIndex + 1, newLayerEntity);
    onHide();
  }, [addLayer, layerTreeItems, layer]);

  const onMergeSelectedCallback = useCallback(() => {
    const stampLayers = [];

    for (let i = 0; i < layerTreeItems.length; i++) {
      const item = layerTreeItems[i];

      if (item.type === 'layer' && activeLayerIds.some((id) => id === item.id)) {
        stampLayers.push(item);
      }
    }

    const dirtyRect = combineManyRectangles(stampLayers.map((layer) => layer.layer.rect));

    const finalLayer = stampLayers.pop();

    if (!finalLayer) throw new Error('final item not found merging many layers');

    console.log(stampLayers, finalLayer);

    for (let i = stampLayers.length - 1; i >= 0; i--) {
      finalLayer.layer = stampLayer(stampLayers[i].layer, finalLayer.layer, false);
    }

    setLayerById(finalLayer, dirtyRect);

    stampLayers.map((layer) => {
      deleteItem(layer.id);
    });
  }, [layerTreeItems, setLayerById, deleteItem]);

  const contextMenuCallback = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();

      const contextMenu = (
        <>
          <GeneralLayerContext
            editNameTrigger={() => setIsEditing(true)}
            addLayerBelowTrigger={addLayerBelowCallback}
            addGroupBelowTrigger={addGroupBelowCallback}
            deleteTrigger={deleteCallback}
            deleteDisabled={layerTreeItems.length <= 1}
          />
          <LayerLayerContext
            layer={layer}
            mergeDownDisabled={mergeDownDisabled}
            onMergeDownCallback={onMergeDownCallback}
            onDuplicateCallback={onDuplicateCallback}
            mergeSelectedDisabled={mergeSelectedDisabled}
            onMergeSelectedCallback={onMergeSelectedCallback}
          />
        </>
      );

      onShow(contextMenu, e.clientX, e.clientY);
    },
    [
      onShow,
      layerTreeItems,
      setIsEditing,
      mergeDownDisabled,
      mergeSelectedDisabled,
      onMergeDownCallback,
      onMergeSelectedCallback,
      onDuplicateCallback,
    ],
  );

  const onClickLayer = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      onSelectItem(layer.id, e.shiftKey, e.ctrlKey || e.metaKey);
    },
    [onSelectItem],
  );

  const selected = useMemo(
    (): boolean => activeLayerIds.some((id) => id === layer.id),
    [layer.id, activeLayerIds],
  );

  const onClickVisibleCallback = useCallback(() => {
    const currentLayer = layerTreeItems.find(
      (item) => item.type === 'layer' && item.id === layer.id,
    );

    if (!currentLayer || currentLayer.type !== 'layer') return;

    const nextVisible = !currentLayer.visible;

    setLayerTreeItems((prev) =>
      prev.map((item) =>
        item.type === 'layer' && item.id === layer.id ? { ...item, visible: nextVisible } : item,
      ),
    );

    if (isLoadedFromCloud) {
      addChange({ type: 'visible', visible: nextVisible, id: layer.id });
    }

    markDirty(layer.layer.rect);
  }, [setLayerTreeItems, markDirty, layer, isLoadedFromCloud, addChange]);

  return (
    <div
      draggable={!isEditing}
      className={`${styles.layerItem} ${styles.row} ${selected ? styles.selected : ''} ${
        dropAt === DropAtEnum.below ? styles.below : dropAt === DropAtEnum.over ? styles.over : ''
      }`}
      onClick={onClickLayer}
      onDragStart={onDragStartCallback}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onContextMenu={contextMenuCallback}
    >
      <div>
        {isEditing ? (
          <input
            autoFocus
            value={inputValue}
            onChange={onInputChange}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitInput();
              if (e.key === 'Escape') cancelInput();
            }}
          />
        ) : (
          <div className={styles.layerBar}>
            <span onDoubleClick={() => setIsEditing(true)}>{layer.name}</span>
            <button className={styles.visibleButton} onClick={onClickVisibleCallback}>
              <img
                src={layer.visible ? '/icons/openEye.png' : 'icons/closedEye.png'}
                className={styles.buttonIcon}
                width={18}
                height={18}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerItem;
