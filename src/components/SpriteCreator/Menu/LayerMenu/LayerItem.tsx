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
  const { layerTreeItems, activeLayerIds } = useLayerContext();

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
  }, [deleteItem, layer.id]);

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
          <LayerLayerContext />
        </>
      );

      onShow(contextMenu, e.clientX, e.clientY);
    },
    [onShow, layerTreeItems, setIsEditing],
  );

  const onClickLayer = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      onSelectItem(layer.id, e.shiftKey, e.ctrlKey);
    },
    [onSelectItem],
  );

  const selected = useMemo(
    (): boolean => activeLayerIds.some((id) => id === layer.id),
    [layer.id, activeLayerIds],
  );

  return (
    <div
      draggable={!isEditing}
      className={`${styles.layerItem} ${styles.row} ${selected ? styles.selected : ''} ${
        dropAt === DropAtEnum.below ? styles.below : dropAt === DropAtEnum.over ? styles.over : ''
      }`}
      onDoubleClick={() => setIsEditing(true)}
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
          <span>{layer.name}</span>
        )}
      </div>
    </div>
  );
};

export default LayerItem;
