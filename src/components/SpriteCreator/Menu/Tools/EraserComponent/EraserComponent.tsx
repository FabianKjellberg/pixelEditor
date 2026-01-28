'use client';

import { useLayerContext } from '@/context/LayerContext';
import ToolButton from '../ToolButton/ToolButton';
import { Eraser } from '@/models/Tools/Eraser';
import { useToolContext } from '@/context/ToolContext';
import { useEffect } from 'react';
import { OpacityProperty, SizeProperty } from '@/models/Tools/Properties';

const EraserComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { getProperties, setProperties } = useToolContext();

  useEffect(() => {
    const existing = getProperties('eraser');
    if (!existing.length) {
      setProperties('eraser', [new SizeProperty(5), new OpacityProperty(255)]);
    }
  }, [getProperties, setProperties]);

  return (
    <ToolButton
      icon="/icons/eraser.png"
      tool={new Eraser({ setLayer: setActiveLayer, getLayer: getActiveLayer, getProperties })}
    />
  );
};
export default EraserComponent;
