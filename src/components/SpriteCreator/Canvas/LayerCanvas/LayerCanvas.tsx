import { useLayerContext } from '@/context/LayerContext';
import { useCallback } from 'react';

const LayerCanvas = () => {
  const { allLayers } = useLayerContext();

  //!TODO implement a better drawing and rerendering for canvas :) dirty rects

  return (
    <>
      <button></button>
    </>
  );
};
export default LayerCanvas;
