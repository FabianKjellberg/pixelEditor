type LocalRef<T> = { current: T | null };

export function ensureCanvas2D(
  canvasRef: LocalRef<OffscreenCanvas | HTMLCanvasElement>,
  ctxRef: LocalRef<OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D>,
  w: number,
  h: number,
): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D {
  if (!canvasRef.current) {
    canvasRef.current =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(1, 1)
        : document.createElement('canvas');
  }

  // resize if needed
  const c = canvasRef.current;
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }

  // get 2D context once
  if (!ctxRef.current) {
    ctxRef.current =
      (canvasRef.current as OffscreenCanvas).getContext?.('2d') ??
      (canvasRef.current as HTMLCanvasElement).getContext('2d')!;
  }

  return ctxRef.current;
}
