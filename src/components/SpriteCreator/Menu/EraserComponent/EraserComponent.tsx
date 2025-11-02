'use client';

import { useLayerContext } from '@/context/LayerContext';
import ToolButton from '../ToolButton/ToolButton';
import { Eraser } from '@/models/Tools/Eraser';
import { useToolContext } from '@/context/ToolContext';
import { useEffect } from 'react';
import { SizeProperty } from '@/models/Tools/Properties';

const EraserComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { getProperties, setProperties } = useToolContext();

  useEffect(() => {
    const existing = getProperties('pencil');
    if (!existing.length) {
      setProperties('eraser', [new SizeProperty(5)]);
    }
  }, [getProperties, setProperties]);

  return (
    <>
      <ToolButton
        icon="/icons/eraser.png"
        tool={new Eraser({ setLayer: setActiveLayer, getLayer: getActiveLayer, getProperties })}
      />
    </>
  );
};
export default EraserComponent;
