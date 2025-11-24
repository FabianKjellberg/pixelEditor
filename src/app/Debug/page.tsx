'use client';

import { getPixelIndex } from '@/helpers/color';
import React, { useRef, useEffect } from 'react';

const Debug = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedArray = new Uint8Array([1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]);
  const pixelSize = 23;
  const pattern = [2];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.beginPath();
    ctx.lineWidth = 2;
    for (let i: number = 0; i < 4; i++) {
      for (let j: number = 0; j < 4; j++) {
        if (selectedArray[getPixelIndex(i, 4, j)] === 1) {
          ctx.fillStyle = 'white';
          ctx.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);

          //noTopNeighbor
          if (i <= 0 || selectedArray[getPixelIndex(i - 1, 4, j)] !== 1) {
            ctx.setLineDash(pattern);

            const startBuffer = (j * pixelSize) % 4;
            ctx.moveTo(j * pixelSize - startBuffer, i * pixelSize + 1);
            ctx.lineTo(j * pixelSize + pixelSize, i * pixelSize + 1);
          }
          //noRightNeighbor
          if (j >= 4 - 1 || selectedArray[getPixelIndex(i, 4, j + 1)] !== 1) {
            ctx.setLineDash(pattern);

            ctx.moveTo(j * pixelSize + pixelSize - 1, i * pixelSize);
            ctx.lineTo(j * pixelSize + pixelSize - 1, i * pixelSize + pixelSize);
          }
          //noBottomNeighbor
          if (i >= 4 - 1 || selectedArray[getPixelIndex(i + 1, 4, j)] !== 1) {
            ctx.setLineDash(pattern);
            const startBuffer = (j * pixelSize) % 4;

            ctx.moveTo(j * pixelSize - startBuffer - 2, i * pixelSize + pixelSize - 1);
            ctx.lineTo(j * pixelSize + pixelSize, i * pixelSize + pixelSize - 1);
          }
          //noLeftNeighbor
          if (j <= 0 || selectedArray[getPixelIndex(i, 4, j - 1)] !== 1) {
            ctx.setLineDash(pattern);

            ctx.moveTo(j * pixelSize + 1, i * pixelSize);
            ctx.lineTo(j * pixelSize + 1, i * pixelSize + pixelSize);
          }
        }
      }
      ctx.stroke();
    }
  }, []);

  return (
    <div
      style={{
        padding: 16,
        background: 'gray',
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 18 }}>Debug Canvas</h1>
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        style={{
          background: '#gray',
        }}
      />
    </div>
  );
};

export default Debug;
