'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLayerContext } from './LayerContext';
import { createLayerEntity } from '@/util/LayerUtil';
import { LayerGroupEnd, LayerGroupStart } from '@/models/Layer';
import { DropAtEnum } from '@/components/SpriteCreator/Menu/LayerMenu/LayerItem';
import { removeRange } from '@/util/LayerSelectorUtil';

type LayerSelectorContextValue = {
  collapseGroup: (groupId: string) => void;
  changeLayerName: (id: string, name: string) => void;
  addLayer: () => void;
  addGroup: () => void;
  deleteLayer: () => void;
  dragId: string;
  setDragId: (id: string) => void;
  checkDropAvailability: (position: DropAtEnum, id: string) => boolean;
  dropItem: (position: DropAtEnum, fromId: string, toId: string) => void;
};

const LayerSelectorContext = createContext<LayerSelectorContextValue | undefined>(undefined);

export const LayerSelectorProvider = ({ children }: { children: React.ReactNode }) => {
  const { setLayerTreeItems, layerTreeItems } = useLayerContext();

  const [dragId, setDragId] = useState<string>('');

  const collapseGroup = useCallback(
    (groupId: string) => {
      setLayerTreeItems((prev) => {
        const next = prev.map((group) =>
          group.type === 'group-start' && group.id === groupId
            ? { ...group, collapsed: !group.collapsed }
            : group,
        );

        return next;
      });
    },
    [setLayerTreeItems],
  );

  const changeLayerName = useCallback(
    (id: string, name: string) => {
      setLayerTreeItems((prev) => {
        const next = prev.map((item) =>
          (item.type === 'group-start' || item.type === 'layer') && item.id === id
            ? { ...item, name }
            : item,
        );

        return next;
      });
    },
    [setLayerTreeItems],
  );

  const addLayer = useCallback(() => {
    const newLayer = createLayerEntity('New layer');

    setLayerTreeItems((prev) => [newLayer, ...prev]);
  }, [setLayerTreeItems]);

  const addGroup = useCallback(() => {
    const groupId = crypto.randomUUID();

    const newGroupStart: LayerGroupStart = {
      type: 'group-start',
      id: groupId,
      collapsed: false,
      name: 'New group',
    };
    const newGroupEnd: LayerGroupEnd = {
      type: 'group-end',
      id: groupId,
    };

    setLayerTreeItems((prev) => [newGroupStart, newGroupEnd, ...prev]);
  }, [setLayerTreeItems]);
  const deleteLayer = useCallback(() => {}, []);

  const checkDropAvailability = useCallback(
    (position: DropAtEnum, id: string): boolean => {
      const dropIndex = layerTreeItems.findIndex(
        (item) => (item.type === 'group-start' || item.type === 'layer') && item.id === id,
      );
      const dragIndex = layerTreeItems.findIndex(
        (item) => (item.type === 'group-start' || item.type === 'layer') && item.id === dragId,
      );

      //return if cant find either items
      if (dragIndex === -1 || dropIndex === -1) return false;

      // above the item below or below the item below is same position you are in.
      if (position === DropAtEnum.over && dropIndex === dragIndex + 1) return false;
      if (
        position === DropAtEnum.below &&
        dropIndex === dragIndex - 1 &&
        layerTreeItems[dropIndex].type !== 'group-start'
      )
        return false;

      //for dragging groups
      if (layerTreeItems[dragIndex].type === 'group-start') {
        const endIndex = layerTreeItems.findIndex(
          (group) => group.id === layerTreeItems[dragIndex].id && group.type === 'group-end',
        );

        if (endIndex === -1) return false;

        if (dropIndex >= dragIndex && dropIndex <= endIndex) return false;

        if (position === DropAtEnum.over && dropIndex === endIndex + 1) return false;
      }

      if (
        layerTreeItems[dragIndex].type === 'layer' &&
        layerTreeItems[dropIndex].type === 'group-start'
      ) {
        const endIndex = layerTreeItems.findIndex(
          (group) => group.id === layerTreeItems[dropIndex].id && group.type === 'group-end',
        );

        if (endIndex === -1) return false;

        if (position === DropAtEnum.on && dragIndex > dropIndex && dragIndex < endIndex)
          return false;
      }

      return true;
    },
    [dragId, layerTreeItems],
  );

  const dropItem = useCallback(
    (position: DropAtEnum, fromId: string, toId: string) => {
      setLayerTreeItems((prev) => {
        const next = [...prev];

        const fromStart = next.findIndex(
          (item) => item.id === fromId && (item.type === 'group-start' || item.type === 'layer'),
        );
        if (fromStart === -1) return prev;

        const fromEnd =
          next[fromStart].type === 'layer'
            ? fromStart
            : next.findIndex((item) => item.id === fromId && item.type === 'group-end');

        if (fromEnd === -1) return prev;

        const removed = next.splice(fromStart, fromEnd - fromStart + 1);

        const toIndex = next.findIndex(
          (item) => item.id === toId && (item.type === 'group-start' || item.type === 'layer'),
        );
        if (toIndex === -1) {
          next.splice(fromStart, 0, ...removed);
          return next;
        }

        const insertIndex = (() => {
          const target = next[toIndex];

          if (position === DropAtEnum.on) {
            if (target.type === 'group-start') return toIndex + 1;
            return toIndex + 1;
          }

          if (position === DropAtEnum.over) return toIndex;

          if (target.type === 'group-start') {
            const groupEndIndex = next.findIndex(
              (item, idx) => idx > toIndex && item.type === 'group-end' && item.id === target.id,
            );
            return groupEndIndex === -1 ? toIndex + 1 : groupEndIndex + 1;
          }

          return toIndex + 1;
        })();

        next.splice(insertIndex, 0, ...removed);
        return next;
      });
    },
    [setLayerTreeItems],
  );

  const value = useMemo(
    () => ({
      collapseGroup,
      changeLayerName,
      addLayer,
      addGroup,
      deleteLayer,
      dragId,
      setDragId,
      checkDropAvailability,
      dropItem,
    }),
    [
      collapseGroup,
      changeLayerName,
      addLayer,
      addGroup,
      deleteLayer,
      dragId,
      setDragId,
      checkDropAvailability,
      dropItem,
    ],
  );

  return <LayerSelectorContext.Provider value={value}>{children}</LayerSelectorContext.Provider>;
};

export const useLayerSelectorContext = () => {
  const ctx = useContext(LayerSelectorContext);
  if (!ctx) throw new Error('useLayerSelectorContext must be used within provider');
  return ctx;
};
