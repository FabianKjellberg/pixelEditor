type ColorPickerSliderPointerProps = {
  y: number;
  setY: React.Dispatch<React.SetStateAction<number>>;
  W: number;
  pointerColor: string;
};

const ColorPickerSliderPointer = ({ y, setY, W, pointerColor }: ColorPickerSliderPointerProps) => {
  const getPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ny = Math.max(0, Math.min(e.clientY - r.top, r.height));
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
        inset: 0,
        touchAction: 'none',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: W / 2,
          top: y,
          width: 14 + W,
          height: 14,
          background: pointerColor,
          outline: '3px solid gray',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
export default ColorPickerSliderPointer;
