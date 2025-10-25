'use client';

import { useCanvasContext } from '@/context/CanvasContext';
import { useLayerContext } from '@/context/LayerContext';
import { useEffect } from 'react';

const RedrawEverything = () => {
  const { setPixelSize, pixelSize } = useCanvasContext();

  const zoomIn = () => {
    if (pixelSize > 100) return;
    setPixelSize(Math.ceil(pixelSize * 1.2));
  };

  const zoomOut = () => {
    if (pixelSize <= 1) return;
    setPixelSize(Math.floor(pixelSize * 0.8));
  };

  useEffect(() => {
    console.log(pixelSize);
  }, [pixelSize]);

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
    </>
  );
};
export default RedrawEverything;
