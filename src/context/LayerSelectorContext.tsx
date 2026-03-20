'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLayerContext } from './LayerContext';
import { combineManyRectangles, createLayerEntity } from '@/util/LayerUtil';
import {
  LayerEntity,
  LayerGroupEnd,
  LayerGroupStart,
  LayerTreeItem,
  Rectangle,
} from '@/models/Layer';
import { DropAtEnum } from '@/components/SpriteCreator/Menu/LayerMenu/LayerItem';
import { useCanvasContext } from './CanvasContext';
import { api } from '@/api/client';
import { useMetaDataAutoSaveContext } from './MetaDataAutoSaveContext';
import { LoadingState } from '@/components/Loading/Loading';

export type Order = {
  id: string;
  type: 'layer' | 'group-start' | 'group-end';
  index: number;
};

type LayerSelectorContextValue = {
  orderState: 'saved' | 'not-saved' | 'saving';
  collapseGroup: (groupId: string) => void;
  changeLayerName: (id: string, name: string) => void;
  addLayer: (index?: number, layerEntity?: LayerEntity) => void;
  addGroup: (index?: number) => void;
  deleteItem: (id: string) => void;
  deleteMultipleItems: (ids: string[]) => void;
  dragId: string;
  setDragId: (id: string) => void;
  checkDropAvailability: (position: DropAtEnum, id: string) => boolean;
  dropItem: (position: DropAtEnum, fromId: string, toId: string) => void;
  onSelectItem: (id: string, shiftClick: boolean, ctrlClick: boolean) => void;
};

const LayerSelectorContext = createContext<LayerSelectorContextValue | undefined>(undefined);

export const LayerSelectorProvider = ({ children }: { children: React.ReactNode }) => {
  const { setLayerTreeItems, layerTreeItems, activeLayerIds, setActiveLayerIds, markDirty } =
    useLayerContext();

  const { getCanvasRect, width, height, isLoadedFromCloud, projectId, requestPreview } =
    useCanvasContext();

  const { addChange } = useMetaDataAutoSaveContext();

  const [dragId, setDragId] = useState<string>('');

  const collapseGroup = useCallback(
    (groupId: string) => {
      let collapsed = true;

      setLayerTreeItems((prev) => {
        const item = prev.find((group) => group.id === groupId && group.type === 'group-start');

        if (item && item.type === 'group-start') {
          collapsed = !item.collapsed;
        }

        const next = prev.map((group) =>
          group.type === 'group-start' && group.id === groupId
            ? { ...group, collapsed: !group.collapsed }
            : group,
        );

        return next;
      });

      if (isLoadedFromCloud) {
        addChange({ type: 'collapse', id: groupId, collapsed });
      }
    },
    [setLayerTreeItems, addChange, isLoadedFromCloud],
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

      if (isLoadedFromCloud) {
        addChange({ type: 'name', name, id });
      }
    },
    [setLayerTreeItems, addChange, isLoadedFromCloud],
  );

  const addLayer = useCallback(
    (index?: number, layer?: LayerEntity) => {
      const newLayer = layer ? layer : createLayerEntity('New layer');

      setLayerTreeItems((prev) => {
        const insertIndex = index ?? 0;
        const next = [...prev];

        next.splice(insertIndex, 0, newLayer);

        if (isLoadedFromCloud) {
          api.layer.addLayer(newLayer, projectId, requestPreview, index);
        }

        return next;
      });
    },
    [setLayerTreeItems, isLoadedFromCloud],
  );

  const addGroup = useCallback(
    (index?: number) => {
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

      if (activeLayerIds.length > 1) {
        setLayerTreeItems((prev) => {
          const indexes: { index: number; id: string }[] = activeLayerIds.map((id) => ({
            index: prev.findIndex((item) => item.id == id),
            id: id,
          }));

          indexes.sort((a, b) => a.index - b.index);

          const startIndex = indexes[0].index;
          const endIndex = indexes[indexes.length - 1].index;

          let groupBetween = false;

          for (let i = startIndex; i <= endIndex; i++) {
            if (prev[i].type !== 'layer') groupBetween = true;
          }

          if (groupBetween) {
            const insertIndex = index ?? 0;
            const next = [...prev];

            next.splice(insertIndex, 0, newGroupStart, newGroupEnd);

            return next;
          }

          const insertIndex = startIndex;
          const next = prev.filter((item) => !indexes.some((idx) => idx.id === item.id));

          const groupItems: LayerTreeItem[] = [];

          indexes.forEach((idx) => {
            const item = prev.find((i) => i.id === idx.id);

            if (item) groupItems.push(item);
          });

          const newGroup = [newGroupStart, ...groupItems, newGroupEnd];

          next.splice(insertIndex, 0, ...newGroup);

          if (isLoadedFromCloud) {
            const startIndex = next.findIndex((g) => g.id === groupId && g.type === 'group-start');
            const endIndex = next.findIndex((g) => g.id === groupId && g.type === 'group-end');

            if (startIndex === -1 || endIndex === -1)
              throw new Error('cant find group start or group end');

            api.group.createGroup(projectId, startIndex, endIndex, newGroupStart);
          }

          return next;
        });

        const rect = getCanvasRect();

        markDirty(rect);
      } else {
        setLayerTreeItems((prev) => {
          const insertIndex = index ?? 0;
          const next = [...prev];

          next.splice(insertIndex, 0, newGroupStart, newGroupEnd);

          if (isLoadedFromCloud) {
            const startIndex = next.findIndex((g) => g.id === groupId && g.type === 'group-start');
            const endIndex = next.findIndex((g) => g.id === groupId && g.type === 'group-end');

            if (startIndex === -1 || endIndex === -1)
              throw new Error('cant find group start or group end');

            api.group.createGroup(projectId, startIndex, endIndex, newGroupStart);
          }

          return next;
        });
      }
    },
    [setLayerTreeItems, activeLayerIds, markDirty, getCanvasRect, isLoadedFromCloud],
  );

  const deleteItem = useCallback(
    (id: string) => {
      const item = layerTreeItems.find(
        (i) => i.id === id && (i.type === 'group-start' || i.type === 'layer'),
      );

      if (!item) return;

      let dirtyRect: Rectangle | undefined;
      const idsToDelete: string[] = [id];
      let nextItems = layerTreeItems;

      if (item.type === 'layer') {
        dirtyRect = item.layer.rect;
        nextItems = layerTreeItems.filter((item) => item.id !== id);
      }

      if (item.type === 'group-start') {
        const startIndex = layerTreeItems.findIndex((i) => i.type === 'group-start' && i.id === id);
        const endIndex = layerTreeItems.findIndex((i) => i.type === 'group-end' && i.id === id);

        if (startIndex === -1 || endIndex === -1) return;

        const rectangles: Rectangle[] = [];

        for (let i = startIndex; i < endIndex; i++) {
          const layer = layerTreeItems[i];
          if (layer.type === 'layer') {
            rectangles.push(layer.layer.rect);
          }
        }

        dirtyRect = combineManyRectangles(rectangles);
        nextItems = [...layerTreeItems];
        nextItems.splice(startIndex, endIndex - startIndex + 1);
      }

      setActiveLayerIds((prev) => prev.filter((layerId) => id !== layerId));
      setLayerTreeItems(nextItems);

      if (isLoadedFromCloud) {
        const shouldPreview = !!dirtyRect && dirtyRect.height > 0 && dirtyRect.width > 0;
        api.project.deleteMultipleItems(idsToDelete, shouldPreview, projectId, requestPreview);
      }

      if (dirtyRect) {
        markDirty(dirtyRect);
      }
    },
    [layerTreeItems, markDirty, isLoadedFromCloud, projectId, requestPreview, setActiveLayerIds],
  );

  const deleteMultipleItems = useCallback(
    (ids: string[]) => {
      const idsToDelete = new Set(ids);
      const indexesToRemove = new Set<number>();
      const dirtyRects: Rectangle[] = [];

      for (let i = 0; i < layerTreeItems.length; i++) {
        const item = layerTreeItems[i];

        if (!idsToDelete.has(item.id)) continue;

        if (item.type === 'layer') {
          indexesToRemove.add(i);
          dirtyRects.push(item.layer.rect);
          continue;
        }

        if (item.type === 'group-start') {
          const endIndex = layerTreeItems.findIndex(
            (candidate, idx) =>
              idx > i && candidate.type === 'group-end' && candidate.id === item.id,
          );

          if (endIndex === -1) continue;

          for (let j = i; j <= endIndex; j++) {
            indexesToRemove.add(j);

            const rangeItem = layerTreeItems[j];
            if (rangeItem.type === 'layer') {
              dirtyRects.push(rangeItem.layer.rect);
            }
          }

          i = endIndex;
        }
      }

      const nextItems = layerTreeItems.filter((_, index) => !indexesToRemove.has(index));

      setActiveLayerIds((prev) => prev.filter((itemId) => !idsToDelete.has(itemId)));
      setLayerTreeItems(nextItems);

      if (isLoadedFromCloud) {
        const shouldPreview = dirtyRects.some((rect) => rect.height > 0 && rect.width > 0);
        api.project.deleteMultipleItems(ids, shouldPreview, projectId, requestPreview);
      }

      if (dirtyRects.length > 0) {
        markDirty(combineManyRectangles(dirtyRects));
      }
    },
    [
      layerTreeItems,
      isLoadedFromCloud,
      markDirty,
      projectId,
      requestPreview,
      setActiveLayerIds,
      setLayerTreeItems,
    ],
  );

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
      let dirtyRect: Rectangle = { x: 0, y: 0, width: 0, height: 0 };

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

        const recntangles: Rectangle[] = [];

        for (let i = fromStart; i <= fromEnd; i++) {
          const layer = prev[i];

          if (layer.type === 'layer') {
            recntangles.push(layer.layer.rect);
          }
        }

        dirtyRect = combineManyRectangles(recntangles);

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
      if (dirtyRect.width < 1 || dirtyRect.height < 1) return;

      markDirty(dirtyRect);
    },

    [setLayerTreeItems, markDirty, width, height],
  );

  const onSelectItem = useCallback(
    (id: string, shiftClick: boolean, ctrlClick: boolean) => {
      if (shiftClick && ctrlClick) return;

      const index = layerTreeItems.findIndex(
        (i) => i.id === id && (i.type === 'group-start' || i.type === 'layer'),
      );

      if (index === -1) throw new Error('unable to find layer to select');

      switch (layerTreeItems[index].type) {
        case 'layer':
          if (shiftClick) {
            setActiveLayerIds((prev) => {
              const next: string[] = [];

              if (prev.some((prevId) => id === prevId)) {
                return prev;
              }

              if (prev.length === 0) {
                return [id];
              }

              const startPrevIndex = layerTreeItems.findIndex((i) => i.id === prev[0]);
              const endPrevIndex = layerTreeItems.findIndex((i) => i.id === prev[prev.length - 1]);

              const from = Math.min(index, startPrevIndex, endPrevIndex);
              const to = Math.max(index, startPrevIndex, endPrevIndex);

              if (from === -1 || to === -1)
                throw new Error('from or to is -1, from: ' + from + ' to: ' + to);

              for (let i = from; i <= to; i++) {
                if (layerTreeItems[i].type === 'layer') {
                  next.push(layerTreeItems[i].id);
                }
              }

              return next;
            });
            break;
          }

          if (ctrlClick) {
            setActiveLayerIds((prev) => {
              const exist = prev.some((i) => i === id);

              if (exist) {
                return prev.filter((i) => i !== id);
              }

              return [...prev, id];
            });

            break;
          }

          setActiveLayerIds([id]);
          break;

        case 'group-start':
          if (shiftClick) {
            break;
          }

          const next: string[] = [];

          const startPrevIndex = layerTreeItems.findIndex(
            (i) => i.id === id && i.type === 'group-start',
          );
          const endPrevIndex = layerTreeItems.findIndex(
            (i) => i.id === id && i.type === 'group-end',
          );

          const from = Math.min(index, startPrevIndex, endPrevIndex);
          const to = Math.max(index, startPrevIndex, endPrevIndex);

          if (from === -1 || to === -1)
            throw new Error('from or to is -1, from: ' + from + ' to: ' + to);

          for (let i = from; i <= to; i++) {
            if (layerTreeItems[i].type === 'layer') {
              next.push(layerTreeItems[i].id);
            }
          }
          setActiveLayerIds(next);
        default:
          break;
      }
    },
    [layerTreeItems, activeLayerIds, setActiveLayerIds],
  );

  const orderRef = useRef<Order[]>([]);

  const order = useMemo(
    (): Order[] => layerTreeItems.map((item, index) => ({ id: item.id, type: item.type, index })),
    [layerTreeItems],
  );

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const orderKey = useMemo(
    () => layerTreeItems.map((item, index) => `${item.id}:${item.type}:${index}`).join('|'),
    [layerTreeItems],
  );

  const timeOutRef = useRef<number | null>(null);

  const [orderState, setOrderState] = useState<LoadingState>('saved');

  const saveOrder = useCallback(async () => {
    try {
      setOrderState('saving');
      await api.project.saveOrder(orderRef.current, projectId);
    } finally {
      setOrderState('saved');
    }
  }, [projectId]);

  useEffect(() => {
    if (!isLoadedFromCloud) return;

    setOrderState('not-saved');

    const delay = 5000;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }

    const timer = window.setTimeout(() => {
      saveOrder();
      timeOutRef.current = null;
    }, delay);

    timeOutRef.current = timer;
  }, [orderKey]);

  const value = useMemo(
    () => ({
      orderState,
      collapseGroup,
      changeLayerName,
      addLayer,
      addGroup,
      deleteItem,
      deleteMultipleItems,
      dragId,
      setDragId,
      checkDropAvailability,
      dropItem,
      onSelectItem,
    }),
    [
      orderState,
      collapseGroup,
      changeLayerName,
      addLayer,
      addGroup,
      deleteItem,
      deleteMultipleItems,
      dragId,
      setDragId,
      checkDropAvailability,
      dropItem,
      onSelectItem,
    ],
  );

  return <LayerSelectorContext.Provider value={value}>{children}</LayerSelectorContext.Provider>;
};

export const useLayerSelectorContext = () => {
  const ctx = useContext(LayerSelectorContext);
  if (!ctx) throw new Error('useLayerSelectorContext must be used within provider');
  return ctx;
};
