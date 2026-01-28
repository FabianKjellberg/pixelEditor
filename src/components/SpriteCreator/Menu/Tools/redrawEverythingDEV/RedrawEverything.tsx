'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { createSelectionLayer } from '@/util/SelectionUtil';

const RedrawEverything = () => {
  const { setPixelSize, pixelSize, setSelectionLayer } = useCanvasContext();

  const zoomIn = () => {
    if (pixelSize > 100) return;
    setPixelSize(Math.ceil(pixelSize * 1.2));
  };

  const zoomOut = () => {
    if (pixelSize <= 1) return;
    setPixelSize(Math.floor(pixelSize * 0.8));
  };

  const makeSelection = () => {
    const selectionLayer = createSelectionLayer(3, 3, 10, 10, true);

    setSelectionLayer(selectionLayer);
  };

  return (
    <>
      <button
        onClick={() => {
          zoomIn();
        }}
      >
        zoom in
      </button>
      <button
        onClick={() => {
          zoomOut();
        }}
      >
        zoom out
      </button>
      <button onClick={makeSelection}>make selection</button>
    </>
  );
};
export default RedrawEverything;
