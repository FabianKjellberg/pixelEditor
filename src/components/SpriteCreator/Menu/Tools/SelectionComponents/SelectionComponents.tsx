'use client';

import { useContextMenuContext } from '@/context/ContextMenuContext/ContextMenuContext';
import { useToolContext } from '@/context/ToolContext';
import { toolWithImage } from '@/models/Tools/Tools';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ToolButton from '../ToolButton/ToolButton';
import ToolButtonMimic from '../ToolButton/ToolButtonMimic';
import styles from '../ShapeComponents/ShapeComponents.module.css';
import { RectangleSelector } from '@/models/Tools/SelectionTools/RectangleSelector';
import { useCanvasContext } from '@/context/CanvasContext';
import { CircleSelector } from '@/models/Tools/SelectionTools/CircleSelector';
import { ReplaceProperty } from '@/models/properties/Properties';
import { LassoSelector } from '@/models/Tools/SelectionTools/LassoSelector';
import { FreeformSelector } from '@/models/Tools/SelectionTools/FreeformSelector';

const SelectionComponents = () => {
  const { onShow, onHide } = useContextMenuContext();
  const { setActiveTool, getProperties, ensureProperties } = useToolContext();
  const { setSelectionLayer, getSelectionLayer, setSelectionOverlay, getSelectionOverlay } =
    useCanvasContext();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    ensureProperties('circleSelector', [new ReplaceProperty(true)]);

    ensureProperties('rectangleSelector', [new ReplaceProperty(true)]);

    ensureProperties('lassoSelector', [new ReplaceProperty(true)]);

    ensureProperties('freeformSelector', [new ReplaceProperty(true)]);
  }, []);

  const rectangleSelection = useMemo(
    () => new RectangleSelector({ setSelectionLayer, getSelectionLayer, getProperties }),
    [setSelectionLayer, getSelectionLayer, getProperties],
  );

  const circleSelection = useMemo(
    () => new CircleSelector({ setSelectionLayer, getSelectionLayer, getProperties }),
    [setSelectionLayer, getSelectionLayer, getProperties],
  );

  const lassoSelector = useMemo(
    () =>
      new LassoSelector({
        setSelectionLayer,
        getSelectionLayer,
        getProperties,
        getSelectionOverlay,
        setSelectionOverlay,
      }),
    [setSelectionLayer, getSelectionLayer, getProperties, getSelectionOverlay, setSelectionOverlay],
  );

  const freeformSelector = useMemo(
    () =>
      new FreeformSelector({
        setSelectionLayer,
        getSelectionLayer,
        getProperties,
        getSelectionOverlay,
        setSelectionOverlay,
      }),
    [setSelectionLayer, getSelectionLayer, getProperties, getSelectionOverlay, setSelectionOverlay],
  );

  const onClickCallbackItem = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          setActiveTool(rectangleSelection);
          break;
        case 1:
          setActiveTool(circleSelection);
          break;
        case 2:
          setActiveTool(lassoSelector);
          break;
        case 3:
          setActiveTool(freeformSelector);
          break;
      }

      setSelectedIndex(index);
      onHide();
    },
    [setActiveTool, onHide, rectangleSelection],
  );

  const onRightClickCallback = useCallback(
    (x: number, y: number) => {
      const menu = (
        <div className={styles.contextMenu}>
          <ToolButtonMimic
            icon="icons/selection.png"
            index={0}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/circleSelection.png"
            index={1}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/lassoSelector.png"
            index={2}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/freeformSelector.png"
            index={3}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
        </div>
      );

      onShow(menu, x, y);
    },
    [onShow, onClickCallbackItem, selectedIndex],
  );

  const selectedTool = useMemo((): toolWithImage => {
    switch (selectedIndex) {
      case 0:
      default:
        return {
          icon: '/icons/selection.png',
          tool: rectangleSelection,
        };
      case 1:
        return {
          icon: '/icons/circleSelection.png',
          tool: circleSelection,
        };
      case 2:
        return {
          icon: '/icons/lassoSelector.png',
          tool: lassoSelector,
        };
      case 3:
        return {
          icon: '/icons/freeformSelector.png',
          tool: freeformSelector,
        };
    }
  }, [selectedIndex]);

  return (
    <>
      <ToolButton
        icon={selectedTool.icon}
        tool={selectedTool.tool}
        onRightClickCallback={onRightClickCallback}
      />
    </>
  );
};

export default SelectionComponents;
