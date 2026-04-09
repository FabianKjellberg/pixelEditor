'use client';

import React, { useEffect } from 'react';
import ToolButton from '../ToolButton/ToolButton';
import { useToolContext } from '@/context/ToolContext';
import { RectangleSelector } from '@/models/Tools/SelectionTools/RectangleSelector';
import { useCanvasContext } from '@/context/CanvasContext';
import { SelectionModeProperty } from '@/models/properties/Properties';

const RectangleSelectorComponent = () => {
  const { getProperties, setProperties } = useToolContext();
  const { setSelectionLayer, getSelectionLayer } = useCanvasContext();

  useEffect(() => {
    const existing = getProperties('rectangleSelector');
    if (!existing.length) {
      setProperties('rectangleSelector', [new SelectionModeProperty()]);
    }
  }, [getProperties, setProperties]);

  return (
    <ToolButton
      icon="/icons/selection.png"
      tool={new RectangleSelector({ setSelectionLayer, getSelectionLayer, getProperties })}
    />
  );
};
export default RectangleSelectorComponent;
