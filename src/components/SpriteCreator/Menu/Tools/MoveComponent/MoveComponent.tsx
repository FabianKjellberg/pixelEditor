'use client';

import { useLayerContext } from '@/context/LayerContext';
import { useCanvasContext } from '@/context/CanvasContext';
import ToolButton from '../ToolButton/ToolButton';
import { MoveTool } from '@/models/Tools/MoveTool';
import { useMemo } from 'react';
import { useUndoRedoContext } from '@/context/UndoRedoContext';
import { useToastContext } from '@/context/ToastContext/ToastContext';
import { useToolTipContext } from '@/context/TooltipContext';

const MoveComponent = () => {
  const { getActiveLayers, setActiveLayers } = useLayerContext();
  const { getSelectionLayer, setSelectionLayer } = useCanvasContext();
  const { checkPoint } = useUndoRedoContext();
  const { onToast } = useToastContext();
  const { setToolTipValues } = useToolTipContext();

  const tool = useMemo(
    () =>
      new MoveTool({
        setLayers: setActiveLayers,
        getLayers: getActiveLayers,
        getSelectionLayer,
        setSelectionLayer,
        checkPoint,
        onToast,
        setToolTipValues,
      }),
    [getActiveLayers, setActiveLayers, getSelectionLayer, setSelectionLayer, setToolTipValues],
  );

  return (
    <>
      <ToolButton icon="/icons/arrowicon.png" tool={tool} />
    </>
  );
};
export default MoveComponent;
