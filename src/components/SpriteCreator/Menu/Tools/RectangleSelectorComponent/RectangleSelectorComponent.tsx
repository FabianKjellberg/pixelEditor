'use client';

import React, { useEffect } from 'react';
import ToolButton from '../ToolButton/ToolButton';
import { useToolContext } from '@/context/ToolContext';
import { ReplaceProperty } from '@/models/Tools/Properties';
import { RectangleSelector } from '@/models/Tools/RectangleSelector';
import { useCanvasContext } from '@/context/CanvasContext';

const RectangleSelectorComponent = () => {
  const { getProperties, setProperties } = useToolContext();
  const { setSelectionLayer, getSelectionLayer } = useCanvasContext();

  useEffect(() => {
    const existing = getProperties('rectangleSelector');
    if (!existing.length) {
      setProperties('rectangleSelector', [new ReplaceProperty(true)]);
    }
  }, [getProperties, setProperties]);

  return (
    <ToolButton
      icon="/icons/pencil.png"
      tool={new RectangleSelector({ setSelectionLayer, getSelectionLayer, getProperties })}
    />
  );
};
export default RectangleSelectorComponent;
