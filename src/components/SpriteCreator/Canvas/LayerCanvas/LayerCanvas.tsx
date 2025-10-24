import { config } from '@/config/env';
import { useLayerContext } from '@/context/LayerContext';
import { getPixelIndex, intToCssRgba } from '@/helpers/color';
import { Rectangle } from '@/models/Layer';
import { outOfBoundFinder } from '@/util/LayerUtil';
import { useCallback, useEffect, useRef } from 'react';

const LayerCanvas = () => {
  const { allLayers, redrawVersion, consumeDirty } = useLayerContext();

  const redrawArea = (ctx: CanvasRenderingContext2D, r: Rectangle) => {
    const pSize = config.pixelSize;
    ctx.clearRect(r.x * pSize, r.y * pSize, r.width * pSize, r.height * pSize);

    allLayers.map((layer) => {
      //ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

      ctx.imageSmoothingEnabled = false;
      for (let y: number = 0; y < r.height; y++) {
        //early return if y has passed the vertical boundary
        if (y + r.y > layer.rect.height + layer.rect.y) return;
        //next loop, not inside the bounds yet
        if (y + r.y < layer.rect.y) continue;
        for (let x: number = 0; x < r.width; x++) {
          //early reaturn if x has passed the horizontal boundary
          if (x + r.x > layer.rect.width + layer.rect.x) return;
          //next loop, not inside the bounds yet
          if (x + r.x < layer.rect.x) continue;

          const srcY = y + r.y - layer.rect.y;
          const srcX = x + r.x - layer.rect.x;

          const px = layer.pixels[getPixelIndex(srcY, layer.rect.width, srcX)];

          if (px) {
            ctx.fillStyle = intToCssRgba(px);
            ctx.fillRect((x + r.x) * pSize, (y + r.y) * pSize, pSize, pSize);
          }
        }
      }
    });
  };

  //trigger from layerContext
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dirtyRectangles: Rectangle[] = consumeDirty();

    dirtyRectangles.map((r) => redrawArea(ctx, r));
  }, [redrawVersion]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={config.canvasWidth}
        height={config.canvasHeight}
        style={{ position: 'fixed', imageRendering: 'pixelated' }}
      />
    </>
  );
};
export default LayerCanvas;
