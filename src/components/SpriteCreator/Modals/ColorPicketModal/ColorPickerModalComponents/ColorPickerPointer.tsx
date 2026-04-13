'use client';

import { useRef } from 'react';

type Props = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  x: number;
  y: number;
  selectedColor: string;
  H: number;
  W: number;
};

export default function ColorPickerPointer({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  x,
  y,
  selectedColor,
  H,
  W,
}: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        width: W,
        height: H,
        touchAction: 'none',
        inset: 0,
        cursor: 'pointer',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 14,
          height: 14,
          background: selectedColor,
          outline: '3px solid gray',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
