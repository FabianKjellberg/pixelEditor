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

const SelectionComponents = () => {
  const { onShow, onHide } = useContextMenuContext();
  const { setActiveTool, getProperties, ensureProperties } = useToolContext();
  const { setSelectionLayer, getSelectionLayer } = useCanvasContext();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    ensureProperties('circleSelector', [new ReplaceProperty(true)]);

    ensureProperties('rectangleSelector', [new ReplaceProperty(true)]);
  }, []);

  const rectangleSelection = useMemo(
    () => new RectangleSelector({ setSelectionLayer, getSelectionLayer, getProperties }),
    [setSelectionLayer, getSelectionLayer, getProperties],
  );

  const circleSelection = useMemo(
    () => new CircleSelector({ setSelectionLayer, getSelectionLayer, getProperties }),
    [setSelectionLayer, getSelectionLayer, getProperties],
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
