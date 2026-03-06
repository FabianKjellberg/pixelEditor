'use client';

import { useLayerContext } from '@/context/LayerContext';
import { useCanvasContext } from '@/context/CanvasContext';
import ToolButton from '../ToolButton/ToolButton';
import { MoveTool } from '@/models/Tools/MoveTool';
import { useMemo } from 'react';
import { useUndoRedoContext } from '@/context/UndoRedoContext';
import { useToastContext } from '@/context/ToastContext/ToastContext';

const MoveComponent = () => {
  const { getActiveLayers, setActiveLayers } = useLayerContext();
  const { getSelectionLayer, setSelectionLayer } = useCanvasContext();
  const { checkPoint, hasBaseline } = useUndoRedoContext();
  const { onToast } = useToastContext();

  const tool = useMemo(
    () =>
      new MoveTool({
        setLayers: setActiveLayers,
        getLayers: getActiveLayers,
        getSelectionLayer,
        setSelectionLayer,
        checkPoint,
        hasBaseline,
        onToast,
      }),
    [getActiveLayers, setActiveLayers, getSelectionLayer, setSelectionLayer],
  );

  return (
    <>
      <ToolButton icon="/icons/arrowicon.png" tool={tool} />
    </>
  );
};
export default MoveComponent;
