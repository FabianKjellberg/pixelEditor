'use client';

import { LayerEntity } from '@/models/Layer';
import styles from './LayerMenu.module.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useLayerSelectorContext } from '@/context/LayerSelectorContext';

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
  const { changeLayerName, setDragId, dragId, checkDropAvailability, dropItem } =
    useLayerSelectorContext();

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

  return (
    <div
      draggable={!isEditing}
      className={`${styles.layerItem} ${styles.row} ${
        dropAt === DropAtEnum.below ? styles.below : dropAt === DropAtEnum.over ? styles.over : ''
      }`}
      onDoubleClick={() => setIsEditing(true)}
      onDragStart={onDragStartCallback}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
