'use client';

import { useRef } from 'react';

type Props = {
  x: number;
  y: number;
  selectedColor: string;
  H: number;
  W: number;
};

export default function ColorPickerPointer({ x, y, selectedColor, H, W }: Props) {
  const draggingRef = useRef(false);
  return (
    <div
      style={{
        position: 'absolute',
        width: W,
        height: H,
        touchAction: 'none',
        inset: 0,
        cursor: 'pointer',
        pointerEvents: 'none',
      }}
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
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
