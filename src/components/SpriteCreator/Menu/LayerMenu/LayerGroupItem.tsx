'use client';

import { LayerGroupStart, LayerTreeItem } from '@/models/Layer';

import styles from './LayerMenu.module.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLayerSelectorContext } from '@/context/LayerSelectorContext';
import { DropAtEnum } from './LayerItem';
import LayerGroup from './LayerGroup';
import GeneralLayerContext from './LayerContextMenu.tsx/GeneralLayerContext';
import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { useLayerContext } from '@/context/LayerContext';
import ConfirmationModal from '../../Modals/ConfirmationModal/ConfirmationModal';
import { useModalContext } from '@/context/ModalContext/ModalContext';

type LayerGroupItemProps = {
  group: LayerGroupStart;
  groupItems: LayerTreeItem[];
};

const LayerGroupItem = ({ group, groupItems }: LayerGroupItemProps) => {
  const {
    collapseGroup,
    changeLayerName,
    setDragId,
    dragId,
    checkDropAvailability,
    dropItem,
    deleteItem,
    addLayer,
    addGroup,
    onSelectItem,
  } = useLayerSelectorContext();
  const { onShow, onHide } = useContextMenuContext();
  const { onShow: onShowModal } = useModalContext();
  const { layerTreeItems } = useLayerContext();

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(group.name);
  const [dropAt, setDropAt] = useState<DropAtEnum>(DropAtEnum.none);

  const dragPreviewRef = useRef<HTMLDivElement>(null);

  const collapseGroupCallback = useCallback(() => {
    collapseGroup(group.id);
  }, [group]);

  useEffect(() => {
    setInputValue(group.name);
  }, [group.name]);

  const commitInput = useCallback(() => {
    const next = inputValue.trim();
    if (next.length > 0 && next !== group.name) {
      changeLayerName(group.id, next);
    }
    setIsEditing(false);
  }, [changeLayerName, group.id, group.name, inputValue]);

  const cancelInput = useCallback(() => {
    setInputValue(group.name);
    setIsEditing(false);
  }, [group.name]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const onDragStartCallback = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (dragPreviewRef.current) {
      e.dataTransfer.setDragImage(dragPreviewRef.current, 0, 0);
    }

    setDragId(group.id);
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (dragId === group.id) return;

      const rect = e.currentTarget.getBoundingClientRect();

      const middle = rect.height / 3;

      const position =
        e.clientY < rect.top + middle
          ? DropAtEnum.over
          : e.clientY < rect.top + middle * 2
            ? DropAtEnum.on
            : DropAtEnum.below;

      const canDrop = checkDropAvailability(position, group.id);

      if (!canDrop) return;

      setDropAt(position);
    },
    [dragId, checkDropAvailability, group.id],
  );

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropAt(DropAtEnum.none);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const drop = dropAt;

      dropItem(drop, dragId, group.id);

      setDropAt(DropAtEnum.none);
    },
    [dropAt, dragId, dropItem, setDropAt, group.id],
  );

  const deleteLayer = useCallback(() => {
    deleteItem(group.id);
  }, [deleteItem, group.id]);

  const deleteCallback = useCallback(() => {
    const deleteLayerId = 'delete-layer';

    const startIndex = layerTreeItems.findIndex(
      (i) => i.type === 'group-start' && i.id === group.id,
    );
    const endIndex = layerTreeItems.findIndex((i) => i.type === 'group-end' && i.id === group.id);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return;
    }

    const layerCount = layerTreeItems
      .slice(startIndex + 1, endIndex)
      .filter((i) => i.type === 'layer').length;

    const layerWord = layerCount === 1 ? 'layer' : 'layers';

    const deleteModal = (
      <ConfirmationModal
        id={deleteLayerId}
        text={`Are you sure you want to delete ${group.name} and ${layerCount} ${layerWord}.`}
        callbackFunction={deleteLayer}
      />
    );

    onShowModal(deleteLayerId, deleteModal, 'Warning');
    onHide();
  }, [layerTreeItems, group.id, group.name, deleteLayer, onShowModal, onHide]);

  const addLayerBelowCallback = useCallback(() => {
    const index = layerTreeItems.findIndex(
      (item) => item.id === group.id && item.type === 'group-end',
    );
    if (index === -1) return;

    addLayer(index + 1);
  }, [layerTreeItems, addLayer, group.id]);

  const addGroupBelowCallback = useCallback(() => {
    const index = layerTreeItems.findIndex(
      (item) => item.id === group.id && item.type === 'group-end',
    );
    if (index === -1) return;

    addGroup(index + 1);
  }, [layerTreeItems, addGroup, group.id]);

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
        </>
      );

      onShow(contextMenu, e.clientX, e.clientY);
    },
    [onShow, layerTreeItems, setIsEditing],
  );

  const onGroupClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      onSelectItem(group.id, e.shiftKey, e.ctrlKey);
    },
    [onSelectItem],
  );

  return (
    <div
      className={`${styles.row} ${
        dropAt === DropAtEnum.below ? styles.below : dropAt === DropAtEnum.over ? styles.over : ''
      }`}
    >
      <div
        className={`${styles.layerGroupItem} ${dropAt === DropAtEnum.on ? styles.on : ''}`}
        draggable={!isEditing}
        onDoubleClick={() => setIsEditing(true)}
        onDragStart={onDragStartCallback}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onContextMenu={contextMenuCallback}
        onClick={onGroupClick}
      >
        <div className={styles.iconAndName} ref={dragPreviewRef}>
          <img
            src="/icons/folder.png"
            width={16}
            height={16}
            alt="folder"
            className={styles.buttonIcon}
          />
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
            <p>{group.name}</p>
          )}
        </div>
        <div>
          <button
            className={styles.chevronButton}
            onClick={collapseGroupCallback}
            disabled={groupItems.length < 1}
          >
            <img
              src="/icons/chevron.png"
              width={8}
              height={8}
              alt="folder"
              className={`${styles.buttonIcon} ${
                group.collapsed || groupItems.length < 1 ? styles.rotatedChevron : ''
              }`}
            />
          </button>
        </div>
      </div>
      <div
        className={`${styles.groupContent} ${
          group.collapsed || groupItems.length < 1 ? styles.collapsed : styles.expanded
        }`}
      >
        <LayerGroup layerGroup={groupItems} />
      </div>
    </div>
  );
};
export default LayerGroupItem;
