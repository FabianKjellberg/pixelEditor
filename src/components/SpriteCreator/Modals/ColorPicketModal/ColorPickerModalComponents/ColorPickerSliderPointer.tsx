type ColorPickerSliderPointerProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  y: number;
  W: number;
  pointerColor: string;
};

const ColorPickerSliderPointer = ({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  y,
  W,
  pointerColor,
}: ColorPickerSliderPointerProps) => {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
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
          cursor: 'pointer',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
};
export default ColorPickerSliderPointer;
