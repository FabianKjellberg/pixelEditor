'use client';

import { useEffect, useMemo } from 'react';
import ToolButton from './ToolButton/ToolButton';
import { FillBucket } from '@/models/Tools/FillBucket';
import { useUndoRedoContext } from '@/context/UndoRedoContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { useToolContext } from '@/context/ToolContext';
import { useLayerContext } from '@/context/LayerContext';
import { OpacityProperty, ToleranceProperty } from '@/models/Tools/Properties';

const BucketFillComponent = () => {
  const { getActiveLayer, setActiveLayer } = useLayerContext();
  const { getProperties, setProperties, getPrimaryColor, getSecondaryColor } = useToolContext();
  const { getSelectionLayer, getCanvasRect } = useCanvasContext();
  const { checkPoint, hasBaseline } = useUndoRedoContext();

  useEffect(() => {
    const existing = getProperties('fillBucket');
    if (!existing.length) {
      setProperties('fillBucket', [new ToleranceProperty(0), new OpacityProperty(255)]);
    }
  }, [getProperties, setProperties]);

  return (
    <>
      <ToolButton
        icon="/icons/bucket.png"
        tool={
          new FillBucket({
            setLayer: setActiveLayer,
            getLayer: getActiveLayer,
            getProperties,
            getCanvasRect,
            getSelectionLayer,
            getPrimaryColor,
            getSecondaryColor,
            checkPoint,
            hasBaseline,
          })
        }
      />
    </>
  );
};

export default BucketFillComponent;
