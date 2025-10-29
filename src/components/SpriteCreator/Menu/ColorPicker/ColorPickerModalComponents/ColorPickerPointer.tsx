'use client';
type Props = {
  x: number;
  setX: React.Dispatch<React.SetStateAction<number>>;
  y: number;
  setY: React.Dispatch<React.SetStateAction<number>>;
  selectedColor: string;
  H: number;
  W: number;
};

export default function ColorPickerPointer({ x, y, setX, setY, selectedColor, H, W }: Props) {
  const getPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0, Math.min(e.clientX - r.left, r.width));
    const ny = Math.max(0, Math.min(e.clientY - r.top, r.height));
    setX((prev) => (prev === nx ? prev : nx));
    setY((prev) => (prev === ny ? prev : ny));
  };

  return (
    <div
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        getPos(e);
      }}
      onPointerMove={(e) => e.buttons && getPos(e)}
      onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
      style={{
        position: 'absolute',
        width: W,
        height: H,
        touchAction: 'none',
        inset: 0,
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
