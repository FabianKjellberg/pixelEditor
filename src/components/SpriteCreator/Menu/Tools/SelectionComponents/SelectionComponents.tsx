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
import { LassoSelector } from '@/models/Tools/SelectionTools/LassoSelector';
import { FreeformSelector } from '@/models/Tools/SelectionTools/FreeformSelector';
import { SelectionModeProperty } from '@/models/properties/Properties';

const SelectionComponents = () => {
  const { onShow, onHide } = useContextMenuContext();
  const { setActiveTool, getProperties, ensureProperties } = useToolContext();
  const { setSelectionLayer, getSelectionLayer, setSelectionOverlay, getSelectionOverlay } =
    useCanvasContext();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    ensureProperties('circleSelector', [new SelectionModeProperty()]);

    ensureProperties('rectangleSelector', [new SelectionModeProperty()]);

    ensureProperties('lassoSelector', [new SelectionModeProperty()]);

    ensureProperties('freeformSelector', [new SelectionModeProperty()]);
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
          setActiveTool(lassoSelector);
          break;
        case 1:
          setActiveTool(freeformSelector);
          break;
        case 2:
          setActiveTool(rectangleSelection);
          break;
        case 3:
          setActiveTool(circleSelection);
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
            icon="icons/lassoSelector.png"
            index={0}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/freeformSelector.png"
            index={1}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />

          <ToolButtonMimic
            icon="icons/selection.png"
            index={2}
            onClickCallback={onClickCallbackItem}
            selectedIndex={selectedIndex}
          />
          <ToolButtonMimic
            icon="icons/circleSelection.png"
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
          icon: '/icons/lassoSelector.png',
          tool: lassoSelector,
        };
      case 1:
        return {
          icon: '/icons/freeformSelector.png',
          tool: freeformSelector,
        };

      case 2:
        return {
          icon: '/icons/selection.png',
          tool: rectangleSelection,
        };
      case 3:
        return {
          icon: '/icons/circleSelection.png',
          tool: circleSelection,
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
